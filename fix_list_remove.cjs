const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanList.tsx', 'utf8');

code = code.replace(/const currentUserEmail = currentTeacher\?\.email;\n\s*const isCollaborator = plan\.collaborators && currentUserEmail \? plan\.collaborators\.includes\(currentUserEmail\) : false;\n/, '');
code = code.replace(/if \(\(isOwner \|\| isCoTeacher \|\| isCollaborator\) && !isApproved\) \{/, 'if ((isOwner || isCoTeacher) && !isApproved) {');

fs.writeFileSync('src/components/LessonPlanList.tsx', code, 'utf8');
