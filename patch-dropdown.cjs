const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

const regex = /let finalSubjects = fetchedAvailableSubjects;\s*if\s*\(currentTeacher\s*&&\s*!\['admin',\s*'academic',\s*'deputy'\]\.includes\(currentTeacher\.role\)\)\s*\{[\s\S]*?\}\s*\}/m;

const replacement = `let finalSubjects = fetchedAvailableSubjects;
                      if (currentTeacher && !['admin', 'academic', 'deputy'].includes(currentTeacher.role)) {
                        const teacherSubjectsForGrade = new Set<string>(
                          schedules
                            .filter(s => s.teacherId === currentTeacher.id && s.gradeLevel === selectedGrade)
                            .map(s => s.subject === 'อื่นๆ' ? (s.customSubject || s.subject) : s.subject)
                        );
                        if (teacherSubjectsForGrade.size > 0) {
                            // Filter grouped data
                            finalSubjects = finalSubjects.map(item => {
                              if (typeof item === 'string') return item;
                              if (item.type === 'header') return item; // Keep headers initially
                              if (item.type === 'single') {
                                return teacherSubjectsForGrade.has(item.name) ? item : null;
                              }
                              if (item.type === 'group') {
                                // For groups (Parent subjects), if the teacher teaches ANY child subject, show the group with ONLY those child subjects
                                // OR if the teacher is assigned to the Parent subject itself, show it.
                                const validChildren = item.subjects.filter((sub: string) => teacherSubjectsForGrade.has(sub));
                                if (validChildren.length > 0 || teacherSubjectsForGrade.has(item.groupName)) {
                                  return { ...item, subjects: validChildren.length > 0 ? validChildren : item.subjects };
                                }
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
                        } else {
                            // Teacher has no schedules for this grade, show nothing except headers which will be filtered out
                            finalSubjects = [];
                        }
                      }`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/EvaluationModule.tsx', code);
    console.log("Successfully patched dropdown filtering in EvaluationModule.tsx");
} else {
    console.log("Could not find the dropdown filtering block");
}
