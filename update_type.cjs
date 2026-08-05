const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const target = `  targetIndicators?: string;  // ตัวชี้วัดควรรู้ (ปลายทาง)
  objectives: string;`;
const replacement = `  targetIndicators?: string;  // ตัวชี้วัดควรรู้ (ปลายทาง)
  competencies?: string;      // สมรรถนะสำคัญของผู้เรียน
  objectives: string;`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/types.ts', code, 'utf8');
    console.log('Updated types.ts');
} else {
    // try finding objectives: string;
    code = code.replace(/objectives: string;/, 'competencies?: string;\n  objectives: string;');
    fs.writeFileSync('src/types.ts', code, 'utf8');
    console.log('Updated types.ts using fallback');
}
