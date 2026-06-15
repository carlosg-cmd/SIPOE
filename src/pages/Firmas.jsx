import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { PenTool, Upload, Search, Trash2, Edit3, X, User, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const TIPOS = [
  { value: 'estudiante', label: 'Estudiante', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { value: 'acudiente', label: 'Acudiente', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' },
  { value: 'orientador', label: 'Orientador', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  { value: 'rector', label: 'Rector', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
];

const getTipoBadge = (tipo) => TIPOS.find(t => t.value === tipo) || TIPOS[0];

const processSignature = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          if (r > 200 && g > 200 && b > 200) {
            data[i + 3] = 0;
          } else {
            data[i] = 15;
            data[i + 1] = 23;
            data[i + 2] = 42;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const initialForm = {
  tipo: 'estudiante',
  nombre_completo: '',
  documento: '',
  estudiante_id: null,
};

export default function Firmas() {
  const [firmas, setFirmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingFirma, setEditingFirma] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  // Image state
  const [selectedFile, setSelectedFile] = useState(null);
  const [processedPreview, setProcessedPreview] = useState(null);
  const [processedBlob, setProcessedBlob] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Student search state
  const [studentSearch, setStudentSearch] = useState('');
  const [studentResults, setStudentResults] = useState([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const studentSearchTimeout = useRef(null);

  // --- Data Fetching ---
  const fetchFirmas = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('firmas')
        .select('*, estudiantes(nombres, apellidos)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFirmas(data || []);
    } catch (error) {
      console.error('Error fetching firmas:', error);
      toast.error('Error al cargar las firmas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFirmas();
  }, [fetchFirmas]);

  // --- Filtering ---
  const filteredFirmas = firmas.filter(f => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      (f.nombre_completo || '').toLowerCase().includes(q) ||
      (f.documento || '').toLowerCase().includes(q)
    );
  });

  // --- Student Search ---
  const searchStudents = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setStudentResults([]);
      return;
    }
    setSearchingStudents(true);
    try {
      const { data, error } = await supabase
        .from('estudiantes')
        .select('id, nombres, apellidos, documento, grado, datos_acudiente')
        .or(`nombres.ilike.%${query}%,apellidos.ilike.%${query}%,documento.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setStudentResults(data || []);
    } catch {
      setStudentResults([]);
    } finally {
      setSearchingStudents(false);
    }
  }, []);

  const handleStudentSearchChange = (value) => {
    setStudentSearch(value);
    if (studentSearchTimeout.current) clearTimeout(studentSearchTimeout.current);
    studentSearchTimeout.current = setTimeout(() => searchStudents(value), 350);
  };

  const selectStudent = (student) => {
    setSelectedStudent(student);
    setStudentResults([]);
    setStudentSearch(`${student.nombres} ${student.apellidos}`);

    if (form.tipo === 'estudiante') {
      setForm(prev => ({
        ...prev,
        nombre_completo: `${student.nombres} ${student.apellidos}`.trim(),
        documento: student.documento || '',
        estudiante_id: student.id,
      }));
    } else if (form.tipo === 'acudiente') {
      const acu = student.datos_acudiente || {};
      setForm(prev => ({
        ...prev,
        nombre_completo: `${acu.nombres || ''} ${acu.apellidos || ''}`.trim(),
        documento: acu.documento || '',
        estudiante_id: student.id,
      }));
    }
  };

  // --- Image Handling ---
  const handleFileSelect = async (file) => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Solo se permiten archivos .jpg, .jpeg o .png');
      return;
    }
    setSelectedFile(file);
    try {
      const blob = await processSignature(file);
      setProcessedBlob(blob);
      const url = URL.createObjectURL(blob);
      setProcessedPreview(url);
    } catch {
      toast.error('Error al procesar la imagen');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  // --- Modal Management ---
  const openCreateModal = () => {
    setEditingFirma(null);
    setForm(initialForm);
    setSelectedFile(null);
    setProcessedPreview(null);
    setProcessedBlob(null);
    setStudentSearch('');
    setStudentResults([]);
    setSelectedStudent(null);
    setShowModal(true);
  };

  const openEditModal = (firma) => {
    setEditingFirma(firma);
    setForm({
      tipo: firma.tipo,
      nombre_completo: firma.nombre_completo || '',
      documento: firma.documento || '',
      estudiante_id: firma.estudiante_id || null,
    });
    setSelectedFile(null);
    setProcessedPreview(null);
    setProcessedBlob(null);
    setStudentSearch(
      firma.estudiantes
        ? `${firma.estudiantes.nombres} ${firma.estudiantes.apellidos}`
        : ''
    );
    setStudentResults([]);
    setSelectedStudent(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFirma(null);
    if (processedPreview) URL.revokeObjectURL(processedPreview);
    setProcessedPreview(null);
    setProcessedBlob(null);
    setSelectedFile(null);
    setStudentSearch('');
    setStudentResults([]);
    setSelectedStudent(null);
  };

  // --- Save ---
  const handleSave = async () => {
    if (!form.nombre_completo.trim()) {
      toast.error('El nombre completo es obligatorio');
      return;
    }
    if (!form.documento.trim()) {
      toast.error('El documento es obligatorio');
      return;
    }
    if (!editingFirma && !processedBlob) {
      toast.error('Debes subir una imagen de firma');
      return;
    }

    setSaving(true);
    try {
      let imagen_url = editingFirma?.imagen_url || '';

      // Upload new image if provided
      if (processedBlob) {
        // Delete old image if editing
        if (editingFirma?.imagen_url) {
          const oldPath = editingFirma.imagen_url.split('/firmas/')[1];
          if (oldPath) {
            await supabase.storage.from('firmas').remove([oldPath]);
          }
        }

        const fileName = `firma_${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from('firmas')
          .upload(fileName, processedBlob, { contentType: 'image/png', upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('firmas').getPublicUrl(fileName);
        imagen_url = urlData.publicUrl;
      }

      const record = {
        tipo: form.tipo,
        nombre_completo: form.nombre_completo.trim(),
        documento: form.documento.trim(),
        estudiante_id: (form.tipo === 'estudiante' || form.tipo === 'acudiente') ? form.estudiante_id : null,
        imagen_url,
      };

      if (editingFirma) {
        const { error } = await supabase
          .from('firmas')
          .update(record)
          .eq('id', editingFirma.id);
        if (error) throw error;
        toast.success('Firma actualizada correctamente');
      } else {
        const { error } = await supabase
          .from('firmas')
          .insert([record]);
        if (error) throw error;
        toast.success('Firma guardada correctamente');
      }

      closeModal();
      fetchFirmas();
    } catch (error) {
      console.error('Error saving firma:', error);
      toast.error('Error al guardar la firma: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // --- Delete ---
  const handleDelete = async (firma) => {
    if (!window.confirm(`¿Estás seguro de eliminar la firma de "${firma.nombre_completo}"? Esta acción no se puede deshacer.`)) return;

    try {
      // Delete image from storage
      if (firma.imagen_url) {
        const filePath = firma.imagen_url.split('/firmas/')[1];
        if (filePath) {
          await supabase.storage.from('firmas').remove([filePath]);
        }
      }

      const { error } = await supabase.from('firmas').delete().eq('id', firma.id);
      if (error) throw error;

      toast.success('Firma eliminada correctamente');
      fetchFirmas();
    } catch (error) {
      console.error('Error deleting firma:', error);
      toast.error('Error al eliminar la firma');
    }
  };

  const needsStudent = form.tipo === 'estudiante' || form.tipo === 'acudiente';

  // --- Render ---
  return (
    <div className="max-w-7xl mx-auto h-full w-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <PenTool className="w-7 h-7 text-indigo-500" />
            Gestión de Firmas Digitales
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sube, asocia y gestiona las firmas de estudiantes, acudientes y orientadores
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
        >
          <Upload className="w-4 h-4" />
          Subir Firma
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex-shrink-0">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o documento..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="ml-3 text-slate-500 dark:text-slate-400">Cargando firmas...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredFirmas.length === 0 && (
        <div className="text-center py-20 flex-1 flex flex-col justify-center items-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <PenTool className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {searchQuery ? 'Sin resultados' : 'No hay firmas registradas'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {searchQuery
              ? 'Intenta con otro término de búsqueda.'
              : 'Comienza subiendo la primera firma digital.'}
          </p>
        </div>
      )}

      {/* Firmas List */}
      {!loading && filteredFirmas.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0 mb-6">
          <div className="overflow-auto flex-1">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 relative">
              <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-32 bg-slate-50 dark:bg-slate-900">Firma</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-900">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-900">Documento</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-900">Tipo</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredFirmas.map((firma) => {
                  const badge = getTipoBadge(firma.tipo);
                  const studentName = firma.estudiantes
                    ? `${firma.estudiantes.nombres} ${firma.estudiantes.apellidos}`
                    : null;
                  
                  return (
                    <tr key={firma.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-normal break-words">
                        <div className="w-24 h-10 bg-slate-50 dark:bg-slate-800 rounded flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700"
                           style={{
                             backgroundImage: 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                             backgroundSize: '8px 8px',
                             backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                           }}>
                          {firma.imagen_url ? (
                            <img src={firma.imagen_url} alt={`Firma de ${firma.nombre_completo}`} className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{firma.nombre_completo}</div>
                        {studentName && (
                          <div className="text-xs text-slate-500 flex items-center mt-1">
                            <User className="w-3 h-3 mr-1 text-slate-400" />
                            Estudiante: {studentName}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-normal break-words text-sm text-slate-600 dark:text-slate-400">
                        {firma.documento}
                      </td>
                      <td className="px-6 py-4 whitespace-normal break-words">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-normal break-words text-right text-sm font-medium">
                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(firma)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(firma)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-800 z-10 flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PenTool className="w-5 h-5 text-indigo-500" />
                {editingFirma ? 'Editar Firma' : 'Subir Nueva Firma'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {/* Tipo Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tipo de firmante
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TIPOS.map((tipo) => (
                    <button
                      key={tipo.value}
                      type="button"
                      onClick={() => {
                        setForm(prev => ({
                          ...prev,
                          tipo: tipo.value,
                          nombre_completo: '',
                          documento: '',
                          estudiante_id: null,
                        }));
                        setStudentSearch('');
                        setSelectedStudent(null);
                        setStudentResults([]);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                        form.tipo === tipo.value
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      {tipo.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Searcher */}
              {needsStudent && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Buscar estudiante
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => handleStudentSearchChange(e.target.value)}
                      placeholder="Nombre o documento del estudiante..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                    />
                    {searchingStudents && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 animate-spin" />
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {studentResults.length > 0 && (
                    <div className="mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {studentResults.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => selectStudent(s)}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors border-b border-slate-100 dark:border-slate-600 last:border-b-0"
                        >
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {s.nombres} {s.apellidos}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Doc: {s.documento} · Grado: {s.grado}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Nombre Completo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={form.nombre_completo}
                  onChange={(e) => setForm(prev => ({ ...prev, nombre_completo: e.target.value }))}
                  placeholder="Nombre completo del firmante"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                />
              </div>

              {/* Documento */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Documento
                </label>
                <input
                  type="text"
                  value={form.documento}
                  onChange={(e) => setForm(prev => ({ ...prev, documento: e.target.value }))}
                  placeholder="Número de documento"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                />
              </div>

              {/* Image Upload Zone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Imagen de la firma
                </label>

                {/* Drop zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    dragging
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    className="hidden"
                  />

                  {!processedPreview && !editingFirma?.imagen_url && (
                    <div>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Arrastra una imagen aquí o <span className="text-indigo-600 dark:text-indigo-400 font-medium">haz clic para seleccionar</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">JPG, JPEG o PNG</p>
                    </div>
                  )}

                  {/* Existing image (editing, no new file) */}
                  {!processedPreview && editingFirma?.imagen_url && (
                    <div>
                      <div
                        className="inline-block p-3 rounded-lg mb-2"
                        style={{
                          backgroundImage:
                            'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                          backgroundSize: '12px 12px',
                          backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
                        }}
                      >
                        <img
                          src={editingFirma.imagen_url}
                          alt="Firma actual"
                          className="max-h-20 max-w-full object-contain"
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Firma actual · Haz clic o arrastra para reemplazar
                      </p>
                    </div>
                  )}

                  {/* Processed preview */}
                  {processedPreview && (
                    <div>
                      <div
                        className="inline-block p-3 rounded-lg mb-2"
                        style={{
                          backgroundImage:
                            'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                          backgroundSize: '12px 12px',
                          backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
                        }}
                      >
                        <img
                          src={processedPreview}
                          alt="Vista previa procesada"
                          className="max-h-24 max-w-full object-contain"
                        />
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✓ Firma procesada (fondo removido)
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {selectedFile?.name} · Haz clic para cambiar
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-slate-800 z-10 flex items-center justify-end gap-3 p-5 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <PenTool className="w-4 h-4" />
                    {editingFirma ? 'Actualizar Firma' : 'Guardar Firma'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
