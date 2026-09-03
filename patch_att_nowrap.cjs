const fs = require('fs');
let code = fs.readFileSync('src/components/AttendancePrintTemplate.tsx', 'utf-8');

code = code.replace(/<th className="border border-slate-900 px-4 py-2 text-left">ชื่อ - นามสกุล<\/th>/g, 
  '<th className="border border-slate-900 px-4 py-2 text-left whitespace-nowrap">ชื่อ - นามสกุล</th>');

code = code.replace(/<td className="border border-slate-900 px-4 py-1 text-left">/g, 
  '<td className="border border-slate-900 px-4 py-1 text-left whitespace-nowrap">');

fs.writeFileSync('src/components/AttendancePrintTemplate.tsx', code, 'utf-8');
console.log("Patched AttendancePrintTemplate");
