const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('const [classroomInitialTab')) {
  const targetStateStr = `  const [teachingInitialSubject, setTeachingInitialSubject] = useState<string | undefined>(undefined);
  const [teachingInitialGrade, setTeachingInitialGrade] = useState<string | undefined>(undefined);`;
  
  const newStateStr = `  const [teachingInitialSubject, setTeachingInitialSubject] = useState<string | undefined>(undefined);
  const [teachingInitialGrade, setTeachingInitialGrade] = useState<string | undefined>(undefined);

  const [classroomInitialTab, setClassroomInitialTab] = useState<'students' | 'student360' | 'attendance' | 'assessments' | 'special-care' | undefined>(undefined);`;
  
  content = content.replace(targetStateStr, newStateStr);
}

const actionOld = `                 } else if (action === 'attendance') {
                   setEvalInitialTab('attendance');
                   setEvalInitialSubject(subject);
                   setEvalInitialGrade(grade);
                   setActiveModule('analytics');
                 }`;

const actionNew = `                 } else if (action === 'attendance') {
                   setClassroomInitialTab('attendance');
                   setActiveModule('classroom');
                 }`;

content = content.replace(actionOld, actionNew);

const moduleOld = `<ClassroomModule
            currentTeacher={currentTeacher}
            systemAcademicYear={systemAcademicYear}
            systemSemester={systemSemester}
            teachers={teachers}
          />`;

const moduleNew = `<ClassroomModule
            currentTeacher={currentTeacher}
            systemAcademicYear={systemAcademicYear}
            systemSemester={systemSemester}
            teachers={teachers}
            initialTab={classroomInitialTab}
          />`;

content = content.replace(moduleOld, moduleNew);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx for classroom initial tab routing");
