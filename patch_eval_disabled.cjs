const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

// The inputs in the student loops are like:
// <input \n                                    type="number" min={0} max={act.maxScore}
// Let's replace them to include the disabled attribute.
code = code.replace(/<input\s+type="number"/g, '<input disabled={student.status !== "active"} type="number"');
code = code.replace(/<input\s+type="text"/g, '<input disabled={student.status !== "active"} type="text"');
code = code.replace(/<textarea/g, '<textarea disabled={student.status !== "active"}');

fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf-8');
console.log("Patched EvaluationModule");
