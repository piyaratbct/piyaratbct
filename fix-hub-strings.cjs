const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomHub.tsx', 'utf8');

content = content.replace(
  /const gbRef = doc\(db, 'gradebooks', \\`\\\${systemAcademicYear}_\\\${systemSemester}_\\\${subjectName\.replace\(\/\\\\\\\/\\\/g, '_'\)}_\\\${gradeLevel\.replace\(\/\\\\\\\/\\\/g, '_'\)}\\`\);/g,
  "const gbRef = doc(db, 'gradebooks', `${systemAcademicYear}_${systemSemester}_${subjectName.replace(/\\//g, '_')}_${gradeLevel.replace(/\\//g, '_')}`);"
);

content = content.replace(/className={\\\`/g, "className={`");
content = content.replace(/\\\`}/g, "`}");

fs.writeFileSync('src/components/ClassroomHub.tsx', content);
