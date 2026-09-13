const fs = require('fs');
let content = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

// Import ScoreActivity
content = content.replace(/SubjectSettings, /g, 'SubjectSettings, ScoreActivity, ');

fs.writeFileSync('src/components/EvaluationModule.tsx', content);
