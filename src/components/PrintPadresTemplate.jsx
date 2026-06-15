import React, { useState } from 'react';
import PrintLayout from './PrintLayout';

export default function PrintPadresTemplate({ data, onClose }) {
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


  return (
    <PrintLayout 
      title="ACTA DE ATENCIÓN A PADRES"
      onClose={onClose}
      data={data}
      signatureSize={{ value: signatureSize, onChange: setSignatureSize }}
    >
      <div className="space-y-4 text-[12px] pb-24">
        
        {/* Tabla de Datos Básicos */}
        <table className="w-full border-collapse border border-black text-left">
          <tbody>
            <tr>
              <td className="border border-black p-1.5 font-bold bg-slate-50 w-1/4">FECHA DE ATENCIÓN:</td>
              <td className="border border-black p-1.5 w-1/4">
                <input type="text" className="w-full bg-transparent outline-none" defaultValue={data.fecha} />
              </td>
              <td className="border border-black p-1.5 font-bold bg-slate-50 w-1/4">LUGAR:</td>
              <td className="border border-black p-1.5 w-1/4">
                <input type="text" className="w-full bg-transparent outline-none" defaultValue="ORIENTACIÓN ESCOLAR" />
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-bold bg-slate-50">RESPONSABLE:</td>
              <td colSpan="3" className="border border-black p-1.5 font-semibold">
                <input type="text" className="w-full bg-transparent outline-none" defaultValue={data.nombre_remitente || 'Docente Orientadora'} />
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-bold bg-slate-50">ACUDIENTE(S):</td>
              <td colSpan="3" className="border border-black p-1.5 font-semibold">
                <input type="text" className="w-full bg-transparent outline-none" defaultValue="" placeholder="Nombre del acudiente..." />
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-bold bg-slate-50">ESTUDIANTE:</td>
              <td colSpan="3" className="border border-black p-1.5 font-semibold">
                {data.estudiantes?.nombres} {data.estudiantes?.apellidos}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-bold bg-slate-50">GRADO:</td>
              <td colSpan="3" className="border border-black p-1.5">
                {data.estudiantes?.grado}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Desarrollo */}
        <div className="border border-black mt-4">
          <div className="bg-slate-50 border-b border-black p-1.5">
            <h3 className="font-bold uppercase">PROPÓSITO</h3>
          </div>
          <div className="p-3">
            <textarea 
              className="w-full min-h-[50px] resize-none bg-transparent outline-none font-inherit text-inherit"
              defaultValue={data.motivos?.join(', ')}
            />
          </div>
        </div>

        <div className="border border-black mt-4">
          <div className="bg-slate-50 border-b border-black p-1.5">
            <h3 className="font-bold uppercase">DESARROLLO DEL ENCUENTRO</h3>
          </div>
          <div className="p-3">
            <textarea 
              className="w-full min-h-[100px] resize-none bg-transparent outline-none font-inherit text-inherit"
              defaultValue={data.descripcion}
            />
          </div>
        </div>

        <div className="border border-black mt-4">
          <div className="bg-slate-50 border-b border-black p-1.5">
            <h3 className="font-bold uppercase">OBSERVACIONES Y/O ACUERDOS</h3>
          </div>
          <div className="p-3">
            <textarea 
              className="w-full min-h-[80px] resize-none bg-transparent outline-none font-inherit text-inherit"
              defaultValue={data.orientaciones}
            />
          </div>
        </div>

        {/* Legal Text */}
        <div className="mt-4 p-3 border border-black bg-slate-50 text-justify text-[10px] italic">
          <p>
            <strong>ACLARACIÓN SOBRE FIRMA DIGITAL:</strong> La presente acta se firma de manera digital, 
            contando con la autorización expresa del acudiente para el uso de la firma registrada en el sistema, 
            la cual se adopta como válida para efectos de constancia, seguimiento institucional y archivo 
            del presente documento, de conformidad con los procedimientos internos de la institución educativa.
          </p>
        </div>

        {/* FIRMAS AL FINAL */}
        <div className="mt-16 flex justify-between gap-4 px-4">
          <div className="text-center flex-1">
            <div className="h-20 mb-2 border-b border-black mx-2"></div>
            <input type="text" className="font-bold text-[11px] w-full text-center bg-transparent outline-none" defaultValue="DOCENTE ORIENTADORA" />
          </div>

          <div className="text-center relative flex-1">
            <div className="h-20 mb-2 border-b border-black mx-2 relative flex items-end justify-center">
              {data.firma_base64 && (
                <img 
                  src={data.firma_base64} 
                  alt="Firma" 
                  style={{ width: `${signatureSize}px`, position: 'absolute', bottom: '0' }}
                />
              )}
            </div>
            <input type="text" className="font-bold text-[11px] w-full text-center bg-transparent outline-none" defaultValue="ACUDIENTE" />
          </div>

          <div className="text-center flex-1">
            <div className="h-20 mb-2 border-b border-black mx-2"></div>
            <input type="text" className="font-bold text-[11px] w-full text-center bg-transparent outline-none" defaultValue="ESTUDIANTE" />
          </div>
        </div>

      </div>
    </PrintLayout>
  );
}
