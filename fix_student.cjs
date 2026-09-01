const fs = require('fs');
let code = fs.readFileSync('src/components/Student360.tsx', 'utf8');

code = code.replace(
    /grade: '4' \}/g,
    "grade: '4' } as any"
);

code = code.replace(
    /grade: '3.5' \}/g,
    "grade: '3.5' } as any"
);

fs.writeFileSync('src/components/Student360.tsx', code);
console.log("Fixed Student360.tsx!");
