const fs = require('fs');

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  if (!code.includes('const currentUserEmail')) {
    code = code.replace(/const isCoTeacher = plan\.coTeachers \? plan\.coTeachers\.includes\(currentTeacherId \|\| ''\) : false;/, 
    `const isCoTeacher = plan.coTeachers ? plan.coTeachers.includes(currentTeacherId || '') : false;
              const currentTeacher = teachers?.find(t => t.id === currentTeacherId);
              const currentUserEmail = currentTeacher?.email;
              const isCollaborator = plan.collaborators && currentUserEmail ? plan.collaborators.includes(currentUserEmail) : false;`);

    code = code.replace(/if \(\(isOwner \|\| isCoTeacher\) && !isApproved\) \{/, 
    `if ((isOwner || isCoTeacher || isCollaborator) && !isApproved) {`);

    fs.writeFileSync(file, code, 'utf8');
  }
}

processFile('src/components/LessonPlanList.tsx');
