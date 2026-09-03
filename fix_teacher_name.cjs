const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

// 1. Remove the misplaced subjectTeacherName inside useEffect
const badCode = `      const subjectTeacherName = schedules.length > 0 && schedules[0].teacherName
    ? schedules[0].teacherName
    : currentTeacher
    ? \\\`\\\${currentTeacher.firstName || ''} \\\${currentTeacher.lastName || ''}\\\`.trim()
    : undefined;

  return () => unsubscribe();`;
code = code.replace(badCode, `  return () => unsubscribe();`);

// 2. Add subjectTeacherName before the main return
const insertionPoint = "  return (";
const correctCode = `  const subjectTeacherName = schedules.length > 0 && schedules[0].teacherName
    ? schedules[0].teacherName
    : currentTeacher
    ? \`\${currentTeacher.firstName || ''} \${currentTeacher.lastName || ''}\`.trim()
    : undefined;

  return (`;
code = code.replace(insertionPoint, correctCode);

fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf-8');
console.log("Fixed subjectTeacherName declaration");
