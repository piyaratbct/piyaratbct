const fs = require('fs');

const filesToPatch = [
  'src/components/LessonPlanForm.tsx',
  'src/components/PBLLessonPlanForm.tsx',
  'src/components/LessonLogForm.tsx',
  'src/components/PBLLessonLogForm.tsx'
];

filesToPatch.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace the .filter(s => s !== 'อื่นๆ' ... with flatMap
  content = content.replace(
    /\{availableSubjects\.filter\(s => s !== 'อื่นๆ' && s !== 'อื่น ๆ'\)\.map\(\(subj\) => \{/g,
    "{availableSubjects.flatMap(s => typeof s === 'string' ? [s] : s.type === 'single' ? [s.name] : s.subjects).filter(s => s !== 'อื่นๆ' && s !== 'อื่น ๆ').map((subj) => {"
  );
  
  fs.writeFileSync(file, content);
});

console.log("Patched multiselects");
