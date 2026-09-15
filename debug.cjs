const fs = require('fs');

// Check the exact code of ScheduleManager.tsx around line 430-480
const code = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('gradeSchedules.forEach(curr => {'));
const end = lines.findIndex((l, i) => i > start && l.includes('return ('));
console.log(lines.slice(start, end).join('\n'));
