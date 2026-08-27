import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, Search, Plus, Calendar, Clock, BookOpen, FileText, Printer, Trash2, Edit3, X, Loader2, Sparkles, UserCheck, Layers, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import DictationButton from '../components/DictationButton';
import { useSync } from '../contexts/SyncContext';
import PrintIntervencionesGrupalesTemplate from '../components/PrintIntervencionesGrupalesTemplate';

const GRADOS_SUGERIDOS = [
  'Transición', '1°', '2°', '3°', '4°', '5°',
  '6°1', '6°2', '7°1', '7°2', '8°1', '8°2',
  '9°1', '9°2', '10°1', '10°2', '11°1', '11°2'
];

const TEMATICAS_SUGERIDAS = [
  'Convivencia Escolar y Prevención del Bullying',
  'Salud Mental y Manejo del Estrés',
  'Orientación Vocacional y Proyecto de Vida',
  'Prevención del Consumo de Sustancias',
  'Educación Sexual e Afectividad',
  'Uso Responsable de Redes Sociales y Grooming',
  'Inteligencia Emocional y Autoestima',
  'Taller de Padres y Pautas de Crianza'
];

const initialForm = {
  fecha: new Date().toISOString().split('T')[0],
  grado: '',
  jornada: 'MAÑANA',
  docente_titular: '',
  tematica: '',
  motivo: '',
  duracion_minutos: '60 min',
  nombre_actividad: '',
  objetivo: '',
  descripcion: '',
  recursos: 'Videobeam, papelería, fichas didácticas'
};

