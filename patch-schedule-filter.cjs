const fs = require('fs');
let code = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

const regex = /const gradeSchedules = allSchedules\.filter\(s => s\.gradeLevel && s\.gradeLevel\.startsWith\(baseGrade\)\);/g;

const replacement = `const gradeSchedules = allSchedules.filter(s => 
    s.gradeLevel && 
    s.gradeLevel.startsWith(baseGrade) && 
    (s.semester === systemSemester || !s.semester) // Fallback for old data without semester
);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ScheduleManager.tsx', code);
