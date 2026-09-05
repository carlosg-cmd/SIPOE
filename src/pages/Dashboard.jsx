import { useState } from 'react';
import { Search, Info, CheckCircle2, ChevronRight, X, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import GlobalSearch from '../components/GlobalSearch';

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const navigate = useNavigate();

  // Mapeo de formatos
  const formatos = [
    { id: 'consentimiento', nombre: 'Consentimiento', icon: '📝', path: null },
    { id: 'orientacion', nombre: 'At. orientación', icon: '💬', path: '/atenciones/nueva' },
    { id: 'padres', nombre: 'At. padres', icon: '👥', path: null },
    { id: 'convivencia', nombre: 'Convivencia', icon: '📋', path: '/seguimientos' },
    { id: 'coord', nombre: 'Rem. coord.', icon: '🎓', path: null },
    { id: 'interv', nombre: 'Interv. grup.', icon: '👥', path: '/intervenciones-grupales', direct: true },
    { id: 'entrega', nombre: 'Inf. entrega', icon: '📄', path: null },
    { id: 'entidad', nombre: 'Rem. entidad', icon: '🏢', path: null },
  ];

  const handleFormatClick = (formato) => {
    if (formato.direct) {
      navigate(formato.path);
    } else {
      setSelectedFormat(formato);
      setModalOpen(true);
    }
  };

  const handleStudentSelect = (studentId) => {
    setModalOpen(false);
    if (selectedFormat?.path) {
      // Navegar a la ruta con el ID del estudiante (ejemplo)
      navigate(`${selectedFormat.path}?estudiante_id=${studentId}`);
    } else {
      alert('Formato en desarrollo');
    }
  };

  // Datos mockeados para la tabla histórica
  const historialCasos = [
    { año: '2026', casos: 27, remitidos: 5, cerrados: 18, total: 45 },
    { año: '2025', casos: 31, remitidos: 8, cerrados: 29, total: 60 },
    { año: '2024', casos: 22, remitidos: 4, cerrados: 22, total: 44 },
  ];

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
              className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-white text-2xl shadow-sm transition-transform group-hover:scale-105 mb-2"
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

      {/* Modal Placeholder para Seleccionar Estudiante */}
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
              className="bg-white rounded-xl shadow-2xl p-6 relative z-10 w-full max-w-md"
            >
              <button 
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                Iniciar: {selectedFormat?.nombre}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Busca y selecciona el estudiante para generar el formato.
              </p>
              
              <div className="w-full h-48 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 mb-4">
                 <p className="text-sm text-slate-400 text-center px-4">
                   (Aquí se integrará el componente de búsqueda de estudiantes que ya existe en Atenciones/Seguimientos)
                 </p>
              </div>

              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
