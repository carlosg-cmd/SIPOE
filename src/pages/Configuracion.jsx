import { useState, useEffect } from 'react';
import { Moon, Sun, Settings, UserCircle, Users, Building, Shield, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { supabase } from '../supabase';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Configuracion() {
  const { userProfile, session } = useAuth();
  const { settings, updateSettings } = useSettings();
  
  const [expandedSection, setExpandedSection] = useState('perfil');

  // Perfil State
  const [nombre, setNombre] = useState('');
  const [savingPerfil, setSavingPerfil] = useState(false);
  
  // Institución State
  const [instName, setInstName] = useState('');
  const [sedesList, setSedesList] = useState([]);
  const [newSede, setNewSede] = useState('');

  // Admin users state
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  useEffect(() => {
    if (userProfile?.nombre) {
      setNombre(userProfile.nombre);
    }
  }, [userProfile]);

  useEffect(() => {
    if (settings) {
      setInstName(settings.institucion);
      setSedesList(settings.sedes || []);
    }
  }, [settings]);

  useEffect(() => {
    if (userProfile?.rol === 'Administrador' && expandedSection === 'perfil') {
      fetchUsuarios();
    }
  }, [userProfile, expandedSection]);

  const fetchUsuarios = async () => {
    setLoadingUsuarios(true);
    const { data } = await supabase.from('perfiles').select('*').order('created_at', { ascending: false });
    if (data) setUsuarios(data);
    setLoadingUsuarios(false);
  };

  const handleSaveProfile = async () => {
    setSavingPerfil(true);
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
    setSavingPerfil(false);
  };

  const handleSaveInstitution = () => {
    updateSettings({
      institucion: instName,
      sedes: sedesList
    });
    toast.success('Datos de la institución guardados');
  };

  const addSede = () => {
    if (newSede.trim() && !sedesList.includes(newSede.trim())) {
      setSedesList([...sedesList, newSede.trim()]);
      setNewSede('');
    }
  };

  const removeSede = (index) => {
    const newList = [...sedesList];
    newList.splice(index, 1);
    setSedesList(newList);
  };

  const toggleTheme = () => {
    const newTheme = settings.tema === 'dark' ? 'light' : 'dark';
    updateSettings({ tema: newTheme });
  };

  const Accordion = ({ id, title, icon: Icon, children }) => {
    const isExpanded = expandedSection === id;
    
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4">
        <button 
          onClick={() => setExpandedSection(isExpanded ? null : id)}
          className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center text-slate-800 font-bold text-lg">
            <Icon className="w-5 h-5 mr-3 text-[#185FA5]" />
            {title}
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 border-t border-slate-100">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto h-full w-full flex flex-col p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex-shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Configuración</h1>
        <p className="mt-2 text-sm text-slate-500">
          Ajustes generales del sistema SIPOE y apariencia.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pb-12 scrollbar-hide">
        
        {/* Accordion Perfil */}
        <Accordion id="perfil" title="Administrar Perfil" icon={UserCircle}>
          <div className="max-w-md space-y-4 mb-8">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nombre de la Orientadora (Mostrará en el saludo)
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-[#185FA5] outline-none transition-all"
                placeholder="Ej: Laura Martínez"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={savingPerfil}
              className="px-6 py-2.5 bg-[#185FA5] text-white rounded-lg hover:bg-[#124982] transition-colors text-sm font-bold shadow-sm disabled:opacity-50"
            >
              {savingPerfil ? 'Guardando...' : 'Guardar Nombre'}
            </button>
          </div>

          {userProfile?.rol === 'Administrador' && (
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center">
                <Users className="w-4 h-4 mr-2 text-slate-500" />
                Gestión de Usuarios (Administrador)
              </h3>
              
              {loadingUsuarios ? (
                <p className="text-slate-500 text-sm">Cargando usuarios...</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Correo</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Nombre</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Rol Actual</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {usuarios.map((usr) => (
                        <tr key={usr.id}>
                          <td className="px-4 py-3 text-sm text-slate-800 font-medium">
                            {usr.correo || usr.email || 'Sin correo'}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500">{usr.nombre || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md">
                              {usr.rol}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {usr.id !== session.user.id && (
                              <select
                                value={usr.rol}
                                onChange={async (e) => {
                                  const nuevoRol = e.target.value;
                                  const nuevoEstado = nuevoRol !== 'Pendiente';
                                  await supabase.from('perfiles').update({ rol: nuevoRol, estado: nuevoEstado }).eq('id', usr.id);
                                  toast.success(`Rol cambiado a ${nuevoRol}`);
                                  fetchUsuarios();
                                }}
                                className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold outline-none focus:border-[#185FA5]"
                              >
                                <option value="Pendiente">Pendiente</option>
                                <option value="Orientador">Orientador</option>
                                <option value="Administrador">Administrador</option>
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </Accordion>

        {/* Accordion Institución */}
        <Accordion id="institucion" title="Institución" icon={Building}>
          <div className="max-w-md space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nombre del Colegio / Institución
              </label>
              <input
                type="text"
                value={instName}
                onChange={(e) => setInstName(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-[#185FA5] outline-none transition-all"
                placeholder="Ej: I.E. Divino Niño"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sedes de la Institución
              </label>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSede}
                  onChange={(e) => setNewSede(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSede()}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-[#185FA5] outline-none"
                  placeholder="Nueva sede..."
                />
                <button
                  onClick={addSede}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold flex items-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <ul className="space-y-2">
                {sedesList.map((sede, idx) => (
                  <li key={idx} className="flex justify-between items-center px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">{sede}</span>
                    <button onClick={() => removeSede(idx)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleSaveInstitution}
              className="px-6 py-2.5 bg-[#185FA5] text-white rounded-lg hover:bg-[#124982] transition-colors text-sm font-bold shadow-sm w-full sm:w-auto"
            >
              Guardar Institución
            </button>
          </div>
        </Accordion>

        {/* Accordion Apariencia */}
        <Accordion id="apariencia" title="Apariencia" icon={Settings}>
          <div className="flex items-center justify-between max-w-md py-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Modo Oscuro</h3>
              <p className="text-xs text-slate-500 mt-1">
                Cambia la apariencia del sistema a tonos oscuros.
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#185FA5] focus:ring-offset-2 ${
                settings?.tema === 'dark' ? 'bg-[#185FA5]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings?.tema === 'dark' ? 'translate-x-7' : 'translate-x-1'
                } flex items-center justify-center shadow-sm`}
              >
                {settings?.tema === 'dark' ? (
                  <Moon className="h-4 w-4 text-[#185FA5]" />
                ) : (
                  <Sun className="h-4 w-4 text-slate-400" />
                )}
              </span>
            </button>
          </div>
        </Accordion>

      </div>
    </div>
  );
}
