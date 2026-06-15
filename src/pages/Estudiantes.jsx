import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Search, UserPlus, FileSpreadsheet, Upload, Download, Loader2, AlertCircle, X, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useSync } from '../contexts/SyncContext';

export default function Estudiantes() {
  const { saveSmartly } = useSync();
  const [estudiantes, setEstudiantes] = useState([]);
  const [totalEstudiantes, setTotalEstudiantes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para el Modal de Importación
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  // Estados para Modal de Estudiante (Nuevo/Editar)
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    documento: '', nombres: '', apellidos: '', grado: '',
    direccion: '', eps: '', telefono: '',
    datos_acudiente: { nombres: '', apellidos: '', parentesco: '', telefono: '' }
  });

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  const fetchEstudiantes = async () => {
    setLoading(true);
    
    const { count } = await supabase.from('estudiantes').select('*', { count: 'exact', head: true });
    setTotalEstudiantes(count || 0);

    let allData = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('estudiantes')
        .select('*')
        .order('nombres', { ascending: true })
        .range(from, from + pageSize - 1);
      
      if (error || !data || data.length === 0) {
        hasMore = false;
      } else {
        allData = [...allData, ...data];
        from += pageSize;
        if (data.length < pageSize) {
          hasMore = false;
        }
      }
    }
    
    setEstudiantes(allData);
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    setImportStatus(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const bstr = event.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        
        // Empezar a leer desde la fila 7 (índice 6) porque las primeras 6 tienen el membrete del colegio
        const data = XLSX.utils.sheet_to_json(ws, { range: 6 });
        
        const registros = data.map(row => ({
          documento: String(row['DOCUMENTO'] || ''),
          tipo_documento: 'TI', // Por defecto para estudiantes
          nombres: String(row['NOMBRE'] || ''), // En el reporte vienen nombres y apellidos juntos
          apellidos: '', 
          grado: String(row['Grupo'] || ''),
          direccion: String(row['Dirección'] || ''),
          eps: String(row['IPS'] || ''),
          telefono: String(row['CELULAR'] || ''),
          datos_acudiente: {
            nombres: String(row['Nombres(Acudiente)'] || ''),
            apellidos: String(row['Apellidos(Acudiente)'] || ''),
            parentesco: String(row['Parentesco'] || ''),
            telefono: String(row['Cel. Acudiente'] || '')
          }
        })).filter(r => r.documento !== '' && r.nombres !== '');

        if (registros.length === 0) {
          setImportStatus({ type: 'error', msg: 'No se encontraron registros válidos. Verifica el formato del Excel.' });
          setImporting(false);
          return;
        }

        const { error } = await supabase.from('estudiantes').upsert(registros, { onConflict: 'documento' });

        if (error) {
          setImportStatus({ type: 'error', msg: 'Error subiendo a la base de datos: ' + error.message });
        } else {
          setImportStatus({ type: 'success', msg: `¡Se importaron ${registros.length} estudiantes correctamente!` });
          fetchEstudiantes();
          setTimeout(() => setShowImportModal(false), 3000);
        }
        setImporting(false);
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      setImportStatus({ type: 'error', msg: 'Error leyendo el archivo.' });
      setImporting(false);
    }
  };

  const [filterGrado, setFilterGrado] = useState('');

  // Extraer grados únicos de la lista de estudiantes para el filtro
  const gradosUnicos = [...new Set(estudiantes.map(e => e.grado).filter(g => g))].sort();

  const filteredEstudiantes = estudiantes.filter(e => {
    const fullName = `${e.nombres || ''} ${e.apellidos || ''}`.toLowerCase();
    const doc = String(e.documento || '');
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.trim() !== '');
    
    // Matches if every typed word is found anywhere in the name, OR if the whole query matches the document
    const matchesSearch = searchTerms.length === 0 || 
                          searchTerms.every(term => fullName.includes(term)) || 
                          doc.includes(searchQuery.toLowerCase().trim());
                          
    const matchesGrado = filterGrado === '' || e.grado === filterGrado;
    return matchesSearch && matchesGrado;
  });

  return (
    <div className="max-w-7xl mx-auto h-full w-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Base de Datos de Estudiantes</h1>
            <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
              Total: {totalEstudiantes}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Gestiona la información personal y familiar de todos los alumnos de la institución.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-medium text-sm transition-colors border border-emerald-200"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Importar Excel
          </button>
          <button 
            onClick={() => {
              setEditingStudent(null);
              setStudentForm({ documento: '', nombres: '', apellidos: '', grado: '', direccion: '', eps: '', telefono: '', datos_acudiente: { nombres: '', apellidos: '', parentesco: '', telefono: '' }});
              setShowStudentModal(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Nuevo Estudiante
          </button>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-4 flex-shrink-0">
        <div className="flex items-center flex-1">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o documento (sin importar el orden)..." 
            className="flex-1 bg-transparent border-none outline-none text-slate-700 dark:text-white placeholder-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="sm:border-l sm:border-slate-200 sm:pl-4">
          <select
            value={filterGrado}
            onChange={(e) => setFilterGrado(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 py-2 px-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos los grados</option>
            {gradosUnicos.map(grado => (
              <option key={grado} value={grado}>{grado}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0 mb-6">
        {loading ? (
          <div className="flex-1 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-full"></div>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full"></div>
              ))}
            </div>
          </div>
        ) : filteredEstudiantes.length === 0 ? (
          <div className="text-center py-20 flex-1 flex flex-col justify-center items-center opacity-80">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4 ring-8 ring-slate-50 dark:ring-slate-900/50">
              <Users className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aún no hay estudiantes</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm max-w-sm">No se encontraron registros en la base de datos que coincidan con los criterios de búsqueda.</p>
            <button 
              onClick={() => {
                setEditingStudent(null);
                setStudentForm({ documento: '', nombres: '', apellidos: '', grado: '', direccion: '', eps: '', telefono: '', datos_acudiente: { nombres: '', apellidos: '', parentesco: '', telefono: '' }});
                setShowStudentModal(true);
              }}
              className="mt-6 inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 rounded-xl font-bold text-sm transition-transform hover:scale-105"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Registrar Primer Estudiante
            </button>
          </div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="min-w-full divide-y divide-slate-200 relative">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">Documento</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">Nombre Completo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">Grado</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredEstudiantes.map((est) => (
                  <tr key={est.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-normal break-words text-sm text-slate-600 font-medium">{est.documento}</td>
                    <td className="px-6 py-4 whitespace-normal break-words">
                      <div className="text-sm font-semibold text-slate-900">{est.nombres} {est.apellidos}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-normal break-words text-sm text-slate-500">{est.grado || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-normal break-words text-right text-sm font-medium">
                      <button 
                        onClick={() => {
                          setEditingStudent(est);
                          setStudentForm({
                            documento: est.documento || '',
                            nombres: est.nombres || '',
                            apellidos: est.apellidos || '',
                            grado: est.grado || '',
                            direccion: est.direccion || '',
                            eps: est.eps || '',
                            telefono: est.telefono || '',
                            datos_acudiente: est.datos_acudiente || { nombres: '', apellidos: '', parentesco: '', telefono: '' }
                          });
                          setShowStudentModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Ver/Editar
                      </button>
                      <Link to={`/atenciones/nueva?estudianteId=${est.id}`} className="text-emerald-600 hover:text-emerald-900">
                        Atender
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Importación Masiva */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 sm:p-8 relative">
            <button 
              onClick={() => setShowImportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Importación Masiva</h2>
              <p className="mt-2 text-sm text-slate-500">
                Sube tu archivo de Excel (.xlsx) con la lista completa de estudiantes para poblar el sistema.
              </p>
            </div>

            {importStatus && (
              <div className={`p-4 rounded-xl mb-6 text-sm flex items-start ${importStatus.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <p>{importStatus.msg}</p>
              </div>
            )}

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 hover:border-emerald-300 transition-all cursor-pointer relative">
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                disabled={importing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              {importing ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
                  <p className="text-sm font-medium text-slate-600">Procesando archivo...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-slate-400 mb-3" />
                  <p className="text-sm font-semibold text-indigo-600 mb-1">Haz clic para buscar tu archivo</p>
                  <p className="text-xs text-slate-500">Soporta .XLSX o .CSV (Max 10MB)</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium mb-2">Columnas esperadas en la primera fila:</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-600">documento</span>
                <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-600">nombres</span>
                <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-600">apellidos</span>
                <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-600">grado</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo / Editar Estudiante */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl max-w-2xl w-full p-6 sm:p-8 relative my-8">
            <button 
              onClick={() => setShowStudentModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              {editingStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
            </h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                if (editingStudent) {
                  await saveSmartly('estudiantes', 'update', studentForm);
                  toast.success('Estudiante actualizado');
                } else {
                  await saveSmartly('estudiantes', 'insert', studentForm);
                  toast.success('Estudiante registrado');
                }
                setShowStudentModal(false);
                fetchEstudiantes();
              } catch (err) {
                toast.error('Error al guardar');
              }
            }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Documento</label>
                  <input required type="text" value={studentForm.documento} onChange={e => setStudentForm({...studentForm, documento: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Grado</label>
                  <input type="text" value={studentForm.grado} onChange={e => setStudentForm({...studentForm, grado: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nombres</label>
                  <input required type="text" value={studentForm.nombres} onChange={e => setStudentForm({...studentForm, nombres: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Apellidos</label>
                  <input type="text" value={studentForm.apellidos} onChange={e => setStudentForm({...studentForm, apellidos: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                  <input type="text" value={studentForm.telefono} onChange={e => setStudentForm({...studentForm, telefono: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
                  <input type="text" value={studentForm.direccion} onChange={e => setStudentForm({...studentForm, direccion: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2 border-b border-slate-200 dark:border-slate-700 pb-2">Datos del Acudiente</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nombres Acudiente</label>
                  <input type="text" value={studentForm.datos_acudiente.nombres} onChange={e => setStudentForm({...studentForm, datos_acudiente: {...studentForm.datos_acudiente, nombres: e.target.value}})} className="w-full p-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Apellidos Acudiente</label>
                  <input type="text" value={studentForm.datos_acudiente.apellidos} onChange={e => setStudentForm({...studentForm, datos_acudiente: {...studentForm.datos_acudiente, apellidos: e.target.value}})} className="w-full p-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Parentesco</label>
                  <input type="text" value={studentForm.datos_acudiente.parentesco} onChange={e => setStudentForm({...studentForm, datos_acudiente: {...studentForm.datos_acudiente, parentesco: e.target.value}})} className="w-full p-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Teléfono Acudiente</label>
                  <input type="text" value={studentForm.datos_acudiente.telefono} onChange={e => setStudentForm({...studentForm, datos_acudiente: {...studentForm.datos_acudiente, telefono: e.target.value}})} className="w-full p-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">
                  {editingStudent ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
