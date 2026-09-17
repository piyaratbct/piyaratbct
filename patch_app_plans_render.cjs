const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<PBLLessonPlanForm\s+teacherId=\{currentTeacher\.id\}\s+teachers=\{teachers\}/g,
  `<PBLLessonPlanForm
                  teacherId={currentTeacher.id}
                  teachers={teachers}
                  initialSubject={teachingInitialSubject}
                  initialGrade={teachingInitialGrade}`
);

code = code.replace(
  /<PBLLessonLogForm\s+teacherId=\{currentTeacher\.id\}\s+teachers=\{teachers\}/g,
  `<PBLLessonLogForm
                  teacherId={currentTeacher.id}
                  teachers={teachers}
                  initialSubject={teachingInitialSubject}
                  initialGrade={teachingInitialGrade}`
);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched App.tsx rendering');
