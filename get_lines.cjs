const fs = require('fs');
const lines = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8').split('\n');

// Find the boundaries of the old table
const startTable = lines.findIndex(l => l.includes('{curriculums.length === 0 ? ('));
const endTable = lines.findIndex((l, i) => i > startTable && l.includes('          <div>') && lines[i+1].includes('ตัวชี้วัดต้องรู้ (ต้นทาง)'));

// Find the core indicator textarea
const startCore = lines.findIndex(l => l.includes('<div>') && lines[l+1] && lines[l+1].includes('ตัวชี้วัดต้องรู้'));

console.log("startTable:", startTable, "endTable:", endTable, "startCore:", startCore);
