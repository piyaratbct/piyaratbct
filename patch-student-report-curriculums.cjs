const fs = require('fs');

let content = fs.readFileSync('src/components/StudentReportPrintTemplate.tsx', 'utf8');

// Change SchoolSubject back to CurriculumSubject
content = content.replace(/SchoolSubject/g, 'CurriculumSubject');

// Change query
content = content.replace(/collection\(db, "schoolSubjects"\)/g, 'collection(db, "curriculums")');

// Replace .name with .subjectName
// Wait, I need to be careful with .name vs .subjectName in the mapping logic.
// Let's rewrite the mapping logic completely.
