import { useState, useEffect, useRef } from 'react';
import { Search, Command, Users, FileText, X } from 'lucide-react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ estudiantes: [], atenciones: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Atajo de teclado Cmd+K o Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      setResults({ estudiantes: [], atenciones: [] });
      document.body.style.overflow = 'hidden'; // Ensure it stays hidden globally due to our main layout
    }
  }, [isOpen]);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch();
      } else {
        setResults({ estudiantes: [], atenciones: [] });
      }
    }, 300);
    return () => clearTimeout(searchTimer);
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      // Buscar estudiantes
      const { data: estudiantesData } = await supabase
        .from('estudiantes')
        .select('id, nombres, apellidos, documento, grado')
        .or(`nombres.ilike.%${query}%,apellidos.ilike.%${query}%,documento.ilike.%${query}%`)
        .limit(10);

      setResults({
        estudiantes: estudiantesData || [],
        atenciones: []
      });
    } catch (error) {
      console.error('Error buscando:', error);
    }
    setLoading(false);
  };

  const navigateToStudent = (estudianteId) => {
    setIsOpen(false);
    navigate(`/atenciones/nueva?estudianteId=${estudianteId}`);
  };

  return (
    <>
      {/* Botón en Sidebar */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-500 bg-slate-100/50 hover:bg-slate-200/50 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50 transition-colors group shadow-sm mb-4"
      >
        <div className="flex items-center">
          <Search className="w-4 h-4 mr-2 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          <span>Buscar...</span>
        </div>
        <div className="hidden sm:flex items-center space-x-1">
          <kbd className="px-1.5 py-0.5 text-[10px] font-sans font-semibold text-slate-500 bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 rounded shadow-sm">
            <Command className="w-3 h-3 inline-block" />
          </kbd>
          <kbd className="px-1.5 py-0.5 text-[10px] font-sans font-semibold text-slate-500 bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 rounded shadow-sm">
            K
          </kbd>
        </div>
      </button>

      {/* Modal Command Palette */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="inline-block w-full max-w-2xl text-left align-middle transition-all transform bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mt-20"
            >
              <div className="relative">
                <Search className="absolute top-4 left-4 w-5 h-5 text-indigo-500" />
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full h-14 pl-12 pr-4 bg-transparent border-0 border-b border-slate-200/50 dark:border-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 text-base outline-none font-medium"
                  placeholder="Buscar estudiantes por nombre, apellido o documento..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100/50 dark:bg-slate-800/50 rounded-md p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto p-2">
                {query.length > 0 && query.length < 2 && (
                  <p className="p-4 text-sm text-center text-slate-500">Escribe al menos 2 caracteres...</p>
                )}

                {loading && (
                  <div className="p-4 text-sm text-center text-slate-500 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                    Buscando en la base de datos...
                  </div>
                )}

                {!loading && query.length >= 2 && results.estudiantes.length === 0 && (
                  <p className="p-8 text-sm text-center text-slate-500">No se encontraron resultados para <span className="font-bold">"{query}"</span></p>
                )}

                {!loading && results.estudiantes.length > 0 && (
                  <div>
                    <h3 className="px-3 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Estudiantes Encontrados
                    </h3>
                    <ul className="space-y-1">
                      {results.estudiantes.map((estudiante) => (
                        <li key={estudiante.id}>
                          <button
                            onClick={() => navigateToStudent(estudiante.id)}
                            className="w-full flex items-center px-3 py-3 text-left rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all group shadow-sm hover:shadow"
                          >
                            <div className="flex-shrink-0 bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {estudiante.nombres} {estudiante.apellidos}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Doc: {estudiante.documento} • Grado: {estudiante.grado}
                              </p>
                            </div>
                            <div className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                              Atender ➔
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
