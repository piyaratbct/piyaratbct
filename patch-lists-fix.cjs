const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace('  onEvaluate,\n}:', '  onEvaluate,\n  initialSubject,\n  initialGrade\n}:');
  fs.writeFileSync(file, content);
}

fix('src/components/LessonPlanList.tsx');
fix('src/components/LessonLogList.tsx');

let dash = fs.readFileSync('src/components/TeacherSubjectsDashboard.tsx', 'utf8');
if (!dash.includes('Calculator,')) {
  dash = dash.replace('import { BookOpen', 'import { Calculator, BookOpen');
  fs.writeFileSync('src/components/TeacherSubjectsDashboard.tsx', dash);
}

console.log("Fixed args and imports");
