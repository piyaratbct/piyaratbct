const fs = require('fs');
let code = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

const regex = /gradeSchedules\.forEach\(curr => \{\s*const subjectName = curr\.subject === 'อื่นๆ' \? \(curr\.customSubject \|\| 'อื่นๆ'\) : curr\.subject;\s*const room = curr\.gradeLevel;\s*if \(!subjectGroups\[subjectName\]\) \{/m;

const replacement = `gradeSchedules.forEach(curr => {
                  const subjectName = curr.subject === 'อื่นๆ' ? (curr.customSubject || 'อื่นๆ') : curr.subject;
                  const roomsList = curr.gradeLevel ? curr.gradeLevel.split(',').map(r => r.trim()).filter(r => r.startsWith(baseGrade)) : [baseGrade];
                  
                  roomsList.forEach(room => {
                  if (!subjectGroups[subjectName]) {`;

code = code.replace(regex, replacement);

const endRegex = /const teacher = teachers\.find\(t => t\.id === curr\.teacherId\);\s*if \(teacher\) \{\s*subjectGroups\[subjectName\]\[room\]\.teachers\.add\(teacher\.displayName \|\| teacher\.thaiName \|\| ''\);\s*\}\s*\}\);/m;

const endReplacement = `const teacher = teachers.find(t => t.id === curr.teacherId);
                  if (teacher) {
                    subjectGroups[subjectName][room].teachers.add(teacher.displayName || teacher.thaiName || '');
                  }
                  }); // end roomsList
                });`;

code = code.replace(endRegex, endReplacement);
fs.writeFileSync('src/components/ScheduleManager.tsx', code);
