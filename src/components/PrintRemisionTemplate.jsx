import React, { useState } from 'react';
import PrintLayout from './PrintLayout';

export default function PrintRemisionTemplate({ data, onClose }) {
  const [signatureSize, setSignatureSize] = useState(150);

  if (!data) return null;

  return (
    <PrintLayout 
      title="ACOMPAÑAMIENTO SEGUIMIENTO DE COMPROMISOS / REMISIÓN A COORDINACIÓN"
      onClose={onClose}
      data={data}
      signatureSize={{ value: signatureSize, onChange: setSignatureSize }}
    >
      <div className="space-y-4 text-[12px] pb-24">
        
        {/* Sección 1: Datos */}
        <div className="border border-black">
          <div className="bg-slate-50 border-b border-black p-1.5">
            <h3 className="font-bold uppercase">1. DATOS DEL ESTUDIANTE</h3>
          </div>
          <table className="w-full border-collapse text-left">
            <tbody>
              <tr>
                <td className="border-b border-r border-black p-1.5 font-bold bg-slate-50 w-1/4">Nombre del estudiante:</td>
                <td className="border-b border-r border-black p-1.5 font-semibold">
                  {data.estudiantes?.nombres} {data.estudiantes?.apellidos}
                </td>
                <td className="border-b border-r border-black p-1.5 font-bold bg-slate-50 w-1/6">Grado/Grupo:</td>
                <td className="border-b border-black p-1.5">
                  {data.estudiantes?.grado}
                </td>
              </tr>
              <tr>
                <td className="border-b border-r border-black p-1.5 font-bold bg-slate-50">Acudiente:</td>
                <td className="border-b border-r border-black p-1.5">
                  <input type="text" className="w-full bg-transparent outline-none" placeholder="Nombre acudiente..." />
                </td>
                <td className="border-b border-r border-black p-1.5 font-bold bg-slate-50">Teléfono:</td>
                <td className="border-b border-black p-1.5">
                  <input type="text" className="w-full bg-transparent outline-none" placeholder="Teléfono..." />
                </td>
              </tr>
              <tr>
                <td className="border-r border-black p-1.5 font-bold bg-slate-50">Fecha de remisión:</td>
                <td className="border-r border-black p-1.5">
                  <input type="text" className="w-full bg-transparent outline-none" defaultValue={data.fecha} />
                </td>
                <td className="border-r border-black p-1.5 font-bold bg-slate-50">Remite:</td>
                <td className="border-black p-1.5">
                  <input type="text" className="w-full bg-transparent outline-none" defaultValue={data.nombre_remitente || 'Orientación Escolar'} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2: Motivo */}
        <div className="border border-black mt-4">
          <div className="bg-slate-50 border-b border-black p-1.5">
            <h3 className="font-bold uppercase">2. MOTIVO DE REMISIÓN A COORDINACIÓN</h3>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <label className="flex items-center gap-2"><input type="checkbox" /> Incumplimiento de compromisos</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Inasistencia a seguimientos quincenales</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Reincidencia en la conducta</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Falta Tipo II / Tipo III</label>
              <label className="flex items-center gap-2 col-span-2">
                <input type="checkbox" /> Otro: 
                <input type="text" className="flex-1 bg-transparent border-b border-black outline-none ml-2" defaultValue={data.motivos?.join(', ')} />
              </label>
            </div>
            <p className="font-bold mt-2">Descripción breve:</p>
            <textarea 
              className="w-full min-h-[60px] resize-none bg-transparent outline-none font-inherit text-inherit"
              defaultValue={data.descripcion}
            />
          </div>
        </div>

        {/* Sección 3: Compromisos */}
        <div className="border border-black mt-4">
          <div className="bg-slate-50 border-b border-black p-1.5">
            <h3 className="font-bold uppercase">3. COMPROMISOS PREVIOS ESTABLECIDOS:</h3>
          </div>
          <div className="p-3">
            <textarea 
              className="w-full min-h-[60px] resize-none bg-transparent outline-none font-inherit text-inherit"
              defaultValue={data.orientaciones}
            />
          </div>
        </div>

        {/* Sección 4: Seguimiento */}
        <div className="border border-black mt-4">
          <div className="bg-slate-50 border-b border-black p-1.5">
            <h3 className="font-bold uppercase">4. SEGUIMIENTO REALIZADO (RESUMEN)</h3>
          </div>
          <div className="p-3">
            <div className="flex flex-col gap-2 mb-2">
              <label className="flex items-center gap-2"><input type="checkbox" /> Se realizó seguimiento completo (4 encuentros quincenales)</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Seguimiento parcial.</label>
            </div>
            <p className="font-bold mt-2">Observaciones relevantes:</p>
            <textarea 
              className="w-full min-h-[60px] resize-none bg-transparent outline-none font-inherit text-inherit"
              defaultValue=""
            />
          </div>
        </div>

        {/* FIRMAS AL FINAL */}
        <div className="mt-12">
          <h3 className="font-bold uppercase mb-8">5. FIRMAS</h3>
          <div className="flex justify-between gap-4 px-4">
            <div className="text-center flex-1">
              <div className="h-16 mb-2 border-b border-black mx-2"></div>
              <input type="text" className="font-bold text-[11px] w-full text-center bg-transparent outline-none" defaultValue="Coordinación de Convivencia" />
            </div>

            <div className="text-center flex-1">
              <div className="h-16 mb-2 border-b border-black mx-2"></div>
              <input type="text" className="font-bold text-[11px] w-full text-center bg-transparent outline-none" defaultValue="Orientador Escolar" />
            </div>

            <div className="text-center flex-1 relative">
              <div className="h-16 mb-2 border-b border-black mx-2 relative flex items-end justify-center">
                {data.firma_base64 && (
                  <img 
                    src={data.firma_base64} 
                    alt="Firma" 
                    style={{ width: `${signatureSize}px`, position: 'absolute', bottom: '0' }}
                  />
                )}
              </div>
              <input type="text" className="font-bold text-[11px] w-full text-center bg-transparent outline-none" defaultValue="Acudiente" />
            </div>
          </div>
        </div>

      </div>
    </PrintLayout>
  );
}
