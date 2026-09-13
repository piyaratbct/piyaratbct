const fs = require('fs');

let content = fs.readFileSync('src/components/StudentReportPrintTemplate.tsx', 'utf8');

content = content.replace(
  /const filteredSubjects = SUBJECTS\.filter\(subject => \{[\s\S]*?return true;\s*\}\);/,
  `const filteredSubjects = SUBJECTS.filter(subject => {
            if (subject === 'อื่นๆ') return false;
            
            const isKindergarten = gradeLevel.includes('อนุบาล');
            const isPrimary = gradeLevel.includes('ประถม');
            const isPrimaryUpper = isPrimary && (gradeLevel.includes('4') || gradeLevel.includes('5') || gradeLevel.includes('6'));
            const isPrimaryLower = isPrimary && (gradeLevel.includes('1') || gradeLevel.includes('2') || gradeLevel.includes('3'));
  
            if (isKindergarten && subject !== 'การศึกษาปฐมวัย') {
               return false;
            }
            
            if (isPrimary && subject === 'การศึกษาปฐมวัย') {
               return false;
            }

            if (subject === 'จินตคณิต' && isPrimaryUpper) {
              return false;
            }
            if (subject === 'ภาษาอังกฤษเพื่อการสื่อสาร' && isPrimaryLower) {
              return false;
            }
            
            return true;
          });`
);

fs.writeFileSync('src/components/StudentReportPrintTemplate.tsx', content);
console.log("Patched fallback");
