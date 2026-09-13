const fs = require('fs');

let content = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

// Use hook at top of component
content = content.replace(/export function EvaluationModule\([^)]+\) \{/g, 'export function EvaluationModule(props: Props) {');
content = content.replace(/export function EvaluationModule\(props: Props\) \{/, 'export function EvaluationModule(props: Props) {\n  const fetchedAvailableSubjects = useAvailableSubjects();');

// Replace SUBJECTS logic in grade filter
// In EvaluationModule, it currently maps availableGrades.
// The Subject dropdown maps SUBJECTS
content = content.replace(/let availableSubjects = SUBJECTS;/g, `
                      let finalSubjects = fetchedAvailableSubjects;
                      if (currentTeacher && !['admin', 'academic', 'deputy'].includes(currentTeacher.role)) {
                        const teacherSubjectsForGrade = new Set<string>(schedules.filter(s => s.teacherId === currentTeacher.id && s.gradeLevel === selectedGrade).map(s => s.subject === 'อื่นๆ' ? (s.customSubject || s.subject) : s.subject));
                        if (teacherSubjectsForGrade.size > 0) {
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
                        }
                      }
`);

content = content.replace(/return availableSubjects\.filter\(s => \{[\s\S]*?\}\)\.map\(s => \(\s*<option key=\{s\} value=\{s\}>\{s\}<\/option>\s*\)\);/g, `
                      return finalSubjects.map((s: any, idx: number) => {
                        if (typeof s === 'string') {
                          return <option key={\`s-\${idx}\`} value={s}>{s}</option>;
                        } else if (s.type === 'single') {
                          return <option key={\`s-\${idx}\`} value={s.name}>{s.name}</option>;
                        } else if (s.type === 'group') {
                          return (
                            <optgroup key={\`g-\${idx}\`} label={s.groupName}>
                              {s.subjects.map((sub: string) => <option key={sub} value={sub}>{sub}</option>)}
                            </optgroup>
                          );
                        }
                        return null;
                      });
`);

fs.writeFileSync('src/components/EvaluationModule.tsx', content);
console.log("Patched EvaluationModule subject dropdown");
