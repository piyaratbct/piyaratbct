const fs = require('fs');
let code = fs.readFileSync('src/components/MilkReportPrintTemplate.tsx', 'utf-8');

code = code.replace(/w-\[140px\] text-center font-normal">ชื่อ - สกุล<\/th>/g, 
  'whitespace-nowrap text-center font-normal">ชื่อ - สกุล</th>');

code = code.replace(/<td className="border border-slate-400 px-2 py-1 max-w-\[140px\] text-\[11px\] leading-tight break-words">/g, 
  '<td className="border border-slate-400 px-2 py-1 whitespace-nowrap text-[11px]">');

fs.writeFileSync('src/components/MilkReportPrintTemplate.tsx', code, 'utf-8');
console.log("Patched MilkReportPrintTemplate");
