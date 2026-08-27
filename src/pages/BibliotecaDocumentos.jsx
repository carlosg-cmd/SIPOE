import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Search, BookOpen, Trash2, Printer, Edit, Download, Calendar, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

// Templates
import PrintConsentimientoTemplate from '../components/PrintConsentimientoTemplate';
import PrintAtencionEscolarTemplate from '../components/PrintAtencionEscolarTemplate';
import PrintAtencionPadresTemplate from '../components/PrintAtencionPadresTemplate';
import PrintSeguimientoConvivenciaTemplate from '../components/PrintSeguimientoConvivenciaTemplate';
import PrintRemisionCoordinacionTemplate from '../components/PrintRemisionCoordinacionTemplate';
import PrintIntervencionesGrupalesTemplate from '../components/PrintIntervencionesGrupalesTemplate';
import PrintInformeEntregaCasosTemplate from '../components/PrintInformeEntregaCasosTemplate';
import PrintRemisionEntidadesTemplate from '../components/PrintRemisionEntidadesTemplate';

export default function BibliotecaDocumentos() {
  const { permisos, userProfile } = useAuth();
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  
  // printState { data: object, type: string }
  const [printState, setPrintState] = useState(null);

  useEffect(() => {
    fetchDocumentos();
  }, []);

  const fetchDocumentos = async () => {
    try {
      const { data, error } = await supabase
        .from('documentos_generados')
        .select(`
          *,
          orientador:perfiles(nombre)
        `)
        .order('fecha_generacion', { ascending: false });

      if (error) throw error;
      setDocumentos(data || []);
    } catch (error) {
      console.error('Error fetching documentos:', error);
      toast.error('Error al cargar la biblioteca de documentos');
    } finally {
      setLoading(false);
    }
  };

  const eliminarDocumento = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este documento de la biblioteca? No se podrá recuperar.")) return;
    try {
      const { error } = await supabase.from('documentos_generados').delete().eq('id', id);
      if (error) throw error;
      fetchDocumentos();
      toast.success('Documento eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el documento');
    }
  };

  const abrirDocumento = (doc) => {
    // Reconstruimos el objeto data para que los templates lo entiendan.
    // El snapshot guardó la mayoría de datos en 'datos_snapshot'.
    // Combinamos esto con la info básica.
    const dataForTemplate = {
      ...doc.datos_snapshot,
      id: doc.atencion_id, // Por si lo necesita
      estudiante: {
        id: doc.estudiante_id,
        nombres: doc.nombre_estudiante.split(' ')[0], // Aproximado
        apellidos: doc.nombre_estudiante.split(' ').slice(1).join(' '),
        grado: doc.datos_snapshot?.grado,
        documento: doc.datos_snapshot?.documento,
        // Algunos templates esperan esto
      },
      // Algunos templates usan estudiantes
      estudiantes: {
        id: doc.estudiante_id,
        nombres: doc.nombre_estudiante, // Aproximado
        apellidos: '',
        grado: doc.datos_snapshot?.grado,
        documento: doc.datos_snapshot?.documento,
      }
    };
    
    setPrintState({ data: dataForTemplate, type: doc.tipo_formato });
  };

  const filteredDocs = documentos.filter(d => {
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.trim() !== '');
    const matchesName = searchTerms.every(term => d.nombre_estudiante?.toLowerCase().includes(term));
    const matchesTipo = tipoFiltro ? d.tipo_formato === tipoFiltro : true;
    return matchesName && matchesTipo;
  });

  return (
    <div className="max-w-7xl mx-auto h-full w-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            Biblioteca de Documentos
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Historial de formatos PDF generados y guardados en el sistema.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 flex-shrink-0">
        <div className="col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-4 shadow-sm flex items-center">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input 
            type="text" 
            placeholder="Buscar por nombre de estudiante..." 
            className="flex-1 bg-transparent border-none outline-none text-slate-700 dark:text-white placeholder-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="col-span-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-4 shadow-sm flex items-center">
          <Filter className="w-5 h-5 text-slate-400 mr-3" />
          <select 
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-slate-700 dark:text-white text-sm"
          >
            <option value="">Todos los formatos</option>
            <option value="consentimiento">Consentimiento Informado</option>
            <option value="atencion">Atención Escolar</option>
            <option value="padres_acudientes">Atención a Padres</option>
            <option value="convivencia">Seguimiento Convivencia</option>
            <option value="remision_coord">Remisión Coordinación</option>
            <option value="intervencion_grupal">Intervenciones Grupales</option>
            <option value="informe_entrega_casos">Informe Entrega de Casos</option>
            <option value="remision_entidades">Remisión a Entidades</option>
          </select>
        </div>
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
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-20 flex-1 flex flex-col justify-center items-center opacity-80">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4 ring-8 ring-slate-50 dark:ring-slate-900/50">
              <BookOpen className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Biblioteca vacía</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm max-w-sm">No se encontraron documentos guardados. Los documentos se guardan desde el menú "Exportar PDF" en cada atención.</p>
          </div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 relative">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 sticky top-0 z-10 shadow-sm backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-32">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Documento</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estudiante / Destinatario</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Orientador</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-medium">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                        {new Date(doc.fecha_generacion).toLocaleDateString('es-CO')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                        {doc.nombre_formato}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 inline-block px-2 py-0.5 rounded">
                        {doc.tipo_formato}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {doc.nombre_estudiante || 'N/A'}
                      </div>
                      {doc.datos_snapshot?.grado && (
                        <div className="text-xs text-slate-500 mt-0.5">Grado: {doc.datos_snapshot.grado}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {doc.orientador?.nombre || 'Desconocido'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => abrirDocumento(doc)}
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-900 transition-colors font-bold mr-4 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg"
                        title="Ver, Editar, Imprimir o Descargar"
                      >
                        <Edit className="w-4 h-4" />
                        Abrir
                      </button>
                      
                      {(permisos?.can_delete || userProfile?.id === doc.orientador_id) && (
                        <button 
                          onClick={() => eliminarDocumento(doc.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Renderizado Condicional de Modales de Impresión */}
      {printState?.type === 'consentimiento' && <PrintConsentimientoTemplate data={printState.data} onClose={() => setPrintState(null)} />}
      {printState?.type === 'atencion' && <PrintAtencionEscolarTemplate data={printState.data} onClose={() => setPrintState(null)} />}
      {printState?.type === 'padres_acudientes' && <PrintAtencionPadresTemplate data={printState.data} onClose={() => setPrintState(null)} />}
      {printState?.type === 'convivencia' && <PrintSeguimientoConvivenciaTemplate data={printState.data} onClose={() => setPrintState(null)} />}
      {printState?.type === 'remision_coord' && <PrintRemisionCoordinacionTemplate data={printState.data} onClose={() => setPrintState(null)} />}
      {printState?.type === 'intervencion_grupal' && <PrintIntervencionesGrupalesTemplate data={printState.data} onClose={() => setPrintState(null)} />}
      {printState?.type === 'informe_entrega_casos' && <PrintInformeEntregaCasosTemplate data={printState.data} onClose={() => setPrintState(null)} />}
      {printState?.type === 'remision_entidades' && <PrintRemisionEntidadesTemplate data={printState.data} onClose={() => setPrintState(null)} />}
    </div>
  );
}
