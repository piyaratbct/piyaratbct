const fs = require('fs');

let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

content = content.replace(
  "{(!c.totalHours || c.totalHours === 0) && (",
  "{(!c.requiredHoursPerTerm || c.requiredHoursPerTerm === 0) && ("
);

fs.writeFileSync('src/components/CurriculumManager.tsx', content);

let content2 = fs.readFileSync('src/components/UnifiedCurriculumManager.tsx', 'utf8');
content2 = content2.replace(
  "{(!c.totalHours || c.totalHours === 0) && (",
  "{(!c.requiredHoursPerTerm || c.requiredHoursPerTerm === 0) && !c.isParent && ("
);
fs.writeFileSync('src/components/UnifiedCurriculumManager.tsx', content2);

console.log("Fixed alert check");
