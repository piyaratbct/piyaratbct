const fs = require('fs');

const files = ['src/components/SubjectScorePrintTemplate.tsx', 'src/components/AttendancePrintTemplate.tsx'];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf-8');
  
  code = code.replace(
    /teacherName = "\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.",/g,
    'teacherName,'
  );
  
  fs.writeFileSync(file, code, 'utf-8');
}
console.log("Cleaned defaults");
