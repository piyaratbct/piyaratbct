const fs = require('fs');
const code = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

const regexOldCalc = /let actualHours = 0;\s*if \(teachingDaysCount\) \{\s*rData\.days\.forEach\(d => \{\s*actualHours \+\= teachingDaysCount\[d\] \|\| 0;\s*\}\);\s*\}/gm;
console.log(code.match(regexOldCalc));
