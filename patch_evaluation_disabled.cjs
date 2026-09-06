const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

code = code.replace(/disabled=\{student\.status !== "active"\}/g, 'disabled={student.status !== "active" || isReadOnly}');
code = code.replace(/disabled=\{!draftScores\[.*?\]\}/g, 'disabled={!draftScores[key] || isReadOnly}');

fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf-8');
console.log('Patched inputs with isReadOnly');
