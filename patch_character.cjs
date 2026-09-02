const fs = require('fs');
let code = fs.readFileSync('src/components/CharacterAssessmentView.tsx', 'utf-8');

code = code.replace(/disabled={!isTeacherActionAllowed}/g, "disabled={!isTeacherActionAllowed || student.status !== 'active'}");

fs.writeFileSync('src/components/CharacterAssessmentView.tsx', code, 'utf-8');
console.log("Patched CharacterAssessmentView");
