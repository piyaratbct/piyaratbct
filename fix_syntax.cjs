const fs = require('fs');
let code = fs.readFileSync('src/components/AttendancePrintTemplate.tsx', 'utf-8');

code = code.replace("{\\`รายงานเวลาเรียน_\\${subject}_\\${gradeLevel}\\`}", "{\`รายงานเวลาเรียน_\${subject}_\${gradeLevel}\`}");

code = code.replace("className={\\`border border-slate-900 px-2 py-1 text-center font-bold \\${isAtRisk ? 'text-rose-600' : ''}\\`}", "className={\`border border-slate-900 px-2 py-1 text-center font-bold \${isAtRisk ? 'text-rose-600' : ''}\`}");

code = code.replace("className={\\`border border-slate-900 px-2 py-1 text-center font-bold \\${isAtRisk ? 'text-rose-600' : ''}\\`}", "className={\`border border-slate-900 px-2 py-1 text-center font-bold \${isAtRisk ? 'text-rose-600' : ''}\`}");

fs.writeFileSync('src/components/AttendancePrintTemplate.tsx', code, 'utf-8');
console.log("Fixed syntax");
