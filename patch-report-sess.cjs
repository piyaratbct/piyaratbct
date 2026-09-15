const fs = require('fs');
let code = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

const regex = /gradeSessions\.forEach\(sess => \{[\s\S]*?subjectMap\[subjectName\]\.taughtPeriods \+\= 1;\s*\}\s*\}\);/;
const replacement = `gradeSessions.forEach(sess => {
      if (!sess.subject) return;
      let subjectName = sess.subject;
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
          teacherName: sess.teacherName || '-',
          periodsPerWeek: 0,
          curriculumYearTarget: 0,
          curriculumTermTarget: 0,
          scheduleTermTarget: 0,
          targetPeriodsTotal: 0,
          taughtPeriods: 0,
          lastTaughtDate: null,
          dataSource: 'session'
        };
      }
      
      if (!seenSessionsPerSubject[subjectName]) {
         seenSessionsPerSubject[subjectName] = new Set();
      }
      const sessionSig = isChild ? \`\${childName}-\${sess.date}-\${sess.period}\` : \`\${sess.date}-\${sess.period}\`;
      if (!seenSessionsPerSubject[subjectName].has(sessionSig)) {
         seenSessionsPerSubject[subjectName].add(sessionSig);
         subjectMap[subjectName].taughtPeriods += 1;
      }
      
      if (!subjectMap[subjectName].lastTaughtDate || sess.date > subjectMap[subjectName].lastTaughtDate) {
        subjectMap[subjectName].lastTaughtDate = sess.date;
      }
    });`;

if (code.match(/gradeSessions\.forEach\(sess => \{/)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/LearningHoursReport.tsx', code);
    console.log("Patched sessions in LearningHoursReport.tsx");
} else {
    console.log("Could not find regex");
}
