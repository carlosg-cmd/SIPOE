import { useState, useEffect } from 'react';
import { Search, Info, CheckCircle2, ChevronRight, X, UserCircle, FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import GlobalSearch from '../components/GlobalSearch';
import Select from 'react-select';
import { supabase } from '../supabase';

import PrintConsentimientoTemplate from '../components/PrintConsentimientoTemplate';
import PrintAtencionPadresTemplate from '../components/PrintAtencionPadresTemplate';
import PrintRemisionCoordinacionTemplate from '../components/PrintRemisionCoordinacionTemplate';
import PrintInformeEntregaCasosTemplate from '../components/PrintInformeEntregaCasosTemplate';
import PrintRemisionEntidadesTemplate from '../components/PrintRemisionEntidadesTemplate';

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [listaEstudiantes, setListaEstudiantes] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [activePrint, setActivePrint] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    async function fetchEstudiantes() {
      const { data } = await supabase
        .from('estudiantes')
        .select('id, nombres, apellidos, documento, grado, jornada, sede_id, telefono, datos_acudiente')
        .order('nombres', { ascending: true })
        .limit(1000);
      if (data) setListaEstudiantes(data);
    }
    fetchEstudiantes();
  }, []);

  // Mapeo de formatos
  const formatos = [
    { id: 'consentimiento', nombre: 'Consentimiento', icon: '📝' },
    { id: 'orientacion', nombre: 'At. orientación', icon: '💬' },
    { id: 'padres', nombre: 'At. padres', icon: '👥' },
    { id: 'convivencia', nombre: 'Convivencia', icon: '📋' },
    { id: 'coord', nombre: 'Rem. coord.', icon: '🎓' },
    { id: 'interv', nombre: 'Interv. grup.', icon: '👥', direct: true, path: '/intervenciones-grupales' },
    { id: 'entrega', nombre: 'Inf. entrega', icon: '📄' },
    { id: 'entidad', nombre: 'Rem. entidad', icon: '🏢' },
  ];

  useEffect(() => {
    const fmtId = searchParams.get('formato');
    if (fmtId) {
      const found = formatos.find(f => f.id === fmtId);
      if (found) {
        setSelectedFormat(found);
        setSelectedStudentId('');
        setModalOpen(true);
      }
    }
  }, [searchParams]);

  const handleFormatClick = (formato) => {
    if (formato.direct) {
      navigate(formato.path);
    } else {
      setSelectedFormat(formato);
      setSelectedStudentId('');
      setModalOpen(true);
    }
  };

  const handleProceedFormat = () => {
    if (!selectedStudentId) {
      alert('Por favor selecciona un estudiante.');
      return;
    }
    const student = listaEstudiantes.find(e => e.id === selectedStudentId);
    if (!student) return;

    setModalOpen(false);

    if (selectedFormat.id === 'orientacion') {
      navigate(`/atenciones/nueva?estudianteId=${student.id}`);
    } else if (selectedFormat.id === 'convivencia') {
      navigate(`/seguimientos?nuevo=true&estudiante_id=${student.id}`);
    } else if (selectedFormat.id === 'consentimiento') {
      setActivePrint({ type: 'consentimiento', data: { estudiantes: student } });
    } else if (selectedFormat.id === 'padres') {
      setActivePrint({ type: 'padres', data: { estudiantes: student } });
    } else if (selectedFormat.id === 'coord') {
      setActivePrint({ type: 'coord', data: { estudiantes: student } });
    } else if (selectedFormat.id === 'entrega') {
      setActivePrint({ type: 'entrega', data: { estudiantes: student } });
    } else if (selectedFormat.id === 'entidad') {
      setActivePrint({ type: 'entidad', data: { estudiantes: student } });
    }
  };

  // Datos para la tabla histórica
  const historialCasos = [
    { año: '2026', casos: 27, remitidos: 5, cerrados: 18, total: 45 },
    { año: '2025', casos: 31, remitidos: 8, cerrados: 29, total: 60 },
    { año: '2024', casos: 22, remitidos: 4, cerrados: 22, total: 44 },
  ];

  const estudianteModal = listaEstudiantes.find(e => e.id === selectedStudentId);

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col min-w-0 p-4 sm:p-6 lg:p-8 relative">
      
      {/* Fila 1: Perfil y Buscador */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mr-4 shrink-0">
            {userProfile?.nombre ? userProfile.nombre.charAt(0).toUpperCase() : 'O'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 leading-tight">
              {userProfile?.nombre || 'Orientadora Escolar'}
            </h2>
            <p className="text-sm text-slate-500">
              {userProfile?.rol || 'Orientadora escolar'}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-64 relative">
          <GlobalSearch />
        </div>
      </div>

      {/* Fila 2: Íconos de Formatos (1 sola línea) */}
      <div className="flex justify-between items-start w-full overflow-x-auto pb-4 mb-8 scrollbar-hide gap-2">
        {formatos.map((fmt) => (
          <button
            key={fmt.id}
            onClick={() => handleFormatClick(fmt)}
            className="flex flex-col items-center group min-w-[72px]"
          >
            <div 
              className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-white text-2xl shadow-sm transition-transform group-hover:scale-105 mb-2 cursor-pointer"
              style={{ backgroundColor: '#378ADD' }}
            >
              {fmt.icon}
            </div>
            <span className="text-[11px] font-semibold text-center text-slate-600 leading-tight max-w-[80px]">
              {fmt.nombre}
            </span>
          </button>
        ))}
      </div>

      <div className="w-full h-px bg-slate-200 mb-8" />

      {/* Fila 3: Paneles Central y Derecho */}
      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        
        {/* Panel Central (Botones e Historial) */}
        <div className="flex-1 flex flex-col">
          <div className="flex flex-col gap-3 mb-6">
            <button className="w-full py-3 bg-[#F1EFE8] hover:bg-[#e8e5dc] text-slate-700 font-bold rounded-lg transition-colors border border-[#D9D6CC]">
              Casos por género
            </button>
            <button className="w-full py-3 bg-[#F1EFE8] hover:bg-[#e8e5dc] text-slate-700 font-bold rounded-lg transition-colors border border-[#D9D6CC]">
              Estudiantes por sede
            </button>
            <button 
              className="w-full py-3 text-white font-bold rounded-lg transition-colors shadow-sm"
              style={{ backgroundColor: '#185FA5' }}
            >
              Historial de casos por año
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Año</th>
                  <th className="px-4 py-3">Casos</th>
                  <th className="px-4 py-3">Remitidos</th>
                  <th className="px-4 py-3">Cerrados</th>
                  <th className="px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historialCasos.map((row, i) => (
                  <tr key={i} className="text-slate-700 hover:bg-slate-50">
                    <td className="px-4 py-3">{row.año}</td>
                    <td className="px-4 py-3">{row.casos}</td>
                    <td className="px-4 py-3">{row.remitidos}</td>
                    <td className="px-4 py-3">{row.cerrados}</td>
                    <td className="px-4 py-3">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel Derecho (Alertas y Bienvenida) */}
        <div className="w-full lg:w-[320px] shrink-0">
          <div 
            className="p-5 rounded-xl border mb-6"
            style={{ backgroundColor: '#FAEEDA', borderColor: '#EF9F27' }}
          >
            <p className="text-sm font-medium" style={{ color: '#9c6500' }}>
              Recuerda: las remisiones urgentes deben radicarse antes de las 48 horas.
            </p>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed text-justify">
            Bienvenida al sistema de información psicosocial. Aquí puedes consultar el historial completo de cada estudiante, generar los formatos oficiales y hacer seguimiento a los casos activos.
          </p>
        </div>
      </div>

      {/* Footer en el Dashboard */}
      <footer className="mt-auto pt-8 pb-2 text-center border-t border-slate-200 mt-8">
        <p className="text-[11px] text-slate-400 font-medium">
          Copyright © Todos los derechos reservados.<br/>
          Desarrollado por Carlos Andrés Jiménez Murillo
        </p>
      </footer>

      {/* Modal de Búsqueda y Selección de Estudiante para Formato */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 relative z-10 w-full max-w-lg"
            >
              <button 
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{selectedFormat?.icon}</span>
                <h3 className="text-xl font-bold text-slate-800">
                  {selectedFormat?.nombre}
                </h3>
              </div>
              <p className="text-sm text-slate-500 mb-5">
                Busca y selecciona el estudiante para cargar sus datos y generar el formato.
              </p>
              
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Seleccionar Estudiante
                </label>
                <Select
                  options={listaEstudiantes.map(e => ({ 
                    value: e.id, 
                    label: `${e.nombres || ''} ${e.apellidos || ''} — Grado: ${e.grado || 'S/G'}`.trim() 
                  }))}
                  value={selectedStudentId ? { 
                    value: selectedStudentId, 
                    label: estudianteModal ? `${estudianteModal.nombres} ${estudianteModal.apellidos} — Grado: ${estudianteModal.grado || 'S/G'}` : '' 
                  } : null}
                  onChange={selected => setSelectedStudentId(selected ? selected.value : '')}
                  placeholder="Escribe el nombre del estudiante..."
                  isClearable
                  noOptionsMessage={() => "No se encontraron estudiantes"}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      padding: '0.2rem',
                      borderRadius: '0.75rem',
                      borderColor: state.isFocused ? '#185FA5' : '#cbd5e1',
                      boxShadow: state.isFocused ? '0 0 0 2px rgba(24, 95, 165, 0.2)' : 'none',
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? '#185FA5' : state.isFocused ? '#EBF5FF' : '#ffffff',
                      color: state.isSelected ? '#ffffff' : '#1e293b',
                      fontWeight: state.isSelected ? '600' : '500',
                      cursor: 'pointer'
                    })
                  }}
                />
              </div>

              {/* Ficha Resumen del Estudiante Seleccionado */}
              {estudianteModal && (
                <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 mb-5 text-xs text-slate-700">
                  <span className="font-bold text-blue-900 block mb-1 uppercase tracking-wider">
                    Datos del Estudiante y Acudiente:
                  </span>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <span className="text-slate-500">Documento:</span> <span className="font-semibold">{estudianteModal.documento || 'No reg.'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Grado:</span> <span className="font-semibold">{estudianteModal.grado || 'No reg.'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500">Acudiente:</span> <span className="font-semibold">{estudianteModal.datos_acudiente?.nombres || 'No registrado'} {estudianteModal.datos_acudiente?.telefono ? `(${estudianteModal.datos_acudiente.telefono})` : ''}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleProceedFormat}
                  disabled={!selectedStudentId}
                  style={{ backgroundColor: '#185FA5' }}
                  className="px-5 py-2 text-sm font-bold text-white rounded-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center shadow-sm"
                >
                  Continuar al Formato
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Renderizado de Plantillas de Impresión y Formatos PDF */}
      {activePrint?.type === 'consentimiento' && (
        <PrintConsentimientoTemplate data={activePrint.data} onClose={() => setActivePrint(null)} />
      )}
      {activePrint?.type === 'padres' && (
        <PrintAtencionPadresTemplate data={activePrint.data} onClose={() => setActivePrint(null)} />
      )}
      {activePrint?.type === 'coord' && (
        <PrintRemisionCoordinacionTemplate data={activePrint.data} onClose={() => setActivePrint(null)} />
      )}
      {activePrint?.type === 'entrega' && (
        <PrintInformeEntregaCasosTemplate data={activePrint.data} onClose={() => setActivePrint(null)} />
      )}
      {activePrint?.type === 'entidad' && (
        <PrintRemisionEntidadesTemplate data={activePrint.data} onClose={() => setActivePrint(null)} />
      )}
    </div>
  );
}