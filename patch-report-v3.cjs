const fs = require('fs');
let code = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

// For gradeSchedules.forEach
const schedRegex = /subjectMap\[subjectName\]\.periodsPerWeek \+\= 1;\s*\}/g;
const schedReplacement = `subjectMap[subjectName].periodsPerWeek += 1;
         if (isChild) {
             if (!subjectMap[subjectName].childSubjects[childName]) {
                 subjectMap[subjectName].childSubjects[childName] = { periodsPerWeek: 0, taughtPeriods: 0, targetPeriodsTotal: 0 };
             }
             subjectMap[subjectName].childSubjects[childName].periodsPerWeek += 1;
         }
      }`;
code = code.replace(schedRegex, schedReplacement);

// For gradeSessions.forEach
const sessRegex = /subjectMap\[subjectName\]\.taughtPeriods \+\= 1;\s*\}/g;
const sessReplacement = `subjectMap[subjectName].taughtPeriods += 1;
         if (isChild) {
             if (!subjectMap[subjectName].childSubjects[childName]) {
                 subjectMap[subjectName].childSubjects[childName] = { periodsPerWeek: 0, taughtPeriods: 0, targetPeriodsTotal: 0 };
             }
             subjectMap[subjectName].childSubjects[childName].taughtPeriods += 1;
         }
      }`;
code = code.replace(sessRegex, sessReplacement);

fs.writeFileSync('src/components/LearningHoursReport.tsx', code);
console.log("Patched LearningHoursReport.tsx v3");
