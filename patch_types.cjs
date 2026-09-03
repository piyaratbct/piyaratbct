const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');

code = code.replace(
  /export interface KindergartenAssessment \{\n  id: string;\n  studentId: string;/,
  `export interface KindergartenAssessment {\n  id: string;\n  studentId: string;\n  weight?: number;\n  height?: number;`
);

fs.writeFileSync('src/types.ts', code, 'utf-8');
console.log("Patched types.ts");
