const fs = require('fs');

function processFile(filePath, isLessonPlanForm = false) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix allDocs mapping
  content = content.replace(/const allDocs = snapshot\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\)\);/g, 'const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));');
  
  // Fix undefined variables (if availableUnits got lost somehow)
  // Let's actually check if I broke the rendering.
  // wait, the error TS2304: Cannot find name 'availableUnits' means the line where availableUnits was defined got deleted?
  
  fs.writeFileSync(filePath, content);
}

processFile('src/components/LessonPlanForm.tsx', true);
processFile('src/components/PBLLessonPlanForm.tsx', true);
processFile('src/components/LessonLogForm.tsx', false);
processFile('src/components/PBLLessonLogForm.tsx', false);
console.log("fixed types");
