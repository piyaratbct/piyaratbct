const fs = require('fs');
let pblCode = fs.readFileSync('src/components/PBLLessonPlanForm.tsx', 'utf8');
pblCode = pblCode.replace(
  /if \(!title\.trim\(\) \|\| !objectives\.trim\(\) \|\| !activities\.trim\(\) \|\| \(\!pblDrivingQuestion\.trim\(\) \|\| \!pblInvestigationSteps\.trim\(\) \|\| \!pblPresentation\.trim\(\)\)\) \{/g,
  'if (!title.trim() || !objectives.trim() || (!isKindergarten && !activities.trim()) || (!pblDrivingQuestion.trim() || !pblInvestigationSteps.trim() || !pblPresentation.trim())) {'
);
fs.writeFileSync('src/components/PBLLessonPlanForm.tsx', pblCode);

let normalCode = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');
normalCode = normalCode.replace(
  /if \(!title\.trim\(\) \|\| !objectives\.trim\(\) \|\| !activities\.trim\(\)\) \{/g,
  'if (!title.trim() || !objectives.trim() || (!isKindergarten && !activities.trim())) {'
);
fs.writeFileSync('src/components/LessonPlanForm.tsx', normalCode);
console.log('Fixed validation');
