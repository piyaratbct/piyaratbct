const fs = require('fs');
const lines = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8').split('\n');

const target = lines.slice(533, 594).join('\n');
fs.writeFileSync('target_block.txt', target);
