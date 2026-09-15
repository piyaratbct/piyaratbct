const fs = require('fs');
let code = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

// Replace the seenPeriods logic to use Set for unique (day-period), not duplicate hours
const oldLogic = /const periodSig = \`\$\{curr\.dayOfWeek\}-\$\{curr\.period\}\`;\s*if \(\!subjectGroups\[subjectName\]\[room\]\.seenPeriods\.has\(periodSig\)\) \{\s*subjectGroups\[subjectName\]\[room\]\.seenPeriods\.add\(periodSig\);\s*subjectGroups\[subjectName\]\[room\]\.periods \+\= 1;\s*subjectGroups\[subjectName\]\[room\]\.days\.push\(curr\.dayOfWeek\);\s*\}/gm;

const newLogic = `const periodSig = \`\${curr.dayOfWeek}-\${curr.period}\`;
                  if (!subjectGroups[subjectName][room].seenPeriods.has(periodSig)) {
                     subjectGroups[subjectName][room].seenPeriods.add(periodSig);
                     subjectGroups[subjectName][room].periods += 1;
                     subjectGroups[subjectName][room].days.push(curr.dayOfWeek);
                  }`;

code = code.replace(oldLogic, newLogic); // Should be a no-op since this logic looks correct for unique periods

// Oh wait, why is 2/2 calculating as 40 hours?
// Let's check the display rendering:
// "จัดได้: 40 ชม. (2 คาบ) เกินมา 20 ชม."
// Wait, if 2/2 has 2 periods? Let's check the data logic:

fs.writeFileSync('src/components/ScheduleManager.tsx', code);
