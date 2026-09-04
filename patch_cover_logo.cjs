const fs = require('fs');
let code = fs.readFileSync('src/components/SubjectScorePrintTemplate.tsx', 'utf-8');

if (!code.includes('import { SchoolLogo }')) {
  code = code.replace(
    'import { Student,', 
    'import { SchoolLogo } from "./PrintTemplate";\nimport { Student,'
  );
}

code = code.replace(
  '<span className="text-slate-400 text-xs">ตราโรงเรียน</span>',
  '<SchoolLogo className="w-full h-full object-contain drop-shadow-sm" />'
);

fs.writeFileSync('src/components/SubjectScorePrintTemplate.tsx', code, 'utf-8');
