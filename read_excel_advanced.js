import XLSX from 'xlsx';

const filePath = 'C:\\Users\\CARLOS\\Music\\formatos\\RELACIÓN ESTUDIANTES ATENDIDOS ORIENTACIÓN ESCOLAR.xlsx';
try {
  const workbook = XLSX.readFile(filePath);
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  console.log(`\n--- RANGO DE LA HOJA ---`);
  console.log(worksheet['!ref']);
  
  console.log(`\n--- CELDAS COMBINADAS (MERGED CELLS) ---`);
  if (worksheet['!merges']) {
    worksheet['!merges'].forEach(m => {
      console.log(`Rango combinado: Fila ${m.s.r + 1}, Col ${m.s.c} hasta Fila ${m.e.r + 1}, Col ${m.e.c}`);
    });
  }

  console.log(`\n--- CONTENIDO DETALLADO DE LAS FILAS 1 A 10 ---`);
  for (let r = 0; r < 10; r++) {
    let rowStr = `Fila ${r + 1}: `;
    for (let c = 0; c < 25; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r: r, c: c });
      const cell = worksheet[cellAddress];
      if (cell && cell.v !== undefined) {
        rowStr += `[Col ${c}]: "${cell.v}" | `;
      }
    }
    console.log(rowStr);
  }

} catch (e) {
  console.error("Error:", e.message);
}
