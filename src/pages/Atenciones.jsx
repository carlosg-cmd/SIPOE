import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Search, Plus, FileText, Loader2, Calendar, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import PrintTemplate from '../components/PrintTemplate';
import PrintAtencionPadresTemplate from '../components/PrintAtencionPadresTemplate';
import PrintSeguimientoConvivenciaTemplate from '../components/PrintSeguimientoConvivenciaTemplate';
import PrintRemisionTemplate from '../components/PrintRemisionTemplate';
import PrintSaludTemplate from '../components/PrintSaludTemplate';
import PrintAtencionEscolarTemplate from '../components/PrintAtencionEscolarTemplate';
import PrintPadresAcudientesTemplate from '../components/PrintPadresAcudientesTemplate';
import PrintSeguimientoEscolarTemplate from '../components/PrintSeguimientoEscolarTemplate';
import PrintConsentimientoTemplate from '../components/PrintConsentimientoTemplate';
import PrintRemisionCoordinacionTemplate from '../components/PrintRemisionCoordinacionTemplate';
import PrintEntregaCasosTemplate from '../components/PrintEntregaCasosTemplate';
import PrintNotificacionInternaTemplate from '../components/PrintNotificacionInternaTemplate';
import PrintIntervencionesGrupalesTemplate from '../components/PrintIntervencionesGrupalesTemplate';
import PrintInformeEntregaCasosTemplate from '../components/PrintInformeEntregaCasosTemplate';

