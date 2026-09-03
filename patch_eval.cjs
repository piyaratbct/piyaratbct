const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

code = code.replace(
  "{students.map((student) => {",
  `{students.filter(s => s.gradeLevel === selectedGrade)
                          .sort((a, b) => (Number(a.number || '0') - Number(b.number || '0')))
                          .map((student) => {`
);

code = code.replace(
  "teacherName={undefined}",
  "teacherName={undefined}\n          attendanceStats={attendanceStats}"
);

fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf-8');
console.log("Patched EvaluationModule");
