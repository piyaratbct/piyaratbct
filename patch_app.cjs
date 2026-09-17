const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('classroomInitialGrade')) {
  // Add state variables
  code = code.replace(
    /const \[classroomInitialTab, setClassroomInitialTab\] = useState<'students' \| 'student360' \| 'attendance' \| 'assessments' \| 'special-care' \| undefined>\(undefined\);/,
    `const [classroomInitialTab, setClassroomInitialTab] = useState<'students' | 'student360' | 'attendance' | 'assessments' | 'special-care' | undefined>(undefined);\n  const [classroomInitialGrade, setClassroomInitialGrade] = useState<string | undefined>(undefined);\n  const [classroomInitialSubject, setClassroomInitialSubject] = useState<string | undefined>(undefined);`
  );
  
  // Update onAction
  code = code.replace(
    /\} else if \(action === 'attendance'\) \{\s*setClassroomInitialTab\('attendance'\);\s*setActiveModule\('classroom'\);\s*\}/,
    `} else if (action === 'attendance') {
                   setClassroomInitialTab('attendance');
                   setClassroomInitialGrade(grade);
                   setClassroomInitialSubject(subject);
                   setActiveModule('classroom');
                 }`
  );
  
  // Pass to ClassroomModule
  code = code.replace(
    /<ClassroomModule\s+currentTeacher=\{currentTeacher\}\s+systemAcademicYear=\{systemAcademicYear\}\s+systemSemester=\{systemSemester\}\s+teachers=\{teachers\}\s+initialTab=\{classroomInitialTab\}\s*\/>/,
    `<ClassroomModule
            currentTeacher={currentTeacher}
            systemAcademicYear={systemAcademicYear}
            systemSemester={systemSemester}
            teachers={teachers}
            initialTab={classroomInitialTab}
            initialGrade={classroomInitialGrade}
            initialSubject={classroomInitialSubject}
          />`
  );

  fs.writeFileSync('src/App.tsx', code);
  console.log('Patched App.tsx');
}
