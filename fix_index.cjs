const fs = require('fs');

const path = 'src/components/LessonPlanPrintTemplate.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
    'plan.structuredEvaluations.map((evalItem) =>',
    'plan.structuredEvaluations.map((evalItem, index) =>'
);

fs.writeFileSync(path, code);
