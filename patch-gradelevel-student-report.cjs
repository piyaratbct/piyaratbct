const fs = require('fs');

let content = fs.readFileSync('src/components/StudentReportPrintTemplate.tsx', 'utf8');

content = content.replace(
  /const sq = query\(collection\(db, "schoolSubjects"\), where\("gradeLevel", "==", gradeLevel\)\);/,
  `const baseGrade = gradeLevel.split('/')[0].trim();
        const sq = query(collection(db, "schoolSubjects"), where("gradeLevel", "==", baseGrade));`
);

fs.writeFileSync('src/components/StudentReportPrintTemplate.tsx', content);
console.log("Patched grade level fetch for school subjects");
