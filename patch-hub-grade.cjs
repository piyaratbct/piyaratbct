const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomHub.tsx', 'utf8');

const oldQuery = `        const q = query(
          collection(db, 'lessonPlans'),
          where('teacherId', '==', currentTeacher.id),
          where('gradeLevel', '==', gradeLevel)
        );`;

const newQuery = `        const q = query(
          collection(db, 'lessonPlans'),
          where('teacherId', '==', currentTeacher.id)
        );`;

content = content.replace(oldQuery, newQuery);

const oldFilter = `const filteredPlans = fetched.filter(p => 
          (!p.semester || p.semester === systemSemester) &&
          (p.subject === subjectName || p.customSubject === subjectName)
        );`;

const newFilter = `const filteredPlans = fetched.filter(p => {
          const semesterMatch = !p.semester || p.semester === systemSemester;
          const subjectMatch = p.subject === subjectName || p.customSubject === subjectName;
          
          // gradeLevel in plan might be comma separated, e.g., "ประถมศึกษาปีที่ 1/1, ประถมศึกษาปีที่ 1/2"
          const planGrades = p.gradeLevel ? p.gradeLevel.split(',').map(s => s.trim()) : [];
          const gradeMatch = planGrades.includes(gradeLevel) || p.gradeLevel === gradeLevel;
          
          return semesterMatch && subjectMatch && gradeMatch;
        });`;

content = content.replace(oldFilter, newFilter);

fs.writeFileSync('src/components/ClassroomHub.tsx', content);
console.log("Patched hub grade match");
