const fs = require('fs');
let code = fs.readFileSync('src/components/LessonLogForm.tsx', 'utf8');

console.log("Imports:");
console.log(code.split('\n').slice(0, 15).join('\n'));

console.log("\nHandle Import Plan:");
console.log(code.substring(code.indexOf('const handleImportPlan'), code.indexOf('const handleImportPlan') + 500));

console.log("\nReturn Statement Start:");
console.log(code.substring(code.indexOf('return ('), code.indexOf('return (') + 300));

