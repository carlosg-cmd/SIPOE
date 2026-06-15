import React, { useState, useEffect } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { X, ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import PdfSeguimientoConvivencia from './PdfSeguimientoConvivencia';
import { supabase } from '../supabase';

export default function PrintSeguimientoConvivenciaTemplate({ data, onClose }) {
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

  // Parse JSON fields safely in case they are strings
  const safeParse = (val, def) => {
    if (!val) return def;
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch (e) { return def; }
    }
    return val;
  };

  const [fields, setFields] = useState({
    estudiante_nombre: nombreCompleto || '',
    grado: gradoInit,
    mes_ano: data.mes_ano || '',
    responsable: data.responsable || '',
    compromisos: data.compromisos || '',
    encuentros: safeParse(data.encuentros, Array(4).fill({ fecha: '', resultado: '', observacion: '' })),
    valoracion_final_resultado: data.valoracion_final_resultado || '',
    valoracion_final_observacion: data.valoracion_final_observacion || '',
    decisiones: safeParse(data.decisiones, []),
    
    // For signatures
    acudiente_nombre: est.datos_acudiente?.nombres ? `${est.datos_acudiente.nombres} ${est.datos_acudiente.apellidos || ''}` : (est.nombre_acudiente || ''),
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

  const handleEncuentro = (index, field, value) => {
    setFields(prev => {
      const newEncuentros = [...prev.encuentros];
      newEncuentros[index] = { ...newEncuentros[index], [field]: value };
      return { ...prev, encuentros: newEncuentros };
    });
  };

  const handleDecision = (decision, checked) => {
    setFields(prev => {
      let d = [...prev.decisiones];
      if (checked) {
        if (!d.includes(decision)) d.push(decision);
      } else {
        d = d.filter(x => x !== decision);
      }
      return { ...prev, decisiones: d };
    });
  };

  const inputClass = "w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs text-gray-800 p-1.5 border bg-white";
  const labelClass = "block text-xs font-semibold text-gray-600 mb-1";

  const buildPdfData = () => ({
    ...fields
  });

  const handleAddEncuentro = () => {
    setFields(prev => ({
      ...prev,
      encuentros: [...prev.encuentros, { fecha: '', resultado: '', observacion: '' }]
    }));
  };

  const handleRemoveEncuentro = (index) => {
    setFields(prev => ({
      ...prev,
      encuentros: prev.encuentros.filter((_, i) => i !== index)
    }));
  };

  const getFirmasList = () => {
    return [
      { tipo: 'orientador', imagen_url: firmasData.orientador, nombre_completo: fields.responsable },
      { tipo: 'acudiente', imagen_url: firmasData.acudiente, nombre_completo: fields.acudiente_nombre }
    ].filter(f => f.imagen_url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex backdrop-blur-sm p-4 overflow-hidden">
      <div className="bg-white rounded-2xl w-full max-w-7xl mx-auto flex flex-col md:flex-row shadow-2xl overflow-hidden border border-gray-200">
        
        {/* Lado Izquierdo: Formulario */}
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
            
            {/* SECCION 1 */}
            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm">DATOS BÁSICOS</h3>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Mes / Año</label><input type="text" value={fields.mes_ano} onChange={e => handleChange('mes_ano', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Responsable</label><input type="text" value={fields.responsable} onChange={e => handleChange('responsable', e.target.value)} className={inputClass} /></div>
              </div>
              <div><label className={labelClass}>Compromisos a seguir</label><textarea rows="3" value={fields.compromisos} onChange={e => handleChange('compromisos', e.target.value)} className={inputClass} /></div>
            </div>

            {/* SECCION 2 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b-2 border-indigo-100 pb-1">
                <h3 className="font-bold text-indigo-800 text-sm">SEGUIMIENTO QUINCENAL</h3>
                <button onClick={handleAddEncuentro} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                  + Agregar Encuentro
                </button>
              </div>
              {fields.encuentros.map((enc, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-xs text-gray-700">Encuentro {idx + 1}</h4>
                    <button onClick={() => handleRemoveEncuentro(idx)} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mb-2"><label className={labelClass}>Fecha</label><input type="text" placeholder="DD/MM/AAAA" value={enc.fecha} onChange={e => handleEncuentro(idx, 'fecha', e.target.value)} className={inputClass} /></div>
                  <div className="mb-2">
                    <label className={labelClass}>Resultado</label>
                    <div className="flex gap-2 text-xs">
                      {['Cumple', 'Cumple parcialmente', 'No cumple'].map(res => (
                        <label key={res} className="flex items-center gap-1 cursor-pointer text-gray-800">
                          <input type="radio" name={`res-${idx}`} checked={enc.resultado === res} onChange={() => handleEncuentro(idx, 'resultado', res)} /> {res}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div><label className={labelClass}>Observación breve</label><input type="text" value={enc.observacion} onChange={e => handleEncuentro(idx, 'observacion', e.target.value)} className={inputClass} /></div>
                </div>
              ))}
            </div>

            {/* SECCION 3 */}
            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm">VALORACIÓN FINAL</h3>
              <div className="flex gap-3 text-xs">
                {['Avance positivo', 'Avance parcial', 'Sin avance'].map(res => (
                  <label key={res} className="flex items-center gap-1 cursor-pointer text-gray-800">
                    <input type="radio" name="valoracion" checked={fields.valoracion_final_resultado === res} onChange={() => handleChange('valoracion_final_resultado', res)} /> {res}
                  </label>
                ))}
              </div>
              <div><label className={labelClass}>Observación final</label><input type="text" value={fields.valoracion_final_observacion} onChange={e => handleChange('valoracion_final_observacion', e.target.value)} className={inputClass} /></div>
            </div>

            {/* SECCION 4 */}
            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm">DECISIÓN</h3>
              <div className="flex flex-col gap-1 text-xs mb-2">
                {['Continúa seguimiento pedagógico', 'Ajuste de compromisos', 'Remisión a Orientación / Coordinación', 'Remisión a Comité Escolar de Convivencia'].map(lbl => (
                  <label key={lbl} className="flex items-center gap-1 cursor-pointer text-gray-800">
                    <input type="checkbox" checked={fields.decisiones.includes(lbl)} onChange={e => handleDecision(lbl, e.target.checked)} /> {lbl}
                  </label>
                ))}
              </div>
            </div>
            
            {/* Firmas Helper */}
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mt-6 mb-8">
              <h4 className="text-xs font-bold text-indigo-800 mb-2 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Estado de Firmas</h4>
              <div className="space-y-2 text-xs">
                 <div className="flex justify-between items-center">
                    <span className="text-gray-600">Acudiente ({fields.acudiente_nombre || 'Sin nombre'})</span>
                    {firmasData.acudiente ? <span className="text-emerald-600 font-semibold text-[10px] px-2 py-0.5 bg-emerald-100 rounded-full">Vinculada</span> : <span className="text-amber-600 font-semibold text-[10px] px-2 py-0.5 bg-amber-100 rounded-full">Pendiente</span>}
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-gray-600">Orientador</span>
                    {firmasData.orientador ? <span className="text-emerald-600 font-semibold text-[10px] px-2 py-0.5 bg-emerald-100 rounded-full">Vinculada</span> : <span className="text-amber-600 font-semibold text-[10px] px-2 py-0.5 bg-amber-100 rounded-full">Pendiente</span>}
                 </div>
              </div>
              <div className="mt-2 text-[10px] text-indigo-600 italic leading-tight">
                * Para que aparezca la firma del acudiente, asegúrate de que el nombre del acudiente coincida con una firma registrada en la base de datos de firmas.
              </div>
            </div>

          </div>
        </div>

        {/* Lado Derecho: Previsualización PDF */}
        <div className="w-full md:w-2/3 bg-gray-600 flex flex-col relative">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <button onClick={onClose} className="bg-white/90 hover:bg-white text-gray-800 px-3 py-1.5 rounded-lg shadow-lg font-medium text-sm flex items-center gap-2 transition-all">
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
            <div className="bg-white/90 px-3 py-1.5 rounded-lg shadow-lg font-medium text-sm flex items-center text-indigo-700">
              Vista Previa Dinámica
            </div>
          </div>
          
          <div className="flex-1 w-full h-full">
            <PDFViewer width="100%" height="100%" className="border-none">
              <PdfSeguimientoConvivencia data={buildPdfData()} firmas={getFirmasList()} />
            </PDFViewer>
          </div>
        </div>
        
      </div>
    </div>
  );
}
