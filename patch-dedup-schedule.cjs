const fs = require('fs');

let content = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

content = content.replace(
  `const subjectGroups: Record<string, Record<string, { periods: number, days: number[], teachers: Set<string> }>> = {};`,
  `const subjectGroups: Record<string, Record<string, { periods: number, days: number[], teachers: Set<string>, seenPeriods: Set<string> }>> = {};`
);

content = content.replace(
  `                  if (!subjectGroups[subjectName][room]) {
                     subjectGroups[subjectName][room] = { periods: 0, days: [], teachers: new Set() };
                  }
                  subjectGroups[subjectName][room].periods += 1;
                  subjectGroups[subjectName][room].days.push(curr.dayOfWeek);`,
  `                  if (!subjectGroups[subjectName][room]) {
                     subjectGroups[subjectName][room] = { periods: 0, days: [], teachers: new Set(), seenPeriods: new Set() };
                  }
                  
                  const periodSig = \`\${curr.dayOfWeek}-\${curr.period}\`;
                  if (!subjectGroups[subjectName][room].seenPeriods.has(periodSig)) {
                     subjectGroups[subjectName][room].seenPeriods.add(periodSig);
                     subjectGroups[subjectName][room].periods += 1;
                     subjectGroups[subjectName][room].days.push(curr.dayOfWeek);
                  }`
);

fs.writeFileSync('src/components/ScheduleManager.tsx', content);
console.log("Patched ScheduleManager dedup");
