const fs = require('fs');

// Fix App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
    "const rawGrades = plan.gradeLevel ? plan.gradeLevel.split(',').map(g => g.split('/')[0].trim()).filter(Boolean) : [\"ประถมศึกษาปีที่ 1\"];",
    "const rawGrades = plan.gradeLevel ? plan.gradeLevel.split(',').map(g => g.trim()).filter(Boolean) : [\"ประถมศึกษาปีที่ 1\"];"
);
fs.writeFileSync('src/App.tsx', appCode);

// Fix EvaluationModule.tsx
let evalCode = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');
evalCode = evalCode.replace(
    "const baseGrade = selectedGrade.split('/')[0].trim();\n    const settingsId = `${systemAcademicYear}_${systemSemester}_${baseGrade}_${selectedSubject}`.replace(/[\\/]/g, '-');",
    "const settingsId = `${systemAcademicYear}_${systemSemester}_${selectedGrade}_${selectedSubject}`.replace(/[\\/]/g, '-');"
);
fs.writeFileSync('src/components/EvaluationModule.tsx', evalCode);
