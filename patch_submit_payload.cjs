const fs = require('fs');
let code = fs.readFileSync('src/components/LessonLogForm.tsx', 'utf8');

const target = `      date,
      content: content.trim(),`;

const replacement = `      date,
      lessonPlanId,
      content: content.trim(),`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/LessonLogForm.tsx', code, 'utf8');
