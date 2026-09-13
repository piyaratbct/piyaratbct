const fs = require('fs');

let content = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

// Replace curriculumTermTarget with targetPeriodsTotal in warnings
content = content.replace(
  'item.curriculumTermTarget !== item.scheduleTermTarget',
  'item.targetPeriodsTotal !== item.scheduleTermTarget'
);

content = content.replace(
  'item.curriculumTermTarget === item.scheduleTermTarget',
  'item.targetPeriodsTotal === item.scheduleTermTarget'
);

content = content.replace(
  '{item.curriculumTermTarget} คาบ',
  '{item.targetPeriodsTotal} คาบ'
);

content = content.replace(
  '(คาดการณ์ {item.scheduleTermTarget} คาบ/เทอม)',
  '(คาดการณ์ {item.scheduleTermTarget} คาบ)'
);

content = content.replace(
  'ตารางสอนสอดคล้องกับหลักสูตร ({item.scheduleTermTarget} คาบ/เทอม)',
  'ตารางสอนสอดคล้องกับหลักสูตร ({item.scheduleTermTarget} คาบ)'
);

fs.writeFileSync('src/components/LearningHoursReport.tsx', content);
console.log("Patched mismatches.");
