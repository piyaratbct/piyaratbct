const fs = require('fs');

const path = 'src/components/LessonPlanPrintTemplate.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/สัปดาห์ที่สอน/g, 'คาบที่');

fs.writeFileSync(path, content, 'utf8');
