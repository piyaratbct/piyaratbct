const fs = require('fs');
let content = fs.readFileSync('src/hooks/useAvailableSubjects.ts', 'utf8');

const filterTarget = `          allDocs = allDocs.filter(d => {
            if (!d.gradeLevel) return true; // keep if no grade specified
            return getBaseGrade(d.gradeLevel) === baseTargetGrade;
          });`;
          
const newFilterTarget = `          allDocs = allDocs.filter(d => {
            if (d.gradeLevels && d.gradeLevels.length > 0) {
              return d.gradeLevels.some((g: string) => getBaseGrade(g) === baseTargetGrade);
            }
            if (!d.gradeLevel) return true; // keep if no grade specified
            return getBaseGrade(d.gradeLevel) === baseTargetGrade;
          });`;

content = content.replace(filterTarget, newFilterTarget);
fs.writeFileSync('src/hooks/useAvailableSubjects.ts', content);
console.log("Patched useAvailableSubjects.ts for gradeLevels");
