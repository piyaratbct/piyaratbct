const fs = require('fs');
let code = fs.readFileSync('src/components/SubjectScorePrintTemplate.tsx', 'utf-8');

// 1. Add attendanceStats to props
code = code.replace(
  "  teacherName?: string;",
  "  teacherName?: string;\n  attendanceStats?: {\n    totalTargetPeriods: number;\n    studentStats: Record<string, { present: number; leave: number; sick: number; absent: number; late: number; }>;\n  };"
);

// 2. Destructure attendanceStats
code = code.replace(
  "  teacherName = \".......................................................\",",
  "  teacherName = \".......................................................\",\n  attendanceStats,"
);

// 3. Helper to calculate attendance %
const getAttendanceText = `  const getStudentAttendance = (studentId: string) => {
    if (!attendanceStats) return "-";
    const stats = attendanceStats.studentStats[studentId];
    if (!stats) return "-";
    const totalAttended = stats.present + stats.late;
    const totalRecords = stats.present + stats.late + stats.leave + stats.sick + stats.absent;
    const baseTotal = attendanceStats.totalTargetPeriods > 0 ? attendanceStats.totalTargetPeriods : totalRecords;
    if (baseTotal === 0) return "-";
    return ((totalAttended / baseTotal) * 100).toFixed(1) + "%";
  };`

code = code.replace(
  "  return (",
  getAttendanceText + "\n\n  return ("
);

// 4. Update the first table (Normal Subjects)
// Header
code = code.replace(
  "<th className=\"border border-slate-900 px-4 py-2 text-left whitespace-nowrap\" rowSpan={2}>ชื่อ-นามสกุล</th>\n                  <th className=\"border border-slate-900 px-2 py-1 text-center\" colSpan={4}>ระหว่างเรียน (70)</th>",
  "<th className=\"border border-slate-900 px-4 py-2 text-left whitespace-nowrap\" rowSpan={2}>ชื่อ-นามสกุล</th>\n                  <th className=\"border border-slate-900 px-2 py-2 text-center w-12 text-[10px] leading-tight\" rowSpan={2}>เวลาเรียน<br/>(%)</th>\n                  <th className=\"border border-slate-900 px-2 py-1 text-center\" colSpan={4}>ระหว่างเรียน (70)</th>"
);
// Row
code = code.replace(
  "                      <td className=\"border border-slate-900 px-4 py-1 text-left whitespace-nowrap\">\n                        {st.firstName} {st.lastName}\n                      </td>\n                      <td className=\"border border-slate-900 px-2 py-1 text-center\">{score.beforeMidKnowledgeScore || 0}</td>",
  "                      <td className=\"border border-slate-900 px-4 py-1 text-left whitespace-nowrap\">\n                        {st.firstName} {st.lastName}\n                      </td>\n                      <td className=\"border border-slate-900 px-2 py-1 text-center text-xs text-slate-600\">{getStudentAttendance(st.id)}</td>\n                      <td className=\"border border-slate-900 px-2 py-1 text-center\">{score.beforeMidKnowledgeScore || 0}</td>"
);

// 5. Update the second table (กิจกรรมอ่าน-เขียน)
// Header
code = code.replace(
  "<th className=\"border border-slate-900 px-4 py-2 text-left whitespace-nowrap\" rowSpan={2}>ชื่อ-นามสกุล</th>\n                  <th className=\"border border-slate-900 px-2 py-2 text-center\" colSpan={5}>ตัวชี้วัด (3, 2, 1, 0)</th>",
  "<th className=\"border border-slate-900 px-4 py-2 text-left whitespace-nowrap\" rowSpan={2}>ชื่อ-นามสกุล</th>\n                  <th className=\"border border-slate-900 px-2 py-2 text-center w-12 text-[10px] leading-tight\" rowSpan={2}>เวลาเรียน<br/>(%)</th>\n                  <th className=\"border border-slate-900 px-2 py-2 text-center\" colSpan={5}>ตัวชี้วัด (3, 2, 1, 0)</th>"
);
// Row
code = code.replace(
  "                      <td className=\"border border-slate-900 px-4 py-1 text-left whitespace-nowrap\">\n                        {st.firstName} {st.lastName}\n                      </td>\n                      <td className=\"border border-slate-900 px-2 py-1 text-center\">{score.activities?.rw1 ?? \"-\"}</td>",
  "                      <td className=\"border border-slate-900 px-4 py-1 text-left whitespace-nowrap\">\n                        {st.firstName} {st.lastName}\n                      </td>\n                      <td className=\"border border-slate-900 px-2 py-1 text-center text-xs text-slate-600\">{getStudentAttendance(st.id)}</td>\n                      <td className=\"border border-slate-900 px-2 py-1 text-center\">{score.activities?.rw1 ?? \"-\"}</td>"
);

// 6. The third table (กิจกรรมลูกเสือ) ALREADY HAS a เวลาเรียน column!
// Let's modify its value!
code = code.replace(
  "<td className=\"border border-slate-900 px-4 py-2 text-center bg-slate-50\">{score.totalScore || 0}</td>\n                      <td className=\"border border-slate-900 px-4 py-2 text-center font-bold text-lg\">{calculateGrade(score.totalScore || 0, subject, score.activities) || \"-\"}</td>",
  "<td className=\"border border-slate-900 px-4 py-2 text-center bg-slate-50\">{getStudentAttendance(st.id)}</td>\n                      <td className=\"border border-slate-900 px-4 py-2 text-center font-bold text-lg\">{calculateGrade(score.totalScore || 0, subject, score.activities) || \"-\"}</td>"
);

fs.writeFileSync('src/components/SubjectScorePrintTemplate.tsx', code, 'utf-8');
console.log("Patched SubjectScorePrintTemplate");
