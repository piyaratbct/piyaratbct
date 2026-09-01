const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `        ) : activeModule === "discipline" ? (
          <div className="relative animate-in fade-in duration-300">
            <DisciplineModule
              currentTeacher={currentTeacher}
              systemSemester={systemSemester}
              systemAcademicYear={systemAcademicYear}
              students={students}
            />
          </div>
        ) : activeModule === "admission" ? (
          <div className="relative animate-in fade-in duration-300">
            <LessonAdmitModule
              currentTeacher={currentTeacher}
              systemSemester={systemSemester}
              systemAcademicYear={systemAcademicYear}
              students={students}
            />
          </div>
        ) : activeModule === "users" ? (`;

code = code.replace(/        \) : activeModule === "users" \? \(/, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Modules added back!");
