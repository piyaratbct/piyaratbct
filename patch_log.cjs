const fs = require('fs');
let code = fs.readFileSync('src/components/LessonLogForm.tsx', 'utf8');

// We need to fetch students for the given gradeLevel, and render a table for desirable characteristics.
console.log(code.split('\n').filter(l => l.includes('useState')).slice(0, 30).join('\n'));
