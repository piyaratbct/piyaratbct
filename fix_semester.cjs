const fs = require('fs');

// Fix LessonPlanForm.tsx
let lpForm = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');
lpForm = lpForm.replace(
  /const defaultSemester = .*;/g,
  'const defaultSemester = `ภาคเรียนที่ ${systemSemester === \'1\' || systemSemester === \'2\' ? systemSemester : \'1\'}/${systemAcademicYear || \'2567\'}`;'
);
fs.writeFileSync('src/components/LessonPlanForm.tsx', lpForm);

// Fix PBLLessonPlanForm.tsx
let pblForm = fs.readFileSync('src/components/PBLLessonPlanForm.tsx', 'utf8');
pblForm = pblForm.replace(
  /const defaultSemester = .*;/g,
  'const defaultSemester = `ภาคเรียนที่ ${systemSemester === \'1\' || systemSemester === \'2\' ? systemSemester : \'1\'}/${systemAcademicYear || \'2567\'}`;'
);
fs.writeFileSync('src/components/PBLLessonPlanForm.tsx', pblForm);

// Fix getNormalizedTerm in LessonPlanList.tsx
let lpList = fs.readFileSync('src/components/LessonPlanList.tsx', 'utf8');
lpList = lpList.replace(
  /const getNormalizedTerm = \(plan: LessonPlan\) => \{[\s\S]*?return `\$\{sem\}\/\$\{year\}`;\n  \};/,
  `const getNormalizedTerm = (plan: LessonPlan) => {
    let sem = plan.semester || systemSemester || "";
    let year = plan.academicYear || systemAcademicYear || "";
    
    if (sem.includes("ภาคเรียนที่")) {
      const match = sem.match(/ภาคเรียนที่\\s*(\\d)\\/(\\d{4})/);
      if (match) {
        sem = match[1];
        year = match[2];
      }
    } else if (sem.includes("/")) {
      const match = sem.match(/(\\d)\\/(\\d{4})/);
      if (match) {
        sem = match[1];
        year = match[2];
      }
    }
    return \`\${sem}/\${year}\`;
  };`
);
fs.writeFileSync('src/components/LessonPlanList.tsx', lpList);

console.log('Fixed');
