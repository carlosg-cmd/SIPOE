import React, { useState } from 'react';
import PrintLayout from './PrintLayout';

export default function PrintSaludTemplate({ data, onClose }) {
  const [signatureSize, setSignatureSize] = useState(150);

  if (!data) return null;

  return (
    <PrintLayout 
      title="INFORME PARA ENTREGA DEL CASO A LA SECRETARÍA DE SALUD"
      onClose={onClose}
      data={data}
      signatureSize={{ value: signatureSize, onChange: setSignatureSize }}
    >
      <div className="space-y-4 text-[12px] pb-24">
        
        {/* Sección 1: Datos Básicos */}
        <div className="border border-black break-inside-avoid">
          <div className="bg-slate-50 border-b border-black p-1.5">
            <h3 className="font-bold uppercase">DATOS BÁSICOS</h3>
          </div>
          <table className="w-full border-collapse text-left">
            <tbody>
              <tr>
                <td className="border-b border-r border-black p-1.5 font-bold bg-slate-50 w-1/4">Institución Educativa:</td>
                <td colSpan="3" className="border-b border-black p-1.5 font-semibold">
                  <input type="text" className="w-full bg-transparent outline-none" defaultValue="INSTITUCION EDUCATIVA DIVINO NIÑO" />
                </td>
              </tr>
              <tr>
                <td className="border-b border-r border-black p-1.5 font-bold bg-slate-50 w-1/4">Fecha:</td>
                <td colSpan="3" className="border-b border-black p-1.5">
                  <input type="text" className="w-full bg-transparent outline-none" defaultValue={data.fecha} />
                </td>
              </tr>
              <tr>
                <td className="border-b border-r border-black p-1.5 font-bold bg-slate-50 w-1/4">Nombre del estudiante:</td>
                <td className="border-b border-r border-black p-1.5 font-semibold w-1/4">
                  {data.estudiantes?.nombres} {data.estudiantes?.apellidos}
                </td>
                <td className="border-b border-r border-black p-1.5 font-bold bg-slate-50 w-1/6">Grado:</td>
                <td className="border-b border-black p-1.5">
                  {data.estudiantes?.grado}
                </td>
              </tr>
              <tr>
                <td className="border-b border-r border-black p-1.5 font-bold bg-slate-50 w-1/4">Tipo de documento:</td>
                <td className="border-b border-r border-black p-1.5 w-1/4">
                  <input type="text" className="w-full bg-transparent outline-none" placeholder="T.I. / C.C." />
                </td>
                <td className="border-b border-r border-black p-1.5 font-bold bg-slate-50 w-1/6">Número doc:</td>
                <td className="border-b border-black p-1.5">
                  {data.estudiantes?.documento}
                </td>
              </tr>
              <tr>
                <td className="border-b border-r border-black p-1.5 font-bold bg-slate-50 w-1/4">Edad:</td>
                <td className="border-b border-r border-black p-1.5 w-1/4">
                  <input type="text" className="w-full bg-transparent outline-none" placeholder="Edad..." />
                </td>
                <td className="border-b border-r border-black p-1.5 font-bold bg-slate-50 w-1/6">Ciudad nac.:</td>
                <td className="border-b border-black p-1.5">
                  <input type="text" className="w-full bg-transparent outline-none" placeholder="Ciudad..." />
                </td>
              </tr>
              <tr>
                <td className="border-b border-r border-black p-1.5 font-bold bg-slate-50 w-1/4">Nombre del acudiente:</td>
                <td className="border-b border-r border-black p-1.5 w-1/4">
                  <input type="text" className="w-full bg-transparent outline-none" placeholder="Acudiente..." />
                </td>
                <td className="border-b border-r border-black p-1.5 font-bold bg-slate-50 w-1/6">Teléfono:</td>
                <td className="border-b border-black p-1.5">
                  <input type="text" className="w-full bg-transparent outline-none" placeholder="Teléfono..." />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Motivo de activación de ruta */}
        <div className="border border-black mt-4 break-inside-avoid">
          <div className="bg-slate-50 border-b border-black p-1.5">
            <h3 className="font-bold uppercase">MOTIVO DE ACTIVACIÓN DE RUTA</h3>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <label className="flex items-center gap-2"><input type="checkbox" /> Ideación suicida</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Intento de suicidio</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Autolesiones o comportamientos autodestructivos</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Alteraciones del comportamiento con sospecha de trastorno mental</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Episodios de ansiedad o crisis de pánico</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Conductas depresivas prolongadas</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Consumo de sustancias psicoactivas</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Situaciones de violencia intrafamiliar o abuso</label>
              <label className="flex items-center gap-2 col-span-1 md:col-span-2">
                <input type="checkbox" /> Otros: 
                <input type="text" className="flex-1 bg-transparent border-b border-black outline-none ml-2" defaultValue={data.motivos?.join(', ')} />
              </label>
            </div>
          </div>
        </div>

        {/* Descripción de la Situación */}
        <div className="border border-black mt-4 break-inside-avoid">
          <div className="bg-slate-50 border-b border-black p-1.5">
            <h3 className="font-bold uppercase">DESCRIPCIÓN DE LA SITUACIÓN</h3>
          </div>
          <div className="p-3">
            <textarea 
              className="w-full min-h-[80px] resize-none bg-transparent outline-none font-inherit text-inherit"
              defaultValue={data.descripcion}
            />
          </div>
        </div>

        {/* Acciones Realizadas */}
        <div className="border border-black mt-4 break-inside-avoid">
          <div className="bg-slate-50 border-b border-black p-1.5">
            <h3 className="font-bold uppercase">ACCIONES REALIZADAS POR LA INSTITUCIÓN EDUCATIVA</h3>
          </div>
          <div className="p-3">
            <div className="flex flex-col gap-2 mb-2">
              <label className="flex items-center gap-2"><input type="checkbox" /> Observación y seguimiento del estudiante en el contexto escolar.</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Entrevista individual con el estudiante.</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Comunicación con los padres o acudientes.</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Orientación sobre la situación y recomendación de atención médica.</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Registro del caso en el protocolo de protección escolar.</label>
            </div>
          </div>
        </div>

        {/* Observaciones Adicionales */}
        <div className="border border-black mt-4 break-inside-avoid">
          <div className="bg-slate-50 border-b border-black p-1.5">
            <h3 className="font-bold uppercase">OBSERVACIONES ADICIONALES</h3>
          </div>
          <div className="p-3">
            <textarea 
              className="w-full min-h-[60px] resize-none bg-transparent outline-none font-inherit text-inherit"
              defaultValue={data.orientaciones}
            />
          </div>
        </div>

        <div className="mt-4 text-[11px] text-justify">
          <p>Reiteramos nuestra disposición para brindar acompañamiento durante este proceso y agradecemos su colaboración para proteger la integridad y bienestar emocional de la menor.</p>
          <p className="mt-1">Quedamos atentos ante cualquier inquietud o situación adicional.</p>
          <p className="mt-4">Atentamente,</p>
        </div>

        {/* FIRMA AL FINAL */}
        <div className="mt-8 flex justify-start px-4 break-inside-avoid">
          <div className="text-left w-64 relative">
            <div className="h-16 mb-2 border-b border-black relative flex items-end justify-start">
              {data.firma_base64 && (
                <img 
                  src={data.firma_base64} 
                  alt="Firma" 
                  style={{ width: `${signatureSize}px`, position: 'absolute', bottom: '0' }}
                />
              )}
            </div>
            <input type="text" className="font-bold text-[11px] w-full text-left bg-transparent outline-none" defaultValue={data.nombre_remitente || 'Orientadora Escolar'} />
            <br/>
            <input type="text" className="text-[11px] w-full text-left bg-transparent outline-none" defaultValue="Orientación Escolar - Ins.Edu. Divino Niño" />
            <br/>
            <input type="text" className="text-[11px] w-full text-left bg-transparent outline-none" defaultValue="Tel: 3568690 | Correo: orientacion@divinonino.edu.co" />
          </div>
        </div>

      </div>
    </PrintLayout>
  );
}
