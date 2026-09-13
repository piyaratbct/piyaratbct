const fs = require('fs');

let content = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

content = content.replace(
  "const totalHours = curr.totalHours || 0; // ชั่วโมง/ปีการศึกษา",
  "const totalHours = curr.totalHours || curr.requiredHoursPerTerm || 0; // ชั่วโมง/ปีการศึกษา"
);

fs.writeFileSync('src/components/LearningHoursReport.tsx', content);
console.log("Fixed learning hours report property");
