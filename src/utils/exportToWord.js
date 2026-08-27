import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

export const exportConsentimientoToWord = async (atencionData) => {
  try {
    const est = atencionData.estudiantes || {};
    const acu = est.datos_acudiente || {};

    // Extraer Grado sin Jornada
    let gradoStr = est.grado || '';
    const match = gradoStr.match(/(.*?)-(MA[ÑN]ANA|TARDE|NOCHE|SABATINA|UNICA)$/i);
    if (match) gradoStr = match[1];

    // Detectar parentesco
    const parentescoStr = acu.parentesco?.toLowerCase() || '';
    const isPadre = parentescoStr === 'padre' ? 'X' : ' ';
    const isMadre = parentescoStr === 'madre' ? 'X' : ' ';
    const isAcudiente = (parentescoStr !== 'padre' && parentescoStr !== 'madre') ? 'X' : ' ';

    // Preparar el diccionario de variables a reemplazar
    const dataVars = {
      nombre_acudiente: `${acu.nombres || ''} ${acu.apellidos || ''}`.trim() || '__________________________________',
      documento_acudiente: acu.documento || '__________________',
      padre: isPadre,
      madre: isMadre,
      acudiente: isAcudiente,
      nombre_estudiante: `${est.nombres || ''} ${est.apellidos || ''}`.trim() || '__________________________________',
      documento_estudiante: est.documento || '__________________',
      grado: gradoStr || '______',
      fecha_actual: atencionData.fecha || new Date().toLocaleDateString('es-CO')
    };

    // 1. Cargar el archivo de plantilla desde public/formatos/
    const response = await fetch('/formatos/consentimiento.docx');
    if (!response.ok) {
        throw new Error('No se encontró el archivo de plantilla "consentimiento.docx" en la carpeta public/formatos/');
    }
    
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    // 2. Descomprimir e inicializar docxtemplater
    const zip = new PizZip(arrayBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // 3. Reemplazar variables
    doc.render(dataVars);

    // 4. Generar el nuevo archivo
    const out = doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    // 5. Descargar automáticamente
    saveAs(out, `Consentimiento_${est.nombres || 'Estudiante'}.docx`);

    return { success: true };
  } catch (error) {
    console.error('Error exportando a Word:', error);
    return { success: false, error: error.message };
  }
};
