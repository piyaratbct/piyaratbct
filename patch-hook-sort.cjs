const fs = require('fs');

let content = fs.readFileSync('src/hooks/useAvailableSubjects.ts', 'utf8');

// Replace the sorting
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

fs.writeFileSync('src/hooks/useAvailableSubjects.ts', content);
console.log("Patched useAvailableSubjects to sort by code");
