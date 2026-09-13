const fs = require('fs');
let content = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

content = content.replace(/ScoreActivity/g, 'ActivityColumn');
// Fix the Omit generic error
content = content.replace(/Omit<SubjectSettings, ActivityColumn, 'id'/g, "Omit<SubjectSettings, 'id'");

fs.writeFileSync('src/components/EvaluationModule.tsx', content);
