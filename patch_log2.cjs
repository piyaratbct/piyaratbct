const fs = require('fs');
let code = fs.readFileSync('src/components/LessonLogForm.tsx', 'utf8');

const fetchPlanLines = code.split('\n').filter((l, i, arr) => {
  return arr.slice(Math.max(0, i-5), i+10).join('\n').includes('handleSelectPlan');
});
console.log(code.substring(code.indexOf('const handleSelectPlan'), code.indexOf('const handleSelectPlan') + 1000));
