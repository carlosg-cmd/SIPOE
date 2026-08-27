import React, { useState, useEffect } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { X, ArrowLeft, FileText, Download } from 'lucide-react';
import PdfAtencionPadres from './PdfAtencionPadres';
import { supabase } from '../supabase';

export default function PrintAtencionPadresTemplate({ data, onClose }) {
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


  
  const acu = acudienteData;

  // Extraer grado sin jornada
  let gradoInit = est.grado || '';
  const gMatch = gradoInit.match(/(.*?)(?:\s*-\s*|\s+)(MA[ÑN]ANA|TARDE|NOCHE|SABATINA|UNICA)$/i);
  if (gMatch) gradoInit = gMatch[1].trim();

  // Estado editable con todos los campos
  const [editMode, setEditMode] = useState(true);
  const [fields, setFields] = useState({
    fecha: data?.fecha || new Date().toLocaleDateString('es-CO'),
    lugar: 'ORIENTACIÓN ESCOLAR',
    nombre_orientador: data?.nombre_remitente || '',
    nombre_acudiente: `${acu.nombres || ''} ${acu.apellidos || ''}`.trim(),
    nombre_estudiante: `${est.nombres || ''} ${est.apellidos || ''}`.trim(),
    grado: gradoInit,
    proposito: data?.motivos?.join(', ') || '',
    desarrollo: data?.descripcion || '',
    observaciones: data?.orientaciones || '',
  });

  const [firmasData, setFirmasData] = useState({
    estudiante: null,
    acudiente: null,
    orientador: null
  });

  useEffect(() => {
    const fetchFirmas = async () => {
      if (!est.id) return;
      
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

        if (orientadorFirma && !fields.nombre_orientador) {
          setFields(prev => ({
            ...prev,
            nombre_orientador: orientadorFirma.nombre_completo || ''
          }));
        }
      }
    };
    
    fetchFirmas();
  }, [est.id]);

  useEffect(() => {
    const fetchFirmaAcudientePorNombre = async () => {
      const nombre = fields.nombre_acudiente?.trim();
      if (!nombre || nombre.length < 3) return;
      const { data } = await supabase.from('firmas').select('imagen_url').eq('tipo', 'acudiente').ilike('nombre_completo', `%${nombre}%`).not('imagen_url', 'is', null).order('created_at', { ascending: false }).limit(1);
      if (data && data.length > 0) setFirmasData(prev => ({ ...prev, acudiente: data[0].imagen_url }));
    };

    const fetchFirmaEstudiantePorNombre = async () => {
      const nombre = fields.nombre_estudiante?.trim();
      if (!nombre || nombre.length < 3) return;
      const { data } = await supabase.from('firmas').select('imagen_url').eq('tipo', 'estudiante').ilike('nombre_completo', `%${nombre}%`).not('imagen_url', 'is', null).order('created_at', { ascending: false }).limit(1);
      if (data && data.length > 0) setFirmasData(prev => ({ ...prev, estudiante: data[0].imagen_url }));
    };

    const fetchFirmaOrientadorPorNombre = async () => {
      const nombre = fields.nombre_orientador?.trim();
      if (!nombre || nombre.length < 3) return;
      const { data } = await supabase.from('firmas').select('imagen_url').eq('tipo', 'orientador').ilike('nombre_completo', `%${nombre}%`).not('imagen_url', 'is', null).order('created_at', { ascending: false }).limit(1);
      if (data && data.length > 0) setFirmasData(prev => ({ ...prev, orientador: data[0].imagen_url }));
    };
    
    const delayDebounceFn = setTimeout(() => {
      fetchFirmaAcudientePorNombre();
      fetchFirmaEstudiantePorNombre();
      fetchFirmaOrientadorPorNombre();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fields.nombre_acudiente, fields.nombre_estudiante, fields.nombre_orientador]);

  const handleChange = (field, value) => {
    setFields(prev => ({ ...prev, [field]: value }));
  };

  const buildPdfData = () => ({
    ...data,
    fecha: fields.fecha,
    lugar: fields.lugar,
    nombre_orientador: fields.nombre_orientador,
    nombre_acudiente: fields.nombre_acudiente,
    proposito: fields.proposito,
    desarrollo: fields.desarrollo,
    observaciones: fields.observaciones,
    estudiantes: {
      ...est,
      nombres: fields.nombre_estudiante,
      apellidos: '', // Combinado en PDF
      grado: fields.grado,
      datos_acudiente: {
        ...acu,
        nombres: fields.nombre_acudiente,
        apellidos: '', // Combinado
      }
    },
    firmas: firmasData
  });

  return (
    <div className="fixed inset-0 z-50 flex bg-gray-100">
      
      {/* PANE IZQUIERDO - FORMULARIO */}
      {editMode && (
        <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto flex flex-col shadow-xl">
          <div className="p-4 border-b border-gray-200 bg-indigo-50 flex justify-between items-center sticky top-0 z-10">
            <div>
              <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                <FileText size={20} />
                Editar Datos del Acta
              </h2>
              <p className="text-sm text-indigo-600">Modifica los campos antes de generar el PDF</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-indigo-100 rounded-full text-indigo-700 transition-colors"
              title="Cerrar y volver"
            >
              <ArrowLeft size={20} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* 1. Datos Generales */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 border-b pb-2">1. Datos Básicos</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha</label>
                  <input 
                    type="text" 
                    value={fields.fecha} onChange={e => handleChange('fecha', e.target.value)}
                    className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Lugar</label>
                  <input 
                    type="text" 
                    value={fields.lugar} onChange={e => handleChange('lugar', e.target.value)}
                    className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre Docente Orientador(a)</label>
                <input 
                  type="text" 
                  value={fields.nombre_orientador} onChange={e => handleChange('nombre_orientador', e.target.value)}
                  className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800"
                />
              </div>
            </div>

            {/* 2. Datos Participantes */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="font-bold text-gray-700 border-b pb-2">2. Participantes</h3>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre Completo del Acudiente(s)</label>
                <input 
                  type="text" 
                  value={fields.nombre_acudiente} onChange={e => handleChange('nombre_acudiente', e.target.value)}
                  className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre del Estudiante</label>
                  <input 
                    type="text" 
                    value={fields.nombre_estudiante} onChange={e => handleChange('nombre_estudiante', e.target.value)}
                    className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Grado</label>
                  <input 
                    type="text" 
                    value={fields.grado} onChange={e => handleChange('grado', e.target.value)}
                    className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* 3. Contenido del Acta */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="font-bold text-gray-700 border-b pb-2">3. Contenido del Acta</h3>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Propósito</label>
                <textarea 
                  rows={2}
                  value={fields.proposito} onChange={e => handleChange('proposito', e.target.value)}
                  className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Desarrollo del Encuentro</label>
                <textarea 
                  rows={5}
                  value={fields.desarrollo} onChange={e => handleChange('desarrollo', e.target.value)}
                  className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none resize-y text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Observaciones y/o Acuerdos</label>
                <textarea 
                  rows={5}
                  value={fields.observaciones} onChange={e => handleChange('observaciones', e.target.value)}
                  className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none resize-y text-gray-800"
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PANE DERECHO - VISTA PREVIA PDF */}
      <div className={`${editMode ? 'w-2/3' : 'w-full'} h-full flex flex-col relative`}>
        {/* Toolbar Superior */}
        <div className="h-14 bg-slate-800 flex items-center justify-between px-6 shadow-md z-10">
          <div className="flex items-center gap-3 text-white">
            <span className="font-semibold tracking-wide">VISTA PREVIA DEL DOCUMENTO</span>
            <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">Acta de Atención a Padres</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setEditMode(!editMode)}
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              {editMode ? 'Ocultar Panel' : 'Mostrar Panel'}
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Visor PDF */}
        <div className="flex-1 bg-gray-500">
          <PDFViewer width="100%" height="100%" className="border-none">
            <PdfAtencionPadres data={buildPdfData()} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
