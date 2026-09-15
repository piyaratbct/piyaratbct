const fs = require('fs');
let code = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

const regex = /subjectMap\[subjectName\]\.taughtPeriods \+\= 1;/g;

const replacement = `if (!seenSessionsPerSubject[subjectName]) {
         seenSessionsPerSubject[subjectName] = new Set();
      }
      const sessionSig = \`\${sess.date}-\${sess.period}\`;
      if (!seenSessionsPerSubject[subjectName].has(sessionSig)) {
         seenSessionsPerSubject[subjectName].add(sessionSig);
         subjectMap[subjectName].taughtPeriods += 1;
      }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/LearningHoursReport.tsx', code);
