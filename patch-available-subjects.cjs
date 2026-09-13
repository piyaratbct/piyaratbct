const fs = require('fs');
let content = fs.readFileSync('src/hooks/useAvailableSubjects.ts', 'utf8');

content = content.replace(
  'export function useAvailableSubjects() {',
  'export function useAvailableSubjects(gradeLevel?: string) {'
);

content = content.replace(
  'const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));',
  `let allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        if (gradeLevel) {
          const getBaseGrade = (g: string) => g ? g.split('/')[0].trim() : '';
          const baseTargetGrade = getBaseGrade(gradeLevel);
          allDocs = allDocs.filter(d => {
            if (!d.gradeLevel) return true; // keep if no grade specified
            return getBaseGrade(d.gradeLevel) === baseTargetGrade;
          });
        }`
);

content = content.replace(
  '  }, []);',
  '  }, [gradeLevel]);'
);

fs.writeFileSync('src/hooks/useAvailableSubjects.ts', content);
console.log("Patched useAvailableSubjects");
