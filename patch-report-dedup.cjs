const fs = require('fs');
let code = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

const regex = /gradeSchedules\.forEach\(sch => \{[\s\S]*?subjectMap\[subjectName\]\.periodsPerWeek \+\= 1;\s*\}\);/m;

const replacement = `gradeSchedules.forEach(sch => {
      const subjectName = sch.subject === 'อื่นๆ' ? (sch.customSubject || 'อื่นๆ') : sch.subject;
      
      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = {
          subject: subjectName,
          teacherName: sch.teacherName || '-',
          periodsPerWeek: 0,
          curriculumYearTarget: 0,
          curriculumTermTarget: 0,
          scheduleTermTarget: 0,
          targetPeriodsTotal: 0,
          taughtPeriods: 0,
          lastTaughtDate: null,
          dataSource: 'schedule'
        };
      } else {
        if (subjectMap[subjectName].teacherName === '-') {
          subjectMap[subjectName].teacherName = sch.teacherName || '-';
        } else if (sch.teacherName && !subjectMap[subjectName].teacherName.includes(sch.teacherName)) {
           subjectMap[subjectName].teacherName += \`, \${sch.teacherName}\`;
        }
      }
      
      // Deduplicate periods (if multiple teachers teach the same period)
      if (!seenPeriodsPerSubject[subjectName]) {
         seenPeriodsPerSubject[subjectName] = new Set();
      }
      
      const periodSig = \`\${sch.dayOfWeek}-\${sch.period}\`;
      if (!seenPeriodsPerSubject[subjectName].has(periodSig)) {
         seenPeriodsPerSubject[subjectName].add(periodSig);
         subjectMap[subjectName].periodsPerWeek += 1;
      }
    });`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/LearningHoursReport.tsx', code);
    console.log("Successfully patched deduplication in LearningHoursReport.tsx");
} else {
    console.log("Could not find the block to replace in LearningHoursReport.tsx");
}
