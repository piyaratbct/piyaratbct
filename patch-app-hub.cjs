const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import
if (!content.includes('ClassroomHub')) {
  content = content.replace(
    /import { TeacherSubjectsDashboard } from "\.\/components\/TeacherSubjectsDashboard";/,
    `import { TeacherSubjectsDashboard } from "./components/TeacherSubjectsDashboard";\nimport { ClassroomHub } from "./components/ClassroomHub";`
  );
}

// 2. Add State
if (!content.includes('const [selectedHubSubject')) {
  content = content.replace(
    /const \[activeModule, setActiveModule\] = useState</,
    `const [selectedHubSubject, setSelectedHubSubject] = useState<{subjectName: string, gradeLevel: string} | null>(null);\n  const [activeModule, setActiveModule] = useState<`
  );
}

// 3. Update TeacherSubjectsDashboard callback
const oldCallback = `onNavigateToSubject={(subject, grade) => {
                 // Future integration: Redirect to ClassroomHub
                 console.log("Navigate to", subject, grade);
                 // Fallback for now: redirect to lesson class module
                 setActiveModule("classroom");
              }}`;

const newCallback = `onNavigateToSubject={(subject, grade) => {
                 setSelectedHubSubject({ subjectName: subject, gradeLevel: grade });
              }}`;
if (content.includes(oldCallback)) {
  content = content.replace(oldCallback, newCallback);
}

// 4. Render ClassroomHub
const renderHub = `
      {/* Classroom Hub Overlay */}
      {selectedHubSubject && currentTeacher && (
        <ClassroomHub
          subjectName={selectedHubSubject.subjectName}
          gradeLevel={selectedHubSubject.gradeLevel}
          currentTeacher={currentTeacher}
          systemSemester={systemSemester}
          systemAcademicYear={systemAcademicYear}
          students={students}
          onClose={() => setSelectedHubSubject(null)}
        />
      )}
    </div>
  );
}
`;

if (!content.includes('<ClassroomHub')) {
  content = content.replace(
    /    <\/div>\n  \);\n}\n$/,
    renderHub
  );
}

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx patched for ClassroomHub');
