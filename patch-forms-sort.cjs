const fs = require('fs');

const filesToPatch = [
  'src/components/LessonLogForm.tsx',
  'src/components/PBLLessonPlanForm.tsx',
  'src/components/PBLLessonLogForm.tsx'
];

filesToPatch.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

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

  fs.writeFileSync(file, content);
  console.log("Patched " + file);
});
