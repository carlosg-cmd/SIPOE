import React, { useState, useEffect } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { X, ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import PdfInformeEntregaCasos from './PdfInformeEntregaCasos';
import { supabase } from '../supabase';

export default function PrintInformeEntregaCasosTemplate({ data, onClose }) {
  if (!data) return null;

  const est = data.estudiantes || data.estudiante || data || {};
  
  const acudienteData = typeof est.datos_acudiente === 'string' 
    ? JSON.parse(est.datos_acudiente) 
    : (est.datos_acudiente || {});
  
  const acudienteNombre = `${acudienteData.nombres || ''} ${acudienteData.apellidos || ''}`.trim();
  const acudienteTelefono = acudienteData.telefono || '';
  const acudienteParentesco = acudienteData.parentesco || '';
  const acudienteDoc = acudienteData.documento || '';

  const nombresArr = (est.nombres || '').split(' ');
  const apellidosArr = (est.apellidos || '').split(' ');
  const apellido1 = apellidosArr[0] || '';
  const apellido2 = apellidosArr.slice(1).join(' ') || '';


  
  const nombreCompleto = `${est.nombres || ''} ${est.apellidos || ''}`.trim();

  // Extraer grado sin jornada
  let gradoInit = est.grado || '';
  const gMatch = gradoInit.match(/(.*?)(?:\s*-\s*|\s+)(MA[ÑN]ANA|TARDE|NOCHE|SABATINA|UNICA)$/i);
  if (gMatch) gradoInit = gMatch[1].trim();

  const safeParse = (val, def) => {
    if (!val) return def;
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch (e) { return def; }
    }
    return val;
  };

  const today = new Date().toISOString().split('T')[0];

  const [fields, setFields] = useState({
    institucion_educativa: 'INSTITUCIÓN EDUCATIVA DIVINO NIÑO',
    fecha: data.fecha || today,
    nombre_estudiante: nombreCompleto,
    grado: gradoInit,
    edad: est.fecha_nacimiento ? Math.floor((new Date() - new Date(est.fecha_nacimiento)) / 31557600000).toString() : '',
    tipo_documento: est.tipo_documento || '',
    numero_documento: est.numero_documento || '',
    ciudad_nacimiento: est.lugar_nacimiento || '',
    nombre_acudiente: est.datos_acudiente?.nombres ? `${est.datos_acudiente.nombres} ${est.datos_acudiente.apellidos || ''}`.trim() : (est.nombre_acudiente || ''),
    telefono_contacto: est.datos_acudiente?.telefono || est.telefono_acudiente || '',
    
    motivos_activacion: safeParse(data.motivos_activacion, []),
    motivo_otro: data.motivo_otro || '',
    
    descripcion_situacion: data.motivo_consulta || data.observaciones || '',
    
    acciones_realizadas: safeParse(data.acciones_realizadas, []),
    observaciones_adicionales: '',
    
    correo_ins_edu: 'inedin2021@gmail.com'
  });

  const [firmasData, setFirmasData] = useState({
    orientador: null
  });

  useEffect(() => {
    const fetchFirmas = async () => {
      const { data: firmas, error } = await supabase
        .from('firmas')
        .select('*')
        .eq('tipo', 'orientador')
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (!error && firmas && firmas.length > 0) {
        setFirmasData({ orientador: firmas[0].imagen_url });
      }
    };
    fetchFirmas();
  }, []);

  const handleChange = (name, value) => {
    setFields(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (listName, item, checked) => {
    setFields(prev => {
      let arr = [...prev[listName]];
      if (checked) {
        if (!arr.includes(item)) arr.push(item);
      } else {
        arr = arr.filter(x => x !== item);
      }
      return { ...prev, [listName]: arr };
    });
  };

  const inputClass = "w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs text-gray-800 p-1.5 border bg-white";
  const labelClass = "block text-xs font-semibold text-gray-600 mb-1";

  const getFirmasList = () => {
    return [
      { tipo: 'orientador', imagen_url: firmasData.orientador, nombre_completo: 'Orientadora Escolar' }
    ].filter(f => f.imagen_url);
  };

  const listaMotivos = [
    'Ideación suicida',
    'Intento de suicidio',
    'Autolesiones o comportamientos autodestructivos',
    'Alteraciones del comportamiento con sospecha de trastorno mental',
    'Episodios de ansiedad o crisis de pánico',
    'Conductas depresivas prolongadas',
    'Consumo de sustancias psicoactivas',
    'Situaciones de violencia intrafamiliar o abuso',
    'Otros'
  ];

  const listaAcciones = [
    'Observación y seguimiento del estudiante en el contexto escolar.',
    'Entrevista individual con el estudiante.',
    'Comunicación con los padres o acudientes.',
    'Orientación sobre la situación y recomendación de atención médica.',
    'Registro del caso en el protocolo de protección escolar.'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex backdrop-blur-sm p-4 overflow-hidden">
      <div className="bg-white rounded-2xl w-full max-w-7xl mx-auto flex flex-col md:flex-row shadow-2xl overflow-hidden border border-gray-200">
        
        <div className="w-full md:w-1/3 bg-slate-50 flex flex-col border-r border-gray-200">
          <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm">
            <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" /> Formulario Editable
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex-1 space-y-6">
            
            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm">DATOS GENERALES</h3>
              <div><label className={labelClass}>Institución Educativa</label><input type="text" value={fields.institucion_educativa} onChange={e => handleChange('institucion_educativa', e.target.value)} className={inputClass} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Fecha</label><input type="date" value={fields.fecha} onChange={e => handleChange('fecha', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Edad</label><input type="text" value={fields.edad} onChange={e => handleChange('edad', e.target.value)} className={inputClass} /></div>
              </div>
              <div><label className={labelClass}>Nombre del Estudiante</label><input type="text" value={fields.nombre_estudiante} onChange={e => handleChange('nombre_estudiante', e.target.value)} className={inputClass} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Tipo de Documento</label><input type="text" value={fields.tipo_documento} onChange={e => handleChange('tipo_documento', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Número de Documento</label><input type="text" value={fields.numero_documento} onChange={e => handleChange('numero_documento', e.target.value)} className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Grado</label><input type="text" value={fields.grado} onChange={e => handleChange('grado', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Ciudad de nacimiento</label><input type="text" value={fields.ciudad_nacimiento} onChange={e => handleChange('ciudad_nacimiento', e.target.value)} className={inputClass} /></div>
              </div>
              <div><label className={labelClass}>Nombre del Acudiente</label><input type="text" value={fields.nombre_acudiente} onChange={e => handleChange('nombre_acudiente', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Teléfono de Contacto</label><input type="text" value={fields.telefono_contacto} onChange={e => handleChange('telefono_contacto', e.target.value)} className={inputClass} /></div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm">MOTIVO DE ACTIVACIÓN</h3>
              <div className="flex flex-col gap-1 text-xs mb-2">
                {listaMotivos.map(lbl => (
                  <label key={lbl} className="flex items-center gap-1 cursor-pointer text-gray-800">
                    <input type="checkbox" checked={fields.motivos_activacion.includes(lbl)} onChange={e => handleCheckbox('motivos_activacion', lbl, e.target.checked)} /> {lbl}
                  </label>
                ))}
              </div>
              {fields.motivos_activacion.includes('Otros') && (
                <div><label className={labelClass}>¿Cúal otro?</label><input type="text" value={fields.motivo_otro} onChange={e => handleChange('motivo_otro', e.target.value)} className={inputClass} /></div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm">DESCRIPCIÓN</h3>
              <div><label className={labelClass}>Descripción de la Situación</label><textarea rows="4" value={fields.descripcion_situacion} onChange={e => handleChange('descripcion_situacion', e.target.value)} className={inputClass} /></div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm">ACCIONES REALIZADAS</h3>
              <div className="flex flex-col gap-2 text-xs mb-2">
                {listaAcciones.map(lbl => (
                  <label key={lbl} className="flex gap-2 cursor-pointer text-gray-800 items-start">
                    <input type="checkbox" className="mt-0.5" checked={fields.acciones_realizadas.includes(lbl)} onChange={e => handleCheckbox('acciones_realizadas', lbl, e.target.checked)} />
                    <span className="leading-tight">{lbl}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm">OBSERVACIONES ADICIONALES</h3>
              <div><textarea rows="3" value={fields.observaciones_adicionales} onChange={e => handleChange('observaciones_adicionales', e.target.value)} className={inputClass} /></div>
            </div>

            <div className="space-y-3 mb-8">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm">DATOS FINALES</h3>
              <div><label className={labelClass}>Correo Institucional</label><input type="text" value={fields.correo_ins_edu} onChange={e => handleChange('correo_ins_edu', e.target.value)} className={inputClass} /></div>
            </div>

          </div>
        </div>

        <div className="w-full md:w-2/3 bg-gray-600 flex flex-col relative">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <button onClick={onClose} className="flex items-center gap-2 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition-colors border border-gray-200 backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
            <div className="bg-indigo-100 text-indigo-800 px-3 py-2 rounded-lg text-sm font-medium shadow-sm border border-indigo-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Vista Previa Dinámica
            </div>
          </div>
          
          <div className="flex-1 w-full h-full p-0">
            <PDFViewer width="100%" height="100%" style={{ border: 'none', backgroundColor: '#4b5563' }}>
              <PdfInformeEntregaCasos data={fields} firmas={getFirmasList()} />
            </PDFViewer>
          </div>
        </div>
      </div>
    </div>
  );
}
