const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

code = code.replace(/\(initialPlan as any\)\?\.competencies/g, 'initialPlan?.competencies');

fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
