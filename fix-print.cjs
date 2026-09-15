const fs = require('fs');
let code = fs.readFileSync('src/components/SubjectScorePrintTemplate.tsx', 'utf8');

// 1. Remove gradeDistribution from calculateGrade and restore return (
const gradeDistStr = `  const gradeDistribution = React.useMemo(() => {
    const dist = {};
    let totalAssessed = 0;
    
    const isActivity = subject.includes('กิจกรรม') || subject.includes('ลูกเสือ') || subject.includes('แนะแนว') || subject.includes('ชุมนุม');
    const isPrimary12 = gradeLevel === 'ประถมศึกษาปีที่ 1' || gradeLevel === 'ประถมศึกษาปีที่ 2';
    
    if (isActivity) {
      dist['ผ'] = 0;
      dist['มผ'] = 0;
    } else if (isPrimary12) {
      dist['ดีเยี่ยม'] = 0;
      dist['ดี'] = 0;
      dist['ผ่าน'] = 0;
      dist['ไม่ผ่าน'] = 0;
    } else {
      ['4', '3.5', '3', '2.5', '2', '1.5', '1', '0', 'ร', 'มส'].forEach(g => dist[g] = 0);
    }

    students.forEach(st => {
      const key = \`\${st.id}_\${academicYear}_\${semester}_\${subject}\`;
      const score = scores[key] || { totalScore: 0, activities: [] };
      
      let attScore = undefined;
      if (attendanceStats?.studentStats?.[st.id]) {
        const stats = attendanceStats.studentStats[st.id];
        const totalAttended = stats.present + stats.late;
        const totalRecords = stats.present + stats.late + stats.leave + stats.sick + stats.absent;
        const baseTotal = attendanceStats.totalTargetPeriods > 0 ? attendanceStats.totalTargetPeriods : totalRecords;
        attScore = baseTotal > 0 ? (totalAttended / baseTotal) * 100 : 0;
      }
      
      const g = calculateGrade(score.totalScore || 0, subject, score.activities, undefined, attScore);
      if (g && g !== '-') {
        if (dist[g] === undefined) dist[g] = 0;
        dist[g]++;
        totalAssessed++;
      }
    });

    return { dist, totalAssessed };
  }, [students, scores, academicYear, semester, subject, attendanceStats, gradeLevel]);

  return (`;

code = code.replace(gradeDistStr, `      return (`);

// 2. Put gradeDistribution correctly before the main component return
// Find the exact line: `  return (\n    <PDFPrintHelper`
const targetStr = `  return (\n    <PDFPrintHelper`;
code = code.replace(targetStr, `  const gradeDistribution = React.useMemo(() => {
    const dist: Record<string, number> = {};
    let totalAssessed = 0;
    
    const isActivity = subject.includes('กิจกรรม') || subject.includes('ลูกเสือ') || subject.includes('แนะแนว') || subject.includes('ชุมนุม');
    const isPrimary12 = gradeLevel === 'ประถมศึกษาปีที่ 1' || gradeLevel === 'ประถมศึกษาปีที่ 2';
    
    if (isActivity) {
      dist['ผ'] = 0;
      dist['มผ'] = 0;
    } else if (isPrimary12) {
      dist['ดีเยี่ยม'] = 0;
      dist['ดี'] = 0;
      dist['ผ่าน'] = 0;
      dist['ไม่ผ่าน'] = 0;
    } else {
      ['4', '3.5', '3', '2.5', '2', '1.5', '1', '0', 'ร', 'มส'].forEach(g => dist[g] = 0);
    }

    students.forEach(st => {
      const key = \`\${st.id}_\${academicYear}_\${semester}_\${subject}\`;
      const score = scores[key] || { totalScore: 0, activities: [] };
      
      let attScore = undefined;
      if (attendanceStats?.studentStats?.[st.id]) {
        const stats = attendanceStats.studentStats[st.id];
        const totalAttended = stats.present + stats.late;
        const totalRecords = stats.present + stats.late + stats.leave + stats.sick + stats.absent;
        const baseTotal = attendanceStats.totalTargetPeriods > 0 ? attendanceStats.totalTargetPeriods : totalRecords;
        attScore = baseTotal > 0 ? (totalAttended / baseTotal) * 100 : 0;
      }
      
      const g = calculateGrade(score.totalScore || 0, subject, score.activities, undefined, attScore);
      if (g && g !== '-') {
        if (dist[g] === undefined) dist[g] = 0;
        dist[g]++;
        totalAssessed++;
      }
    });

    return { dist, totalAssessed };
  }, [students, scores, academicYear, semester, subject, attendanceStats, gradeLevel]);

  return (
    <PDFPrintHelper`);

fs.writeFileSync('src/components/SubjectScorePrintTemplate.tsx', code);
