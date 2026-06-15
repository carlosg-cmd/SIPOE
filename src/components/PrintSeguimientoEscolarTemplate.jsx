import React, { useState } from 'react';
import PrintLayout from './PrintLayout';

export default function PrintSeguimientoEscolarTemplate({ data, onClose }) {
  const [signatureSize, setSignatureSize] = useState(150);

  if (!data) return null;

  const EncuentroRow = ({ numero, label }) => (
    <tr className="break-inside-avoid">
      <td>
        <div className="border border-black mb-3">
          <div className="bg-slate-50 border-b border-black p-1.5 flex items-center gap-4">
            <h4 className="font-bold text-[11px]">{label}:</h4>
            <input type="text" className="border-b border-black bg-transparent outline-none w-32 text-[11px]" placeholder="_____ / ____________" />
          </div>
          <div className="p-2 border-b border-black">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-bold text-[11px]">Resultado:</span>
              <label className="flex items-center gap-1 text-[11px]"><input type="checkbox" /> Cumple</label>
              <label className="flex items-center gap-1 text-[11px]"><input type="checkbox" /> Cumple parcialmente</label>
              <label className="flex items-center gap-1 text-[11px]"><input type="checkbox" /> No cumple</label>
            </div>
          </div>
          <div className="p-2">
            <p className="font-bold text-[11px] mb-1">Observación breve:</p>
            <textarea className="w-full min-h-[30px] resize-none bg-transparent outline-none text-[11px]"></textarea>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <PrintLayout 
      title="SEGUIMIENTO CONVIVENCIA ESCOLAR"
      onClose={onClose}
      data={data}
      signatureSize={{ value: signatureSize, onChange: setSignatureSize }}
    >
      <table className="w-full text-[11px] pb-24 border-separate" style={{ borderSpacing: '0 0.5rem' }}>
        <tbody>

          {/* DATOS BÁSICOS */}
          <tr className="break-inside-avoid">
            <td>
              <div className="border border-black">
                <div className="bg-slate-50 border-b border-black p-1.5">
                  <h3 className="font-bold uppercase text-center text-[12px]">DATOS BÁSICOS</h3>
                </div>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="border-r border-b border-black p-2 font-bold bg-slate-50 w-1/6">Estudiante:</td>
                      <td className="border-r border-b border-black p-2 w-2/6">
                        <input type="text" className="w-full bg-transparent outline-none font-bold" defaultValue={`${data.estudiantes?.nombres || ''} ${data.estudiantes?.apellidos || ''}`.trim()} />
                      </td>
                      <td className="border-r border-b border-black p-2 font-bold bg-slate-50 w-1/6">Grado:</td>
                      <td className="border-b border-black p-2 w-1/6">
                        <input type="text" className="w-full bg-transparent outline-none font-bold text-center" defaultValue={data.estudiantes?.grado} />
                      </td>
                    </tr>
                    <tr>
                      <td className="border-r border-black p-2 font-bold bg-slate-50">Mes / Año:</td>
                      <td className="border-r border-black p-2">
                        <input type="text" className="w-full bg-transparent outline-none" />
                      </td>
                      <td className="border-r border-black p-2 font-bold bg-slate-50">Responsable:</td>
                      <td className="border-black p-2">
                        <input type="text" className="w-full bg-transparent outline-none" defaultValue={data.nombre_remitente || ''} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>

          {/* COMPROMISOS A SEGUIR */}
          <tr className="break-inside-avoid">
            <td>
              <div className="border border-black">
                <div className="bg-slate-50 border-b border-black p-1.5">
                  <h3 className="font-bold uppercase text-center text-[12px]">COMPROMISOS A SEGUIR</h3>
                </div>
                <div className="p-2">
                  <textarea className="w-full min-h-[60px] resize-none bg-transparent outline-none" defaultValue={data.orientaciones}></textarea>
                </div>
              </div>
            </td>
          </tr>

          {/* SEGUIMIENTO */}
          <tr className="break-inside-avoid">
            <td>
              <div className="bg-slate-50 border border-black p-1.5 mb-1">
                <h3 className="font-bold uppercase text-center text-[12px]">SEGUIMIENTO</h3>
                <p className="text-center text-[10px] text-slate-600 mt-1">Se realizan encuentros periódicos de manera quincenal (con posibles modificaciones según sea necesario)</p>
              </div>
            </td>
          </tr>

          <EncuentroRow numero={1} label="Primer encuentro" />
          <EncuentroRow numero={2} label="Segundo encuentro" />
          <EncuentroRow numero={3} label="Tercer encuentro" />
          <EncuentroRow numero={4} label="Cuarto encuentro" />

          {/* VALORACIÓN FINAL */}
          <tr className="break-inside-avoid">
            <td>
              <div className="border border-black">
                <div className="bg-slate-50 border-b border-black p-1.5">
                  <h3 className="font-bold uppercase text-center text-[12px]">VALORACIÓN FINAL DEL PROCESO (DOS MESES)</h3>
                </div>
                <div className="p-2 border-b border-black">
                  <div className="flex items-center gap-6 flex-wrap">
                    <label className="flex items-center gap-1"><input type="checkbox" /> Avance positivo</label>
                    <label className="flex items-center gap-1"><input type="checkbox" /> Avance parcial</label>
                    <label className="flex items-center gap-1"><input type="checkbox" /> Sin avance</label>
                  </div>
                </div>
                <div className="p-2">
                  <p className="font-bold mb-1">Observación breve:</p>
                  <textarea className="w-full min-h-[40px] resize-none bg-transparent outline-none"></textarea>
                </div>
              </div>
            </td>
          </tr>

          {/* DECISIÓN */}
          <tr className="break-inside-avoid">
            <td>
              <div className="border border-black">
                <div className="bg-slate-50 border-b border-black p-1.5">
                  <h3 className="font-bold uppercase text-center text-[12px]">DECISIÓN</h3>
                </div>
                <div className="p-2">
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2"><input type="checkbox" /> Continúa seguimiento pedagógico</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Ajuste de compromisos</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Remisión a Orientación / Coordinación</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Remisión a Comité Escolar de Convivencia</label>
                  </div>
                </div>
              </div>
            </td>
          </tr>

          {/* FIRMAS */}
          <tr className="break-inside-avoid">
            <td>
              <div className="flex justify-between items-end mt-10 mb-8 px-4 gap-8">
                {/* DOCENTE ORIENTADOR */}
                <div className="flex flex-col relative w-1/2">
                  <div className="h-14 border-b border-black w-full flex items-end relative">
                    {data.firma_base64 && (
                      <img 
                        src={data.firma_base64} 
                        alt="Firma Docente" 
                        style={{ width: `${signatureSize}px`, position: 'absolute', bottom: '0', left: '0' }}
                      />
                    )}
                  </div>
                  <span className="font-bold mt-1 text-[11px] text-center">Docente orientador</span>
                </div>

                {/* ACUDIENTE */}
                <div className="flex flex-col relative w-1/2">
                  <div className="h-14 border-b border-black w-full flex items-end"></div>
                  <span className="font-bold mt-1 text-[11px] text-center">Acudiente</span>
                </div>
              </div>
            </td>
          </tr>

        </tbody>
      </table>
    </PrintLayout>
  );
}
