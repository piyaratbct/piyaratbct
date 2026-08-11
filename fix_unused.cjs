const fs = require('fs');

['src/components/LessonPlanForm.tsx', 'src/components/LessonLogForm.tsx', 'src/components/PBLLessonPlanForm.tsx', 'src/components/PBLLessonLogForm.tsx'].forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/const teachingWeeks = generateTeachingWeeksOptions\(systemAcademicYear\);\n/g, '');
  // Also remove the import if it's unused, though the linter might complain about unused import `generateTeachingWeeksOptions`
  // Let's just remove the import in those files as well.
  content = content.replace(/,\s*generateTeachingWeeksOptions/, '');
  fs.writeFileSync(filePath, content, 'utf8');
});
