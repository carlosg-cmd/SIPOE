import React from 'react';
import PrintLayout from './PrintLayout';

export default function PrintSeguimientoTemplate({ data, onClose }) {
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


  const { estudiante, seguimientos } = data;
  
  // Rellenar hasta 4 encuentros para igualar el formato de Word
  const encuentros = [...(seguimientos || [])];
  while (encuentros.length < 4) {
    encuentros.push({
      fecha: '',
      estado: '',
      descripcion: '',
      compromisos: ''
    });
  }
  // Solo mostramos los primeros 4 para el formato oficial, o podemos mostrarlos todos
  const encuentrosFormato = encuentros.slice(0, 4);

  return (
    <PrintLayout 
      title="SEGUIMIENTO CONVIVENCIA ESCOLAR"
      onClose={onClose}
      data={{}} // No necesitamos controlador de firma aquí a menos que agreguemos firmas
    >
      <div className="space-y-4 text-[12px] pb-24">
        
        {/* Datos Básicos */}
        <div className="border border-black">
          <div className="bg-slate-50 border-b border-black p-1.5">
            <h3 className="font-bold uppercase">DATOS BÁSICOS</h3>
          </div>
          <table className="w-full border-collapse text-left">
            <tbody>
              <tr>
                <td className="border-b border-r border-black p-1.5 font-bold bg-slate-50 w-1/4">Estudiante:</td>
                <td colSpan="3" className="border-b border-black p-1.5 font-semibold">
                  {estudiante?.nombres} {estudiante?.apellidos}
                </td>
              </tr>
              <tr>
                <td className="border-b border-r border-black p-1.5 font-bold bg-slate-50 w-1/4">Grado:</td>
                <td className="border-b border-r border-black p-1.5 w-1/4">
                  {estudiante?.grado}
                </td>
                <td className="border-b border-r border-black p-1.5 font-bold bg-slate-50 w-1/4">Mes / Año:</td>
                <td className="border-b border-black p-1.5 w-1/4">
                  <input type="text" className="w-full bg-transparent outline-none" defaultValue={new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })} />
                </td>
              </tr>
              <tr>
                <td className="border-r border-black p-1.5 font-bold bg-slate-50 w-1/4">Responsable:</td>
                <td colSpan="3" className="border-black p-1.5">
                  <input type="text" className="w-full bg-transparent outline-none" defaultValue="Docente Orientadora" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="font-bold mt-4 mb-2 uppercase">COMPROMISOS A SEGUIR</p>
        <p className="mb-4"><strong>SEGUIMIENTO:</strong> Se realizan encuentros periódicos de manera quincenal (con posibles modificaciones según sea necesario)</p>

        {/* Encuentros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {encuentrosFormato.map((enc, index) => {
            const num = ['Primer', 'Segundo', 'Tercer', 'Cuarto'][index];
            return (
              <div key={index} className="border border-black">
                <div className="bg-slate-50 border-b border-black p-1.5 flex justify-between">
                  <h3 className="font-bold uppercase">{num} encuentro:</h3>
                  <input type="date" className="bg-transparent outline-none text-xs" defaultValue={enc.fecha} />
                </div>
                <div className="p-2 border-b border-black">
                  <p className="font-bold mb-1">Resultado:</p>
                  <div className="flex flex-col gap-1 text-[11px]">
                    <label className="flex items-center gap-1">
                      <input type="radio" name={`res_${index}`} defaultChecked={enc.estado === 'Resuelto'} /> Cumple
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="radio" name={`res_${index}`} defaultChecked={enc.estado === 'En proceso'} /> Cumple parcialmente
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="radio" name={`res_${index}`} defaultChecked={enc.estado === 'Pendiente'} /> No cumple
                    </label>
                  </div>
                </div>
                <div className="p-2">
                  <p className="font-bold mb-1">Observación breve:</p>
                  <textarea 
                    className="w-full min-h-[40px] resize-none bg-transparent outline-none font-inherit text-inherit text-[11px]"
                    defaultValue={enc.descripcion || enc.compromisos}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Valoración Final */}
        <div className="border border-black mt-4">
          <div className="bg-slate-50 border-b border-black p-1.5">
            <h3 className="font-bold uppercase">VALORACIÓN FINAL DEL PROCESO (DOS MESES)</h3>
          </div>
          <div className="p-3 flex gap-8">
            <div className="flex flex-col gap-2 w-1/3">
              <label className="flex items-center gap-2"><input type="radio" name="val_final" /> Avance positivo</label>
              <label className="flex items-center gap-2"><input type="radio" name="val_final" /> Avance parcial</label>
              <label className="flex items-center gap-2"><input type="radio" name="val_final" /> Sin avance</label>
            </div>
            <div className="w-2/3 border-l border-black pl-4">
              <p className="font-bold mb-1">Observación breve:</p>
              <textarea 
                className="w-full min-h-[50px] resize-none bg-transparent outline-none font-inherit text-inherit"
              />
            </div>
          </div>
        </div>

        {/* Decisión */}
        <div className="border border-black mt-4">
          <div className="bg-slate-50 border-b border-black p-1.5">
            <h3 className="font-bold uppercase">DECISIÓN</h3>
          </div>
          <div className="p-3">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <label className="flex items-center gap-2"><input type="checkbox" /> Continúa seguimiento pedagógico</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Ajuste de compromisos</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Remisión a Orientación / Coordinación</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Remisión a Comité Escolar de Convivencia</label>
            </div>
          </div>
        </div>

        {/* Firmas */}
        <div className="mt-12">
          <h3 className="font-bold uppercase mb-8">6. FIRMAS</h3>
          <div className="flex justify-around px-8">
            <div className="text-center w-64">
              <div className="h-12 mb-2 border-b border-black"></div>
              <input type="text" className="font-bold text-[11px] w-full text-center bg-transparent outline-none" defaultValue="Docente Orientador(a)" />
            </div>

            <div className="text-center w-64">
              <div className="h-12 mb-2 border-b border-black"></div>
              <input type="text" className="font-bold text-[11px] w-full text-center bg-transparent outline-none" defaultValue="Acudiente" />
            </div>
          </div>
        </div>

      </div>
    </PrintLayout>
  );
}
