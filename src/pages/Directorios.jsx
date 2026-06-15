import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Contact, Search, Plus, Edit3, Trash2, Phone, Mail, MapPin, Building, Shield, HeartPulse, MoreHorizontal, Loader2, X, Check, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIAS = [
  { value: 'Colegio', label: 'Personal del Colegio', icon: Building, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { value: 'Emergencias', label: 'Emergencias', icon: Phone, color: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400' },
  { value: 'Autoridades', label: 'Autoridades / Policía', icon: Shield, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'Salud', label: 'Centros de Salud', icon: HeartPulse, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { value: 'Otro', label: 'Otros Contactos', icon: MoreHorizontal, color: 'text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-400' }
];

const getCategoriaBadge = (cat) => CATEGORIAS.find(c => c.value === cat) || CATEGORIAS[CATEGORIAS.length - 1];

const initialForm = {
  nombre: '',
  categoria: 'Colegio',
  cargo_descripcion: '',
  telefono: '',
  correo: '',
  direccion: '',
  notas: ''
};

export default function Directorios() {
  const [directorios, setDirectorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingDir, setEditingDir] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  
  const [needsSetup, setNeedsSetup] = useState(false);

  const fetchDirectorios = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('directorios')
        .select('*')
        .order('categoria', { ascending: true })
        .order('nombre', { ascending: true });

      if (error) {
        if (error.code === '42P01' || (error.message && error.message.includes('does not exist'))) {
          // Table does not exist
          setNeedsSetup(true);
        } else {
          // Fallback just in case, assume it needs setup if it's the first time
          setNeedsSetup(true);
        }
      } else {
        setDirectorios(data || []);
      }
    } catch (error) {
      console.error('Error fetching directorios:', error);
      toast.error('Error al cargar los contactos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectorios();
  }, []);

  const filteredDirectorios = directorios.filter(d => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (d.nombre || '').toLowerCase().includes(q) || 
      (d.cargo_descripcion || '').toLowerCase().includes(q) ||
      (d.telefono || '').toLowerCase().includes(q);
      
    const matchesCat = selectedCategoria ? d.categoria === selectedCategoria : true;
    
    return matchesSearch && matchesCat;
  });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    setSaving(true);
    try {
      if (editingDir) {
        const { error } = await supabase
          .from('directorios')
          .update(form)
          .eq('id', editingDir.id);
        if (error) throw error;
        toast.success('Contacto actualizado');
      } else {
        const { error } = await supabase
          .from('directorios')
          .insert([form]);
        if (error) throw error;
        toast.success('Contacto guardado');
      }
      setShowModal(false);
      fetchDirectorios();
    } catch (error) {
      console.error('Error saving directorio:', error);
      toast.error('Error al guardar el contacto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dir) => {
    if (!window.confirm(`¿Estás seguro de eliminar el contacto de ${dir.nombre}?`)) return;
    try {
      const { error } = await supabase.from('directorios').delete().eq('id', dir.id);
      if (error) throw error;
      toast.success('Contacto eliminado');
      fetchDirectorios();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const openModal = (dir = null) => {
    if (dir) {
      setEditingDir(dir);
      setForm({
        nombre: dir.nombre || '',
        categoria: dir.categoria || 'Colegio',
        cargo_descripcion: dir.cargo_descripcion || '',
        telefono: dir.telefono || '',
        correo: dir.correo || '',
        direccion: dir.direccion || '',
        notas: dir.notas || ''
      });
    } else {
      setEditingDir(null);
      setForm(initialForm);
    }
    setShowModal(true);
  };

  if (needsSetup) {
    const sqlCommand = `-- Si necesitas eliminar una tabla anterior que ya no uses, descomenta y edita la siguiente línea:
-- DROP TABLE IF EXISTS nombre_de_la_tabla_vieja;

CREATE TABLE public.directorios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  cargo_descripcion TEXT,
  telefono TEXT,
  correo TEXT,
  direccion TEXT,
  notas TEXT
);`;

    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-amber-200 dark:border-amber-900 shadow-lg text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Se requiere configuración de Base de Datos</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
            Para usar el Directorio de Contactos, necesitamos crear una nueva tabla en Supabase. 
            Por favor, copia el siguiente código SQL, ve a tu panel de Supabase &gt; SQL Editor, pégalo y ejecútalo.
          </p>
          <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl text-left font-mono text-sm overflow-x-auto mb-6 relative">
            <pre>{sqlCommand}</pre>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(sqlCommand);
                toast.success('¡Código SQL copiado!');
              }}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
            >
              Copiar SQL
            </button>
          </div>
          <button 
            onClick={() => {
              setNeedsSetup(false);
              fetchDirectorios();
            }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Ya ejecuté el código, intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-full w-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Contact className="w-7 h-7 text-indigo-500" />
            Directorio de Contactos
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Gestiona los números y direcciones de emergencias, autoridades y personal clave.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Contacto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-4 flex-shrink-0">
        <div className="flex items-center flex-1">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input 
            type="text" 
            placeholder="Buscar contacto por nombre o teléfono..." 
            className="flex-1 bg-transparent border-none outline-none text-slate-700 dark:text-white placeholder-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="sm:border-l sm:border-slate-200 dark:sm:border-slate-700 sm:pl-4">
          <select
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 py-2 px-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-6">
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredDirectorios.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <Contact className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {searchQuery || selectedCategoria ? 'Sin resultados' : 'Directorio vacío'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {(searchQuery || selectedCategoria)
              ? 'Intenta con otros filtros de búsqueda.'
              : 'Agrega tu primer contacto institucional haciendo clic en Nuevo Contacto.'}
          </p>
        </div>
      )}

      {/* Grid of Contacts */}
      {!loading && filteredDirectorios.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDirectorios.map((dir) => {
            const badge = getCategoriaBadge(dir.categoria);
            const Icon = badge.icon;
            
            return (
              <div key={dir.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${badge.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{dir.nombre}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{dir.cargo_descripcion || badge.label}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(dir)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(dir)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {dir.telefono && (
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                      <Phone className="w-4 h-4 mr-2.5 text-slate-400" />
                      <a href={`tel:${dir.telefono}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{dir.telefono}</a>
                    </div>
                  )}
                  {dir.correo && (
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                      <Mail className="w-4 h-4 mr-2.5 text-slate-400" />
                      <a href={`mailto:${dir.correo}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate">{dir.correo}</a>
                    </div>
                  )}
                  {dir.direccion && (
                    <div className="flex items-start text-sm text-slate-600 dark:text-slate-300">
                      <MapPin className="w-4 h-4 mr-2.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{dir.direccion}</span>
                    </div>
                  )}
                </div>

                {dir.notas && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2">{dir.notas}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Contact className="w-5 h-5 text-indigo-500" />
                {editingDir ? 'Editar Contacto' : 'Nuevo Contacto'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              <form id="dirForm" onSubmit={handleSave} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre Completo / Entidad *</label>
                    <input required type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white" placeholder="Ej. Policía de Infancia" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
                    <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white">
                      {CATEGORIAS.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cargo / Descripción</label>
                    <input type="text" value={form.cargo_descripcion} onChange={e => setForm({...form, cargo_descripcion: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white" placeholder="Ej. Cuadrante Zona 4" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
                    <input type="text" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white" placeholder="Ej. 123 456 7890" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico</label>
                    <input type="email" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white" placeholder="ejemplo@entidad.gov.co" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dirección Física</label>
                    <input type="text" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white" placeholder="Ej. Calle 123 # 45-67" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas Adicionales</label>
                    <textarea value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm min-h-[80px] resize-none dark:text-white" placeholder="Horarios de atención, ext, etc." />
                  </div>
                </div>

              </form>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                Cancelar
              </button>
              <button type="submit" form="dirForm" disabled={saving} className="inline-flex items-center px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                Guardar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
