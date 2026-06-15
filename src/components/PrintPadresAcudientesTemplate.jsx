import React, { useState } from 'react';
import PrintLayout from './PrintLayout';

export default function PrintPadresAcudientesTemplate({ data, onClose }) {
  const [signatureSize, setSignatureSize] = useState(150);

  if (!data) return null;

  return (
    <PrintLayout 
      title="ACTA DE ATENCIÓN A PADRES"
      onClose={onClose}
      data={data}
      signatureSize={{ value: signatureSize, onChange: setSignatureSize }}
    >
      <table className="w-full text-[11px] pb-24 border-separate" style={{ borderSpacing: '0 0.75rem' }}>
        <tbody>

          {/* DATOS GENERALES */}
          <tr className="break-inside-avoid">
            <td>
              <div className="border border-black">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="border-r border-b border-black p-2 font-bold bg-slate-50 w-1/6">FECHA</td>
                      <td className="border-b border-black p-2" colSpan="3">
                        <input type="text" className="w-full bg-transparent outline-none" defaultValue={data.fecha ? `${data.fecha} DE ${new Date().getFullYear()}` : ''} />
                      </td>
                    </tr>
                    <tr>
                      <td className="border-r border-b border-black p-2 font-bold bg-slate-50">LUGAR</td>
                      <td className="border-b border-black p-2" colSpan="3">
                        <input type="text" className="w-full bg-transparent outline-none" defaultValue="ORIENTACIÓN ESCOLAR" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border-r border-b border-black p-2 font-bold bg-slate-50">RESPONSABLE</td>
                      <td className="border-b border-black p-2" colSpan="3">
                        <input type="text" className="w-full bg-transparent outline-none font-bold" defaultValue={data.nombre_remitente || ''} />
                      </td>
                    </tr>
                    <tr>
                      <td className="border-r border-b border-black p-2 font-bold bg-slate-50">ACUDIENTE(S)</td>
                      <td className="border-b border-black p-2" colSpan="3">
                        <input type="text" className="w-full bg-transparent outline-none" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border-r border-b border-black p-2 font-bold bg-slate-50">ESTUDIANTE</td>
                      <td className="border-r border-b border-black p-2">
                        <input type="text" className="w-full bg-transparent outline-none font-bold" defaultValue={`${data.estudiantes?.nombres || ''} ${data.estudiantes?.apellidos || ''}`.trim()} />
                      </td>
                      <td className="border-r border-b border-black p-2 font-bold bg-slate-50 w-16">GRADO</td>
                      <td className="border-b border-black p-2 w-24">
                        <input type="text" className="w-full bg-transparent outline-none font-bold text-center" defaultValue={data.estudiantes?.grado} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>

          {/* PROPÓSITO */}
          <tr className="break-inside-avoid">
            <td>
              <div className="border border-black">
                <div className="bg-slate-50 border-b border-black p-1.5">
                  <h3 className="font-bold uppercase text-center text-[12px]">PROPÓSITO</h3>
                </div>
                <div className="p-2">
                  <textarea className="w-full min-h-[60px] resize-none bg-transparent outline-none" defaultValue={data.motivos?.join(', ')}></textarea>
                </div>
              </div>
            </td>
          </tr>

          {/* DESARROLLO DEL ENCUENTRO */}
          <tr className="break-inside-avoid">
            <td>
              <div className="border border-black">
                <div className="bg-slate-50 border-b border-black p-1.5">
                  <h3 className="font-bold uppercase text-center text-[12px]">DESARROLLO DEL ENCUENTRO</h3>
                </div>
                <div className="p-2">
                  <textarea className="w-full min-h-[100px] resize-none bg-transparent outline-none" defaultValue={data.descripcion}></textarea>
                </div>
              </div>
            </td>
          </tr>

          {/* OBSERVACIONES Y/O ACUERDOS */}
          <tr className="break-inside-avoid">
            <td>
              <div className="border border-black">
                <div className="bg-slate-50 border-b border-black p-1.5">
                  <h3 className="font-bold uppercase text-center text-[12px]">OBSERVACIONES Y/O ACUERDOS</h3>
                </div>
                <div className="p-2">
                  <textarea className="w-full min-h-[80px] resize-none bg-transparent outline-none" defaultValue={data.orientaciones}></textarea>
                </div>
              </div>
            </td>
          </tr>

          {/* ACLARACIÓN SOBRE FIRMA DIGITAL */}
          <tr className="break-inside-avoid">
            <td>
              <div className="border border-black p-3 bg-slate-50 text-[10px] text-justify leading-relaxed">
                <strong>ACLARACIÓN SOBRE FIRMA DIGITAL:</strong> La presente acta se firma de manera digital, contando con la autorización expresa del acudiente para el uso de la firma registrada en el listado de asistencia, la cual se adopta como válida para efectos de constancia, seguimiento institucional y archivo del presente documento, de conformidad con los procedimientos internos de la institución educativa.
              </div>
            </td>
          </tr>

          {/* FIRMAS */}
          <tr className="break-inside-avoid">
            <td>
              <div className="mt-4 mb-4">
                <p className="font-bold text-center text-[12px] mb-8">FIRMAN</p>
                <div className="flex justify-between items-end px-4 gap-8">
                  {/* DOCENTE ORIENTADORA */}
                  <div className="flex flex-col relative w-1/3">
                    <div className="h-14 border-b border-black w-full flex items-end relative">
                      {data.firma_base64 && (
                        <img 
                          src={data.firma_base64} 
                          alt="Firma Docente" 
                          style={{ width: `${signatureSize}px`, position: 'absolute', bottom: '0', left: '0' }}
                        />
                      )}
                    </div>
                    <span className="font-bold mt-1 text-[11px] text-center">DOCENTE ORIENTADORA</span>
                  </div>

                  {/* ACUDIENTE */}
                  <div className="flex flex-col relative w-1/3">
                    <div className="h-14 border-b border-black w-full flex items-end"></div>
                    <span className="font-bold mt-1 text-[11px] text-center">ACUDIENTE</span>
                  </div>

                  {/* ESTUDIANTE */}
                  <div className="flex flex-col relative w-1/3">
                    <div className="h-14 border-b border-black w-full flex items-end"></div>
                    <span className="font-bold mt-1 text-[11px] text-center">ESTUDIANTE</span>
                  </div>
                </div>
              </div>
            </td>
          </tr>

        </tbody>
      </table>
    </PrintLayout>
  );
}
