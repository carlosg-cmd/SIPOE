import React, { useState } from 'react';
import PrintLayout from './PrintLayout';

export default function PrintEntregaCasosTemplate({ data, onClose }) {
  const [signatureSize, setSignatureSize] = useState(150);

  if (!data) return null;

  return (
    <PrintLayout 
      title="INFORME PARA ENTREGA DE CASOS"
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
                      <td className="border-r border-b border-black p-2 font-bold bg-slate-50 w-1/4">Institución Educativa:</td>
                      <td className="border-r border-b border-black p-2 w-1/2"><input type="text" className="w-full bg-transparent outline-none" defaultValue="Institución Educativa Divino Niño" /></td>
                      <td className="border-r border-b border-black p-2 font-bold bg-slate-50 w-12">Fecha:</td>
                      <td className="border-b border-black p-2"><input type="text" className="w-full bg-transparent outline-none" defaultValue={data.fecha} /></td>
                    </tr>
                    <tr>
                      <td className="border-r border-b border-black p-2 font-bold bg-slate-50">Nombre del estudiante:</td>
                      <td className="border-r border-b border-black p-2"><input type="text" className="w-full bg-transparent outline-none font-bold" defaultValue={`${data.estudiantes?.nombres || ''} ${data.estudiantes?.apellidos || ''}`.trim()} /></td>
                      <td className="border-r border-b border-black p-2 font-bold bg-slate-50">Grado:</td>
                      <td className="border-b border-black p-2"><input type="text" className="w-full bg-transparent outline-none text-center" defaultValue={data.estudiantes?.grado} /></td>
                    </tr>
                    <tr>
                      <td className="border-r border-b border-black p-2 font-bold bg-slate-50">Edad:</td>
                      <td className="border-r border-b border-black p-2"><input type="text" className="w-full bg-transparent outline-none" /></td>
                      <td className="border-r border-b border-black p-2 font-bold bg-slate-50">Tipo de doc.:</td>
                      <td className="border-b border-black p-2"><input type="text" className="w-full bg-transparent outline-none" /></td>
                    </tr>
                    <tr>
                      <td className="border-r border-b border-black p-2 font-bold bg-slate-50">Número de documento:</td>
                      <td className="border-r border-b border-black p-2"><input type="text" className="w-full bg-transparent outline-none font-bold" defaultValue={data.estudiantes?.documento} /></td>
                      <td className="border-r border-b border-black p-2 font-bold bg-slate-50">Ciudad nac.:</td>
                      <td className="border-b border-black p-2"><input type="text" className="w-full bg-transparent outline-none" /></td>
                    </tr>
                    <tr>
                      <td className="border-r border-black p-2 font-bold bg-slate-50">Nombre del acudiente:</td>
                      <td className="border-r border-black p-2"><input type="text" className="w-full bg-transparent outline-none" /></td>
                      <td className="border-r border-black p-2 font-bold bg-slate-50">Teléfono:</td>
                      <td className="border-black p-2"><input type="text" className="w-full bg-transparent outline-none" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>

          {/* MOTIVO DE ACTIVACIÓN DE RUTA */}
          <tr className="break-inside-avoid">
            <td>
              <div className="border border-black">
                <div className="bg-slate-50 border-b border-black p-1.5">
                  <h3 className="font-bold uppercase text-center text-[12px]">MOTIVO DE ACTIVACIÓN DE RUTA</h3>
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <label className="flex items-center gap-2"><input type="checkbox" /> Ideación suicida</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Intento de suicidio</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Autolesiones o comportamientos autodestructivos</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Alteraciones del comportamiento con sospecha de trastorno mental</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Episodios de ansiedad o crisis de pánico</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Conductas depresivas prolongadas</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Consumo de sustancias psicoactivas</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Situaciones de violencia intrafamiliar o abuso</label>
                    <div className="flex items-center gap-2 col-span-1 md:col-span-2">
                      <input type="checkbox" />
                      <span className="whitespace-nowrap">Otros:</span>
                      <input type="text" className="flex-1 border-b border-black bg-transparent outline-none" defaultValue={data.motivos?.join(', ')} />
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>

          {/* DESCRIPCIÓN DE LA SITUACIÓN */}
          <tr className="break-inside-avoid">
            <td>
              <div className="border border-black">
                <div className="bg-slate-50 border-b border-black p-1.5">
                  <h3 className="font-bold uppercase text-center text-[12px]">DESCRIPCIÓN DE LA SITUACIÓN</h3>
                </div>
                <div className="p-3">
                  <textarea className="w-full min-h-[80px] resize-none bg-transparent outline-none" defaultValue={data.descripcion}></textarea>
                </div>
              </div>
            </td>
          </tr>

          {/* ACCIONES REALIZADAS */}
          <tr className="break-inside-avoid">
            <td>
              <div className="border border-black">
                <div className="bg-slate-50 border-b border-black p-1.5">
                  <h3 className="font-bold uppercase text-center text-[12px]">ACCIONES REALIZADAS POR LA INSTITUCIÓN EDUCATIVA</h3>
                </div>
                <div className="p-3">
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2"><input type="checkbox" /> Observación y seguimiento del estudiante en el contexto escolar.</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Entrevista individual con el estudiante.</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Comunicación con los padres o acudientes.</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Orientación sobre la situación y recomendación de atención médica.</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Registro del caso en el protocolo de protección escolar.</label>
                  </div>
                </div>
              </div>
            </td>
          </tr>

          {/* OBSERVACIONES ADICIONALES */}
          <tr className="break-inside-avoid">
            <td>
              <div className="border border-black">
                <div className="bg-slate-50 border-b border-black p-1.5">
                  <h3 className="font-bold uppercase text-center text-[12px]">OBSERVACIONES ADICIONALES</h3>
                </div>
                <div className="p-3">
                  <textarea className="w-full min-h-[60px] resize-none bg-transparent outline-none" defaultValue="Reiteramos nuestra disposición para brindar acompañamiento durante este proceso y agradecemos su colaboración para proteger la integridad y bienestar emocional del/la estudiante."></textarea>
                </div>
              </div>
            </td>
          </tr>

          {/* CIERRE Y FIRMA */}
          <tr className="break-inside-avoid">
            <td>
              <div className="mt-4 mb-4">
                <p className="text-justify mb-6">Quedamos atentos ante cualquier inquietud o situación adicional.</p>
                <p className="mb-8">Atentamente,</p>
                <div className="w-72">
                  <div className="h-14 border-b border-black flex items-end relative">
                    {data.firma_base64 && (
                      <img 
                        src={data.firma_base64} 
                        alt="Firma" 
                        style={{ width: `${signatureSize}px`, position: 'absolute', bottom: '0', left: '0' }}
                      />
                    )}
                  </div>
                  <div className="mt-1">
                    <input type="text" className="w-full bg-transparent outline-none font-bold" defaultValue={data.nombre_remitente || 'Orientadora Escolar'} />
                    <p className="text-[10px] text-slate-600">Orientadora Escolar</p>
                    <p className="text-[10px] text-slate-600">Ins. Edu. Divino Niño</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px]">Correo:</span>
                      <input type="text" className="flex-1 bg-transparent outline-none text-[10px]" defaultValue="orientacion@divinonino.edu.co" />
                    </div>
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
