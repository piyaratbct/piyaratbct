const fs = require('fs');
let code = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');
code = code.replace(/handleFirestoreError\(error, '([a-z]+)'\)/g, "handleFirestoreError(error, '$1', 'curriculums')");
fs.writeFileSync('src/components/CurriculumManager.tsx', code, 'utf8');
