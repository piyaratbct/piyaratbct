const fs = require('fs');
let code = fs.readFileSync('src/components/AttendancePrintTemplate.tsx', 'utf-8');

const oldHeader = `<PrintHeader
            title="รายงานเวลาเรียน (ปพ.5)"
            subject={subject}
            gradeLevel={gradeLevel}
            academicYear={academicYear}
            semester={semester}
          />`;

const newHeader = `<PrintHeader
            title="รายงานเวลาเรียน (ปพ.5)"
            subtitle={
              <div className="flex justify-center items-center gap-6 mt-2 text-sm text-slate-600">
                <p>
                  <strong>รายวิชา:</strong> {subject}
                </p>
                <p>
                  <strong>ระดับชั้น:</strong> {gradeLevel}
                </p>
                <p>
                  <strong>ภาคเรียนที่:</strong> {semester}
                </p>
                <p>
                  <strong>ปีการศึกษา:</strong> {academicYear}
                </p>
                <p className="text-xs text-slate-400 ml-4">หน้า {pageIndex + 1}/{pages.length}</p>
              </div>
            }
          />`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('src/components/AttendancePrintTemplate.tsx', code, 'utf-8');
console.log("Patched Attendance Print Header");
