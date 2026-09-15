const fs = require('fs');
let code = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

const logicRegex = /gradeSchedules\.forEach\(sch => \{[\s\S]*?subjectMap\[subjectName\]\.periodsPerWeek \+\= 1;\s*\}\s*\}\);/;
const logicReplacement = `gradeSchedules.forEach(sch => {
      let subjectName = sch.subject === 'อื่นๆ' ? (sch.customSubject || 'อื่นๆ') : sch.subject;
      const safeSub = (subjectName || '').trim();
      let currMatch = curriculums.find(c => (c.subjectName || '').trim() === safeSub && (c.gradeLevel === targetBaseGrade || (c.gradeLevels && c.gradeLevels.includes(targetBaseGrade))));
      if (!currMatch) currMatch = curriculums.find(c => (c.subjectName || '').trim() === safeSub);
      
      let isChild = false;
      let childName = subjectName;
      if (currMatch && currMatch.parentId) {
          const parentMatch = curriculums.find(c => c.id === currMatch.parentId);
          if (parentMatch && parentMatch.subjectName) {
              subjectName = parentMatch.subjectName; // Group under parent
              isChild = true;
          }
      }

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
      
      // For children, we track uniqueness per child subject to allow same period across different child subjects (rare but possible),
      // OR we just assume they teach different periods. If it's the SAME child subject, deduplicate.
      const periodSig = isChild ? \`\${childName}-\${sch.dayOfWeek}-\${sch.period}\` : \`\${sch.dayOfWeek}-\${sch.period}\`;
      if (!seenPeriodsPerSubject[subjectName].has(periodSig)) {
         seenPeriodsPerSubject[subjectName].add(periodSig);
         subjectMap[subjectName].periodsPerWeek += 1;
      }
    });`;

if (code.match(/gradeSchedules\.forEach\(sch => \{/)) {
    code = code.replace(logicRegex, logicReplacement);
    fs.writeFileSync('src/components/LearningHoursReport.tsx', code);
    console.log("Patched LearningHoursReport.tsx");
} else {
    console.log("Could not find regex in LearningHoursReport");
}
