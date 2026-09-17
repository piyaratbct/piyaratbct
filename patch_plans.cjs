const fs = require('fs');

// Patch PBLLessonPlanForm.tsx
let planCode = fs.readFileSync('src/components/PBLLessonPlanForm.tsx', 'utf8');
planCode = planCode.replace(
  'systemSemester:\n  teachers?: any[];',
  'systemSemester:\n  teachers?: any[];\n  initialSubject?: string;\n  initialGrade?: string;'
);
planCode = planCode.replace(
  'systemSemester,\n  teachers = [],',
  'systemSemester,\n  teachers = [],\n  initialSubject,\n  initialGrade,'
);

// We need to set initial subject and grade in state
planCode = planCode.replace(
  'const [selectedGrades, setSelectedGrades] = useState<string[]>(',
  'const [selectedGrades, setSelectedGrades] = useState<string[]>(\n    initialGrade ? [initialGrade] :\n'
);
planCode = planCode.replace(
  'const [subject, setSubject] = useState<string>(',
  'const [subject, setSubject] = useState<string>(\n    initialSubject ||'
);
// Make sure it doesn't break if `initialPlan` exists (initialPlan takes precedence)
// Let's do it safer:
planCode = planCode.replace(
  /const \[selectedGrades, setSelectedGrades\] = useState<string\[\]>\([\s\S]*?initialPlan\?.gradeLevel[\s\S]*?\? initialPlan\.gradeLevel\.split\(','\)\.map\(s => s\.trim\(\)\)\.filter\(Boolean\)[\s\S]*?: \[\]\s*\);/,
  `const [selectedGrades, setSelectedGrades] = useState<string[]>(
    initialPlan?.gradeLevel 
      ? initialPlan.gradeLevel.split(',').map(s => s.trim()).filter(Boolean)
      : initialGrade ? [initialGrade] : []
  );`
);

planCode = planCode.replace(
  /const \[subject, setSubject\] = useState<string>\(\s*initialPlan\?\.subject \|\| "ภาษาไทย"\s*\);/,
  `const [subject, setSubject] = useState<string>(initialPlan?.subject || initialSubject || "ภาษาไทย");`
);

fs.writeFileSync('src/components/PBLLessonPlanForm.tsx', planCode);


// Patch PBLLessonLogForm.tsx
let logCode = fs.readFileSync('src/components/PBLLessonLogForm.tsx', 'utf8');
logCode = logCode.replace(
  'systemSemester:\n  teachers?: any[];',
  'systemSemester:\n  teachers?: any[];\n  initialSubject?: string;\n  initialGrade?: string;'
);
logCode = logCode.replace(
  'systemSemester,\n  teachers = [],',
  'systemSemester,\n  teachers = [],\n  initialSubject,\n  initialGrade,'
);

logCode = logCode.replace(
  /const \[selectedGrades, setSelectedGrades\] = useState<string\[\]>\([\s\S]*?initialLog\?.gradeLevel[\s\S]*?\? initialLog\.gradeLevel\.split\(','\)\.map\(s => s\.trim\(\)\)\.filter\(Boolean\)[\s\S]*?: \[\]\s*\);/,
  `const [selectedGrades, setSelectedGrades] = useState<string[]>(
    initialLog?.gradeLevel 
      ? initialLog.gradeLevel.split(',').map(s => s.trim()).filter(Boolean)
      : initialGrade ? [initialGrade] : []
  );`
);

logCode = logCode.replace(
  /const \[subject, setSubject\] = useState<string>\(\s*initialLog\?\.subject \|\| "ภาษาไทย"\s*\);/,
  `const [subject, setSubject] = useState<string>(initialLog?.subject || initialSubject || "ภาษาไทย");`
);

fs.writeFileSync('src/components/PBLLessonLogForm.tsx', logCode);
console.log('Patched PBLLessonPlanForm and PBLLessonLogForm');
