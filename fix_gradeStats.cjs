const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

const regex = /const gradeStats = \{\};/;
const replacement = 'const gradeStats: Record<string, { grade: string, underweight: number, normal: number, overweight: number, obese1: number, obese2: number, unknown: number }> = {};';
content = content.replace(regex, replacement);
fs.writeFileSync('src/components/ClassroomModule.tsx', content, 'utf8');
console.log('Fixed gradeStats type');
