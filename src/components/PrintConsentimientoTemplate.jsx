import React, { useState, useEffect } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { X, ArrowLeft, FileText } from 'lucide-react';
import PdfConsentimiento from './PdfConsentimiento';
import { supabase } from '../supabase';

export default function PrintConsentimientoTemplate({ data, onClose }) {
  if (!data) return null;

  const est = data?.estudiantes || {};
  const acu = est.datos_acudiente || {};

  // Extraer grado sin jornada
  let gradoInit = est.grado || '';
  const gMatch = gradoInit.match(/(.*?)-(MA[ÑN]ANA|TARDE|NOCHE|SABATINA|UNICA)$/i);
  if (gMatch) gradoInit = gMatch[1];

  // Estado editable con todos los campos
  const [editMode, setEditMode] = useState(true);
  const [fields, setFields] = useState({
    nombre_estudiante: `${est.nombres || ''} ${est.apellidos || ''}`.trim(),
    documento_estudiante: est.documento || '',
    grado: gradoInit,
    nombre_acudiente: `${acu.nombres || ''} ${acu.apellidos || ''}`.trim(),
    documento_acudiente: acu.documento || '',
    parentesco: acu.parentesco || 'Acudiente',
    fecha: data?.fecha || new Date().toLocaleDateString('es-CO'),
    tipo_doc_estudiante: 'TI',
    edad_estudiante: '',
    tipo_doc_acudiente: 'CC',
    tipo_doc_orientador: 'CC',
    doc_orientador: '',
    nombre_orientador: '',
    tp_orientador: '',
  });

  const [firmasData, setFirmasData] = useState({
    estudiante: null,
    acudiente: null,
    orientador: null
  });

  useEffect(() => {
    const fetchFirmas = async () => {
      if (!est.id) return;
      
      // Buscar firmas asociadas al estudiante o al orientador
      const { data: firmas, error } = await supabase
        .from('firmas')
        .select('*')
        .or(`estudiante_id.eq.${est.id},tipo.eq.orientador`);
        
      if (!error && firmas) {
        const studentFirma = firmas.find(f => f.tipo === 'estudiante' && f.estudiante_id === est.id && f.imagen_url);
        const acudienteFirma = firmas.find(f => f.tipo === 'acudiente' && f.estudiante_id === est.id && f.imagen_url);
        
        // Cargar el orientador seleccionado (idealmente el usuario actual, por ahora el primero que haya o null)
        const orientadorFirma = firmas.find(f => f.tipo === 'orientador' && f.imagen_url);
        
        setFirmasData(prev => ({
          ...prev,
          estudiante: prev.estudiante || studentFirma?.imagen_url || null,
          acudiente: prev.acudiente || acudienteFirma?.imagen_url || null,
          orientador: prev.orientador || orientadorFirma?.imagen_url || null
        }));

        // Si hay un orientador guardado con firma, autocompletar su nombre y documento
        if (orientadorFirma && !fields.nombre_orientador) {
          setFields(prev => ({
            ...prev,
            nombre_orientador: orientadorFirma.nombre_completo || '',
            doc_orientador: orientadorFirma.documento || ''
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

  // Construir objeto de datos modificados para pasarlo al PDF
  const buildPdfData = () => ({
    ...data,
    fecha: fields.fecha,
    estudiantes: {
      ...est,
      nombres: fields.nombre_estudiante.split(' ').slice(0, -1).join(' ') || fields.nombre_estudiante,
      apellidos: fields.nombre_estudiante.split(' ').slice(-1).join(' '),
      documento: fields.documento_estudiante,
      grado: fields.grado,
      datos_acudiente: {
        ...acu,
        nombres: fields.nombre_acudiente.split(' ').slice(0, -1).join(' ') || fields.nombre_acudiente,
        apellidos: fields.nombre_acudiente.split(' ').slice(-1).join(' '),
        documento: fields.documento_acudiente,
        parentesco: fields.parentesco,
      }
    },
    tipo_doc_estudiante: fields.tipo_doc_estudiante,
    edad_estudiante: fields.edad_estudiante,
    tipo_doc_acudiente: fields.tipo_doc_acudiente,
    tipo_doc_orientador: fields.tipo_doc_orientador,
    doc_orientador: fields.doc_orientador,
    observaciones_extra: fields.observaciones,
    nombre_orientador: fields.nombre_orientador,
    tp_orientador: fields.tp_orientador,
    _gradoLimpio: true,
    firmas: firmasData // Pasamos las firmas al PDF
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            {!editMode && (
              <button 
                onClick={() => setEditMode(true)}
                className="p-2 hover:bg-indigo-100 rounded-full transition-colors text-indigo-600"
                title="Volver a editar"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {editMode ? 'Revisar Datos del Consentimiento' : 'Vista Previa PDF'}
              </h2>
              <p className="text-xs text-slate-500">
                {editMode 
                  ? 'Verifica y corrige los datos antes de generar el PDF' 
                  : 'Descarga o imprime desde los controles del visor'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            title="Cerrar"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 w-full overflow-auto">
          {editMode ? (
            /* ========== FORMULARIO DE EDICION ========== */
            <div className="max-w-2xl mx-auto p-8">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-indigo-700">
                  <strong>Tip:</strong> Los datos se cargan automaticamente de la base de datos. 
                  Si ves algun error, corrigelo aqui antes de generar el PDF.
                </p>
              </div>

              {/* Datos del Estudiante */}
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
                Datos del Estudiante
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre completo</label>
                  <input
                    type="text"
                    value={fields.nombre_estudiante}
                    onChange={e => handleChange('nombre_estudiante', e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo Doc.</label>
                    <select
                      value={fields.tipo_doc_estudiante}
                      onChange={e => handleChange('tipo_doc_estudiante', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    >
                      <option value="TI">TI</option>
                      <option value="RC">RC</option>
                      <option value="CC">CC</option>
                      <option value="PEP">PEP</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Documento</label>
                    <input
                      type="text"
                      value={fields.documento_estudiante}
                      onChange={e => handleChange('documento_estudiante', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Edad</label>
                  <input
                    type="text"
                    value={fields.edad_estudiante}
                    onChange={e => handleChange('edad_estudiante', e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    placeholder="Ej. 12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Grado</label>
                  <input
                    type="text"
                    value={fields.grado}
                    onChange={e => handleChange('grado', e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha</label>
                  <input
                    type="text"
                    value={fields.fecha}
                    onChange={e => handleChange('fecha', e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                  />
                </div>
              </div>

              {/* Datos del Acudiente */}
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
                Datos del Acudiente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre completo</label>
                  <input
                    type="text"
                    value={fields.nombre_acudiente}
                    onChange={e => handleChange('nombre_acudiente', e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo Doc.</label>
                    <select
                      value={fields.tipo_doc_acudiente}
                      onChange={e => handleChange('tipo_doc_acudiente', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    >
                      <option value="CC">CC</option>
                      <option value="CE">CE</option>
                      <option value="PEP">PEP</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Documento</label>
                    <input
                      type="text"
                      value={fields.documento_acudiente}
                      onChange={e => handleChange('documento_acudiente', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Parentesco</label>
                  <div className="flex gap-2">
                    <select
                      value={['Padre', 'Madre'].includes(fields.parentesco) ? fields.parentesco : 'Otro'}
                      onChange={e => {
                        if (e.target.value === 'Otro') {
                          handleChange('parentesco', '');
                        } else {
                          handleChange('parentesco', e.target.value);
                        }
                      }}
                      className="w-1/3 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    >
                      <option value="Padre">Padre</option>
                      <option value="Madre">Madre</option>
                      <option value="Otro">Otro...</option>
                    </select>
                    {!['Padre', 'Madre'].includes(fields.parentesco) && (
                      <input
                        type="text"
                        value={fields.parentesco}
                        onChange={e => handleChange('parentesco', e.target.value)}
                        placeholder="Especifique parentesco (ej. Tío, Abuela...)"
                        className="flex-1 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                        autoFocus
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Datos del Orientador */}
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
                Datos del Docente Orientador
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre completo</label>
                  <input
                    type="text"
                    value={fields.nombre_orientador}
                    onChange={e => handleChange('nombre_orientador', e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    placeholder="Nombre del orientador/a"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo Doc.</label>
                    <select
                      value={fields.tipo_doc_orientador}
                      onChange={e => handleChange('tipo_doc_orientador', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    >
                      <option value="CC">CC</option>
                      <option value="CE">CE</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Documento</label>
                    <input
                      type="text"
                      value={fields.doc_orientador}
                      onChange={e => handleChange('doc_orientador', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                      placeholder="No. Documento"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tarjeta Profesional</label>
                  <input
                    type="text"
                    value={fields.tp_orientador}
                    onChange={e => handleChange('tp_orientador', e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    placeholder="No. Tarjeta Profesional (si aplica)"
                  />
                </div>
              </div>

              {/* Observaciones */}
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
                Observaciones o Aclaraciones
              </h3>
              <div className="mb-6">
                <textarea
                  rows="4"
                  value={fields.observaciones}
                  onChange={e => handleChange('observaciones', e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 resize-none"
                  placeholder="Escribe aqui las observaciones o aclaraciones que necesites agregar al documento..."
                ></textarea>
              </div>

              {/* Boton Generar */}
              <button
                onClick={() => setEditMode(false)}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
              >
                <FileText className="w-6 h-6" />
                Generar PDF
              </button>
            </div>
          ) : (
            /* ========== VISOR PDF ========== */
            <PDFViewer width="100%" height="100%" className="border-none">
              <PdfConsentimiento data={buildPdfData()} />
            </PDFViewer>
          )}
        </div>
      </div>
    </div>
  );
}
