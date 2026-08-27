const fs = require('fs');
let code = fs.readFileSync('src/components/PBLLessonPlanForm.tsx', 'utf8');

// I need to change:
// split('
// ') 
// back to split('\\n')

code = code.replace(/split\('[\r\n]+'\)/g, "split('\\n')");
code = code.replace(/join\('[\r\n]+'\)/g, "join('\\n')");

fs.writeFileSync('src/components/PBLLessonPlanForm.tsx', code);
