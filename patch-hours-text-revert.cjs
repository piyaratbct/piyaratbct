const fs = require('fs');

const files = [
  'src/components/LearningHoursReport.tsx',
  'src/components/SubjectStructureManager.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/ชั่วโมง\/ภาคเรียน/g, 'ชั่วโมง/ปีการศึกษา');
  fs.writeFileSync(file, content);
});

console.log("Reverted hours text to ปีการศึกษา.");
