import React, { useState } from 'react';
import PrintLayout from './PrintLayout';

export default function PrintTemplate({ data, onClose }) {
  const [signatureSize, setSignatureSize] = useState(150);

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


  // Extraer datos incrustados en observaciones si existen
  const getEmbeddedData = (key) => {
    if (!data.observaciones) return '';
    const match = data.observaciones.match(new RegExp(`${key}:\\s*([^\\n.]+)`));
    return match ? match[1].trim() : '';
  };

  const sede = getEmbeddedData('Sede');
  const acompanamiento = getEmbeddedData('Acompañamiento');
  
  // Limpiar observaciones (quitar las variables incrustadas)
  let cleanObservaciones = data.observaciones || '';
  cleanObservaciones = cleanObservaciones.replace(/Sede:.*?(?=\.|$)\.?\s*/g, '');
  cleanObservaciones = cleanObservaciones.replace(/Fecha Remisión:.*?(?=\.|$)\.?\s*/g, '');
  cleanObservaciones = cleanObservaciones.replace(/Acompañamiento:.*?(?=\.|$)\.?\s*/g, '');
  cleanObservaciones = cleanObservaciones.replace(/Formato físico:.*?(?=\.|$)\.?\s*/g, '');
  cleanObservaciones = cleanObservaciones.replace(/\[Firma Digital Adjunta en Sistema\]/g, '');

  return (
    <PrintLayout 
      title="INFORME PARA ENTREGA DE CASOS"
      onClose={onClose}
      data={data}
      signatureSize={{ value: signatureSize, onChange: setSignatureSize }}
    >
      <div className="space-y-4 text-[12px] pb-24">
        
        {/* Tabla de Datos Básicos */}
        <table className="w-full border-collapse border border-black text-left">
          <tbody>
            <tr>
              <td className="border border-black p-1.5 font-bold bg-slate-50 w-1/4">FECHA:</td>
              <td className="border border-black p-1.5 w-1/4">{data.fecha}</td>
              <td className="border border-black p-1.5 font-bold bg-slate-50 w-1/4">SEDE:</td>
              <td className="border border-black p-1.5 w-1/4">
                <input type="text" className="w-full bg-transparent outline-none font-inherit text-inherit" defaultValue={sede || 'Divino Niño'} />
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-bold bg-slate-50">ESTUDIANTE:</td>
              <td colSpan="3" className="border border-black p-1.5 font-semibold">
                {data.estudiantes?.nombres} {data.estudiantes?.apellidos}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-bold bg-slate-50">DOCUMENTO:</td>
              <td className="border border-black p-1.5">{data.estudiantes?.documento}</td>
              <td className="border border-black p-1.5 font-bold bg-slate-50">GRADO:</td>
              <td className="border border-black p-1.5">{data.estudiantes?.grado}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-bold bg-slate-50">REMITENTE:</td>
              <td className="border border-black p-1.5">
                <input type="text" className="w-full bg-transparent outline-none" defaultValue={data.nombre_remitente || 'Autónomo'} />
              </td>
              <td className="border border-black p-1.5 font-bold bg-slate-50">CARGO:</td>
              <td className="border border-black p-1.5">
                <input type="text" className="w-full bg-transparent outline-none" defaultValue={data.cargo_remitente} />
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-bold bg-slate-50">MOTIVOS:</td>
              <td colSpan="3" className="border border-black p-1.5">
                <input type="text" className="w-full bg-transparent outline-none" defaultValue={data.motivos?.join(', ')} />
              </td>
            </tr>
            {acompanamiento && (
              <tr>
                <td className="border border-black p-1.5 font-bold bg-slate-50">ACOMPAÑANTE:</td>
                <td colSpan="3" className="border border-black p-1.5">
                  <input type="text" className="w-full bg-transparent outline-none" defaultValue={acompanamiento} />
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Secciones de texto */}
        <div className="border border-black mt-4">
          <div className="bg-slate-50 border-b border-black p-1.5">
            <h3 className="font-bold uppercase">Descripción de la Situación</h3>
          </div>
          <div className="p-3">
            <textarea 
              className="w-full min-h-[100px] resize-none bg-transparent outline-none font-inherit text-inherit"
              defaultValue={data.descripcion}
            />
          </div>
        </div>

        {cleanObservaciones.trim() && (
          <div className="border border-black mt-4">
            <div className="bg-slate-50 border-b border-black p-1.5">
              <h3 className="font-bold uppercase">Observaciones y Desarrollo</h3>
            </div>
            <div className="p-3">
              <textarea 
                className="w-full min-h-[80px] resize-none bg-transparent outline-none font-inherit text-inherit"
                defaultValue={cleanObservaciones.trim()}
              />
            </div>
          </div>
        )}

        {data.orientaciones && (
          <div className="border border-black mt-4">
            <div className="bg-slate-50 border-b border-black p-1.5">
              <h3 className="font-bold uppercase">Orientaciones / Compromisos</h3>
            </div>
            <div className="p-3">
              <textarea 
                className="w-full min-h-[80px] resize-none bg-transparent outline-none font-inherit text-inherit"
                defaultValue={data.orientaciones}
              />
            </div>
          </div>
        )}

        {/* FIRMAS AL FINAL */}
        <div className="mt-16 flex justify-between gap-8 px-8">
          {/* Firma Orientador */}
          <div className="text-center flex-1">
            <div className="h-20 mb-2 border-b border-black"></div>
            <input type="text" className="font-bold text-[12px] w-full text-center bg-transparent outline-none" defaultValue="Firma Orientador(a) Escolar" />
          </div>

          {/* Firma Estudiante/Acudiente */}
          <div className="text-center relative flex-1 flex flex-col justify-end">
            <div className="h-20 mb-2 border-b border-black flex items-end justify-center">
              {data.firma_base64 && (
                <img 
                  src={data.firma_base64} 
                  alt="Firma" 
                  className="mb-1"
                  style={{ width: `${signatureSize}px`, maxHeight: '80px', objectFit: 'contain' }}
                />
              )}
            </div>
            <input type="text" className="font-bold text-[12px] w-full text-center bg-transparent outline-none" defaultValue="Firma Estudiante / Acudiente" />
            <p className="text-[10px]">{data.estudiantes?.nombres} {data.estudiantes?.apellidos}</p>
          </div>
        </div>

      </div>
    </PrintLayout>
  );
}
