import { useState, useEffect } from 'react';
import { Moon, Sun, Settings, UserCircle, Users, CheckCircle2, XCircle, Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

export default function Configuracion() {
  const { isDark, toggleTheme } = useTheme();
  const { userProfile, session } = useAuth();
  const [nombre, setNombre] = useState('');
  const [saving, setSaving] = useState(false);

  // Admin users state
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPermisosModal, setShowPermisosModal] = useState(false);
  const initialPermisos = { 
    can_view_estudiantes: false, 
    can_view_agenda: false,
    can_view_ia: false,
    can_edit: false, 
    can_download: false 
  };
  const [tempPermisos, setTempPermisos] = useState(initialPermisos);
  const [savingPerms, setSavingPerms] = useState(false);

  useEffect(() => {
    if (userProfile?.nombre) {
      setNombre(userProfile.nombre);
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile?.rol === 'Administrador') {
      fetchUsuarios();
    }
  }, [userProfile]);

  const fetchUsuarios = async () => {
    setLoadingUsuarios(true);
    const { data, error } = await supabase.from('perfiles').select('*').order('created_at', { ascending: false });
    if (data) setUsuarios(data);
    setLoadingUsuarios(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ nombre })
        .eq('id', session.user.id);
        
      if (error) throw error;
      toast.success('Nombre guardado correctamente. Recarga para ver los cambios.');
    } catch (err) {
      toast.error('Error al guardar: ' + err.message);
    }
    setSaving(false);
  };

  const updateRol = async (userId, nuevoRol) => {
    try {
      const { error } = await supabase.from('perfiles').update({ rol: nuevoRol }).eq('id', userId);
      if (error) throw error;
      toast.success(`Rol cambiado a ${nuevoRol}`);
      fetchUsuarios();
    } catch (err) {
      toast.error("Error actualizando rol: " + err.message);
    }
  };

  const handleOpenPermisos = (user) => {
    setSelectedUser(user);
    setTempPermisos(user.permisos || initialPermisos);
    setShowPermisosModal(true);
  };

  const savePermisos = async () => {
    setSavingPerms(true);
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ permisos: tempPermisos })
        .eq('id', selectedUser.id);
        
      if (error) throw error;
      toast.success('Permisos actualizados');
      setShowPermisosModal(false);
      setSelectedUser(null);
      fetchUsuarios();
    } catch (err) {
      toast.error("Error guardando permisos: " + err.message);
    }
    setSavingPerms(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-full w-full flex flex-col">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Configuración</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Ajustes generales del sistema SIPOE y apariencia.
        </p>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2 pb-6 min-h-0">
        {/* Mi Perfil */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
              <UserCircle className="w-5 h-5 mr-2 text-indigo-500" />
              Mi Perfil
            </h2>
            
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nombre de la Orientadora (Mostrará en el saludo)
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Ej: Laura Martínez"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Nombre'}
              </button>
            </div>
          </div>
        </div>

        {/* Apariencia */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-indigo-500" />
              Apariencia
            </h2>
            
            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="text-base font-medium text-slate-900 dark:text-white">Modo Oscuro</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Cambia la apariencia del sistema a tonos oscuros para descansar la vista.
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  isDark ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    isDark ? 'translate-x-7' : 'translate-x-1'
                  } flex items-center justify-center shadow-sm`}
                >
                  {isDark ? (
                    <Moon className="h-4 w-4 text-indigo-600" />
                  ) : (
                    <Sun className="h-4 w-4 text-slate-400" />
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Gestión de Usuarios (Solo Admin) */}
        {userProfile?.rol === 'Administrador' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                <Users className="w-5 h-5 mr-2 text-indigo-500" />
                Gestión de Usuarios (Administrador)
              </h2>
              
              {loadingUsuarios ? (
                <p className="text-slate-500 dark:text-slate-400 text-sm">Cargando usuarios...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Correo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rol Actual</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                      {usuarios.map((usr) => (
                        <tr key={usr.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{usr.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{usr.nombre || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              usr.rol === 'Administrador' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                              usr.rol === 'Orientador' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              usr.rol === 'Lector' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                              {usr.rol}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            {usr.id !== session.user.id && (
                              <>
                                <select
                                  value={usr.rol}
                                  onChange={(e) => updateRol(usr.id, e.target.value)}
                                  className="border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs outline-none"
                                >
                                  <option value="Pendiente">Pendiente</option>
                                  <option value="Lector">Lector</option>
                                  <option value="Orientador">Orientador</option>
                                  <option value="Administrador">Administrador</option>
                                </select>
                                <button
                                  onClick={() => handleOpenPermisos(usr)}
                                  className="inline-flex items-center px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                  <Shield size={14} className="mr-1" />
                                  Permisos
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Permisos */}
      {showPermisosModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Permisos Especiales</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Modificando permisos individuales para: <span className="font-medium text-slate-700 dark:text-slate-300">{selectedUser.email}</span>
            </p>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Ver Estudiantes</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Puede acceder a la base de datos de estudiantes.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={tempPermisos.can_view_estudiantes} 
                  onChange={(e) => setTempPermisos({...tempPermisos, can_view_estudiantes: e.target.checked})}
                  className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Ver Agenda</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Puede ver y gestionar la agenda.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={tempPermisos.can_view_agenda} 
                  onChange={(e) => setTempPermisos({...tempPermisos, can_view_agenda: e.target.checked})}
                  className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Ver Asistente IA</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Puede acceder al generador de textos e IAs.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={tempPermisos.can_view_ia} 
                  onChange={(e) => setTempPermisos({...tempPermisos, can_view_ia: e.target.checked})}
                  className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
              </label>
              
              <label className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Editar Registros</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Puede crear y modificar atenciones o seguimientos.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={tempPermisos.can_edit} 
                  onChange={(e) => setTempPermisos({...tempPermisos, can_edit: e.target.checked})}
                  className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Descargar / Imprimir</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Puede descargar PDF, Excel e imprimir actas.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={tempPermisos.can_download} 
                  onChange={(e) => setTempPermisos({...tempPermisos, can_download: e.target.checked})}
                  className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
              </label>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={savePermisos}
                disabled={savingPerms}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50"
              >
                {savingPerms ? 'Guardando...' : 'Guardar Permisos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
