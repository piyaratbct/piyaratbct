const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

const printScoreButton = `                  <button
                    onClick={() => setShowPrintScore(true)}
                    className="w-full justify-center sm:w-auto flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm whitespace-nowrap"
                  >
                    <Printer className="h-4 w-4" /> พิมพ์ (ปพ.5)
                  </button>`;

const printBothButtons = `                  <button
                    onClick={() => setShowPrintAttendance(true)}
                    className="w-full justify-center sm:w-auto flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm whitespace-nowrap"
                  >
                    <Printer className="h-4 w-4" /> พิมพ์เวลาเรียน
                  </button>
                  <button
                    onClick={() => setShowPrintScore(true)}
                    className="w-full justify-center sm:w-auto flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm whitespace-nowrap"
                  >
                    <Printer className="h-4 w-4" /> พิมพ์คะแนน (ปพ.5)
                  </button>`;

code = code.replace(printScoreButton, printBothButtons);

// and add the modal rendering
const scoreModal = `{showPrintScore && (
        <SubjectScorePrintTemplate`;

const bothModals = `{showPrintAttendance && (
        <AttendancePrintTemplate
          students={students.filter(s => s.gradeLevel === selectedGrade)}
          attendanceStats={attendanceStats}
          subject={selectedSubject}
          gradeLevel={selectedGrade}
          academicYear={systemAcademicYear || "2567"}
          semester={systemSemester || "1"}
          onClose={() => setShowPrintAttendance(false)}
        />
      )}

      {showPrintScore && (
        <SubjectScorePrintTemplate`;

code = code.replace(scoreModal, bothModals);

fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf-8');
console.log("Patched buttons and modals");
