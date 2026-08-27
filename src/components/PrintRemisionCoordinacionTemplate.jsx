import React, { useState, useEffect } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { X, ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import PdfRemisionCoordinacion from './PdfRemisionCoordinacion';
import { supabase } from '../supabase';

export default function PrintRemisionCoordinacionTemplate({ data, onClose }) {
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
    estudiante_nombre: nombreCompleto,
    grado: gradoInit,
    acudiente_nombre: est.datos_acudiente?.nombres ? `${est.datos_acudiente.nombres} ${est.datos_acudiente.apellidos || ''}`.trim() : (est.nombre_acudiente || ''),
    telefono: est.datos_acudiente?.telefono || est.telefono_acudiente || '',
    fecha_remision: data.fecha || today,
    remite: data.responsable || '',
    motivos: safeParse(data.motivos_remision_coord, []),
    motivo_otro: data.motivo_remision_coord_otro || '',
    descripcion_breve: data.descripcion_breve_coord || '',
    compromisos_previos: data.compromisos_previos_coord || '',
    seguimiento_resumen: safeParse(data.seguimiento_resumen_coord, []),
    observaciones_relevantes: data.observaciones_relevantes_coord || ''
  });

  const [firmasData, setFirmasData] = useState({
    orientador: null,
    acudiente: null
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
        const acudienteFirma = firmas.find(f => f.tipo === 'acudiente' && f.estudiante_id === est.id && f.imagen_url);
        const orientadorFirma = firmas.find(f => f.tipo === 'orientador' && f.imagen_url);
        
        setFirmasData(prev => ({
          ...prev,
          acudiente: prev.acudiente || acudienteFirma?.imagen_url || null,
          orientador: prev.orientador || orientadorFirma?.imagen_url || null
        }));
      }
    };
    fetchFirmas();
  }, [est.id]);

  useEffect(() => {
    const fetchFirmaAcudientePorNombre = async () => {
      const nombre = fields.acudiente_nombre?.trim();
      if (!nombre || nombre.length < 3) return;
      const { data } = await supabase.from('firmas').select('imagen_url').eq('tipo', 'acudiente').ilike('nombre_completo', `%${nombre}%`).not('imagen_url', 'is', null).order('created_at', { ascending: false }).limit(1);
      if (data && data.length > 0) setFirmasData(prev => ({ ...prev, acudiente: prev.acudiente || data[0].imagen_url }));
    };

    const delayDebounceFn = setTimeout(() => {
      fetchFirmaAcudientePorNombre();
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [fields.acudiente_nombre]);

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

  const buildPdfData = () => ({ ...fields });

  const getFirmasList = () => {
    return [
      { tipo: 'orientador', imagen_url: firmasData.orientador, nombre_completo: fields.remite },
      { tipo: 'acudiente', imagen_url: firmasData.acudiente, nombre_completo: fields.acudiente_nombre }
    ].filter(f => f.imagen_url);
  };

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
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm">1. DATOS DEL ESTUDIANTE</h3>
              <div><label className={labelClass}>Fecha de remisión</label><input type="date" value={fields.fecha_remision} onChange={e => handleChange('fecha_remision', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Remite</label><input type="text" value={fields.remite} onChange={e => handleChange('remite', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Acudiente</label><input type="text" value={fields.acudiente_nombre} onChange={e => handleChange('acudiente_nombre', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Teléfono</label><input type="text" value={fields.telefono} onChange={e => handleChange('telefono', e.target.value)} className={inputClass} /></div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm">2. MOTIVO DE REMISIÓN</h3>
              <div className="flex flex-col gap-1 text-xs mb-2">
                {['Incumplimiento de compromisos', 'Inasistencia a seguimientos quincenales', 'Reincidencia en la conducta', 'Falta Tipo II', 'Otro'].map(lbl => (
                  <label key={lbl} className="flex items-center gap-1 cursor-pointer text-gray-800">
                    <input type="checkbox" checked={fields.motivos.includes(lbl)} onChange={e => handleCheckbox('motivos', lbl, e.target.checked)} /> {lbl}
                  </label>
                ))}
              </div>
              {fields.motivos.includes('Otro') && (
                <div><label className={labelClass}>Otro motivo</label><input type="text" value={fields.motivo_otro} onChange={e => handleChange('motivo_otro', e.target.value)} className={inputClass} /></div>
              )}
              <div><label className={labelClass}>Descripción breve</label><textarea rows="3" value={fields.descripcion_breve} onChange={e => handleChange('descripcion_breve', e.target.value)} className={inputClass} /></div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm">3. COMPROMISOS PREVIOS</h3>
              <div><textarea rows="3" value={fields.compromisos_previos} onChange={e => handleChange('compromisos_previos', e.target.value)} className={inputClass} /></div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm">4. SEGUIMIENTO REALIZADO</h3>
              <div className="flex flex-col gap-1 text-xs mb-2">
                {['Se realizó seguimiento completo (4 encuentros quincenales)', 'Seguimiento parcial'].map(lbl => (
                  <label key={lbl} className="flex items-center gap-1 cursor-pointer text-gray-800">
                    <input type="checkbox" checked={fields.seguimiento_resumen.includes(lbl)} onChange={e => handleCheckbox('seguimiento_resumen', lbl, e.target.checked)} /> {lbl}
                  </label>
                ))}
              </div>
              <div><label className={labelClass}>Observaciones relevantes</label><textarea rows="3" value={fields.observaciones_relevantes} onChange={e => handleChange('observaciones_relevantes', e.target.value)} className={inputClass} /></div>
            </div>

            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mt-6 mb-8">
              <h4 className="text-xs font-bold text-indigo-800 mb-2 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Estado de Firmas</h4>
              <div className="space-y-2 text-xs">
                 <div className="flex justify-between items-center">
                    <span className="text-gray-600">Acudiente</span>
                    {firmasData.acudiente ? <span className="text-emerald-600 font-semibold text-[10px] px-2 py-0.5 bg-emerald-100 rounded-full">Vinculada</span> : <span className="text-amber-600 font-semibold text-[10px] px-2 py-0.5 bg-amber-100 rounded-full">Pendiente</span>}
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-gray-600">Orientador</span>
                    {firmasData.orientador ? <span className="text-emerald-600 font-semibold text-[10px] px-2 py-0.5 bg-emerald-100 rounded-full">Vinculada</span> : <span className="text-amber-600 font-semibold text-[10px] px-2 py-0.5 bg-amber-100 rounded-full">Pendiente</span>}
                 </div>
              </div>
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
              <PdfRemisionCoordinacion data={buildPdfData()} firmas={getFirmasList()} />
            </PDFViewer>
          </div>
        </div>
      </div>
    </div>
  );
}
