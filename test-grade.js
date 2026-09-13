const gradeLevel = "ประถมศึกษาปีที่ 1/1";
const p = { gradeLevel: "ประถมศึกษาปีที่ 1/1" };
const planGrades = p.gradeLevel ? p.gradeLevel.split(',').map(s => s.trim()) : [];
const gradeMatch = planGrades.includes(gradeLevel) || p.gradeLevel === gradeLevel;
console.log(gradeMatch);
