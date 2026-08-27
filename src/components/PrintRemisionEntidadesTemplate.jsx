import React, { useState, useEffect } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { X, ArrowLeft, FileText } from 'lucide-react';
import PdfRemisionEntidades from './PdfRemisionEntidades';
import { supabase } from '../supabase';

export default function PrintRemisionEntidadesTemplate({ data, onClose }) {
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
    fecha: data.fecha || new Date().toISOString().split('T')[0],
    sede: 'PRINCIPAL',
    jornada: jornadaInit,
    grado: gradoInit,
    apellido1: apellido1,
    apellido2: apellido2,
    nombres: nombresPart,
    tipo_documento: 'T.I',
    numero_documento: est.documento || '',
    sexo: est.genero || '',
    fecha_nacimiento: '',
    edad: est.edad ? est.edad.toString() : '',
    telefono_contacto: est.telefono || '',
    direccion_residencia: est.direccion || '',
    eps: est.eps || '',
    acudiente_nombre: acudienteNombre || '', 
    acudiente_telefono: acudienteTelefono || '',
    entidad_remite: '',
    tipo_atencion: '',
    motivo_remision: data.motivo_principal || '',
    solicitud: 'Solicitamos la atención integral del presente caso, garantizando el restablecimiento de los derechos...',
    nombre_remite: data.orientador_nombre || '',
    cargo_remite: 'Docente Orientador',
    nombre_recibe: '',
    cargo_recibe: '',
    fecha_recibida: ''
  });

  const [firmasData, setFirmasData] = useState({
    orientador: null
  });

  // Fetch firma del orientador actual
  useEffect(() => {
    const fetchFirmaOrientadorPorNombre = async () => {
      const nombre = fields.nombre_remite?.trim();
      if (!nombre || nombre.length < 3) return;
      const { data } = await supabase.from('firmas').select('imagen_url').eq('tipo', 'orientador').ilike('nombre_completo', `%${nombre}%`).not('imagen_url', 'is', null).order('created_at', { ascending: false }).limit(1);
      if (data && data.length > 0) setFirmasData(prev => ({ ...prev, orientador: data[0].imagen_url }));
    };

    const delayDebounceFn = setTimeout(() => {
      fetchFirmaOrientadorPorNombre();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fields.nombre_remite]);

  const handleChange = (field, value) => {
    setFields(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = "w-full p-1.5 text-xs border border-gray-300 rounded bg-white text-gray-900 focus:ring-1 focus:ring-indigo-500 outline-none";
  const labelClass = "block text-[10px] font-bold text-gray-600 mb-1 uppercase";

  return (
    <div className="fixed inset-0 z-50 flex bg-white">
      {/* PANE IZQUIERDO - FORMULARIO DE EDICIÓN */}
      <div className="w-1/3 h-full overflow-y-auto border-r border-gray-200 bg-white flex flex-col shadow-xl z-20">
        <div className="sticky top-0 bg-indigo-600 text-white p-4 shadow flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1 hover:bg-indigo-500 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-bold text-lg leading-tight">Remisión a Entidades</h2>
              <p className="text-indigo-100 text-xs">Completa los campos antes de imprimir</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="space-y-6">
            
            {/* SECCION 1 */}
            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm">DATOS INSTITUCIONALES</h3>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Fecha</label><input type="text" value={fields.fecha} onChange={e => handleChange('fecha', e.target.value)} className={inputClass} placeholder="DD/MM/AAAA" /></div>
                <div><label className={labelClass}>Grado</label><input type="text" value={fields.grado} onChange={e => handleChange('grado', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Sede</label><input type="text" value={fields.sede} onChange={e => handleChange('sede', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Jornada</label><input type="text" value={fields.jornada} onChange={e => handleChange('jornada', e.target.value)} className={inputClass} /></div>
              </div>
            </div>

            {/* SECCION 2 */}
            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm mt-4">DATOS DEL REMITIDO</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2"><label className={labelClass}>Nombres (Completos)</label><input type="text" value={fields.nombres} onChange={e => handleChange('nombres', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Primer Apellido</label><input type="text" value={fields.apellido1} onChange={e => handleChange('apellido1', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Segundo Apellido</label><input type="text" value={fields.apellido2} onChange={e => handleChange('apellido2', e.target.value)} className={inputClass} /></div>
                <div>
                  <label className={labelClass}>Tipo Doc.</label>
                  <select value={fields.tipo_documento} onChange={e => handleChange('tipo_documento', e.target.value)} className={inputClass}>
                    <option value="T.I">T.I</option><option value="C.C">C.C</option><option value="R.C">R.C</option><option value="PEP">PEP</option>
                  </select>
                </div>
                <div><label className={labelClass}>No. Documento</label><input type="text" value={fields.numero_documento} onChange={e => handleChange('numero_documento', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Sexo</label><input type="text" value={fields.sexo} onChange={e => handleChange('sexo', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Fecha Nacimiento</label><input type="text" value={fields.fecha_nacimiento} onChange={e => handleChange('fecha_nacimiento', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Edad</label><input type="text" value={fields.edad} onChange={e => handleChange('edad', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>EPS</label><input type="text" value={fields.eps} onChange={e => handleChange('eps', e.target.value)} className={inputClass} /></div>
              </div>
            </div>

            {/* SECCION 3 */}
            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm mt-4">DATOS ACUDIENTE</h3>
              <div><label className={labelClass}>Nombre Acudiente</label><input type="text" value={fields.acudiente_nombre} onChange={e => handleChange('acudiente_nombre', e.target.value)} className={inputClass} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Dirección</label><input type="text" value={fields.direccion_residencia} onChange={e => handleChange('direccion_residencia', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Teléfono</label><input type="text" value={fields.acudiente_telefono} onChange={e => handleChange('acudiente_telefono', e.target.value)} className={inputClass} /></div>
              </div>
            </div>

            {/* SECCION 4 */}
            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm mt-4">DATOS DE LA REMISIÓN</h3>
              <div><label className={labelClass}>Entidad a la que se remite</label><input type="text" value={fields.entidad_remite} onChange={e => handleChange('entidad_remite', e.target.value)} className={inputClass} placeholder="Ej: ICBF, Comisaría, EPS..." /></div>
              <div><label className={labelClass}>Tipo de Atención</label><input type="text" value={fields.tipo_atencion} onChange={e => handleChange('tipo_atencion', e.target.value)} className={inputClass} /></div>
              
              <div>
                <label className={labelClass}>Motivo de Remisión</label>
                <textarea rows={3} value={fields.motivo_remision} onChange={e => handleChange('motivo_remision', e.target.value)} className={`${inputClass} resize-y`} />
              </div>
              
              <div>
                <label className={labelClass}>Solicitud</label>
                <textarea rows={3} value={fields.solicitud} onChange={e => handleChange('solicitud', e.target.value)} className={`${inputClass} resize-y`} />
              </div>
            </div>

            {/* SECCION 5 */}
            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm mt-4">FIRMAS</h3>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Nombre Remite</label><input type="text" value={fields.nombre_remite} onChange={e => handleChange('nombre_remite', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Cargo Remite</label><input type="text" value={fields.cargo_remite} onChange={e => handleChange('cargo_remite', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Nombre Recibe</label><input type="text" value={fields.nombre_recibe} onChange={e => handleChange('nombre_recibe', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Cargo Recibe</label><input type="text" value={fields.cargo_recibe} onChange={e => handleChange('cargo_recibe', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Fecha Recibido</label><input type="text" value={fields.fecha_recibida} onChange={e => handleChange('fecha_recibida', e.target.value)} className={inputClass} placeholder="DD/MM/AAAA" /></div>
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
          <PdfRemisionEntidades data={fields} firmas={firmasData} />
        </PDFViewer>
      </div>
    </div>
  );
}
