const fs = require('fs');

const files = [
  'src/components/LearningHoursReport.tsx',
  'src/components/SubjectStructureManager.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/ชั่วโมง\/ปีการศึกษา/g, 'ชั่วโมง/ภาคเรียน');
  fs.writeFileSync(file, content);
});

console.log("Patched hours text.");
