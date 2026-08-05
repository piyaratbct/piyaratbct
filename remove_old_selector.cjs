const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

const regex = /const IndicatorSelector = \(\{[\s\S]*?\}\) => \{[\s\S]*?return \([\s\S]*?\}\);[\s\S]*?\};\n+/;
code = code.replace(regex, '');
fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
