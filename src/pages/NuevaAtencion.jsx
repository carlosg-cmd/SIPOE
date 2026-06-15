import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Save, UploadCloud, Trash2, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import DictationButton from '../components/DictationButton';
import { useSync } from '../contexts/SyncContext';

export default function NuevaAtencion() {
  const { session } = useAuth();
  const { saveSmartly } = useSync();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const estudianteIdUrl = searchParams.get('estudianteId');
  const editIdUrl = searchParams.get('editId');

  const [listaEstudiantes, setListaEstudiantes] = useState([]);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const [isEditing, setIsEditing] = useState(!!editIdUrl);

  const initialFormState = {
    estudiante_id: estudianteIdUrl || '',
    fecha: new Date().toISOString().split('T')[0],
    sede: 'Divino Niño',
    tipo_remitente: 'Autónomo',
    nombre_remitente: '',
    fecha_remision: new Date().toISOString().split('T')[0],
    motivo_principal: '',
    descripcion: '',
    observaciones: '',
    observaciones_finales: '',
    orientaciones: '',
    acompanamiento: 'Individual',
    activacion_ruta: '',
    formato_fisico: 'Si',
    firma_estudiante: null,
    director_grupo: '',
    telefono: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const sedesDisponibles = ['Divino Niño', 'San José', 'Caracolí'];

  const motivosDisponibles = [
    'Desempeño académico', 'Convivencia escolar', 'Dificultades emocionales',
    'Problemas familiares', 'Sospecha consumo SPA', 'Sospecha de maltrato',
    'Déficit cognitivo', 'Dificultades de aprendizaje', 'Embarazo adolescente',
    'Riesgo de deserción', 'Orientación vocacional', 'Autolesión/Ideación suicida',
    'Episodio ansioso', 'Otro'
  ];

  const rutasDisponibles = ['Ninguna', 'Salud', 'ICBF', 'Comisaria de Familia', 'Policia de Infancia'];



  async function loadEditData(id) {
    const { data, error } = await supabase.from('atenciones').select('*').eq('id', id).single();
    if (data && !error) {
      let obs = data.observaciones || '';
      let obsFin = '';
      const obsFinMatch = obs.match(/\[Observaciones Finales\]([\s\S]*)$/);
      if (obsFinMatch) {
        obsFin = obsFinMatch[1].trim();
        obs = obs.replace(/\[Observaciones Finales\][\s\S]*$/, '').trim();
      }

      setFormData(prev => ({
        ...prev,
        ...data,
        observaciones: obs,
        observaciones_finales: obsFin,
        motivo_principal: data.motivos && data.motivos[0] ? data.motivos[0] : '',
        tipo_remitente: data.cargo_remitente || 'Autónomo',
        nombre_remitente: data.nombre_remitente === 'Autónomo' ? '' : data.nombre_remitente,
        firma_estudiante: data.firma_base64 || null
      }));
    }
  };

  // Guardar borrador automáticamente al cambiar formData
  useEffect(() => {
    // No guardar si está vacío el estudiante o si apenas está montando, o si estamos editando
    if (!isEditing && (formData.estudiante_id || formData.descripcion)) {
      localStorage.setItem('atencionDraft', JSON.stringify(formData));
    }
  }, [formData, isEditing]);

  function checkDraft() {
    const saved = localStorage.getItem('atencionDraft');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Solo sugerir restaurar si realmente había escrito algo importante
      if (parsed.descripcion || parsed.estudiante_id) {
        setDraftData(parsed);
        setShowRestorePrompt(true);
      }
    }
  };

  const restoreDraft = (restore) => {
    if (restore && draftData) {
      setFormData(draftData);
    } else {
      localStorage.removeItem('atencionDraft');
      if (estudianteIdUrl) {
        setFormData(prev => ({ ...prev, estudiante_id: estudianteIdUrl }));
      }
    }
    setShowRestorePrompt(false);
  };

  async function fetchEstudiantes() {
    const { data } = await supabase
      .from('estudiantes')
      .select('id, nombres, apellidos, documento, grado, jornada, director_grupo, sede_id, telefono, datos_acudiente')
      .order('nombres');
    if (data) setListaEstudiantes(data);
  };

  useEffect(() => {
    fetchEstudiantes();
    if (editIdUrl) {
      loadEditData(editIdUrl);
    } else {
      checkDraft();
    }
  }, [editIdUrl]);


  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Quitar fondo blanco/claro y oscurecer el trazo
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Si es muy claro, hacerlo transparente
          if (r > 200 && g > 200 && b > 200) {
            data[i + 3] = 0; // Alpha 0
          } else {
            // Oscurecer la firma (azul oscuro) para que resalte
            data[i] = 15;     // R
            data[i + 1] = 23; // G
            data[i + 2] = 61; // B
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const processedDataUrl = canvas.toDataURL('image/png');
        setFormData(prev => ({ ...prev, firma_estudiante: processedDataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const removeSignature = () => {
    setFormData(prev => ({ ...prev, firma_estudiante: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.motivo_principal) {
      alert("Por favor selecciona un motivo de atención.");
      return;
    }

    const nombreFinalRemitente = formData.tipo_remitente === 'Autónomo' ? 'Autónomo' : formData.nombre_remitente;
    
    // Preparar observaciones incluyendo la firma si existe (como base64 o anotación)
    let observacionFinal = `Sede: ${formData.sede}. Fecha Remisión: ${formData.fecha_remision}. Acompañamiento: ${formData.acompanamiento}. Formato físico: ${formData.formato_fisico}. ${formData.observaciones}`;
    
    if (formData.observaciones_finales) {
      observacionFinal += `\n[Observaciones Finales] ${formData.observaciones_finales}`;
    }

    if (formData.firma_estudiante && !formData.firma_estudiante.startsWith('http')) {
      observacionFinal += `\n[Firma Digital Adjunta en Sistema]`;
    }

    try {
      if (isEditing) {
        await saveSmartly('atenciones', 'update', {
          id: editIdUrl,
          estudiante_id: formData.estudiante_id,
          fecha: formData.fecha,
          nombre_remitente: nombreFinalRemitente,
          cargo_remitente: formData.tipo_remitente,
          motivos: [formData.motivo_principal],
          descripcion: formData.descripcion,
          observaciones: observacionFinal,
          orientaciones: formData.orientaciones,
          firma_base64: formData.firma_estudiante || null
        });
      } else {
        await saveSmartly('atenciones', 'insert', {
          estudiante_id: formData.estudiante_id,
          fecha: formData.fecha,
          nombre_remitente: nombreFinalRemitente,
          cargo_remitente: formData.tipo_remitente,
          motivos: [formData.motivo_principal],
          descripcion: formData.descripcion,
          observaciones: observacionFinal,
          orientaciones: formData.orientaciones,
          orientador_id: session.user.id,
          firma_base64: formData.firma_estudiante || null
        });
      }
    } catch (atencionError) {
      alert("Error al guardar la atención: " + atencionError.message);
      return;
    }

    if (formData.activacion_ruta && formData.activacion_ruta !== 'Ninguna') {
      await saveSmartly('activacion_ruta', 'insert', {
        atencion_id: editIdUrl || crypto.randomUUID(), // Nota: en modo offline, la relacion puede necesitar lógica extra
        entidad_destino: formData.activacion_ruta,
        descripcion: `Ruta activada por: ${formData.motivo_principal}`,
        acciones_realizadas: 'Remisión inicial'
      });
    }

    // Actualizar estudiante si modificaron el director de grupo o el teléfono
    const est = listaEstudiantes.find(e => e.id === formData.estudiante_id);
    if (est && (formData.director_grupo !== est.director_grupo || formData.telefono !== est.telefono)) {
      await supabase.from('estudiantes').update({
        director_grupo: formData.director_grupo || null,
        telefono: formData.telefono || null
      }).eq('id', formData.estudiante_id);
    }

    // Limpiar borrador al guardar exitosamente
    localStorage.removeItem('atencionDraft');
    navigate('/atenciones');
  };

  const estudianteSeleccionado = listaEstudiantes.find(e => e.id === formData.estudiante_id);

  // Actualizar los datos del formulario cuando cambia el estudiante seleccionado
  useEffect(() => {
    if (estudianteSeleccionado) {
      const sedeNombre = sedesDisponibles.find(s => s.toLowerCase().includes((estudianteSeleccionado.sede_id || '').toLowerCase())) || 'Divino Niño';
      setFormData(prev => ({ 
        ...prev, 
        sede: sedeNombre,
        director_grupo: estudianteSeleccionado.director_grupo || '',
        telefono: estudianteSeleccionado.telefono || ''
      }));
    }
  }, [estudianteSeleccionado]);

  return (
    <div className="max-w-4xl mx-auto h-full w-full flex flex-col">
      {/* Restore Draft Modal */}
      {showRestorePrompt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Tienes información sin guardar</h3>
            <p className="text-slate-500 text-sm mb-6">
              El sistema detectó que estabas llenando una atención anteriormente. ¿Deseas recuperar esos datos o empezar de cero?
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => restoreDraft(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Empezar de cero
              </button>
              <button 
                onClick={() => restoreDraft(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
              >
                Recuperar datos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center mb-6 flex-shrink-0">
        <Link to="/atenciones" className="p-2 mr-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{isEditing ? 'Editar Atención' : 'Registrar Nueva Atención'}</h1>
          <p className="text-sm text-slate-500 mt-1">{isEditing ? 'Modifica los datos del registro existente.' : 'Completa los campos para generar el registro en el historial.'}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-6 min-h-0">

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECCIÓN 1: ESTUDIANTE Y FECHA */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">1. Datos Básicos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Estudiante a atender</label>
              <select
                required
                value={formData.estudiante_id}
                onChange={e => setFormData({...formData, estudiante_id: e.target.value})}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800"
              >
                <option value="">Buscar y seleccionar estudiante...</option>
                {listaEstudiantes.map(e => (
                  <option key={e.id} value={e.id}>{e.nombres} {e.apellidos} - {e.grado}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sede Educativa</label>
              <select
                required
                value={formData.sede}
                onChange={e => setFormData({...formData, sede: e.target.value})}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800"
              >
                {sedesDisponibles.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Atención</label>
              <input
                type="date" required
                value={formData.fecha}
                onChange={e => setFormData({...formData, fecha: e.target.value})}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800"
              />
            </div>
          </div>

          {estudianteSeleccionado && (
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 mt-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-bl-xl">
                Autocompletado
              </div>
              <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-3">Información del Estudiante</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 text-sm items-end">
                <div>
                  <p className="text-slate-500 text-xs mb-1">Grado</p>
                  <p className="font-semibold text-slate-800">{estudianteSeleccionado.grado || 'No reg.'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Jornada</p>
                  <p className="font-semibold text-slate-800">{estudianteSeleccionado.jornada || 'Mañana'}</p>
                </div>
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Director de Grupo</label>
                  <input 
                    type="text" 
                    placeholder="Agregar director..."
                    value={formData.director_grupo}
                    onChange={e => setFormData({...formData, director_grupo: e.target.value})}
                    className="w-full bg-transparent border-b border-indigo-200 focus:border-indigo-500 outline-none font-semibold text-slate-800 placeholder-indigo-300 py-1"
                  />
                </div>
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Teléfono Estudiante</label>
                  <input 
                    type="text" 
                    placeholder="Agregar teléfono..."
                    value={formData.telefono}
                    onChange={e => setFormData({...formData, telefono: e.target.value})}
                    className="w-full bg-transparent border-b border-indigo-200 focus:border-indigo-500 outline-none font-semibold text-slate-800 placeholder-indigo-300 py-1"
                  />
                </div>
                <div className="col-span-2 mt-2">
                  <p className="text-slate-500 text-xs mb-1">Acudiente</p>
                  <p className="font-semibold text-slate-800">
                    {estudianteSeleccionado.datos_acudiente?.nombres} {estudianteSeleccionado.datos_acudiente?.apellidos} 
                    {estudianteSeleccionado.datos_acudiente?.parentesco ? ` (${estudianteSeleccionado.datos_acudiente.parentesco})` : ''}
                  </p>
                </div>
                <div className="col-span-2 mt-2">
                  <p className="text-slate-500 text-xs mb-1">Tel. Acudiente</p>
                  <p className="font-semibold text-slate-800">{estudianteSeleccionado.datos_acudiente?.telefono || 'No reg.'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECCIÓN 2: REMISIÓN Y MOTIVO */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">2. Remisión y Motivo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">¿Quién realiza la remisión?</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {['Autónomo', 'Docente', 'Acudiente', 'Otro'].map(tipo => (
                  <label key={tipo} className="flex items-center space-x-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                    <input 
                      type="radio" name="tipo_remitente" value={tipo}
                      checked={formData.tipo_remitente === tipo}
                      onChange={e => setFormData({...formData, tipo_remitente: e.target.value, nombre_remitente: ''})}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="text-sm font-medium text-slate-700">{tipo}</span>
                  </label>
                ))}
              </div>
              
              {formData.tipo_remitente !== 'Autónomo' && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                  <input
                    type="text" required
                    placeholder={`Escribe el nombre del ${formData.tipo_remitente.toLowerCase()}...`}
                    value={formData.nombre_remitente}
                    onChange={e => setFormData({...formData, nombre_remitente: e.target.value})}
                    className="w-full py-2 px-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 text-sm shadow-sm"
                  />
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de la Remisión</label>
              <input
                type="date" required
                value={formData.fecha_remision}
                onChange={e => setFormData({...formData, fecha_remision: e.target.value})}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800"
              />
              <p className="text-xs text-slate-500 mt-1">Día en que se reportó o remitió el caso (puede ser diferente a la atención).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Motivo Principal</label>
              <select
                required
                value={formData.motivo_principal}
                onChange={e => setFormData({...formData, motivo_principal: e.target.value})}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800"
              >
                <option value="">Selecciona el motivo...</option>
                {motivosDisponibles.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Acompañamiento</label>
              <select
                value={formData.acompanamiento}
                onChange={e => setFormData({...formData, acompanamiento: e.target.value})}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800"
              >
                <option value="Individual">Individual</option>
                <option value="C. Acudientes">Con Acudientes</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: DETALLES DE LA ATENCIÓN */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">3. Desarrollo de la Atención</h2>
          
          <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold text-gray-700">Descripción de la Situación</label>
            <DictationButton 
              onAppendText={(text) => setFormData(prev => ({...prev, descripcion: prev.descripcion + (prev.descripcion.endsWith(' ') ? '' : ' ') + text}))} 
            />
          </div>
            <textarea
              required rows="4"
              value={formData.descripcion}
              onChange={e => setFormData({...formData, descripcion: e.target.value})}
              className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 resize-none"
              placeholder="Narra los hechos o la situación comentada durante la atención..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">Observaciones</label>
                <DictationButton 
                  onAppendText={(text) => setFormData(prev => ({...prev, observaciones: prev.observaciones + (prev.observaciones.endsWith(' ') ? '' : ' ') + text}))} 
                />
              </div>
              <textarea
                rows="3"
                value={formData.observaciones}
                onChange={e => setFormData({...formData, observaciones: e.target.value})}
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 resize-none"
              ></textarea>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">Orientaciones / Recomendaciones</label>
                <DictationButton 
                  onAppendText={(text) => setFormData(prev => ({...prev, orientaciones: prev.orientaciones + (prev.orientaciones.endsWith(' ') ? '' : ' ') + text}))} 
                />
              </div>
              <textarea
                rows="3"
                value={formData.orientaciones}
                onChange={e => setFormData({...formData, orientaciones: e.target.value})}
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 resize-none"
              ></textarea>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">Observaciones Finales</label>
                <DictationButton 
                  onAppendText={(text) => setFormData(prev => ({...prev, observaciones_finales: prev.observaciones_finales + (prev.observaciones_finales.endsWith(' ') ? '' : ' ') + text}))} 
                />
              </div>
              <textarea
                rows="3"
                value={formData.observaciones_finales}
                onChange={e => setFormData({...formData, observaciones_finales: e.target.value})}
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* SECCIÓN 4: RUTA Y FIRMA */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">4. Cierre y Formalización</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Activación de Ruta</label>
              <select
                value={formData.activacion_ruta}
                onChange={e => setFormData({...formData, activacion_ruta: e.target.value})}
                className="w-full py-2.5 px-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              >
                {rutasDisponibles.map(ruta => (
                  <option key={ruta} value={ruta}>{ruta}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">¿Firmó formato de atención físico?</label>
              <select
                value={formData.formato_fisico}
                onChange={e => setFormData({...formData, formato_fisico: e.target.value})}
                className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800"
              >
                <option value="Si">Sí, firmado</option>
                <option value="No">No firmado</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Firma Digital del Estudiante (Opcional)</label>
            
            {formData.firma_estudiante ? (
              <div className="relative inline-block border-2 border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                <img 
                  src={formData.firma_estudiante} 
                  alt="Firma del estudiante" 
                  className="max-h-32 object-contain bg-transparent"
                />
                <button 
                  type="button"
                  onClick={removeSignature}
                  className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-colors shadow-sm"
                  title="Eliminar firma"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-xl p-8 text-center hover:bg-indigo-50 transition-colors relative cursor-pointer">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg" 
                  onChange={handleSignatureUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-500 mb-3">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-indigo-900 mb-1">
                    Sube la foto de la firma (JPG/PNG)
                  </p>
                  <p className="text-xs text-indigo-500/70">
                    El sistema limpiará el fondo automáticamente
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTÓN FINAL */}
        <div className="flex justify-end mt-8">
          <button 
            type="submit" 
            className="flex items-center px-8 py-3.5 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all"
          >
            <Save className="w-5 h-5 mr-2" />
            {isEditing ? 'Guardar Cambios' : 'Guardar Atención Escolar'}
          </button>
        </div>

      </form>
      </div>
    </div>
  );
}
