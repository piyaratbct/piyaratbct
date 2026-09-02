const fs = require('fs');
let code = fs.readFileSync('src/components/StudentStatsModal.tsx', 'utf-8');

const oldStr = `  const totalMale = students.filter(s => s.gender === 'male').length;
  const totalFemale = students.filter(s => s.gender === 'female').length;`;

const newStr = `  const activeStudentsList = students.filter(s => s.status === 'active' || !s.status);
  const totalMale = activeStudentsList.filter(s => s.gender === 'male').length;
  const totalFemale = activeStudentsList.filter(s => s.gender === 'female').length;`;

code = code.replace(oldStr, newStr);
code = code.replace("{students.length}</p>", "{activeStudentsList.length}</p>");

fs.writeFileSync('src/components/StudentStatsModal.tsx', code, 'utf-8');
console.log("Patched!");
