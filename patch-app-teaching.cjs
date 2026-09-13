const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const stateBlock = `  const [evalInitialTab, setEvalInitialTab] = useState<'overview' | 'grades' | 'kindergarten' | 'attendance' | 'learning_hours' | 'character' | undefined>(undefined);
  const [evalInitialSubject, setEvalInitialSubject] = useState<string | undefined>(undefined);
  const [evalInitialGrade, setEvalInitialGrade] = useState<string | undefined>(undefined);`;

const newStateBlock = `  const [evalInitialTab, setEvalInitialTab] = useState<'overview' | 'grades' | 'kindergarten' | 'attendance' | 'learning_hours' | 'character' | undefined>(undefined);
  const [evalInitialSubject, setEvalInitialSubject] = useState<string | undefined>(undefined);
  const [evalInitialGrade, setEvalInitialGrade] = useState<string | undefined>(undefined);

  const [teachingInitialSubject, setTeachingInitialSubject] = useState<string | undefined>(undefined);
  const [teachingInitialGrade, setTeachingInitialGrade] = useState<string | undefined>(undefined);`;

if (!content.includes('teachingInitialSubject')) {
  content = content.replace(stateBlock, newStateBlock);
}

const dashRegex = /<TeacherSubjectsDashboard[\s\S]*?\/>/;
const newDash = `<TeacherSubjectsDashboard 
              currentTeacher={currentTeacher} 
              systemSemester={systemSemester} 
              systemAcademicYear={systemAcademicYear} 
              onNavigateToSubject={(subject, grade) => {
                 setSelectedHubSubject({ subjectName: subject, gradeLevel: grade });
              }}
              onAction={(action, subject, grade) => {
                 if (action === 'gradebook') {
                   setEvalInitialTab('grades');
                   setEvalInitialSubject(subject);
                   setEvalInitialGrade(grade);
                   setActiveModule('analytics');
                 } else if (action === 'plans') {
                   setTeachingInitialSubject(subject);
                   setTeachingInitialGrade(grade);
                   setActiveTab('plan-list');
                   setActiveModule('teaching');
                 } else if (action === 'logs') {
                   setTeachingInitialSubject(subject);
                   setTeachingInitialGrade(grade);
                   setActiveTab('dashboard');
                   setActiveModule('teaching');
                 }
              }}
            />`;

content = content.replace(dashRegex, newDash);

const logListStr = `<LessonLogList
                  records={records}
                  teachers={teachers}`;
const newLogListStr = `<LessonLogList
                  records={records}
                  teachers={teachers}
                  initialSubject={teachingInitialSubject}
                  initialGrade={teachingInitialGrade}`;
content = content.replace(logListStr, newLogListStr);

const planListStr = `<LessonPlanList
                  plans={plans}
                  records={records}`;
const newPlanListStr = `<LessonPlanList
                  plans={plans}
                  records={records}
                  initialSubject={teachingInitialSubject}
                  initialGrade={teachingInitialGrade}`;
content = content.replace(planListStr, newPlanListStr);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx for teaching module shortcuts");
