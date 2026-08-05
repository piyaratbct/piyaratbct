const fs = require('fs');
let code = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

code = code.replace(
  "{Array.from(previewData.values()).map((subject, idx) => (",
  "{Array.from(previewData.values()).map((subject: CurriculumSubject, idx: number) => ("
);

fs.writeFileSync('src/components/CurriculumManager.tsx', code, 'utf8');
