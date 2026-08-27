import React, { useState } from 'react';
import PrintLayout from './PrintLayout';

export default function PrintNotificacionInternaTemplate({ data, onClose }) {
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


  const today = new Date();
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const defaultDate = `Caucasia, Antioquia                                                                  ${today.getDate()} de ${months[today.getMonth()]} de ${today.getFullYear()}`;

  return (
    <PrintLayout 
      title="COMUNICACIÓN PREVENTIVA DESDE ORIENTACIÓN ESCOLAR"
      onClose={onClose}
      data={data}
      signatureSize={{ value: signatureSize, onChange: setSignatureSize }}
    >
      <table className="w-full text-[12px] pb-24 border-separate" style={{ borderSpacing: '0 0.5rem' }}>
        <tbody>

          {/* FECHA Y LUGAR */}
          <tr className="break-inside-avoid">
            <td>
              <div className="mb-6">
                <input type="text" className="w-full bg-transparent outline-none text-[12px]" defaultValue={defaultDate} />
              </div>
            </td>
          </tr>

          {/* DESTINATARIO */}
          <tr className="break-inside-avoid">
            <td>
              <div className="mb-4 space-y-1">
                <p className="font-bold">Señora</p>
                <input type="text" className="w-full bg-transparent outline-none font-bold" defaultValue="Hna. Martha Lucía Jiménez" />
                <input type="text" className="w-full bg-transparent outline-none font-bold" defaultValue="Rectora" />
                <input type="text" className="w-full bg-transparent outline-none" defaultValue="Institución Educativa Divino Niño" />
              </div>
            </td>
          </tr>

          {/* SALUDO */}
          <tr className="break-inside-avoid">
            <td>
              <p className="mb-4">Cordial saludo.</p>
            </td>
          </tr>

          {/* ASUNTO */}
          <tr className="break-inside-avoid">
            <td>
              <div className="mb-4 flex items-center gap-2">
                <span className="font-bold whitespace-nowrap">Asunto:</span>
                <input type="text" className="flex-1 bg-transparent outline-none" defaultValue="Comunicación preventiva desde Orientación Escolar" />
              </div>
            </td>
          </tr>

          {/* CUERPO DEL INFORME */}
          <tr className="break-inside-avoid">
            <td>
              <div className="text-justify leading-relaxed space-y-4">
                <textarea className="w-full min-h-[400px] resize-none bg-transparent outline-none text-justify leading-relaxed text-[12px]" defaultValue={data.descripcion || `Cordial saludo,

Desde el área de Orientación Escolar me permito comunicarme con usted con el fin de poner en su conocimiento algunas consideraciones generales, abordadas desde un enfoque preventivo, de acompañamiento institucional y en coherencia con la normativa vigente del sector educativo público.

[Escriba aquí el contenido del informe...]

Teniendo en cuenta la normativa vigente y el rol preventivo de Orientación Escolar, la presente notificación se realiza con el único fin de posibilitar la prevención de situaciones o acciones no intencionadas que, en el desarrollo cotidiano de la labor pedagógica, puedan llegar a generar una afectación a un grupo de estudiantes o al clima escolar. En ningún caso esta comunicación tiene un carácter evaluativo, sancionatorio o de señalamiento personal.

La intención es aportar elementos que permitan, desde rectoría, considerar estrategias de acompañamiento institucional, apoyo y posibles ajustes razonables, priorizando el bienestar de la docente, los estudiantes y la comunidad educativa en general.

Agradezco su atención y quedo atenta para acompañar, desde Orientación Escolar, los procesos que se consideren pertinentes.`}></textarea>
              </div>
            </td>
          </tr>

          {/* DESPEDIDA Y FIRMA */}
          <tr className="break-inside-avoid">
            <td>
              <div className="mt-6 mb-4">
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
                    <input type="text" className="w-full bg-transparent outline-none font-bold" defaultValue={data.nombre_remitente || ''} />
                    <p className="text-[11px]">Orientación Escolar</p>
                    <p className="text-[11px]">Institución Educativa Divino Niño</p>
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
