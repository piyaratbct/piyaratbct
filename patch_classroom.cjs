const fs = require('fs');
let code = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

if (!code.includes('initialSubject?: string;')) {
  code = code.replace(
    /initialTab\?: 'students' \| 'student360' \| 'attendance' \| 'assessments' \| 'special-care';/,
    `initialTab?: 'students' | 'student360' | 'attendance' | 'assessments' | 'special-care';\n  initialGrade?: string;\n  initialSubject?: string;`
  );
  
  code = code.replace(
    /initialTab,\n\}\) => \{/,
    `initialTab,\n  initialGrade,\n  initialSubject,\n}) => {`
  );

  code = code.replace(
    /const initialGradeLevel = currentTeacher\?.homeroomClass \|\| currentTeacher\?.coHomeroomClass \|\| GRADE_LEVELS\[0\];/g,
    `const initialGradeLevel = initialGrade || currentTeacher?.homeroomClass || currentTeacher?.coHomeroomClass || GRADE_LEVELS[0];`
  );
  // Wait, let's check what the actual code says for `initialGrade`.
}
