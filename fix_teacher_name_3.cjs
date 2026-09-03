const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

// 1. Remove it from line 61
code = code.replace(/const subjectTeacherName = schedules\.length[\s\S]*?: undefined;/g, "");

// 2. Insert it before main return
const mainReturn = "  return (\\n    <div className=\\\"space-y-6 animate-in fade-in duration-300 relative\\\">";
const correctCode = \`  const subjectTeacherName = schedules.length > 0 && schedules[0].teacherName
    ? schedules[0].teacherName
    : currentTeacher
    ? \\\`\\\${currentTeacher.firstName || ''} \\\${currentTeacher.lastName || ''}\\\`.trim()
    : undefined;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">\`;

code = code.replace(mainReturn, correctCode);
fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf-8');
console.log("Fixed subjectTeacherName declaration AGAIN");
