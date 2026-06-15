import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function PrintLayout({ children, title, signatureSize, onClose, data }) {
  const [footerText, setFooterText] = useState('Al firmar este documento acepta el uso y tratamiento de datos personales de acuerdo a la Ley 1581 del 2012, dicha información será resguardada durante el tiempo que establece la ley.');
  
  // Prevenir scroll en el fondo cuando se abre el modal (eliminado porque cortaba la impresión)
  useEffect(() => {
    // Ya no se usa
  }, []);

  const content = (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] overflow-y-auto print:contents">
      <div className="min-h-screen py-8 px-4 flex justify-center items-start print:contents">
        <div className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col relative print:contents">
          
          {/* Barra de herramientas superior */}
          <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm print:hidden">
            <div className="flex items-center gap-6">
              <h3 className="font-bold text-slate-800">Vista Previa: {title}</h3>
              {data?.firma_base64 && signatureSize && (
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                  <label className="text-sm font-semibold text-slate-700">Tamaño de firma:</label>
                  <input 
                    type="range" 
                    min="50" max="300" 
                    value={signatureSize.value} 
                    onChange={(e) => signatureSize.onChange(Number(e.target.value))}
                    className="w-32 accent-indigo-600"
                  />
                  <span className="text-xs font-bold text-slate-500 w-8">{signatureSize.value}px</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => window.print()}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
              >
                Imprimir / Guardar PDF
              </button>
            </div>
          </div>

          {/* CONTENEDOR DE IMPRESIÓN (La Hoja) */}
          <div className="p-8 flex justify-center bg-slate-200 overflow-x-auto print:contents">
            <div id="print-root" className="bg-white shadow-lg w-[21.5cm] min-h-[27.9cm] mx-auto text-black print:w-full print:max-w-full print:m-0 print:shadow-none print:min-h-0 print:block">
              
              {/* CONTENEDOR SIN MÁRGENES MANUALES (Los márgenes los da el thead/tfoot) */}
              <div className="print:p-0 px-[1.5cm]">
                <table className="w-full">
                  {/* ENCABEZADO REPETITIVO EN CADA HOJA */}
                  <thead className="w-full">
                    <tr>
                      <td className="pb-6 print:pt-[1.5cm] pt-[1.5cm]">
                        {/* MEMBRETE UNIFICADO */}
                        <table className="w-full border-collapse border border-black table-fixed">
                          <tbody>
                            <tr>
                              <td className="border border-black w-[20%] p-2 text-center align-middle">
                                <img src="/logo.jpg" alt="Logo Institución" className="h-[75px] mx-auto object-contain" />
                              </td>
                              <td className="border border-black w-[60%] p-2 text-center align-middle">
                                <h1 className="font-bold text-[14px] leading-tight mb-1 font-arial text-black">INSTITUCION EDUCATIVA DIVINO NIÑO</h1>
                                <p className="text-[11px] italic leading-tight mb-1 font-semibold text-black">Resolución de Aprobación 9430 DEL 23/Noviembre/2004</p>
                                <p className="text-[11px] font-bold text-black">"FE, ESPERANZA Y AMOR"</p>
                              </td>
                              <td className="border border-black w-[20%] p-2 text-center align-middle">
                                <p className="text-[11px] font-medium text-black">AD – 01 Versión 01</p>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="3" className="border border-black bg-blue-50/50 print:bg-[#e6f0fa] print:!bg-[#e6f0fa] p-1.5 text-center" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                <h2 className="font-bold text-[12px] uppercase text-black">{title}</h2>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </thead>

                  {/* CONTENIDO DEL DOCUMENTO */}
                  <tbody>
                    <tr>
                      <td className="align-top pb-4">
                        {children}
                      </td>
                    </tr>
                  </tbody>

                  {/* ESPACIADOR DEL PIE DE PÁGINA (Reserva el espacio en cada hoja) */}
                  <tfoot className="w-full hidden print:table-footer-group">
                    <tr>
                      <td style={{ height: '1.5cm' }}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* PIE DE PÁGINA VISUAL (PANTALLA) Y EDITABLE */}
              <div className="print:hidden px-[1.5cm] pb-[1.5cm]">
                <div className="border-t border-black pt-2">
                  <textarea 
                    className="w-full text-center text-[10px] font-semibold text-slate-800 bg-blue-50/30 outline-none resize-none overflow-hidden hover:bg-blue-50 focus:bg-white transition-colors p-1"
                    rows="2"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="Escriba aquí el pie de página..."
                  />
                </div>
              </div>

              {/* PIE DE PÁGINA IMPRESO (FIJO AL FONDO DE CADA HOJA) */}
              <div className="hidden print:flex print:items-end print:justify-center" style={{ position: 'fixed', bottom: '0', left: '0', right: '0', height: '1.5cm', zIndex: 50, backgroundColor: 'white' }}>
                <div className="w-full border-t border-black pt-1">
                  <p className="text-center text-[10px] font-semibold text-black whitespace-pre-wrap">{footerText}</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
