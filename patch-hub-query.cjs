const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomHub.tsx', 'utf8');

const oldQuery = `        const q = query(
          collection(db, 'lessonPlans'),
          where('teacherId', '==', currentTeacher.id),
          where('subject', '==', subjectName),
          where('gradeLevel', '==', gradeLevel)
        );`;

const newQuery = `        // In Firestore, if the teacher selected "อื่นๆ" and typed a custom subject, 
        // the 'subject' field might be "อื่นๆ" and the actual name is in 'customSubject'.
        // So we query by teacherId and gradeLevel, then filter in memory for simplicity.
        const q = query(
          collection(db, 'lessonPlans'),
          where('teacherId', '==', currentTeacher.id),
          where('gradeLevel', '==', gradeLevel)
        );`;

if (content.includes(oldQuery)) {
  content = content.replace(oldQuery, newQuery);
  fs.writeFileSync('src/components/ClassroomHub.tsx', content);
  console.log("Patched query!");
}

const oldFilter = `const filteredPlans = fetched.filter(p => !p.semester || p.semester === systemSemester);`;
const newFilter = `const filteredPlans = fetched.filter(p => 
          (!p.semester || p.semester === systemSemester) &&
          (p.subject === subjectName || p.customSubject === subjectName)
        );`;

content = fs.readFileSync('src/components/ClassroomHub.tsx', 'utf8');
if (content.includes(oldFilter)) {
  content = content.replace(oldFilter, newFilter);
  fs.writeFileSync('src/components/ClassroomHub.tsx', content);
  console.log("Patched filter!");
}
