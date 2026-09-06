const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

code = code.replace(/disabled=\{isSaving\}/g, 'disabled={isSaving || isReadOnly}');

fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf-8');
console.log('Patched save button with isReadOnly');
