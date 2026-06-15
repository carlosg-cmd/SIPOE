import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Search, Loader2, Calendar, FileText, CheckCircle, CheckCircle2, Clock, Save, Trash2, Printer, Plus, ClipboardList, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PrintAtencionEscolarTemplate from '../components/PrintAtencionEscolarTemplate';
import DictationButton from '../components/DictationButton';
import { useSearchParams } from 'react-router-dom';

export default function Seguimientos() {
  const { permisos, session } = useAuth();
  const [seguimientos, setSeguimientos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [listaEstudiantes, setListaEstudiantes] = useState([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [printData, setPrintData] = useState(null);

  const initialFormState = {
    estudiante_id: '',
    fecha: new Date().toISOString().split('T')[0],
    tipo_seguimiento: 'Citación Acudiente',
    descripcion: '',
    compromisos: '',
    estado: 'En proceso'
  };
  
  const [formData, setFormData] = useState(initialFormState);

  const tiposDisponibles = [
    'Citación Acudiente', 
    'Llamada Telefónica', 
    'Visita Domiciliaria', 
    'Reunión Docentes', 
    'Remisión Externa',
    'Seguimiento en Aula',
    'Otro'
  ];


  async function fetchSeguimientos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('seguimientos')
      .select('*, estudiantes(id, nombres, apellidos, documento, grado, datos_acudiente)')
      .order('fecha', { ascending: false });
    
    if (!error && data) {
      setSeguimientos(data);
    }
    setLoading(false);
  }

  async function fetchEstudiantes() {
    // Primero obtener los IDs únicos de estudiantes que tienen atención
    const { data: atencionesData } = await supabase
      .from('atenciones')
      .select('estudiante_id');
      
    if (!atencionesData || atencionesData.length === 0) {
      setListaEstudiantes([]);
      return;
    }
    
    // Sacar IDs únicos
    const idsUnicos = [...new Set(atencionesData.map(a => a.estudiante_id).filter(id => id != null))];
    
    if (idsUnicos.length === 0) {
      setListaEstudiantes([]);
      return;
    }

    // Luego buscar solo los estudiantes con esos IDs
    const { data } = await supabase
      .from('estudiantes')
      .select('id, nombres, apellidos, documento, grado, datos_acudiente')
      .in('id', idsUnicos)
      .order('nombres');
      
    if (data) setListaEstudiantes(data);
  }

  useEffect(() => {
    fetchSeguimientos();
    fetchEstudiantes();
    
    const nuevo = searchParams.get('nuevo');
    const estId = searchParams.get('estudiante_id');
    if (nuevo === 'true' && estId) {
      setFormData(prev => ({ ...prev, estudiante_id: estId }));
      setShowModal(true);
      setIsEditing(false);
    }
  }, [searchParams]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevenir doble clic

    setIsSubmitting(true);
    let error;

    if (isEditing) {
      const { error: updateError } = await supabase.from('seguimientos')
        .update(formData)
        .eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('seguimientos').insert([{
        ...formData,
        orientador_id: session.user.id
      }]);
      error = insertError;
    }

    setIsSubmitting(false);

    if (error) {
      alert("Error al guardar: " + error.message);
      return;
    }

    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialFormState);
    // Expandir automáticamente el estudiante al que se le agregó
    setExpandedStudentId(formData.estudiante_id);
    fetchSeguimientos();
  };

  const handleEdit = (seg) => {
    setFormData({
      estudiante_id: seg.estudiante_id,
      fecha: seg.fecha,
      tipo_seguimiento: seg.tipo_seguimiento,
      descripcion: seg.descripcion,
      compromisos: seg.compromisos,
      estado: seg.estado
    });
    setEditingId(seg.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const eliminarSeguimiento = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;
    await supabase.from('seguimientos').delete().eq('id', id);
    fetchSeguimientos();
  };

  const filteredSeguimientos = seguimientos.filter(s => {
    const estudiante = s.estudiantes ? `${s.estudiantes.nombres} ${s.estudiantes.apellidos}`.toLowerCase() : '';
    const doc = s.estudiantes?.documento || '';
    const q = searchQuery.toLowerCase();
    return estudiante.includes(q) || doc.includes(q);
  });

  // Agrupar los seguimientos por estudiante
  const groupedData = {};
  filteredSeguimientos.forEach(s => {
    const eid = s.estudiante_id;
    if (!groupedData[eid]) {
      groupedData[eid] = {
        estudiante: s.estudiantes,
        seguimientos: []
      };
    }
    groupedData[eid].seguimientos.push(s);
  });

  const casos = Object.entries(groupedData).map(([id, data]) => ({ id, ...data }));

  return (
    <div className="max-w-7xl mx-auto h-full w-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Control de Seguimientos</h1>
          <p className="mt-2 text-sm text-slate-500">
            Historial de acciones posteriores, acuerdos y evolución agrupados por estudiante.
          </p>
        </div>
        
        {permisos?.can_edit && (
          <button 
            onClick={() => {
              setIsEditing(false);
              setEditingId(null);
              setFormData(initialFormState);
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Seguimiento
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm flex items-center flex-shrink-0">
        <Search className="w-5 h-5 text-slate-400 mr-3" />
        <input 
          type="text" 
          placeholder="Buscar por estudiante o documento..." 
          className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-6">
        {loading ? (
          <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : casos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No hay seguimientos registrados</h3>
            <p className="mt-1 text-slate-500 text-sm">Aún no se han registrado acciones de seguimiento de casos.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {casos.map((caso) => {
            const isExpanded = expandedStudentId === caso.id;
            const ultimoEstado = caso.seguimientos[0]?.estado || 'Desconocido';
            const cantidad = caso.seguimientos.length;

            return (
              <div key={caso.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:border-emerald-200">
                <div 
                  className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                  onClick={() => setExpandedStudentId(isExpanded ? null : caso.id)}
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      {caso.estudiante ? `${caso.estudiante.nombres} ${caso.estudiante.apellidos}` : 'Estudiante Borrado'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {caso.estudiante?.grado} • <span className="font-semibold text-emerald-600">{cantidad} anexo{cantidad !== 1 && 's'} de seguimiento</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                      ultimoEstado === 'Cerrado' ? 'bg-slate-100 text-slate-600' : 
                      ultimoEstado === 'Inconcluso' || ultimoEstado === 'Cerrado / Inconcluso' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {ultimoEstado === 'Cerrado' ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> : <Clock className="w-3.5 h-3.5 mr-1.5" />}
                      Último estado: {ultimoEstado}
                    </span>
                    <button className="text-slate-400 hover:text-emerald-600 transition-colors mr-3">
                      <span className="text-sm font-semibold">{isExpanded ? 'Ocultar historial' : 'Ver historial'}</span>
                    </button>
                    {permisos?.can_download && (
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          
                          setPrintData({ 
                            estudiantes: caso.estudiante,
                            fecha: new Date().toISOString().split('T')[0]
                          }); 
                        }}
                        className="p-2 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 rounded-lg transition-colors border border-slate-200"
                        title="Imprimir Consolidado"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-slate-50 border-t border-slate-100 p-5">
                    <div className="relative border-l-2 border-emerald-100 ml-3 pl-6 space-y-6">
                      {caso.seguimientos.map((seg) => (
                        <div key={seg.id} className="relative">
                          {/* Timeline dot */}
                          <div className="absolute -left-[29px] top-1.5 w-3 h-3 bg-emerald-500 rounded-full ring-4 ring-slate-50"></div>
                          
                          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg mb-2">
                                  {seg.tipo_seguimiento}
                                </span>
                                <p className="text-sm font-semibold text-slate-900">{seg.fecha}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold ${
                                  seg.estado === 'Cerrado' ? 'text-slate-500' : 
                                  seg.estado === 'Cerrado / Inconcluso' ? 'text-red-600' : 'text-amber-600'
                                }`}>
                                  {seg.estado}
                                </span>
                                {permisos?.can_edit && (
                                  <>
                                    <button 
                                      onClick={() => handleEdit(seg)}
                                      className="text-slate-300 hover:text-indigo-500 transition-colors p-1"
                                      title="Editar anexo"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    <button 
                                      onClick={() => eliminarSeguimiento(seg.id)}
                                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                      title="Eliminar este anexo (por error)"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-sm text-slate-700 whitespace-pre-wrap mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <span className="font-semibold block mb-1 text-slate-900">Descripción:</span>
                              {seg.descripcion}
                            </div>
                            
                            {seg.compromisos && (
                              <div className="text-sm text-slate-700 whitespace-pre-wrap mt-3 bg-amber-50/50 p-3 rounded-lg border border-amber-100/50">
                                <span className="font-semibold block mb-1 text-amber-900">Compromisos:</span>
                                {seg.compromisos}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Modal Nuevo Seguimiento */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              x
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <Activity className="w-6 h-6 mr-3 text-emerald-600" />
              {isEditing ? 'Editar Seguimiento' : 'Nuevo Anexo de Seguimiento'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estudiante</label>
                  <select
                    required
                    value={formData.estudiante_id}
                    onChange={e => setFormData({...formData, estudiante_id: e.target.value})}
                    className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
                  >
                    <option value="">Buscar estudiante...</option>
                    {listaEstudiantes.map(e => (
                      <option key={e.id} value={e.id}>{e.nombres} {e.apellidos} - {e.grado}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
                  <input
                    type="date" required
                    value={formData.fecha}
                    onChange={e => setFormData({...formData, fecha: e.target.value})}
                    className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Acción</label>
                  <select
                    required
                    value={formData.tipo_seguimiento}
                    onChange={e => setFormData({...formData, tipo_seguimiento: e.target.value})}
                    className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
                  >
                    {tiposDisponibles.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estado del Caso (Actualizado)</label>
                  <select
                    value={formData.estado}
                    onChange={e => setFormData({...formData, estado: e.target.value})}
                    className="w-full py-2 px-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                  >
                    <option value="En proceso">Activo / En proceso</option>
                    <option value="Cerrado">Cerrado / Resuelto</option>
                    <option value="Cerrado / Inconcluso">Cerrado / Inconcluso</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Descripción del avance</label>
                  <DictationButton 
                    onAppendText={(text) => setFormData(prev => ({...prev, descripcion: prev.descripcion + (prev.descripcion.endsWith(' ') ? '' : ' ') + text}))} 
                  />
                </div>
                <textarea
                  required rows="3"
                  value={formData.descripcion}
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
                  placeholder="Describe qué se hizo en este seguimiento..."
                ></textarea>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Compromisos / Tareas / Acuerdos</label>
                  <DictationButton 
                    onAppendText={(text) => setFormData(prev => ({...prev, compromisos: prev.compromisos + (prev.compromisos.endsWith(' ') ? '' : ' ') + text}))} 
                  />
                </div>
                <textarea
                  rows="2"
                  value={formData.compromisos}
                  onChange={e => setFormData({...formData, compromisos: e.target.value})}
                  className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
                  placeholder="Ej. El acudiente se compromete a..."
                ></textarea>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl mr-3 transition-colors">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isSubmitting ? 'Guardando...' : 'Guardar Seguimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {printData && (
        <PrintAtencionEscolarTemplate data={printData} onClose={() => setPrintData(null)} />
      )}
    </div>
  );
}
