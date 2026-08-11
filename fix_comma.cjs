const fs = require('fs');

['src/components/LessonLogForm.tsx', 'src/components/LessonPlanForm.tsx', 'src/components/PBLLessonLogForm.tsx', 'src/components/PBLLessonPlanForm.tsx'].forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/SEMESTERS,, PERIOD_OPTIONS/g, 'SEMESTERS, PERIOD_OPTIONS');
  content = content.replace(/,,/g, ',');
  fs.writeFileSync(filePath, content, 'utf8');
});
