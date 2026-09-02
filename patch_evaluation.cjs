const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

// Replace standard input fields with conditionally disabled inputs based on s.status !== 'active'
// Actually, it's easier to just replace `<input` with `<input disabled={student.status !== 'active'}`

code = code.replace(/<input/g, `<input disabled={student.status !== 'active'}`);
// wait, there are other inputs in EvaluationModule (like search, maxScore etc). 
// I should only disable inputs inside the student loop.
