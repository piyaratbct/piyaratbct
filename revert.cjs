const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

// Revert 1: Rendering
const renderRegex = /\} else if \(s\.type === 'group'\) \{[\s\S]*?return null;/m;
const originalRender = `} else if (s.type === 'group') {
                          return (
                            <optgroup key={\`g-\${idx}\`} label={s.groupName}>
                              {s.subjects.map((sub: string) => <option key={sub} value={sub}>{sub}</option>)}
                            </optgroup>
                          );
                        }
                        return null;`;
code = code.replace(renderRegex, originalRender);

// Revert 2: Filtering
const filterRegex = /let finalSubjects = fetchedAvailableSubjects;\s*if\s*\(currentTeacher\s*&&\s*!\['admin',\s*'academic',\s*'deputy'\]\.includes\(currentTeacher\.role\)\)\s*\{[\s\S]*?\}\s*\}/m;
const originalFilter = `let finalSubjects = fetchedAvailableSubjects;
                      if (currentTeacher && !['admin', 'academic', 'deputy'].includes(currentTeacher.role)) {
                        const teacherSubjectsForGrade = new Set<string>(schedules.filter(s => s.teacherId === currentTeacher.id && s.gradeLevel === selectedGrade).map(s => s.subject === 'อื่นๆ' ? (s.customSubject || s.subject) : s.subject));
                        if (teacherSubjectsForGrade.size > 0) {
                            // Filter grouped data
                            finalSubjects = finalSubjects.map(item => {
                              if (typeof item === 'string') return item;
                              if (item.type === 'header') return item; // Keep headers initially
                              if (item.type === 'single' && teacherSubjectsForGrade.has(item.name)) return item;
                              if (item.type === 'group') {
                                const validChildren = item.subjects.filter((sub: string) => teacherSubjectsForGrade.has(sub));
                                if (validChildren.length > 0) return { ...item, subjects: validChildren };
                              }
                              return null;
                            }).filter(Boolean);
                            
                            // Remove empty headers
                            finalSubjects = finalSubjects.filter((item, index, array) => {
                                if (item.type === 'header') {
                                    // A header is empty if it's the last item, or if the next item is also a header
                                    if (index === array.length - 1) return false;
                                    if (array[index + 1].type === 'header') return false;
                                }
                                return true;
                            });
                        }
                      }`;
code = code.replace(filterRegex, originalFilter);

// Revert 3: Subject Type
const subjTypeRegex = /if \(s\.type === 'group'\) return s\.groupName === selectedSubject \|\| s\.subjects\.includes\(selectedSubject\);/g;
const originalSubjType = "if (s.type === 'group') return s.subjects.includes(selectedSubject);";
code = code.replace(subjTypeRegex, originalSubjType);

fs.writeFileSync('src/components/EvaluationModule.tsx', code);
console.log("Reverted EvaluationModule.tsx");
