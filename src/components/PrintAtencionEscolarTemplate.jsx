import React, { useState, useEffect } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { X, ArrowLeft, FileText } from 'lucide-react';
import PdfAtencionEscolar from './PdfAtencionEscolar';
import { supabase } from '../supabase';

export default function PrintAtencionEscolarTemplate({ data, onClose }) {
  if (!data) return null;

  const est = data.estudiantes || data.estudiante || data || {};
  
  let acudienteNombre = '';
  let acudienteTelefono = '';
  let acudienteParentesco = '';
  let acudienteDoc = '';

  if (typeof est.datos_acudiente === 'string') {
    try {
      const parsed = JSON.parse(est.datos_acudiente);
      acudienteNombre = `${parsed.nombres || ''} ${parsed.apellidos || ''}`.trim();
      if (!acudienteNombre && parsed.nombre_completo) acudienteNombre = parsed.nombre_completo;
      if (!acudienteNombre && parsed.nombres) acudienteNombre = parsed.nombres;
      acudienteTelefono = parsed.telefono || '';
      acudienteParentesco = parsed.parentesco || '';
      acudienteDoc = parsed.documento || '';
    } catch(e) {
      acudienteNombre = est.datos_acudiente.trim();
    }
  } else if (est.datos_acudiente) {
    acudienteNombre = `${est.datos_acudiente.nombres || ''} ${est.datos_acudiente.apellidos || ''}`.trim();
    if (!acudienteNombre && est.datos_acudiente.nombre_completo) acudienteNombre = est.datos_acudiente.nombre_completo;
    if (!acudienteNombre && est.datos_acudiente.nombres) acudienteNombre = est.datos_acudiente.nombres;
    acudienteTelefono = est.datos_acudiente.telefono || '';
    acudienteParentesco = est.datos_acudiente.parentesco || '';
    acudienteDoc = est.datos_acudiente.documento || '';
  }

  let nombresPart = '';
  let apellido1 = '';
  let apellido2 = '';

  if (est.apellidos && est.apellidos.trim() !== '') {
    const apArr = est.apellidos.trim().split(' ');
    apellido1 = apArr[0] || '';
    apellido2 = apArr.slice(1).join(' ') || '';
    nombresPart = est.nombres || '';
  } else {
    const fullName = (est.nombres || '').trim();
    const parts = fullName.split(/\s+/);
    if (parts.length === 1) {
      nombresPart = parts[0] || '';
    } else if (parts.length === 2) {
      nombresPart = parts[0];
      apellido1 = parts[1];
    } else if (parts.length === 3) {
      nombresPart = parts[0];
      apellido1 = parts[1];
      apellido2 = parts[2];
    } else if (parts.length >= 4) {
      apellido2 = parts.pop();
      apellido1 = parts.pop();
      nombresPart = parts.join(' ');
    }
  }


  
  
  // Extraer nombres y apellidos


  // Extraer grado sin jornada
  let gradoInit = est.grado || '';
  const gMatch = gradoInit.match(/(.*?)(?:\s*-\s*|\s+)(MA[ÑN]ANA|TARDE|NOCHE|SABATINA|UNICA)$/i);
  if (gMatch) gradoInit = gMatch[1].trim();
  
  let jornadaInit = '';
  if (gMatch) jornadaInit = gMatch[2].toUpperCase();

  // Parse JSON fields safely in case they are strings
  const safeParse = (val, def) => {
    if (!val) return def;
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch (e) { return def; }
    }
    return val;
  };

  // Estado editable
  const [fields, setFields] = useState({
    fecha: data.fecha || '',
    sede: 'PRINCIPAL',
    jornada: jornadaInit,
    grado: gradoInit,
    director_grupo: '',
    apellido1: apellido1,
    apellido2: apellido2,
    nombres: nombresPart,
    tipo_documento: 'T.I',
    numero_documento: est.documento || '',
    sexo: est.genero || '',
    fecha_nacimiento: '',
    edad: est.edad ? est.edad.toString() : '',
    lugar_nacimiento: '',
    telefono_contacto: est.telefono || '',
    direccion_residencia: est.direccion || '',
    eps: est.eps || '',
    
    padre_nombre: '', padre_telefono: '', padre_ocupacion: '', padre_escolaridad: '',
    madre_nombre: '', madre_telefono: '', madre_ocupacion: '', madre_escolaridad: '',
    acudiente_nombre: acudienteNombre || '', acudiente_telefono: acudienteTelefono || '', acudiente_ocupacion: '', acudiente_parentesco: acudienteParentesco || '',
    
    num_hermanos: '', lugar_hermanos: '',
    vive_con: safeParse(data.vive_con, {}), vive_con_otros: data.vive_con_otros || '',
    descripcion_familiar: data.descripcion_familiar || '',
    
    nombre_remite: data.nombre_remitente || '',
    cargo_remite: data.cargo_remitente || '',
    motivos: safeParse(data.motivos || data.motivos_remision, []),
    motivo_otro: data.motivos_otros || data.motivo_otro || '',
    
    descripcion_situacion: data.descripcion || '',
    observaciones: data.observaciones || data.orientaciones || '',
    
    seguimientos: data.seguimientos || Array.from({ length: 4 }, () => ({ fecha: '', descripcion: '', acuerdos: '' })),
    orientaciones: ''
  });

  const [firmasData, setFirmasData] = useState({
    estudiante: null,
    acudiente: null,
    orientador: null
  });

  useEffect(() => {
    if (!est.id) return;
    const fetchFirmas = async () => {
      const { data: firmas, error } = await supabase
        .from('firmas')
        .select('*')
        .or(`estudiante_id.eq.${est.id},tipo.eq.orientador`)
        .order('created_at', { ascending: false });
        
      if (!error && firmas) {
        const studentFirma = firmas.find(f => f.tipo === 'estudiante' && f.estudiante_id === est.id && f.imagen_url);
        const acudienteFirma = firmas.find(f => f.tipo === 'acudiente' && f.estudiante_id === est.id && f.imagen_url);
        const orientadorFirma = firmas.find(f => f.tipo === 'orientador' && f.imagen_url);
        
        setFirmasData(prev => ({
          ...prev,
          estudiante: prev.estudiante || studentFirma?.imagen_url || null,
          acudiente: prev.acudiente || acudienteFirma?.imagen_url || null,
          orientador: prev.orientador || orientadorFirma?.imagen_url || null
        }));
      }
    };
    
    fetchFirmas();
  }, [est.id]);

  useEffect(() => {
    if (!est.id) return;
    const fetchSeguimientos = async () => {
      const { data: segs, error } = await supabase
        .from('seguimientos')
        .select('*')
        .eq('estudiante_id', est.id)
        .order('fecha', { ascending: true });
        
      if (!error && segs && segs.length > 0) {
        const mappedSegs = segs.map(s => ({
          fecha: s.fecha,
          descripcion: s.descripcion || '',
          acuerdos: s.compromisos || ''
        }));
        
        while (mappedSegs.length < 4) {
          mappedSegs.push({ fecha: '', descripcion: '', acuerdos: '' });
        }
        
        setFields(prev => ({
          ...prev,
          seguimientos: mappedSegs
        }));
      }
    };
    
    fetchSeguimientos();
  }, [est.id]);

  const addSeguimiento = () => {
    setFields(prev => ({
      ...prev,
      seguimientos: [...prev.seguimientos, { fecha: '', descripcion: '', acuerdos: '' }]
    }));
  };

  const removeSeguimiento = (idx) => {
    setFields(prev => {
      const segs = [...prev.seguimientos];
      segs.splice(idx, 1);
      return { ...prev, seguimientos: segs.length > 0 ? segs : [{ fecha: '', descripcion: '', acuerdos: '' }] };
    });
  };

  useEffect(() => {
    const fetchFirmaAcudientePorNombre = async () => {
      const nombre = fields.acudiente_nombre?.trim();
      if (!nombre || nombre.length < 3) return;
      const { data } = await supabase.from('firmas').select('imagen_url').eq('tipo', 'acudiente').ilike('nombre_completo', `%${nombre}%`).not('imagen_url', 'is', null).order('created_at', { ascending: false }).limit(1);
      if (data && data.length > 0) setFirmasData(prev => ({ ...prev, acudiente: data[0].imagen_url }));
    };

    const fetchFirmaEstudiantePorNombre = async () => {
      const nombre = `${fields.nombres || ''} ${fields.apellido1 || ''} ${fields.apellido2 || ''}`.trim();
      if (!nombre || nombre.length < 3) return;
      const { data } = await supabase.from('firmas').select('imagen_url').eq('tipo', 'estudiante').ilike('nombre_completo', `%${nombre}%`).not('imagen_url', 'is', null).order('created_at', { ascending: false }).limit(1);
      if (data && data.length > 0) setFirmasData(prev => ({ ...prev, estudiante: data[0].imagen_url }));
    };

    const fetchFirmaOrientadorPorNombre = async () => {
      const nombre = fields.nombre_orientador?.trim() || fields.orientador_nombre?.trim(); // if applicable
      if (!nombre || nombre.length < 3) return;
      const { data } = await supabase.from('firmas').select('imagen_url').eq('tipo', 'orientador').ilike('nombre_completo', `%${nombre}%`).not('imagen_url', 'is', null).order('created_at', { ascending: false }).limit(1);
      if (data && data.length > 0) setFirmasData(prev => ({ ...prev, orientador: data[0].imagen_url }));
    };
    
    // Solo buscar por nombre si no tenemos firma vinculada por ID o si cambió el nombre.
    const delayDebounceFn = setTimeout(() => {
      fetchFirmaAcudientePorNombre();
      fetchFirmaEstudiantePorNombre();
      fetchFirmaOrientadorPorNombre();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fields.acudiente_nombre, fields.nombres, fields.apellido1, fields.apellido2, fields.nombre_orientador, fields.orientador_nombre]);

  const handleChange = (field, value) => {
    setFields(prev => ({ ...prev, [field]: value }));
  };

  const handleViveCon = (key, checked) => {
    setFields(prev => ({
      ...prev,
      vive_con: { ...prev.vive_con, [key]: checked }
    }));
  };

  const handleMotivo = (motivo, checked) => {
    setFields(prev => {
      let m = [...prev.motivos];
      if (checked) {
        if (!m.includes(motivo)) m.push(motivo);
      } else {
        m = m.filter(x => x !== motivo);
      }
      return { ...prev, motivos: m };
    });
  };

  const handleSeguimiento = (idx, field, value) => {
    setFields(prev => {
      const segs = [...prev.seguimientos];
      segs[idx] = { ...segs[idx], [field]: value };
      return { ...prev, seguimientos: segs };
    });
  };

  const buildPdfData = () => ({
    ...fields
  });

  const inputClass = "w-full text-sm p-1 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-gray-800";
  const labelClass = "block text-[10px] font-bold text-gray-600 mb-0.5 uppercase";

  return (
    <div className="fixed inset-0 z-50 flex bg-gray-100">
      {/* PANE IZQUIERDO - FORMULARIO */}
      <div className="w-1/3 min-w-[400px] bg-white flex flex-col border-r shadow-xl z-10">
        <div className="flex items-center justify-between p-4 border-b bg-slate-50">
          <div className="flex items-center gap-2 text-indigo-700">
            <FileText className="w-5 h-5" />
            <h2 className="font-bold">Formulario Editable</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 space-y-6">

            {/* SECCION 1 */}
            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm">DATOS DE ESTUDIANTE</h3>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Fecha</label><input type="text" value={fields.fecha} onChange={e => handleChange('fecha', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Sede</label><input type="text" value={fields.sede} onChange={e => handleChange('sede', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Jornada</label><input type="text" value={fields.jornada} onChange={e => handleChange('jornada', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Grado</label><input type="text" value={fields.grado} onChange={e => handleChange('grado', e.target.value)} className={inputClass} /></div>
              </div>
              <div><label className={labelClass}>Director de Grupo</label><input type="text" value={fields.director_grupo} onChange={e => handleChange('director_grupo', e.target.value)} className={inputClass} /></div>
              
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Primer Apellido</label><input type="text" value={fields.apellido1} onChange={e => handleChange('apellido1', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Segundo Apellido</label><input type="text" value={fields.apellido2} onChange={e => handleChange('apellido2', e.target.value)} className={inputClass} /></div>
              </div>
              <div><label className={labelClass}>Nombres</label><input type="text" value={fields.nombres} onChange={e => handleChange('nombres', e.target.value)} className={inputClass} /></div>
              
              <div className="grid grid-cols-3 gap-2">
                <div><label className={labelClass}>Tipo Doc.</label><input type="text" value={fields.tipo_documento} onChange={e => handleChange('tipo_documento', e.target.value)} className={inputClass} /></div>
                <div className="col-span-2"><label className={labelClass}>Número Doc.</label><input type="text" value={fields.numero_documento} onChange={e => handleChange('numero_documento', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Sexo</label><input type="text" value={fields.sexo} onChange={e => handleChange('sexo', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Edad</label><input type="text" value={fields.edad} onChange={e => handleChange('edad', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Lugar Nac.</label><input type="text" value={fields.lugar_nacimiento} onChange={e => handleChange('lugar_nacimiento', e.target.value)} className={inputClass} /></div>
              </div>
              <div><label className={labelClass}>Fecha de Nacimiento</label><input type="text" value={fields.fecha_nacimiento} onChange={e => handleChange('fecha_nacimiento', e.target.value)} className={inputClass} placeholder="DD/MM/AAAA" /></div>
              
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Tel. Contacto</label><input type="text" value={fields.telefono_contacto} onChange={e => handleChange('telefono_contacto', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>EPS</label><input type="text" value={fields.eps} onChange={e => handleChange('eps', e.target.value)} className={inputClass} /></div>
              </div>
              <div><label className={labelClass}>Dirección Residencia</label><input type="text" value={fields.direccion_residencia} onChange={e => handleChange('direccion_residencia', e.target.value)} className={inputClass} /></div>
            </div>

            {/* SECCION 2 */}
            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm mt-4">DATOS DE ACUDIENTES</h3>
              <div className="bg-slate-100 p-2 rounded">
                <label className={labelClass}>PADRE</label>
                <div className="grid grid-cols-2 gap-1 mb-1">
                  <div><input type="text" placeholder="Nombre" value={fields.padre_nombre} onChange={e => handleChange('padre_nombre', e.target.value)} className={inputClass} /></div>
                  <div><input type="text" placeholder="Teléfono" value={fields.padre_telefono} onChange={e => handleChange('padre_telefono', e.target.value)} className={inputClass} /></div>
                  <div><input type="text" placeholder="Ocupación" value={fields.padre_ocupacion} onChange={e => handleChange('padre_ocupacion', e.target.value)} className={inputClass} /></div>
                  <div><input type="text" placeholder="Escolaridad" value={fields.padre_escolaridad} onChange={e => handleChange('padre_escolaridad', e.target.value)} className={inputClass} /></div>
                </div>
              </div>
              <div className="bg-slate-100 p-2 rounded">
                <label className={labelClass}>MADRE</label>
                <div className="grid grid-cols-2 gap-1 mb-1">
                  <div><input type="text" placeholder="Nombre" value={fields.madre_nombre} onChange={e => handleChange('madre_nombre', e.target.value)} className={inputClass} /></div>
                  <div><input type="text" placeholder="Teléfono" value={fields.madre_telefono} onChange={e => handleChange('madre_telefono', e.target.value)} className={inputClass} /></div>
                  <div><input type="text" placeholder="Ocupación" value={fields.madre_ocupacion} onChange={e => handleChange('madre_ocupacion', e.target.value)} className={inputClass} /></div>
                  <div><input type="text" placeholder="Escolaridad" value={fields.madre_escolaridad} onChange={e => handleChange('madre_escolaridad', e.target.value)} className={inputClass} /></div>
                </div>
              </div>
              <div className="bg-slate-100 p-2 rounded">
                <label className={labelClass}>ACUDIENTE PRINCIPAL</label>
                <div className="grid grid-cols-2 gap-1 mb-1">
                  <div><input type="text" placeholder="Nombre" value={fields.acudiente_nombre} onChange={e => handleChange('acudiente_nombre', e.target.value)} className={inputClass} /></div>
                  <div><input type="text" placeholder="Teléfono" value={fields.acudiente_telefono} onChange={e => handleChange('acudiente_telefono', e.target.value)} className={inputClass} /></div>
                  <div><input type="text" placeholder="Ocupación" value={fields.acudiente_ocupacion} onChange={e => handleChange('acudiente_ocupacion', e.target.value)} className={inputClass} /></div>
                  <div><input type="text" placeholder="Parentesco" value={fields.acudiente_parentesco} onChange={e => handleChange('acudiente_parentesco', e.target.value)} className={inputClass} /></div>
                </div>
              </div>
            </div>

            {/* SECCION 3 */}
            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm mt-4">DATOS FAMILIARES</h3>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>No. de Hermanos</label><input type="text" value={fields.num_hermanos} onChange={e => handleChange('num_hermanos', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Lugar entre hermanos</label><input type="text" value={fields.lugar_hermanos} onChange={e => handleChange('lugar_hermanos', e.target.value)} className={inputClass} /></div>
              </div>
              <div>
                <label className={labelClass}>Con quien vive</label>
                <div className="flex flex-wrap gap-3 text-xs mb-2">
                  {['Mamá', 'Papá', 'Hermanos', 'Tíos', 'Primos', 'Abuelos', 'Otros'].map(lbl => (
                    <label key={lbl} className="flex items-center gap-1 cursor-pointer text-gray-800">
                      <input type="checkbox" checked={!!fields.vive_con[lbl]} onChange={e => handleViveCon(lbl, e.target.checked)} /> {lbl}
                    </label>
                  ))}
                </div>
                {fields.vive_con['Otros'] && (
                  <input type="text" placeholder="¿Cuales otros?" value={fields.vive_con_otros} onChange={e => handleChange('vive_con_otros', e.target.value)} className={inputClass} />
                )}
              </div>
              <div>
                <label className={labelClass}>Descripción Familiar</label>
                <textarea rows={2} value={fields.descripcion_familiar} onChange={e => handleChange('descripcion_familiar', e.target.value)} className={`${inputClass} resize-y`} />
              </div>
            </div>

            {/* SECCION 4 */}
            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm mt-4">REGISTRO DE SITUACIÓN</h3>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Quien remite</label><input type="text" value={fields.nombre_remite} onChange={e => handleChange('nombre_remite', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Cargo</label><input type="text" value={fields.cargo_remite} onChange={e => handleChange('cargo_remite', e.target.value)} className={inputClass} /></div>
              </div>
              <div>
                <label className={labelClass}>Motivo de remisión</label>
                <div className="grid grid-cols-1 gap-1 text-xs mb-2 bg-slate-50 p-2 rounded border border-slate-200">
                  {[
                    'Desempeño Académico', 'Convivencia escolar', 'Dificultades Emocionales', 'Problemas Familiares',
                    'Sospecha de consumo de SPA', 'Sospecha de maltrato', 'Sospecha de déficit cognitivo o sensorial',
                    'Dificultades de Aprendizaje', 'Embarazo en adolescente', 'Riesgo de deserción escolar',
                    'Orientación vocacional/profesional', 'Autolesión e Ideación suicida'
                  ].map(m => (
                    <label key={m} className="flex items-center gap-1 cursor-pointer text-gray-800">
                      <input type="checkbox" checked={fields.motivos.includes(m)} onChange={e => handleMotivo(m, e.target.checked)} /> {m}
                    </label>
                  ))}
                  <div className="mt-2">
                    <label className={labelClass}>Otro Motivo</label>
                    <input type="text" value={fields.motivo_otro} onChange={e => handleChange('motivo_otro', e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelClass}>Descripción Situación Actual</label>
                <textarea rows={3} value={fields.descripcion_situacion} onChange={e => handleChange('descripcion_situacion', e.target.value)} className={`${inputClass} resize-y`} />
              </div>
              <div>
                <label className={labelClass}>Observaciones</label>
                <textarea rows={2} value={fields.observaciones} onChange={e => handleChange('observaciones', e.target.value)} className={`${inputClass} resize-y`} />
              </div>
            </div>

            {/* SECCION 5 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center mt-4">
                <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm">DATOS DE SEGUIMIENTO</h3>
                <button
                  type="button"
                  onClick={addSeguimiento}
                  className="px-2 py-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded text-xs font-bold"
                >
                  + Añadir Seguimiento
                </button>
              </div>
              {fields.seguimientos.map((seg, idx) => (
                <div key={idx} className="bg-slate-100 p-2 rounded mb-2 border border-slate-200 relative">
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-bold text-[10px] text-gray-800">SEGUIMIENTO {idx + 1}</div>
                    {fields.seguimientos.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeSeguimiento(idx)}
                        className="text-red-500 hover:text-red-700"
                        title="Eliminar este seguimiento"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1"><input type="text" placeholder="Fecha" value={seg.fecha} onChange={e => handleSeguimiento(idx, 'fecha', e.target.value)} className={inputClass} /></div>
                    <div className="col-span-2"><input type="text" placeholder="Descripción" value={seg.descripcion} onChange={e => handleSeguimiento(idx, 'descripcion', e.target.value)} className={inputClass} /></div>
                  </div>
                  <div className="mt-1">
                    <input type="text" placeholder="Acuerdos / Observaciones" value={seg.acuerdos} onChange={e => handleSeguimiento(idx, 'acuerdos', e.target.value)} className={inputClass} />
                  </div>
                </div>
              ))}
            </div>

            {/* SECCION 6 */}
            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm mt-4">ORIENTACIONES Y RECOMENDACIONES</h3>
              <div>
                <textarea rows={3} value={fields.orientaciones} onChange={e => handleChange('orientaciones', e.target.value)} className={`${inputClass} resize-y`} />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* PANE DERECHO - PDF VIEWER */}
      <div className="flex-1 h-full bg-gray-500 relative">
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow flex items-center gap-3 z-10">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <div className="w-px h-4 bg-gray-300"></div>
          <span className="text-sm font-semibold text-gray-800">Vista Previa Dinámica</span>
        </div>

        <PDFViewer width="100%" height="100%" className="border-0">
          <PdfAtencionEscolar data={buildPdfData()} firmas={firmasData} />
        </PDFViewer>
      </div>
    </div>
  );
}
