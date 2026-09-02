const fs = require('fs');
let code = fs.readFileSync('src/components/DisciplineModule.tsx', 'utf-8');

const oldFilter = `  const filteredStudents = students.filter(s => 
    !selectedStudentIds.includes(s.id) && !offenderIds.includes(s.id) && !victimIds.includes(s.id) && 
    (
      s.firstName.toLowerCase().includes(studentSearch.toLowerCase()) || 
      s.lastName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.studentId.includes(studentSearch) ||
      (s.nickname && s.nickname.toLowerCase().includes(studentSearch.toLowerCase()))
    )
  ).slice(0, 5);`;

const newFilter = `  const filteredStudents = students.filter(s => 
    s.status === 'active' &&
    !selectedStudentIds.includes(s.id) && !offenderIds.includes(s.id) && !victimIds.includes(s.id) && 
    (
      s.firstName.toLowerCase().includes(studentSearch.toLowerCase()) || 
      s.lastName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.studentId.includes(studentSearch) ||
      (s.nickname && s.nickname.toLowerCase().includes(studentSearch.toLowerCase()))
    )
  ).slice(0, 5);`;

code = code.replace(oldFilter, newFilter);
fs.writeFileSync('src/components/DisciplineModule.tsx', code, 'utf-8');
console.log("Patched discipline filter");
