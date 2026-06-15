import React, { useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { X, ArrowLeft, FileText } from 'lucide-react';
import PdfIntervencionesGrupales from './PdfIntervencionesGrupales';

export default function PrintIntervencionesGrupalesTemplate({ data, onClose }) {
  if (!data) return null;

  const est = data.estudiantes || {};
  
  // Extraer grado y jornada
  let gradoInit = est.grado || '';
  let jornadaInit = '';
  const gMatch = gradoInit.match(/(.*?)(?:\s*-\s*|\s+)(MA[ÑN]ANA|TARDE|NOCHE|SABATINA|UNICA)$/i);
  if (gMatch) {
    gradoInit = gMatch[1].trim();
    jornadaInit = gMatch[2].toUpperCase();
  }

  const today = new Date().toISOString().split('T')[0];

  const [fields, setFields] = useState({
    fecha: data.fecha || today,
    grado: gradoInit,
    jornada: jornadaInit,
    docente_titular: '',
    tematica: '',
    motivo: data.motivo_consulta || '',
    duracion: '',
    nombre_actividad: '',
    objetivo: '',
    descripcion_encuentro: data.observaciones || '',
    recursos: '',
    responsables: 'MELISSA NUÑEZ SUAREZ'
  });

  const handleChange = (name, value) => {
    setFields(prev => ({ ...prev, [name]: value }));
  };

  const inputClass = "w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs text-gray-800 p-1.5 border bg-white";
  const labelClass = "block text-xs font-semibold text-gray-600 mb-1";

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

          <div className="p-5 overflow-y-auto flex-1 space-y-5">
            
            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm">DATOS DE LA INTERVENCIÓN</h3>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Fecha</label><input type="date" value={fields.fecha} onChange={e => handleChange('fecha', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Duración</label><input type="text" value={fields.duracion} onChange={e => handleChange('duracion', e.target.value)} className={inputClass} placeholder="Ej. 2 horas" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Grado</label><input type="text" value={fields.grado} onChange={e => handleChange('grado', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Jornada</label><input type="text" value={fields.jornada} onChange={e => handleChange('jornada', e.target.value)} className={inputClass} /></div>
              </div>
              <div><label className={labelClass}>Docente Titular</label><input type="text" value={fields.docente_titular} onChange={e => handleChange('docente_titular', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Temática</label><input type="text" value={fields.tematica} onChange={e => handleChange('tematica', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Motivo</label><input type="text" value={fields.motivo} onChange={e => handleChange('motivo', e.target.value)} className={inputClass} /></div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-100 pb-1 text-sm">DETALLES DE LA ACTIVIDAD</h3>
              <div><label className={labelClass}>Nombre de la Actividad</label><input type="text" value={fields.nombre_actividad} onChange={e => handleChange('nombre_actividad', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Objetivo</label><textarea rows="2" value={fields.objetivo} onChange={e => handleChange('objetivo', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Descripción del Encuentro</label><textarea rows="4" value={fields.descripcion_encuentro} onChange={e => handleChange('descripcion_encuentro', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Recursos</label><textarea rows="2" value={fields.recursos} onChange={e => handleChange('recursos', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Responsables</label><input type="text" value={fields.responsables} onChange={e => handleChange('responsables', e.target.value)} className={inputClass} /></div>
            </div>

          </div>
        </div>

        {/* Lado Derecho: Previsualización PDF */}
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
              <PdfIntervencionesGrupales data={fields} />
            </PDFViewer>
          </div>
        </div>
      </div>
    </div>
  );
}
