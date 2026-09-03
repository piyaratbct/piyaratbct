const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

const tNameCode = "teacherName={currentTeacher ? `${currentTeacher.firstName || ''} ${currentTeacher.lastName || ''}`.trim() : undefined}";

// AttendancePrintTemplate
code = code.replace(
  "          semester={systemSemester || \"1\"}\n          onClose={() => setShowPrintAttendance(false)}\n        />",
  "          semester={systemSemester || \"1\"}\n          " + tNameCode + "\n          onClose={() => setShowPrintAttendance(false)}\n        />"
);

// SubjectScorePrintTemplate
code = code.replace(
  "          settings={subjectSettings}\n          teacherName={undefined}\n          onClose={() => setShowPrintScore(false)}",
  "          settings={subjectSettings}\n          " + tNameCode + "\n          onClose={() => setShowPrintScore(false)}"
);

fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf-8');
console.log("Patched EvaluationModule teacherName");
