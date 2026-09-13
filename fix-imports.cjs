const fs = require('fs');

const files = [
  'src/components/LessonLogForm.tsx',
  'src/components/LessonPlanForm.tsx',
  'src/components/PBLLessonLogForm.tsx',
  'src/components/PBLLessonPlanForm.tsx',
  'src/hooks/useAvailableSubjects.ts'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // If we couldn't import it in the regex, let's just forcefully append the import at the top
  if (content.includes('sortSubjects') && !content.includes("import { sortSubjects }") && !content.includes("import { SUBJECTS, sortSubjects }") && !content.includes("sortSubjects } from '../types'")) {
     content = "import { sortSubjects } from '../types';\n" + content;
  }
  
  fs.writeFileSync(file, content);
  console.log("Fixed " + file);
});
