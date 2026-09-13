const fs = require('fs');
let content = fs.readFileSync('src/hooks/useAvailableSubjects.ts', 'utf8');

const pushStandaloneStr = `        standaloneSubjects.forEach(s => {
          dropDownData.push({ type: 'single', name: s });
        });`;
        
const newPushStandaloneStr = `        standaloneSubjects.forEach(s => {
          // Find the original doc to get its type
          const originalDoc = allDocs.find(d => d.subjectName === s);
          dropDownData.push({ type: 'single', name: s, subjectType: originalDoc?.subjectType || 'academic' });
        });`;

content = content.replace(pushStandaloneStr, newPushStandaloneStr);
fs.writeFileSync('src/hooks/useAvailableSubjects.ts', content);
console.log("Patched available subjects 2");
