const fs = require('fs');
let code = fs.readFileSync('src/components/PBLLessonPlanForm.tsx', 'utf8');

code = code.replace(/\\n/g, '\n');

fs.writeFileSync('src/components/PBLLessonPlanForm.tsx', code);
console.log('Fixed syntax error');
