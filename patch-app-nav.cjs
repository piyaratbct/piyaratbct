const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldHub = `<ClassroomHub
          subjectName={selectedHubSubject.subjectName}
          gradeLevel={selectedHubSubject.gradeLevel}
          currentTeacher={currentTeacher}
          systemSemester={systemSemester}
          systemAcademicYear={systemAcademicYear}
          students={students}
          onClose={() => setSelectedHubSubject(null)}
        />`;

const newHub = `<ClassroomHub
          subjectName={selectedHubSubject.subjectName}
          gradeLevel={selectedHubSubject.gradeLevel}
          currentTeacher={currentTeacher}
          systemSemester={systemSemester}
          systemAcademicYear={systemAcademicYear}
          students={students}
          onClose={() => setSelectedHubSubject(null)}
          onNavigateToEvaluation={(subject, grade) => {
             setSelectedHubSubject(null);
             setEvalInitialTab('grades');
             setEvalInitialSubject(subject);
             setEvalInitialGrade(grade);
             setActiveModule('analytics');
          }}
        />`;

if (content.includes(oldHub)) {
  content = content.replace(oldHub, newHub);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched App.tsx with onNavigateToEvaluation");
} else {
  console.log("Could not find oldHub in App.tsx");
}
