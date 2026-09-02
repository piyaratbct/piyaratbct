const fs = require('fs');
let code = fs.readFileSync('src/components/CharacterAssessmentView.tsx', 'utf-8');

// Undo the specific one at line 393 that I broke
code = code.replace(/disabled={!isTeacherActionAllowed \|\| student\.status !== 'active'}/, "disabled={!isTeacherActionAllowed}");

fs.writeFileSync('src/components/CharacterAssessmentView.tsx', code, 'utf-8');
console.log("Patched CharacterAssessmentView top button");
