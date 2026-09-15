const fs = require('fs');
let code = fs.readFileSync('src/components/SubjectScorePrintTemplate.tsx', 'utf8');

code = code.replace(
  /{Object\.entries\(gradeDistribution\.dist\)\.map\(\(\[grade, counts\]\) => \(/g,
  '{Object.entries(gradeDistribution.dist).map(([grade, counts]: [string, any]) => ('
);

fs.writeFileSync('src/components/SubjectScorePrintTemplate.tsx', code);
