import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { Calendar as CalendarIcon, Clock, Plus, Loader2, CheckCircle2, User, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import DictationButton from '../components/DictationButton';

export default function Agenda() {
  const { session, permisos } = useAuth();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estudiantes, setEstudiantes] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_cita: '',
    hora_cita: '',
    estudiante_id: ''
  });

  useEffect(() => {
    fetchCitas();
    fetchEstudiantes();
  }, []);

  const fetchEstudiantes = async () => {
    const { data } = await supabase
      .from('estudiantes')
      .select('id, nombres, apellidos')
      .order('nombres')
      .limit(5000);
    if (data) setEstudiantes(data);
  };

  const fetchCitas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('agenda')
      .select('*, estudiantes(nombres, apellidos)')
      .order('fecha_cita', { ascending: true });
    
    if (error) {
      toast.error("Error al cargar la agenda: " + error.message);
    } else {
      setCitas(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    // Unir fecha y hora para el campo TIMESTAMP WITH TIME ZONE
    const fechaCompleta = new Date(`${formData.fecha_cita}T${formData.hora_cita}:00`).toISOString();

    const { error } = await supabase.from('agenda').insert([{
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      fecha_cita: fechaCompleta,
      estudiante_id: formData.estudiante_id || null,
      orientador_id: session.user.id
    }]);

    setIsSubmitting(false);

    if (error) {
      toast.error("Error al guardar: " + error.message);
      return;
    }

    toast.success("Cita agendada correctamente");
    setShowModal(false);
    setFormData({ titulo: '', descripcion: '', fecha_cita: '', hora_cita: '', estudiante_id: '' });
    fetchCitas();
  };

  const marcarCompletado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'Completada' ? 'Pendiente' : 'Completada';
    const { error } = await supabase.from('agenda').update({ estado: nuevoEstado }).eq('id', id);
    if (!error) fetchCitas();
  };

  const eliminarCita = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta cita?")) return;
    const { error } = await supabase.from('agenda').delete().eq('id', id);
    if (!error) {
      toast.success("Cita eliminada");
      fetchCitas();
    }
  };

  // Agrupar citas por fecha
  const groupedCitas = citas.reduce((acc, cita) => {
    const dateObj = new Date(cita.fecha_cita);
    const dateKey = dateObj.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push({ ...cita, dateObj });
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto h-full w-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Mi Agenda</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Programa tus citas, citaciones a acudientes y reuniones importantes.
          </p>
        </div>
        
        {permisos?.can_edit && (
          <button 
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cita
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-6">
      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : citas.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 h-full flex flex-col justify-center items-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 mb-4">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Tu agenda está libre</h3>
          <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">No tienes próximas citas programadas.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedCitas).map(([dateLabel, eventos]) => (
            <div key={dateLabel} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {dateLabel}
                </h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {eventos.map(cita => (
                  <div key={cita.id} className={`p-6 flex flex-col sm:flex-row gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${cita.estado === 'Completada' ? 'opacity-60' : ''}`}>
                    <div className="sm:w-32 flex-shrink-0 flex items-start text-indigo-600 dark:text-indigo-400 font-bold">
                      <Clock className="w-5 h-5 mr-2" />
                      {cita.dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-base font-bold ${cita.estado === 'Completada' ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                        {cita.titulo}
                      </h4>
                      {cita.estudiantes && (
                        <div className="flex items-center mt-2 text-sm text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-700 inline-flex px-2.5 py-1 rounded-md">
                          <User className="w-4 h-4 mr-1.5 text-slate-400" />
                          {cita.estudiantes.nombres} {cita.estudiantes.apellidos}
                        </div>
                      )}
                      {cita.descripcion && (
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 whitespace-pre-wrap">
                          {cita.descripcion}
                        </p>
                      )}
                    </div>
                    {permisos?.can_edit && (
                      <div className="flex sm:flex-col items-center gap-2 justify-end">
                        <button 
                          onClick={() => marcarCompletado(cita.id, cita.estado)}
                          className={`p-2 rounded-full transition-colors ${cita.estado === 'Completada' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30' : 'text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                          title={cita.estado === 'Completada' ? 'Desmarcar' : 'Marcar como completada'}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => eliminarCita(cita.id)}
                          className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Eliminar cita"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Modal Nueva Cita */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl max-w-lg w-full p-6 sm:p-8 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
              <CalendarIcon className="w-6 h-6 mr-3 text-indigo-600" />
              Agendar Nueva Cita
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Título / Asunto</label>
                <input
                  required
                  type="text"
                  value={formData.titulo}
                  onChange={e => setFormData({...formData, titulo: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 dark:text-white"
                  placeholder="Ej. Citación a padres, Reunión convivencia..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                  <input
                    required
                    type="date"
                    value={formData.fecha_cita}
                    onChange={e => setFormData({...formData, fecha_cita: e.target.value})}
                    className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Hora</label>
                  <input
                    required
                    type="time"
                    value={formData.hora_cita}
                    onChange={e => setFormData({...formData, hora_cita: e.target.value})}
                    className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Estudiante Relacionado (Opcional)</label>
                <select
                  value={formData.estudiante_id}
                  onChange={e => setFormData({...formData, estudiante_id: e.target.value})}
                  className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 dark:text-white"
                >
                  <option value="">Ninguno / Actividad general</option>
                  {estudiantes.map(e => (
                    <option key={e.id} value={e.id}>{e.nombres} {e.apellidos}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Motivo / Notas</label>
                  <DictationButton 
                    onAppendText={(text) => setFormData(prev => ({...prev, descripcion: prev.descripcion + (prev.descripcion.endsWith(' ') ? '' : ' ') + text}))} 
                  />
                </div>
                <textarea
                  rows="3"
                  value={formData.descripcion}
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full py-3 px-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 dark:text-white"
                  placeholder="Escribe detalles sobre la cita..."
                ></textarea>
              </div>

              <div className="flex justify-end pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl mr-3 transition-colors">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isSubmitting ? 'Guardando...' : 'Guardar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
