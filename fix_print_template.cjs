const fs = require('fs');
let code = fs.readFileSync('src/components/SubjectScorePrintTemplate.tsx', 'utf-8');

// Remove the misplaced getStudentAttendance
const misplacedCode = `      const getStudentAttendance = (studentId: string) => {
    if (!attendanceStats) return "-";
    const stats = attendanceStats.studentStats[studentId];
    if (!stats) return "-";
    const totalAttended = stats.present + stats.late;
    const totalRecords = stats.present + stats.late + stats.leave + stats.sick + stats.absent;
    const baseTotal = attendanceStats.totalTargetPeriods > 0 ? attendanceStats.totalTargetPeriods : totalRecords;
    if (baseTotal === 0) return "-";
    return ((totalAttended / baseTotal) * 100).toFixed(1) + "%";
  };
  return (total >= 80 && campAttended) ? "ผ" : "มผ";`;

code = code.replace(misplacedCode, "      return (total >= 80 && campAttended) ? \"ผ\" : \"มผ\";");

// Re-insert getStudentAttendance OUTSIDE of calculateGrade
const correctCode = `  const getStudentAttendance = (studentId: string) => {
    if (!attendanceStats) return "-";
    const stats = attendanceStats.studentStats[studentId];
    if (!stats) return "-";
    const totalAttended = stats.present + stats.late;
    const totalRecords = stats.present + stats.late + stats.leave + stats.sick + stats.absent;
    const baseTotal = attendanceStats.totalTargetPeriods > 0 ? attendanceStats.totalTargetPeriods : totalRecords;
    if (baseTotal === 0) return "-";
    return ((totalAttended / baseTotal) * 100).toFixed(1) + "%";
  };

  const calculateGrade =`;

code = code.replace("  const calculateGrade =", correctCode);

fs.writeFileSync('src/components/SubjectScorePrintTemplate.tsx', code, 'utf-8');
console.log("Fixed getStudentAttendance placement");