export default function Atenciones() {
  const { permisos } = useAuth();
  const [atenciones, setAtenciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // printState { data: object, type: 'informe' | 'padres' | 'remision' | 'salud' | 'consentimiento' | 'atencion' }
  const [printState, setPrintState] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    fetchAtenciones();
  }, []);

  const fetchAtenciones = async () => {
    try {
      const { data, error } = await supabase
        .from('atenciones')
        .select('*, estudiantes(*)')
        .order('fecha', { ascending: false });

      if (error) throw error;
      setAtenciones(data || []);
    } catch (error) {
      console.error('Error fetching atenciones:', error);
      toast.error('Error al cargar las atenciones');
    } finally {
      setLoading(false);
    }
  };



  const filteredAtenciones = atenciones.filter(a => {
    const estudiante = a.estudiantes ? `${a.estudiantes.nombres} ${a.estudiantes.apellidos}`.toLowerCase() : '';
    const doc = a.estudiantes?.documento || '';
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.trim() !== '');
    
    if (searchTerms.length === 0) return true;

    // Matches if every typed word is found anywhere in the name, OR if the whole query matches the document
    const matchesName = searchTerms.every(term => estudiante.includes(term));
    const matchesDoc = doc.includes(searchQuery.toLowerCase().trim());
    
    return matchesName || matchesDoc;
  });

  return (
    <div className="max-w-7xl mx-auto h-full w-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Registro de Atenciones</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Historial de visitas y remisiones a Orientación Escolar.
          </p>
        </div>
        
        {permisos?.can_edit && (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={async () => {
                const toastId = toast.loading('Exportando base de datos a Excel...');
                try {
                  const { exportAtencionesToExcel } = await import('../utils/exportToExcel');
                  await exportAtencionesToExcel();
                  toast.success('Excel exportado correctamente', { id: toastId });
                } catch (error) {
                  toast.error('Error al exportar a Excel', { id: toastId });
                }
              }}
              className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-medium text-sm transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              Exportar Excel
            </button>
            <Link 
              to="/atenciones/nueva"
              className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-medium text-sm transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Atención
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-4 mb-6 shadow-sm flex items-center flex-shrink-0">
        <Search className="w-5 h-5 text-slate-400 mr-3" />
        <input 
          type="text" 
          placeholder="Buscar atención por nombre o documento del estudiante (sin importar el orden)..." 
          className="flex-1 bg-transparent border-none outline-none text-slate-700 dark:text-white placeholder-slate-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex-1 flex flex-col min-h-0 mb-6 overflow-hidden">
        {loading ? (
          <div className="flex-1 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-full"></div>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full"></div>
              ))}
            </div>
          </div>
        ) : filteredAtenciones.length === 0 ? (
          <div className="text-center py-20 flex-1 flex flex-col justify-center items-center opacity-80">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4 ring-8 ring-slate-50 dark:ring-slate-900/50">
              <FileText className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No hay atenciones</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm max-w-sm">No se encontraron registros que coincidan con la búsqueda o aún no se han registrado visitas.</p>
          </div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 relative">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 sticky top-0 z-10 shadow-sm backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estudiante</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Remitente</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Motivos Principales</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                {filteredAtenciones.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-normal break-words text-sm text-slate-600 dark:text-slate-300 font-medium">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                        {a.fecha}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-normal break-words">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {a.estudiantes ? `${a.estudiantes.nombres} ${a.estudiantes.apellidos}` : 'Estudiante Borrado'}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{a.estudiantes?.grado}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-normal break-words text-sm text-slate-600 dark:text-slate-300">
                      {a.nombre_remitente || 'Autónomo'}
                      <div className="text-xs text-slate-400 dark:text-slate-500">{a.cargo_remitente}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(a.motivos || []).slice(0, 2).map((m, i) => (
                          <span key={i} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded-md border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                            {m}
                          </span>
                        ))}
                        {(a.motivos || []).length > 2 && (
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-md shadow-sm">
                            +{(a.motivos || []).length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-normal break-words text-right text-sm font-medium">
                      
                      <div className="relative inline-block text-left mr-4">
                        {permisos?.can_download && (
                          <button 
                            onClick={() => setOpenDropdownId(openDropdownId === a.id ? null : a.id)}
                            className="inline-flex justify-center items-center text-indigo-600 hover:text-indigo-900 transition-colors font-bold"
                          >
                            Exportar PDF
                            <ChevronDown className="w-4 h-4 ml-1" />
                          </button>
                        )}
                        
                        {openDropdownId === a.id && permisos?.can_download && (
                          <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                            <div className="py-1" role="menu">
                              <button
                                onClick={() => { setPrintState({ data: a, type: 'consentimiento' }); setOpenDropdownId(null); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium"
                              >
                                1. Consentimiento Informado
                              </button>
                              <button
                                onClick={() => { setPrintState({ data: a, type: 'atencion' }); setOpenDropdownId(null); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium border-t border-slate-100"
                              >
                                2. Atención Orientación Escolar
                              </button>
                              <button
                                onClick={() => { setPrintState({ data: a, type: 'padres_acudientes' }); setOpenDropdownId(null); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium border-t border-slate-100"
                              >
                                3. Atención a Padres/Acudientes
                              </button>
                              <button
                                onClick={() => { setPrintState({ data: a, type: 'convivencia' }); setOpenDropdownId(null); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium border-t border-slate-100"
                              >
                                4. Seguimiento Convivencia Escolar
                              </button>
                              <button
                                onClick={() => { setPrintState({ data: a, type: 'remision_coord' }); setOpenDropdownId(null); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium border-t border-slate-100"
                              >
                                5. Remisión Caso a Coordinación
                              </button>
                              <button
                                onClick={() => { setPrintState({ data: a, type: 'intervencion_grupal' }); setOpenDropdownId(null); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium border-t border-slate-100"
                              >
                                6. Intervenciones Grupales
                              </button>
                              <button
                                onClick={() => { setPrintState({ data: a, type: 'informe_entrega_casos' }); setOpenDropdownId(null); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium border-t border-slate-100"
                              >
                                7. Informe de Entrega de Casos
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                        {permisos?.can_edit && (
                          <Link 
                            to={`/atenciones/nueva?editId=${a.id}`}
                            className="text-amber-600 hover:text-amber-900 transition-colors mr-4 font-semibold"
                            title="Editar esta atención"
                          >
                            Editar
                          </Link>
                        )}
                        <Link to={`/seguimientos?nuevo=true&estudiante_id=${a.estudiantes?.id}`} className="text-emerald-600 hover:text-emerald-900 transition-colors font-semibold">Seguimiento</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {printState?.type === 'informe' && (
        <PrintTemplate data={printState.data} onClose={() => setPrintState(null)} />
      )}
      {printState?.type === 'padres' && (
        <PrintAtencionPadresTemplate data={printState.data} onClose={() => setPrintState(null)} />
      )}
      {printState?.type === 'remision' && (
        <PrintRemisionTemplate data={printState.data} onClose={() => setPrintState(null)} />
      )}
      {printState?.type === 'salud' && (
        <PrintSaludTemplate data={printState.data} onClose={() => setPrintState(null)} />
      )}
      {printState?.type === 'consentimiento' && (
        <PrintConsentimientoTemplate data={printState.data} onClose={() => setPrintState(null)} />
      )}
      {printState?.type === 'atencion' && (
        <PrintAtencionEscolarTemplate data={printState.data} onClose={() => setPrintState(null)} />
      )}
      {printState && printState.type === 'padres_acudientes' && (
        <PrintAtencionPadresTemplate data={printState.data} onClose={() => setPrintState(null)} />
      )}
      {printState && printState.type === 'convivencia' && (
        <PrintSeguimientoConvivenciaTemplate data={printState.data} onClose={() => setPrintState(null)} />
      )}
      {printState && printState.type === 'remision_coord' && (
        <PrintRemisionCoordinacionTemplate data={printState.data} onClose={() => setPrintState(null)} />
      )}
      {printState && printState.type === 'intervencion_grupal' && (
        <PrintIntervencionesGrupalesTemplate data={printState.data} onClose={() => setPrintState(null)} />
      )}
      {printState && printState.type === 'informe_entrega_casos' && (
        <PrintInformeEntregaCasosTemplate data={printState.data} onClose={() => setPrintState(null)} />
      )}
    </div>
  );
}
