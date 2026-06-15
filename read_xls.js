import * as XLSX from 'xlsx';
import * as fs from 'fs';

const filePath = 'C:\\Users\\ELIAS ROJAS\\Downloads\\informe-pacsis (4).xls';

try {
  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Read just the first few rows to see the structure
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log("=== SHEET NAMES ===");
  console.log(workbook.SheetNames);
  
  console.log("\n=== FIRST 15 ROWS ===");
  for (let i = 0; i < Math.min(15, data.length); i++) {
    console.log(`Row ${i}:`, data[i]);
  }
} catch (e) {
  console.error("Error reading file:", e.message);
}
