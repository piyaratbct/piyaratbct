const fs = require('fs');

const filesToPatch = [
  'src/components/LessonPlanList.tsx',
  'src/components/LessonLogList.tsx',
  'src/components/EvaluationModule.tsx'
];

const renderGradeFilter = `
              <optgroup label="ระดับปฐมวัย">
                {GRADE_LEVELS.filter(g => g.includes('อนุบาล')).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </optgroup>
              <optgroup label="ระดับประถมศึกษา">
                {GRADE_LEVELS.filter(g => g.includes('ประถม')).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </optgroup>
`;

filesToPatch.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (file.includes('EvaluationModule')) {
    // In EvaluationModule, they filter by uniqueGrades and teacherGrades
    // So we can group the availableGrades array
    content = content.replace(
      /return availableGrades\.map\(g => \(\s*<option key=\{g\} value=\{g\}>\{g\}<\/option>\s*\)\);/g,
      `
      const kg = availableGrades.filter(g => g.includes('อนุบาล'));
      const pr = availableGrades.filter(g => g.includes('ประถม'));
      return (
        <>
          {kg.length > 0 && (
            <optgroup label="ระดับปฐมวัย">
              {kg.map(g => <option key={g} value={g}>{g}</option>)}
            </optgroup>
          )}
          {pr.length > 0 && (
            <optgroup label="ระดับประถมศึกษา">
              {pr.map(g => <option key={g} value={g}>{g}</option>)}
            </optgroup>
          )}
        </>
      );
      `
    );
  } else {
    // For lists
    content = content.replace(
      /\{GRADE_LEVELS\.map\(\(g\) => \(\s*<option key=\{g\} value=\{g\}>\s*\{g\}\s*<\/option>\s*\)\)\}/g,
      renderGradeFilter
    );
  }
  
  fs.writeFileSync(file, content);
});

console.log("Patched grade filters to use optgroups");
