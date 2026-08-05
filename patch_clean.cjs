const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

const fullTableRegex = /\{curriculums\.length > 0 && totalRemaining > 0 && \([\s\S]*?\}\)/;

// Wait, the previous replace failed or succeeded? Let's check the current code.
