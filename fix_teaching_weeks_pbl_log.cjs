const fs = require('fs');
let code = fs.readFileSync('src/components/PBLLessonLogForm.tsx', 'utf8');

code = code.replace(/  const \[date, setDate\] = useState\(getTodayString\(\)\);/, `  const teachingWeeks = generateTeachingWeeksOptions(systemAcademicYear);
  const [date, setDate] = useState(teachingWeeks[0]);`);

code = code.replace(/initialRecord\?\.date \|\| getTodayString\(\)/g, `initialRecord?.date || teachingWeeks[0]`);

fs.writeFileSync('src/components/PBLLessonLogForm.tsx', code, 'utf8');
