const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetProps = `                  currentUserRole={currentTeacher.role}
                  systemAcademicYear={systemAcademicYear}`;

const replacementProps = `                  currentUserRole={currentTeacher.role}
                  currentUserName={currentTeacher.name}
                  systemAcademicYear={systemAcademicYear}`;

code = code.replace(targetProps, replacementProps);
fs.writeFileSync('src/App.tsx', code, 'utf8');
