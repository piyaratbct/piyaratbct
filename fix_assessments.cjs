const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

content = content.replace(
  'Object.values(assessments).filter(a => a.studentId === student.id)',
  '(Object.values(assessments) as StudentAssessment[]).filter(a => a.studentId === student.id)'
);

fs.writeFileSync('src/components/ClassroomModule.tsx', content, 'utf8');
console.log('Fixed assessments type casting');
