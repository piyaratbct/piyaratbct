const fs = require('fs');

let content = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

content = content.replace(
  'let curriculumMatch = curriculums.find(c => c.subjectName === sub && c.gradeLevel === baseGrade);',
  `let curriculumMatch = curriculums.find(c => c.subjectName === sub && (c.gradeLevel === baseGrade || (c.gradeLevels && c.gradeLevels.includes(baseGrade))));`
);

content = content.replace(
  'const currA = curriculums.find(c => c.subjectName === a && c.gradeLevel === baseGrade) || { subjectName: a };',
  'const currA = curriculums.find(c => c.subjectName === a && (c.gradeLevel === baseGrade || (c.gradeLevels && c.gradeLevels.includes(baseGrade)))) || { subjectName: a };'
);

content = content.replace(
  'const currB = curriculums.find(c => c.subjectName === b && c.gradeLevel === baseGrade) || { subjectName: b };',
  'const currB = curriculums.find(c => c.subjectName === b && (c.gradeLevel === baseGrade || (c.gradeLevels && c.gradeLevels.includes(baseGrade)))) || { subjectName: b };'
);


fs.writeFileSync('src/components/ScheduleManager.tsx', content);
console.log("Patched curriculum matching logic");
