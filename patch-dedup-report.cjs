const fs = require('fs');

let content = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

content = content.replace(
  /const subjectMap: Record<string, \{([\s\S]*?)\}> = \{\};/,
  `const subjectMap: Record<string, {$1}> = {};
    const seenPeriodsPerSubject: Record<string, Set<string>> = {};
    const seenSessionsPerSubject: Record<string, Set<string>> = {};`
);

content = content.replace(
  `            subjectMap[subjectName].teacherName += \`, \${sch.teacherName}\`;
        }
      }
      
      subjectMap[subjectName].periodsPerWeek += 1;
    });`,
  `            subjectMap[subjectName].teacherName += \`, \${sch.teacherName}\`;
        }
      }
      
      if (!seenPeriodsPerSubject[subjectName]) seenPeriodsPerSubject[subjectName] = new Set();
      const periodSig = \`\${sch.semester}-\${sch.dayOfWeek}-\${sch.period}\`;
      if (!seenPeriodsPerSubject[subjectName].has(periodSig)) {
         seenPeriodsPerSubject[subjectName].add(periodSig);
         subjectMap[subjectName].periodsPerWeek += 1;
      }
    });`
);

content = content.replace(
  `          dataSource: 'session'
        };
      }
      subjectMap[subjectName].taughtPeriods += 1;
      
      // Update last taught date`,
  `          dataSource: 'session'
        };
      }
      
      if (!seenSessionsPerSubject[subjectName]) seenSessionsPerSubject[subjectName] = new Set();
      const sessionSig = \`\${sess.date}-\${sess.period}\`;
      if (!seenSessionsPerSubject[subjectName].has(sessionSig)) {
         seenSessionsPerSubject[subjectName].add(sessionSig);
         subjectMap[subjectName].taughtPeriods += 1;
      }
      
      // Update last taught date`
);

fs.writeFileSync('src/components/LearningHoursReport.tsx', content);
console.log("Patched LearningHoursReport dedup");
