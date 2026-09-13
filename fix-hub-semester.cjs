const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomHub.tsx', 'utf8');

const oldFilter = `const semesterMatch = !p.semester || p.semester === systemSemester;`;
const newFilter = `
          // plan.semester is usually "ภาคเรียนที่ 1/2569", but systemSemester is just "1" and systemAcademicYear is "2569"
          const expectedSemesterStr = \`ภาคเรียนที่ \${systemSemester}/\${systemAcademicYear}\`;
          const semesterMatch = !p.semester || p.semester === systemSemester || p.semester === expectedSemesterStr || p.semester.includes(systemSemester);`;

content = content.replace(oldFilter, newFilter);

fs.writeFileSync('src/components/ClassroomHub.tsx', content);
console.log("Patched semester match logic");
