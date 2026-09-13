const fs = require('fs');

const filesToPatch = [
  'src/components/LessonPlanForm.tsx',
  'src/components/PBLLessonPlanForm.tsx',
  'src/components/LessonLogForm.tsx',
  'src/components/PBLLessonLogForm.tsx'
];

filesToPatch.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/dropDownData\.push\(\{ type: 'single', name: 'บูรณาการ \(PBL\)' \}\);\n?/g, '');
  content = content.replace(/setSubject\("บูรณาการ \(PBL\)"\);/g, 'setSubject(SUBJECTS[0] || "อื่นๆ");');
  content = content.replace(/initialPlan\?\.subject \|\| "บูรณาการ \(PBL\)"/g, 'initialPlan?.subject');
  content = content.replace(/initialRecord\?\.subject \|\| "บูรณาการ \(PBL\)"/g, 'initialRecord?.subject');
  fs.writeFileSync(file, content);
});

let typesContent = fs.readFileSync('src/types.ts', 'utf8');
typesContent = typesContent.replace(/ *'บูรณาการ \(PBL\)',\n?/g, '');
fs.writeFileSync('src/types.ts', typesContent);

console.log("Removed PBL option from dropdowns");
