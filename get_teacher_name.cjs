const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

const tNameVar = `  const subjectTeacherName = schedules.length > 0 && schedules[0].teacherName
    ? schedules[0].teacherName
    : currentTeacher
    ? \`\${currentTeacher.firstName || ''} \${currentTeacher.lastName || ''}\`.trim()
    : undefined;

  return (`;

code = code.replace("  return (", tNameVar);
fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf-8');
