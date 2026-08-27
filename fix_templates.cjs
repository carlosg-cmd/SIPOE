const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/CARLOS/Music/proyecto melissa/pf/src/components';
const files = fs.readdirSync(dir).filter(f => f.startsWith('Print') && f.endsWith('Template.jsx'));

const extractionCode = `
  const est = data.estudiantes || data.estudiante || data || {};
  
  const acudienteData = typeof est.datos_acudiente === 'string' 
    ? JSON.parse(est.datos_acudiente) 
    : (est.datos_acudiente || {});
  
  const acudienteNombre = \`\${acudienteData.nombres || ''} \${acudienteData.apellidos || ''}\`.trim();
  const acudienteTelefono = acudienteData.telefono || '';
  const acudienteParentesco = acudienteData.parentesco || '';
  const acudienteDoc = acudienteData.documento || '';

  const nombresArr = (est.nombres || '').split(' ');
  const apellidosArr = (est.apellidos || '').split(' ');
  const apellido1 = apellidosArr[0] || '';
  const apellido2 = apellidosArr.slice(1).join(' ') || '';
`;

for (let file of files) {
  let filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf-8');
  
  if (!content.includes('acudienteNombre =')) {
    let match = content.match(/if\s*\(!data\)\s*return\s*null;/);
    if (match) {
      content = content.replace(match[0], match[0] + '\n' + extractionCode);
    }
  }

  content = content.replace(/acudiente_nombre:\s*est\.nombre_acudiente\s*\|\|\s*''/g, "acudiente_nombre: acudienteNombre || ''");
  content = content.replace(/acudiente_telefono:\s*est\.telefono_acudiente\s*\|\|\s*''/g, "acudiente_telefono: acudienteTelefono || ''");
  
  // Reemplazar campos vacios si existen
  content = content.replace(/acudiente_nombre:\s*''/g, "acudiente_nombre: acudienteNombre || ''");
  content = content.replace(/acudiente_telefono:\s*''/g, "acudiente_telefono: acudienteTelefono || ''");
  content = content.replace(/acudiente_parentesco:\s*''/g, "acudiente_parentesco: acudienteParentesco || ''");
  content = content.replace(/acudiente_documento:\s*''/g, "acudiente_documento: acudienteDoc || ''");
  content = content.replace(/apellido1:\s*''/g, "apellido1: apellido1 || ''");
  content = content.replace(/apellido2:\s*''/g, "apellido2: apellido2 || ''");

  fs.writeFileSync(filepath, content);
  console.log('Updated', file);
}
