import { createContext, useContext, useState, useEffect } from 'react';
import localforage from 'localforage';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

const SyncContext = createContext({});

export function useSync() {
  return useContext(SyncContext);
}

export function SyncProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Inicializar almacenamiento local
  useEffect(() => {
    localforage.config({
      name: 'SIPOE_DB',
      storeName: 'sync_queue'
    });
    updatePendingCount();
  }, []);

  const updatePendingCount = async () => {
    try {
      const queue = await localforage.getItem('offline_mutations') || [];
      setPendingCount(queue.length);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processSyncQueue();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast('Modo sin conexión activado', { icon: '📡' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Intentar procesar la cola si carga y hay internet
    if (navigator.onLine) {
      processSyncQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Agregar una mutación a la cola offline
  const addToSyncQueue = async (table, action, data) => {
    try {
      const queue = await localforage.getItem('offline_mutations') || [];
      queue.push({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        table,
        action,
        data
      });
      await localforage.setItem('offline_mutations', queue);
      updatePendingCount();
      toast('Guardado localmente. Se subirá al recuperar conexión.', { icon: '💾' });
    } catch (error) {
      console.error('Error al guardar en cola offline:', error);
    }
  };

  // Procesar cola
  const processSyncQueue = async () => {
    if (!navigator.onLine) return;
    
    try {
      const queue = await localforage.getItem('offline_mutations') || [];
      if (queue.length === 0) return;

      setIsSyncing(true);
      toast.loading('Sincronizando datos pendientes...', { id: 'sync' });

      let successCount = 0;
      let failedQueue = [];

      for (const item of queue) {
        try {
          if (item.action === 'insert') {
            const { error } = await supabase.from(item.table).insert([item.data]);
            if (error) throw error;
          } else if (item.action === 'update') {
            const { error } = await supabase.from(item.table).update(item.data).eq('id', item.data.id);
            if (error) throw error;
          }
          successCount++;
        } catch (err) {
          console.error('Fallo al sincronizar item:', item, err);
          failedQueue.push(item); // Retener si falló (ej. error de base de datos)
        }
      }

      await localforage.setItem('offline_mutations', failedQueue);
      updatePendingCount();
      setIsSyncing(false);

      if (successCount > 0) {
        toast.success(`Se sincronizaron ${successCount} registros exitosamente`, { id: 'sync' });
      } else {
        toast.dismiss('sync');
      }

    } catch (error) {
      console.error('Error procesando la cola de sincronización:', error);
      setIsSyncing(false);
      toast.dismiss('sync');
    }
  };

  // Wrapper para guardar de forma inteligente (nube o local)
  const saveSmartly = async (table, action, data) => {
    if (navigator.onLine) {
      // Guardar directamente
      if (action === 'insert') {
        const { error } = await supabase.from(table).insert([data]);
        if (error) throw error;
      } else if (action === 'update') {
        const { error } = await supabase.from(table).update(data).eq('id', data.id);
        if (error) throw error;
      }
      return true;
    } else {
      // Guardar en cola
      await addToSyncQueue(table, action, data);
      return false; // False indica que fue encolado, no subido a la nube
    }
  };

  return (
    <SyncContext.Provider value={{ isOnline, isSyncing, pendingCount, processSyncQueue, saveSmartly }}>
      {children}
    </SyncContext.Provider>
  );
}
