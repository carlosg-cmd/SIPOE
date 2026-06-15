import XLSX from 'xlsx';

const filePath = 'C:\\Users\\CARLOS\\Music\\formatos\\RELACIÓN ESTUDIANTES ATENDIDOS ORIENTACIÓN ESCOLAR.xlsx';
try {
  const workbook = XLSX.readFile(filePath);
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log(`\nContenido de la primera hoja (${firstSheetName}):`);
  json.forEach((row, rowIndex) => {
    const rowData = row.map((cell, colIndex) => {
      if (cell !== undefined && cell !== null && cell !== '') {
        return `[Col ${colIndex}]: ${cell}`;
      }
      return null;
    }).filter(c => c !== null);
    
    if (rowData.length > 0) {
      console.log(`Fila ${rowIndex + 1}: ${rowData.join(' | ')}`);
    }
  });
} catch (e) {
  console.error("Error leyendo archivo:", e.message);
}
