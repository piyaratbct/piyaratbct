const fs = require('fs');

let content = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

content = content.replace(
  /const allDocs = snapshot\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \} as any\)\);/,
  `const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        allDocs.sort((a, b) => {
          const codeA = a.subjectCode || '';
          const codeB = b.subjectCode || '';
          if (codeA && codeB) {
            return codeA.localeCompare(codeB);
          }
          if (codeA) return -1;
          if (codeB) return 1;
          return (a.subjectName || '').localeCompare(b.subjectName || '');
        });`
);

fs.writeFileSync('src/components/LessonPlanForm.tsx', content);
console.log("Patched LessonPlanForm sorting");
