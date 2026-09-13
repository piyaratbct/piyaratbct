const fs = require('fs');

const forms = [
  'src/components/LessonLogForm.tsx',
  'src/components/PBLLessonPlanForm.tsx',
  'src/components/PBLLessonLogForm.tsx',
  'src/components/LessonPlanForm.tsx',
  'src/hooks/useAvailableSubjects.ts'
];

forms.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('sortSubjects')) {
     if (content.includes('useAvailableSubjects.ts')) {
        // useAvailableSubjects imports
        content = content.replace(/import \{ collection, query, getDocs \} from 'firebase\/firestore';/, 
        "import { collection, query, getDocs } from 'firebase/firestore';\nimport { sortSubjects } from '../types';");
     } else {
        // For forms, check if sortSubjects is imported
        if (content.match(/import \{[^}]*SUBJECTS[^}]*\} from '..\/types'/)) {
           content = content.replace(/import \{([^}]*SUBJECTS[^}]*)\} from '..\/types'/, "import { $1, sortSubjects } from '../types'");
        } else {
           content = content.replace(/import \{([^}]*GRADE_LEVELS[^}]*)\} from '..\/types'/, "import { $1, sortSubjects } from '../types'");
        }
     }
  }

  // Replace sort logic
  content = content.replace(/allDocs\.sort\(\(a, b\) => \{[\s\S]*?return \(a\.subjectName \|\| ''\)\.localeCompare\(b\.subjectName \|\| ''\);\s*\}\);/,
    'allDocs.sort(sortSubjects);');
    
  fs.writeFileSync(file, content);
  console.log("Patched " + file);
});

// Patch CurriculumManager.tsx
let currContent = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');
if (!currContent.includes('sortSubjects')) {
  currContent = currContent.replace(/import \{ CurriculumSubject, CurriculumStandard, CurriculumIndicator, GRADE_LEVELS, SUBJECTS \} from '\.\.\/types';/, 
    "import { CurriculumSubject, CurriculumStandard, CurriculumIndicator, GRADE_LEVELS, SUBJECTS, sortSubjects } from '../types';");
}
currContent = currContent.replace(/data\.sort\(\(a, b\) => a\.gradeLevel\.localeCompare\(b\.gradeLevel\) \|\| \(a\.subjectCode \|\| ""\)\.localeCompare\(b\.subjectCode \|\| ""\)\);/,
  'data.sort((a, b) => a.gradeLevel.localeCompare(b.gradeLevel) || sortSubjects(a, b));');
fs.writeFileSync('src/components/CurriculumManager.tsx', currContent);
console.log("Patched CurriculumManager.tsx");

// Patch StudentReportPrintTemplate.tsx
let reportContent = fs.readFileSync('src/components/StudentReportPrintTemplate.tsx', 'utf8');
if (!reportContent.includes('sortSubjects')) {
  reportContent = reportContent.replace(/import \{ Student, SubjectScore, SUBJECTS, CurriculumSubject \} from "\.\.\/types";/, 
    'import { Student, SubjectScore, SUBJECTS, CurriculumSubject, sortSubjects } from "../types";');
}
reportContent = reportContent.replace(/const parentsAndStandalone = schoolSubjects\.filter\(s => s\.isParent \|\| \(!s\.isParent && !s\.parentId\)\)\.sort\(\(a, b\) => \(a\.subjectCode \|\| ""\)\.localeCompare\(b\.subjectCode \|\| ""\)\);/,
  'const parentsAndStandalone = schoolSubjects.filter(s => s.isParent || (!s.isParent && !s.parentId)).sort(sortSubjects);');

// The fallback array sort for studentScores
reportContent = reportContent.replace(/studentScores = filteredSubjects\.map\(\(subject\) => \{/,
  `studentScores = filteredSubjects.map((subject) => {`).replace(/const standardScores = studentScores\.filter\(s => !s\.isScout\);/,
  `studentScores.sort(sortSubjects);\n        const standardScores = studentScores.filter(s => !s.isScout);`);

fs.writeFileSync('src/components/StudentReportPrintTemplate.tsx', reportContent);
console.log("Patched StudentReportPrintTemplate.tsx");