export default function IntervencionesGrupales() {
  const { session, permisos } = useAuth();
  const { saveSmartly } = useSync();
  const [intervenciones, setIntervenciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrado, setFilterGrado] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PDF State
  const [printData, setPrintData] = useState(null);

  useEffect(() => {
    fetchIntervenciones();
  }, []);

  const fetchIntervenciones = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('intervenciones_grupales')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) {
        console.error('Error fetching intervenciones:', error);
        toast.error('Error al cargar las intervenciones grupales');
      } else {
        setIntervenciones(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.grado.trim()) {
      toast.error('Por favor especifica el grado o grupo');
      return;
    }
    if (!formData.tematica.trim()) {
      toast.error('Por favor especifica la temática');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...formData,
      responsable: session?.user?.id
    };

    try {
      if (isEditing) {
        await saveSmartly('intervenciones_grupales', 'update', {
          id: editingId,
          ...payload
        });
        toast.success('Intervención grupal actualizada correctamente');
      } else {
        await saveSmartly('intervenciones_grupales', 'insert', {
          id: crypto.randomUUID(),
          ...payload
        });
        toast.success('Intervención grupal registrada correctamente');
      }
      setShowModal(false);
      setIsEditing(false);
      setFormData(initialForm);
      fetchIntervenciones();
    } catch (err) {
      toast.error('Error al guardar: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setIsEditing(true);
    setFormData({
      fecha: item.fecha || new Date().toISOString().split('T')[0],
      grado: item.grado || '',
      jornada: item.jornada || 'MAÑANA',
      docente_titular: item.docente_titular || '',
      tematica: item.tematica || '',
      motivo: item.motivo || '',
      duracion_minutos: item.duracion_minutos || '60 min',
      nombre_actividad: item.nombre_actividad || '',
      objetivo: item.objetivo || '',
      descripcion: item.descripcion || '',
      recursos: item.recursos || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar el registro "${nombre || 'esta intervención'}"?`)) return;

    try {
      await saveSmartly('intervenciones_grupales', 'delete', { id });
      toast.success('Registro eliminado');
      fetchIntervenciones();
    } catch (err) {
      toast.error('Error al eliminar: ' + err.message);
    }
  };

  // Filtrar
  const filteredIntervenciones = intervenciones.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchSearch = (
      (item.grado || '').toLowerCase().includes(q) ||
      (item.tematica || '').toLowerCase().includes(q) ||
      (item.nombre_actividad || '').toLowerCase().includes(q) ||
      (item.docente_titular || '').toLowerCase().includes(q) ||
      (item.motivo || '').toLowerCase().includes(q)
    );
    const matchGrado = !filterGrado || (item.grado || '').toLowerCase() === filterGrado.toLowerCase();
    return matchSearch && matchGrado;
  });

  // Agrupar por grado/grupo
  const groupedData = {};
  filteredIntervenciones.forEach(item => {
    const key = (item.grado || 'Sin Grado Asignado').trim();
    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    groupedData[key].push(item);
  });

  const gruposList = Object.keys(groupedData).sort();

  return (
    <div className="max-w-7xl mx-auto h-full w-full flex flex-col">
      {/* Imprimir PDF Modal Template */}
      {printData && (
        <PrintIntervencionesGrupalesTemplate
          data={printData}
          onClose={() => setPrintData(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-indigo-500" />
            Intervenciones Grupales
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Historial de talleres, charlas y actividades pedagógicas organizadas por grupo.
          </p>
        </div>

        {permisos?.can_edit && (
          <button
            onClick={() => {
              setIsEditing(false);
              setEditingId(null);
              setFormData(initialForm);
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Intervención Grupal
          </button>
        )}
      </div>

      {/* Bar de Búsqueda y Filtros */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-4 flex-shrink-0">
        <div className="flex items-center flex-1">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Buscar por grupo, temática, docente o actividad..."
            className="flex-1 bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="sm:border-l sm:border-slate-200 dark:sm:border-slate-700 sm:pl-4">
          <select
            value={filterGrado}
            onChange={(e) => setFilterGrado(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold py-2 px-3 rounded-xl outline-none"
          >
            <option value="">Todos los grupos</option>
            {gruposList.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenido Principal / Historial Agrupado */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-6">
        {loading ? (
          <div className="flex justify-center items-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : gruposList.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No hay intervenciones registradas</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
              Registra talleres, talleres de convivencia, charlas comunitarias u orientaciones de grupo.
            </p>
            {permisos?.can_edit && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingId(null);
                  setFormData(initialForm);
                  setShowModal(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Registrar Primera Intervención
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {gruposList.map((gradoKey) => {
              const items = groupedData[gradoKey];
              return (
                <div key={gradoKey} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  {/* Encabezado del Grupo */}
                  <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {gradoKey}
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                            {items.length} {items.length === 1 ? 'intervención' : 'intervenciones'}
                          </span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Historial de talleres y orientación grupal
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Intervenciones del Grupo */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {items.map((item) => (
                      <div key={item.id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {item.fecha}
                              </span>
                              {item.jornada && (
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                                  Jornada {item.jornada}
                                </span>
                              )}
                              {item.duracion_minutos && (
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {item.duracion_minutos}
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                              {item.nombre_actividad || item.tematica}
                            </h3>
                            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 mt-0.5">
                              Temática: {item.tematica}
                            </p>
                          </div>

                          {/* Acciones */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setPrintData(item)}
                              className="inline-flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-xl text-xs font-bold transition-colors"
                              title="Exportar PDF / Imprimir"
                            >
                              <Printer className="w-4 h-4 mr-1.5" />
                              PDF
                            </button>
                            {permisos?.can_edit && (
                              <>
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                  title="Editar"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id, item.nombre_actividad || item.tematica)}
                                  className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Detalles de la intervención */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60">
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Docente Titular:</span>
                            <p className="text-slate-600 dark:text-slate-400">{item.docente_titular || 'No especificado'}</p>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Motivo:</span>
                            <p className="text-slate-600 dark:text-slate-400">{item.motivo || 'No especificado'}</p>
                          </div>
                          {item.objetivo && (
                            <div className="md:col-span-2">
                              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Objetivo de la Actividad:</span>
                              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{item.objetivo}</p>
                            </div>
                          )}
                          {item.descripcion && (
                            <div className="md:col-span-2">
                              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Desarrollo del Encuentro:</span>
                              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{item.descripcion}</p>
                            </div>
                          )}
                          {item.recursos && (
                            <div className="md:col-span-2">
                              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Recursos Utilizados:</span>
                              <p className="text-slate-500 dark:text-slate-400 italic">{item.recursos}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Nueva / Editar Intervención */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              {isEditing ? 'Editar Intervención Grupal' : 'Registrar Nueva Intervención Grupal'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Grupo y Fecha */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Grado / Grupo *</label>
                  <input
                    required
                    type="text"
                    list="grados-list"
                    value={formData.grado}
                    onChange={e => setFormData({ ...formData, grado: e.target.value })}
                    className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white text-sm"
                    placeholder="Ej. 6°1, 11°A"
                  />
                  <datalist id="grados-list">
                    {GRADOS_SUGERIDOS.map(g => <option key={g} value={g} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jornada</label>
                  <select
                    value={formData.jornada}
                    onChange={e => setFormData({ ...formData, jornada: e.target.value })}
                    className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white text-sm font-medium"
                  >
                    <option value="MAÑANA">MAÑANA</option>
                    <option value="TARDE">TARDE</option>
                    <option value="NOCHE">NOCHE</option>
                    <option value="SABATINA">SABATINA</option>
                    <option value="UNICA">ÚNICA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha *</label>
                  <input
                    required
                    type="date"
                    value={formData.fecha}
                    onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white text-sm"
                  />
                </div>
              </div>

              {/* Docente Titular y Duración */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Docente Titular</label>
                  <input
                    type="text"
                    value={formData.docente_titular}
                    onChange={e => setFormData({ ...formData, docente_titular: e.target.value })}
                    className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white text-sm"
                    placeholder="Nombre del docente director de grupo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Duración de la sesión</label>
                  <input
                    type="text"
                    value={formData.duracion_minutos}
                    onChange={e => setFormData({ ...formData, duracion_minutos: e.target.value })}
                    className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white text-sm"
                    placeholder="Ej. 60 min, 2 horas"
                  />
                </div>
              </div>

              {/* Temática y Nombre Actividad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Temática Principal *</label>
                  <input
                    required
                    type="text"
                    list="tematicas-list"
                    value={formData.tematica}
                    onChange={e => setFormData({ ...formData, tematica: e.target.value })}
                    className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white text-sm"
                    placeholder="Ej. Prevención del Bullying"
                  />
                  <datalist id="tematicas-list">
                    {TEMATICAS_SUGERIDAS.map(t => <option key={t} value={t} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre de la Actividad</label>
                  <input
                    type="text"
                    value={formData.nombre_actividad}
                    onChange={e => setFormData({ ...formData, nombre_actividad: e.target.value })}
                    className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white text-sm"
                    placeholder="Ej. Taller 'Respeto e Inclusión'"
                  />
                </div>
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Motivo de la Intervención</label>
                <input
                  type="text"
                  value={formData.motivo}
                  onChange={e => setFormData({ ...formData, motivo: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white text-sm"
                  placeholder="Ej. Solicitud de coordinación por conflictos convivenciales"
                />
              </div>

              {/* Objetivo con Dictado por Voz */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Objetivo de la Actividad</label>
                  <DictationButton
                    onAppendText={(text) => setFormData(prev => ({ ...prev, objetivo: prev.objetivo + (prev.objetivo.endsWith(' ') ? '' : ' ') + text }))}
                  />
                </div>
                <textarea
                  rows="2"
                  value={formData.objetivo}
                  onChange={e => setFormData({ ...formData, objetivo: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white text-sm"
                  placeholder="Describa el objetivo pedagógico o formativo..."
                />
              </div>

              {/* Desarrollo del Encuentro con Dictado por Voz */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Desarrollo del Encuentro / Descripción</label>
                  <DictationButton
                    onAppendText={(text) => setFormData(prev => ({ ...prev, descripcion: prev.descripcion + (prev.descripcion.endsWith(' ') ? '' : ' ') + text }))}
                  />
                </div>
                <textarea
                  rows="3"
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white text-sm"
                  placeholder="Resumen del desarrollo de la sesión, dinámica de grupo y reflexiones..."
                />
              </div>

              {/* Recursos */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Recursos Utilizados</label>
                <input
                  type="text"
                  value={formData.recursos}
                  onChange={e => setFormData({ ...formData, recursos: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white text-sm"
                  placeholder="Ej. Videobeam, carteleras, fichas de trabajo"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    isEditing ? 'Guardar Cambios' : 'Registrar Intervención'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
