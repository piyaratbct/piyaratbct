const fs = require('fs');
let content = fs.readFileSync('src/components/Student360.tsx', 'utf8');

content = content.replace(
  'initialStudent.parentPhone || initialStudent.guardianPhone ||',
  'initialStudent.parentPhone || initialStudent.fatherPhone || initialStudent.motherPhone ||'
);

fs.writeFileSync('src/components/Student360.tsx', content, 'utf8');
console.log('Fixed phone error');
