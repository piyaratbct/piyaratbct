const fs = require('fs');
let code = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

// 1. Replace subjectGroups declaration
const declRegex = /const subjectGroups: Record<string, Record<string, \{ periods: number, days: number\[\], teachers: Set<string>, seenPeriods: Set<string> \}>> = \{\};/;
const declReplacement = `const subjectGroups: Record<string, Record<string, { periods: number, days: number[], teachers: Set<string>, seenPeriods: Set<string>, childSubjects: Record<string, { periods: number, days: number[], teachers: Set<string>, seenPeriods: Set<string> }> }>> = {};`;
code = code.replace(declRegex, declReplacement);

// 2. Replace the grouping logic
const logicRegex = /roomsList\.forEach\(room => \{[\s\S]*?\}\); \/\/ end roomsList/;
const logicReplacement = `
                  // Find curriculum for this scheduled subject
                  const safeSub = (subjectName || '').trim();
                  let curriculumMatch = curriculums.find(c => (c.subjectName || '').trim() === safeSub && (c.gradeLevel === baseGrade || (c.gradeLevels && c.gradeLevels.includes(baseGrade))));
                  if (!curriculumMatch) curriculumMatch = curriculums.find(c => (c.subjectName || '').trim() === safeSub);
                  
                  let groupName = subjectName;
                  let childName = null;
                  
                  if (curriculumMatch && curriculumMatch.parentId) {
                      const parentMatch = curriculums.find(c => c.id === curriculumMatch.parentId);
                      if (parentMatch && parentMatch.subjectName) {
                          groupName = parentMatch.subjectName;
                          childName = subjectName;
                      }
                  }

                  roomsList.forEach(room => {
                      if (!subjectGroups[groupName]) {
                         subjectGroups[groupName] = {};
                      }
                      if (!subjectGroups[groupName][room]) {
                         subjectGroups[groupName][room] = { periods: 0, days: [], teachers: new Set(), seenPeriods: new Set(), childSubjects: {} };
                      }
                      
                      const periodSig = \`\${curr.dayOfWeek}-\${curr.period}\`;
                      const teacher = teachers.find(t => t.id === curr.teacherId);
                      const tName = teacher ? (teacher.displayName || teacher.thaiName || '') : '';
                      
                      if (childName) {
                          if (!subjectGroups[groupName][room].childSubjects[childName]) {
                              subjectGroups[groupName][room].childSubjects[childName] = { periods: 0, days: [], teachers: new Set(), seenPeriods: new Set() };
                          }
                          if (!subjectGroups[groupName][room].childSubjects[childName].seenPeriods.has(periodSig)) {
                              subjectGroups[groupName][room].childSubjects[childName].seenPeriods.add(periodSig);
                              subjectGroups[groupName][room].childSubjects[childName].periods += 1;
                              subjectGroups[groupName][room].childSubjects[childName].days.push(curr.dayOfWeek);
                              
                              // Add to parent as well (only if the parent hasn't seen this period FOR THIS CHILD, but actually parent periods are sum of child periods, we can just sum them without cross-child dedup)
                              // Wait, what if two children are taught in the same period? Rare, but we just sum them.
                              // Better to just track parent seenPeriods using a composite key: childName-periodSig to prevent deduping different children, 
                              // BUT if it's the SAME child, dedup it.
                              const parentSig = \`\${childName}-\${periodSig}\`;
                              if (!subjectGroups[groupName][room].seenPeriods.has(parentSig)) {
                                  subjectGroups[groupName][room].seenPeriods.add(parentSig);
                                  subjectGroups[groupName][room].periods += 1;
                                  subjectGroups[groupName][room].days.push(curr.dayOfWeek);
                              }
                          }
                          if (tName) {
                              subjectGroups[groupName][room].childSubjects[childName].teachers.add(tName);
                              subjectGroups[groupName][room].teachers.add(tName);
                          }
                      } else {
                          // No parent, standalone
                          if (!subjectGroups[groupName][room].seenPeriods.has(periodSig)) {
                              subjectGroups[groupName][room].seenPeriods.add(periodSig);
                              subjectGroups[groupName][room].periods += 1;
                              subjectGroups[groupName][room].days.push(curr.dayOfWeek);
                          }
                          if (tName) {
                              subjectGroups[groupName][room].teachers.add(tName);
                          }
                      }
                  }); // end roomsList`;

code = code.replace(logicRegex, logicReplacement);

// 3. Update UI rendering to show children
const uiRegex = /<td className="py-4 px-6 font-bold text-slate-800 align-top">\{sub\}<\/td>/;
const uiReplacement = `<td className="py-4 px-6 align-top">
                                  <div className="font-bold text-slate-800">{sub}</div>
                                  {Object.keys(rooms).length > 0 && Object.keys(Object.values(rooms)[0].childSubjects).length > 0 && (
                                      <div className="mt-2 pl-3 border-l-2 border-indigo-200 space-y-1">
                                          {Object.keys(Object.values(rooms)[0].childSubjects).map(child => (
                                              <div key={child} className="text-xs text-slate-600 flex items-center gap-1">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-300"></span>
                                                  {child}
                                              </div>
                                          ))}
                                      </div>
                                  )}
                                </td>`;
code = code.replace(uiRegex, uiReplacement);

fs.writeFileSync('src/components/ScheduleManager.tsx', code);
console.log('Patched ScheduleManager.tsx');
