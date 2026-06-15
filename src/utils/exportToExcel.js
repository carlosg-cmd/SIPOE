import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { supabase } from '../supabase';

export const exportAtencionesToExcel = async () => {
  try {
    const { data: atenciones, error } = await supabase
      .from('atenciones')
      .select(`
        *,
        estudiantes (
          nombres, apellidos, grado, jornada, director_grupo, telefono, datos_acudiente, sede_id
        ),
        activacion_ruta (
          entidad_destino
        )
      `)
      .order('fecha', { ascending: false });

    if (error) throw error;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relacion Estudiantes');

    // CONFIGURACIÓN DE COLUMNAS (Total 21 columnas)
    // A: #, B: Nombre, C: Acudiente, D: Tel, E: Sede, F: Docente, G: Acudiente, H: Autónomo
    // I: Motivo, J: Fecha, K: Dir Grupo, L: Jornada, M: Grado
    // N: Individual, O: C. Acudientes, P: Salud, Q: ICBF, R: Comisaria, S: Policia
    // T: Formato, U: Observaciones
    worksheet.columns = [
      { width: 5 },  // A
      { width: 30 }, // B
      { width: 30 }, // C
      { width: 15 }, // D
      { width: 12 }, // E
      { width: 10 }, { width: 10 }, { width: 10 }, // F, G, H
      { width: 25 }, // I
      { width: 15 }, // J
      { width: 15 }, // K
      { width: 12 }, // L
      { width: 10 }, // M
      { width: 12 }, { width: 15 }, // N, O
      { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, // P, Q, R, S
      { width: 15 }, // T
      { width: 40 }, // U
    ];

    // ESTILO COMÚN PARA BORDES
    const borderAll = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    // 1. MEMBRETE (Fila 2)
    const titleText = "INSTITUCION EDUCATIVA DIVINO NIÑO\nResolución de Aprobación 9430 DEL 23/Noviembre/2004\n“FE, ESPERANZA Y AMOR”";
    worksheet.mergeCells('A2:H2');
    worksheet.getCell('A2').value = titleText;
    worksheet.getCell('A2').alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' };
    worksheet.getCell('A2').font = { bold: true };
    
    worksheet.mergeCells('I2:U2');
    worksheet.getCell('I2').value = "AD – 01\nVersión 01\nFecha: 23/01/2025";
    worksheet.getCell('I2').alignment = { wrapText: true, horizontal: 'right', vertical: 'middle' };

    worksheet.getRow(2).height = 45;

    // 2. TÍTULO PRINCIPAL (Fila 3)
    worksheet.mergeCells('A3:U3');
    worksheet.getCell('A3').value = "RELACIÓN ESTUDIANTES ATENDIDOS ORIENTACIÓN ESCOLAR";
    worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell('A3').font = { bold: true, size: 12 };
    worksheet.getRow(3).height = 25;

    // 3. ENCABEZADOS DE TABLA (Filas 4 y 5)
    // Combinaciones verticales para campos simples
    ['A','B','C','D','E','I','J','K','L','M','T','U'].forEach(col => {
      worksheet.mergeCells(`${col}4:${col}5`);
      const cell = worksheet.getCell(`${col}4`);
      cell.alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' };
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    });

    // Títulos de celdas simples
    worksheet.getCell('A4').value = "#";
    worksheet.getCell('B4').value = "NOMBRE Y APELLIDO DEL ESTUDIANTE";
    worksheet.getCell('C4').value = "NOMBRE Y APELLIDO DEL ACUDIENTE";
    worksheet.getCell('D4').value = "TELEFONO";
    worksheet.getCell('E4').value = "SEDE";
    worksheet.getCell('I4').value = "MOTIVO";
    worksheet.getCell('J4').value = "FECHA ATENCIÓN";
    worksheet.getCell('K4').value = "DIRECCIÓN DE GRUPO";
    worksheet.getCell('L4').value = "JORNADA";
    worksheet.getCell('M4').value = "GRADO";
    worksheet.getCell('T4').value = "FORMATO DE ATENCION";
    worksheet.getCell('U4').value = "OBSERVACIONES FINALES";

    // Combinaciones horizontales para grupos
    // REMISIÓN
    worksheet.mergeCells('F4:H4');
    worksheet.getCell('F4').value = "REMISIÓN";
    worksheet.getCell('F5').value = "DOCENTE";
    worksheet.getCell('G5').value = "ACUDIENTE";
    worksheet.getCell('H5').value = "AUTÓNOMO";

    // ACOMPAÑAMIENTO
    worksheet.mergeCells('N4:O4');
    worksheet.getCell('N4').value = "ACOMPAÑAMIENTO";
    worksheet.getCell('N5').value = "INDIVIDUAL";
    worksheet.getCell('O5').value = "C. ACUDIENTES";

    // RUTAS
    worksheet.mergeCells('P4:S4');
    worksheet.getCell('P4').value = "ACTIVACIÓN DE RUTA";
    worksheet.getCell('P5').value = "SALUD";
    worksheet.getCell('Q5').value = "ICBF";
    worksheet.getCell('R5').value = "COMISARÍA";
    worksheet.getCell('S5').value = "POLICÍA";

    // Estilizar todos los encabezados
    for (let r = 4; r <= 5; r++) {
      for (let c = 1; c <= 21; c++) {
        const cell = worksheet.getCell(r, c);
        cell.font = { bold: true, size: 9 };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = borderAll;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      }
    }
    worksheet.getRow(4).height = 20;
    worksheet.getRow(5).height = 30;

    // 4. DATOS DE FILAS
    let currentRow = 6;
    atenciones.forEach((a, index) => {
      const est = a.estudiantes || {};
      const acu = est.datos_acudiente || {};
      
      const sedesDisponibles = ['Divino Niño', 'San José', 'Caracolí'];
      const sede = sedesDisponibles.find(s => s.toLowerCase().includes((est.sede_id || '').toLowerCase())) || est.sede_id || 'Divino Niño';
      
      const remDocente = a.cargo_remitente === 'Docente' ? a.nombre_remitente || 'X' : '';
      const remAcudiente = a.cargo_remitente === 'Acudiente' ? 'X' : '';
      const remAutonomo = a.cargo_remitente === 'Autónomo' || a.cargo_remitente === 'Autnomo' ? 'X' : '';
      
      // Extraer datos ocultos en observaciones (Acompañamiento y Formato)
      let rawObs = a.observaciones || '';
      const acompMatch = rawObs.match(/Acompa[ñn]amiento:\s*([^.]+)/);
      const acompanamiento = acompMatch ? acompMatch[1].trim() : '';
      const acompInd = acompanamiento === 'Individual' ? 'X' : '';
      const acompAcu = acompanamiento === 'C. Acudientes' || acompanamiento === 'Con Acudientes' ? 'X' : '';
      
      const rutas = Array.isArray(a.activacion_ruta) ? a.activacion_ruta.map(r => r.entidad_destino) : [];
      const rSalud = rutas.some(r => r.includes('Salud')) ? 'X' : '';
      const rIcbf = rutas.some(r => r.includes('ICBF')) ? 'X' : '';
      const rComisaria = rutas.some(r => r.includes('Comisaria')) ? 'X' : '';
      const rPolicia = rutas.some(r => r.includes('Policia')) ? 'X' : '';

      // Limpiar observaciones de basura auto-generada
      rawObs = rawObs.replace(/Sede:\s*[^.]+\.\s*Fecha Remisi[oó]n:\s*[^.]+\.\s*Acompa[ñn]amiento:\s*[^.]+\.\s*Formato f[ií]sico:\s*[^.]+\.\s*/gi, '');
      rawObs = rawObs.replace(/\[Firma Digital Adjunta en Sistema\]/gi, '');

      let exportObs = '';
      const obsFinMatchExport = rawObs.match(/\[Observaciones Finales\]([\s\S]*)$/);
      if (obsFinMatchExport) {
        exportObs = obsFinMatchExport[1].replace(/\[Firma Digital Adjunta en Sistema\]/gi, '').trim();
      }

      let gradoStr = est.grado || '';
      let jornadaStr = est.jornada || '';

      // Si el grado viene concatenado con la jornada (ej. "07-B-MAÑANA")
      const jornadaMatch = gradoStr.match(/(.*?)-(MA[ÑN]ANA|TARDE|NOCHE|SABATINA|UNICA)$/i);
      if (jornadaMatch) {
        gradoStr = jornadaMatch[1];
        if (!jornadaStr) {
          jornadaStr = jornadaMatch[2].toUpperCase();
        }
      }

      const rowData = [
        index + 1,
        `${est.nombres || ''} ${est.apellidos || ''}`.trim(),
        `${acu.nombres || ''} ${acu.apellidos || ''}`.trim(),
        acu.telefono || est.telefono || '',
        sede,
        remDocente, remAcudiente, remAutonomo,
        (a.motivos || []).join(', '),
        a.fecha || '',
        est.director_grupo || '',
        jornadaStr,
        gradoStr,
        acompInd, acompAcu,
        rSalud, rIcbf, rComisaria, rPolicia,
        a.formato_atencion || '',
        exportObs
      ];

      const row = worksheet.addRow(rowData);
      
      // Aplicar bordes a todas las celdas de datos
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = borderAll;
        cell.alignment = { vertical: 'middle', wrapText: true };
      });
      // Centrar campos que son de "X" o códigos
      [1, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].forEach(colIndex => {
        row.getCell(colIndex).alignment = { horizontal: 'center', vertical: 'middle' };
      });
    });

    // 5. GENERAR Y DESCARGAR ARCHIVO
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, "Relacion_Estudiantes_Atendidos.xlsx");

    return true;
  } catch (err) {
    console.error("Error exportando a Excel:", err);
    throw err;
  }
};
