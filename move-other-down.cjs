const fs = require('fs');

const filesToPatch = [
  'src/components/LessonPlanForm.tsx',
  'src/components/PBLLessonPlanForm.tsx',
  'src/components/LessonLogForm.tsx',
  'src/components/PBLLessonLogForm.tsx'
];

filesToPatch.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove the line pushing 'อื่นๆ' from the top
  content = content.replace(/[ \t]*dropDownData\.push\(\{ type: 'single', name: 'อื่นๆ' \}\);\n/g, '');
  
  // Insert it before setAvailableSubjects
  content = content.replace(/setAvailableSubjects\(dropDownData\);/g, "dropDownData.push({ type: 'single', name: 'อื่นๆ' });\n        setAvailableSubjects(dropDownData);");
  
  fs.writeFileSync(file, content);
});

console.log("Moved 'อื่นๆ' to the bottom of the dropdowns");
