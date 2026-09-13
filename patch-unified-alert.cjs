const fs = require('fs');

let content = fs.readFileSync('src/components/UnifiedCurriculumManager.tsx', 'utf8');
content = content.replace(
  "{(!c.requiredHoursPerTerm || c.requiredHoursPerTerm === 0) && !c.isParent && (",
  "{(!(c.totalHours || c.requiredHoursPerTerm) || (c.totalHours === 0 && c.requiredHoursPerTerm === 0)) && ("
);
fs.writeFileSync('src/components/UnifiedCurriculumManager.tsx', content);

let content2 = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');
content2 = content2.replace(
  "{(!c.requiredHoursPerTerm || c.requiredHoursPerTerm === 0) && (",
  "{(!(c.totalHours || c.requiredHoursPerTerm) || (c.totalHours === 0 && c.requiredHoursPerTerm === 0)) && ("
);
fs.writeFileSync('src/components/CurriculumManager.tsx', content2);
