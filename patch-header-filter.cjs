const fs = require('fs');
let content = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

const targetStr = `                        if (teacherSubjectsForGrade.size > 0) {
                            // Filter grouped data
                            finalSubjects = finalSubjects.map(item => {
                              if (typeof item === 'string') return item;
                              if (item.type === 'single' && teacherSubjectsForGrade.has(item.name)) return item;
                              if (item.type === 'group') {
                                const validChildren = item.subjects.filter((sub: string) => teacherSubjectsForGrade.has(sub));
                                if (validChildren.length > 0) return { ...item, subjects: validChildren };
                              }
                              return null;
                            }).filter(Boolean);
                        }`;

const newTargetStr = `                        if (teacherSubjectsForGrade.size > 0) {
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
                        }`;

content = content.replace(targetStr, newTargetStr);
fs.writeFileSync('src/components/EvaluationModule.tsx', content);
console.log("Patched EvaluationModule to handle header filtering");
