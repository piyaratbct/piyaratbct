const fs = require('fs');

const files = ['src/components/SubjectScorePrintTemplate.tsx', 'src/components/AttendancePrintTemplate.tsx'];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf-8');
  
  code = code.replace(
    /name=\{teacherName !== "\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\." \? teacherName : undefined\}\n\s*label="\(ลงชื่อ\) \.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\. ผู้สอน"/g,
    'name={teacherName}'
  );
  
  code = code.replace(
    /label="\(ลงชื่อ\) \.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\. ผู้ตรวจ"/g,
    ''
  );
  
  fs.writeFileSync(file, code, 'utf-8');
}
console.log("Cleaned print signature box calls");
