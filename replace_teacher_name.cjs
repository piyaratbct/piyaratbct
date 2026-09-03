const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

code = code.replace(
  "teacherName={currentTeacher ? `${currentTeacher.firstName || ''} ${currentTeacher.lastName || ''}`.trim() : undefined}",
  "teacherName={subjectTeacherName}"
);

code = code.replace(
  "teacherName={undefined}",
  "teacherName={subjectTeacherName}"
);

fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf-8');
