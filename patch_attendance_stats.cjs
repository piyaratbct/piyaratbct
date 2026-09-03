const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

const hookCode = `  const attendanceStats = React.useMemo(() => {
    // calculate total target periods for the selected subject
    const periodsPerWeek = schedules.filter(s => s.subject === selectedSubject).length;
    // assuming 20 weeks per semester
    const totalTargetPeriods = periodsPerWeek * 20;

    // for each student, calculate how many times they were present/late/leave/sick
    const studentStats: Record<string, { present: number, leave: number, sick: number, absent: number, late: number }> = {};
    
    students.forEach(s => {
      studentStats[s.id] = { present: 0, leave: 0, sick: 0, absent: 0, late: 0 };
    });

    attendanceSessions.filter(sess => sess.subject === selectedSubject).forEach(sess => {
      Object.entries(sess.attendanceData).forEach(([studentId, status]) => {
        if (studentStats[studentId] && studentStats[studentId][status] !== undefined) {
          studentStats[studentId][status]++;
        }
      });
    });

    return {
      totalTargetPeriods,
      studentStats
    };
  }, [schedules, attendanceSessions, selectedSubject, students]);

  useEffect(() => {`;

code = code.replace('  useEffect(() => {\n    const prathomGrades', hookCode + '\n    const prathomGrades');

fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf-8');
console.log("Patched attendanceStats");
