const fs = require('fs');

const files = [
  'src/components/LessonPlanForm.tsx',
  'src/components/PBLLessonPlanForm.tsx',
  'src/components/LessonLogForm.tsx',
  'src/components/PBLLessonLogForm.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // LessonPlanForm.tsx specific
  content = content.replace(
    'setSubject("ภาษาไทย");\n    setSelectedGrades([GRADE_LEVELS[0]]);',
    'setSubject("");\n    setSelectedGrades([]);'
  );
  
  // PBLLessonPlanForm.tsx specific
  content = content.replace(
    'setSelectedGrades([GRADE_LEVELS[0]]);\n    setSubject(SUBJECTS[0] || "อื่นๆ");',
    'setSelectedGrades([]);\n    setSubject("");'
  );
  
  // LessonLogForm.tsx & PBLLessonLogForm.tsx
  content = content.replace(
    "setSubject('ภาษาไทย');\n    setSelectedGrades([GRADE_LEVELS[0]]);",
    "setSubject('');\n    setSelectedGrades([]);"
  );
  
  content = content.replace(
    "setSubject('บูรณาการ (PBL)');\n    setSelectedGrades([GRADE_LEVELS[0]]);",
    "setSubject('');\n    setSelectedGrades([]);"
  );

  fs.writeFileSync(file, content);
});

console.log("Patched resetForm in all files.");
