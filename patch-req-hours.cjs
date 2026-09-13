const fs = require('fs');
let content = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

content = content.replace(
  'const requiredHoursYear = curriculumMatch?.requiredHoursPerTerm || 0;',
  'const requiredHoursYear = curriculumMatch?.totalHours || curriculumMatch?.requiredHoursPerTerm || 0;'
);

fs.writeFileSync('src/components/ScheduleManager.tsx', content);
console.log("Patched ScheduleManager totalHours");
