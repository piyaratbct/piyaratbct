const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

// Use regex to remove ALL occurrences of subjectTeacherName declaration
code = code.replace(/const subjectTeacherName = schedules\.length[\s\S]*?: undefined;/g, "");

// Re-add it once before main return
const insertionPoint = "  return (";
const correctCode = `  const subjectTeacherName = schedules.length > 0 && schedules[0].teacherName
    ? schedules[0].teacherName
    : currentTeacher
    ? \`\${currentTeacher.firstName || ''} \${currentTeacher.lastName || ''}\`.trim()
    : undefined;

  return (`;
code = code.replace(insertionPoint, correctCode);

fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf-8');
console.log("Fixed duplicate subjectTeacherName");
