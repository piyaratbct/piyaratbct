const fs = require('fs');
let code = fs.readFileSync('src/components/SubjectScorePrintTemplate.tsx', 'utf-8');

// 1. Remove attendanceStats from props interface
code = code.replace(
  "  teacherName?: string;\n  attendanceStats?: {\n    totalTargetPeriods: number;\n    studentStats: Record<string, { present: number; leave: number; sick: number; absent: number; late: number; }>;\n  };",
  "  teacherName?: string;"
);

// 2. Remove from destructured props
code = code.replace(
  "  teacherName = \".......................................................\",\n  attendanceStats,",
  "  teacherName = \"......................................................\","
);

// 3. Remove getStudentAttendance function
const getStudentAttendanceStr = `  const getStudentAttendance = (studentId: string) => {
    if (!attendanceStats) return "-";
    const stats = attendanceStats.studentStats[studentId];
    if (!stats) return "-";
    const totalAttended = stats.present + stats.late;
    const totalRecords = stats.present + stats.late + stats.leave + stats.sick + stats.absent;
    const baseTotal = attendanceStats.totalTargetPeriods > 0 ? attendanceStats.totalTargetPeriods : totalRecords;
    if (baseTotal === 0) return "-";
    return ((totalAttended / baseTotal) * 100).toFixed(1) + "%";
  };

`;
code = code.replace(getStudentAttendanceStr, "");

// 4. Revert Normal Table Header
code = code.replace(
  `<th rowSpan={2} className="border border-slate-900 px-4 py-2 text-left whitespace-nowrap">ชื่อ-นามสกุล</th>
                  <th rowSpan={2} className="border border-slate-900 px-2 py-2 text-center w-12 text-[10px] leading-tight">เวลาเรียน<br/>(%)</th>
                  <th colSpan={4} className="border border-slate-900 px-2 py-2 text-center">คะแนนระหว่างเรียน (60)</th>`,
  `<th rowSpan={2} className="border border-slate-900 px-4 py-2 text-left whitespace-nowrap">ชื่อ-นามสกุล</th>
                  <th colSpan={4} className="border border-slate-900 px-2 py-2 text-center">คะแนนระหว่างเรียน (60)</th>`
);

// Revert Normal Table Row
code = code.replace(
  /<td className="border border-slate-900 px-4 py-1 text-left whitespace-nowrap">\s*\{st\.firstName\} \{st\.lastName\}\s*<\/td>\s*<td className="border border-slate-900 px-2 py-1 text-center text-xs text-slate-600">\{getStudentAttendance\(st\.id\)\}<\/td>/g,
  `<td className="border border-slate-900 px-4 py-1 text-left whitespace-nowrap">\n                        {st.firstName} {st.lastName}\n                      </td>`
);

// Revert กิจกรรมอ่าน-เขียน Table Header
code = code.replace(
  `<th className="border border-slate-900 px-4 py-2 text-left whitespace-nowrap" rowSpan={2}>ชื่อ-นามสกุล</th>
                  <th className="border border-slate-900 px-2 py-2 text-center w-12 text-[10px] leading-tight" rowSpan={2}>เวลาเรียน<br/>(%)</th>
                  <th className="border border-slate-900 px-2 py-2 text-center" colSpan={5}>ตัวชี้วัด (3, 2, 1, 0)</th>`,
  `<th className="border border-slate-900 px-4 py-2 text-left whitespace-nowrap" rowSpan={2}>ชื่อ-นามสกุล</th>
                  <th className="border border-slate-900 px-2 py-2 text-center" colSpan={5}>ตัวชี้วัด (3, 2, 1, 0)</th>`
);

// Revert กิจกรรมลูกเสือ (and other) Row
code = code.replace(
  /<td className="border border-slate-900 px-4 py-2 text-center bg-slate-50">\{getStudentAttendance\(st\.id\)\}<\/td>/g,
  `<td className="border border-slate-900 px-4 py-2 text-center bg-slate-50">{score.totalScore || 0}</td>`
);

fs.writeFileSync('src/components/SubjectScorePrintTemplate.tsx', code, 'utf-8');
console.log("Reverted SubjectScorePrintTemplate");
