const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomHub.tsx', 'utf8');

const oldFilter = `const semesterMatch = !p.semester || p.semester === systemSemester;
          const subjectMatch = p.subject === subjectName || p.customSubject === subjectName;
          
          // gradeLevel in plan might be comma separated, e.g., "ประถมศึกษาปีที่ 1/1, ประถมศึกษาปีที่ 1/2"
          const planGrades = p.gradeLevel ? p.gradeLevel.split(',').map(s => s.trim()) : [];
          const gradeMatch = planGrades.includes(gradeLevel) || p.gradeLevel === gradeLevel;
          
          return semesterMatch && subjectMatch && gradeMatch;`;

const newFilter = `const semesterMatch = !p.semester || p.semester === systemSemester;
          const subjectMatch = p.subject === subjectName || p.customSubject === subjectName;
          
          // gradeLevel in plan might be comma separated, e.g., "ประถมศึกษาปีที่ 1/1, ประถมศึกษาปีที่ 1/2"
          const planGrades = p.gradeLevel ? p.gradeLevel.split(',').map(s => s.trim()) : [];
          const gradeMatch = planGrades.includes(gradeLevel) || p.gradeLevel === gradeLevel || p.gradeLevel.includes(gradeLevel) || gradeLevel.includes(p.gradeLevel);
          
          console.log("Checking plan:", p.title, {
             planSubject: p.subject, planCustom: p.customSubject, hubSubject: subjectName, subjectMatch,
             planSemester: p.semester, hubSemester: systemSemester, semesterMatch,
             planGrade: p.gradeLevel, hubGrade: gradeLevel, gradeMatch
          });
          
          return semesterMatch && subjectMatch && gradeMatch;`;

if (content.includes(oldFilter)) {
  content = content.replace(oldFilter, newFilter);
  fs.writeFileSync('src/components/ClassroomHub.tsx', content);
  console.log("Added debug logging to ClassroomHub");
}
