const fs = require('fs');
let code = fs.readFileSync('src/components/PBLLessonPlanForm.tsx', 'utf8');

code = code.replace(/split\('\n\s*'\)/g, "split('\\n')");
code = code.replace(/join\('\n\s*'\)/g, "join('\\n')");

// also fix placeholder="1. อธิบาย...
// 2. วิเคราะห์..."
code = code.replace(/placeholder="1\. อธิบาย\.\.\.\n\s*2\. วิเคราะห์\.\.\."/g, 'placeholder="1. อธิบาย...\\n2. วิเคราะห์..."');

fs.writeFileSync('src/components/PBLLessonPlanForm.tsx', code);
