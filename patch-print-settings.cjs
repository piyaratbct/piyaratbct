const fs = require('fs');
let content = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

content = content.replace('settings={subjectSettings}', 'settings={effectiveSettings || subjectSettings || undefined}');

fs.writeFileSync('src/components/EvaluationModule.tsx', content);
console.log("Patched PrintTemplate settings");
