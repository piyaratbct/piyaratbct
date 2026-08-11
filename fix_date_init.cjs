const fs = require('fs');

let f1 = fs.readFileSync('src/components/LessonLogForm.tsx', 'utf8');
f1 = f1.replace(/const \[date, setDate\] = useState\(getTodayString\(\)\);/, 'const [date, setDate] = useState(initialRecord?.date || "");');
fs.writeFileSync('src/components/LessonLogForm.tsx', f1, 'utf8');

let f2 = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');
f2 = f2.replace(/const \[date, setDate\] = useState\(initialPlan\?\.date \|\| new Date\(\)\.toISOString\(\)\.slice\(0, 10\)\);/, 'const [date, setDate] = useState(initialPlan?.date || "");');
fs.writeFileSync('src/components/LessonPlanForm.tsx', f2, 'utf8');

