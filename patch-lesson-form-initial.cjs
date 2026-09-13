const fs = require('fs');

let content = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

content = content.replace(
  'const [subject, setSubject] = useState<string>(initialPlan?.subject || SUBJECTS[0]);',
  'const [subject, setSubject] = useState<string>(initialPlan?.subject || "");'
);

content = content.replace(
  `  const [selectedGrades, setSelectedGrades] = useState<string[]>(
    initialPlan?.gradeLevel 
      ? initialPlan.gradeLevel.split(',').map(s => s.trim()).filter(Boolean)
      : [GRADE_LEVELS[0]]
  );`,
  `  const [selectedGrades, setSelectedGrades] = useState<string[]>(
    initialPlan?.gradeLevel 
      ? initialPlan.gradeLevel.split(',').map(s => s.trim()).filter(Boolean)
      : []
  );`
);

content = content.replace(
  `        setSelectedGrades(levels.length > 0 ? levels : [GRADE_LEVELS[0]]);`,
  `        setSelectedGrades(levels.length > 0 ? levels : []);`
);

const oldUseEffect = `  useEffect(() => {
    if (availableSubjects.length > 0 && !initialPlan) {
      const allSelectable = availableSubjects.flatMap(s => typeof s === 'string' ? [s] : s.type === 'single' ? [s.name] : s.subjects);
      if (!allSelectable.includes(subject)) {
        setSubject(allSelectable[0]);
      }
    }
  }, [availableSubjects, initialPlan, subject]);`;

const newUseEffect = `  useEffect(() => {
    if (availableSubjects.length > 0 && !initialPlan && subject !== "") {
      const allSelectable = availableSubjects.flatMap(s => typeof s === 'string' ? [s] : s.type === 'single' ? [s.name] : s.subjects);
      // Only auto-correct if a subject was somehow selected but not in the list, but allow empty
      if (!allSelectable.includes(subject) && subject !== "") {
        // Do nothing or handle gracefully. We want to allow empty.
      }
    }
  }, [availableSubjects, initialPlan, subject]);`;

content = content.replace(oldUseEffect, newUseEffect);

fs.writeFileSync('src/components/LessonPlanForm.tsx', content);

// Also do PBLLessonPlanForm
let content2 = fs.readFileSync('src/components/PBLLessonPlanForm.tsx', 'utf8');

content2 = content2.replace(
  'const [subject, setSubject] = useState<string>(initialPlan?.subject || "บูรณาการ (PBL)");',
  'const [subject, setSubject] = useState<string>(initialPlan?.subject || "");'
);

content2 = content2.replace(
  `  const [selectedGrades, setSelectedGrades] = useState<string[]>(
    initialPlan?.gradeLevel 
      ? initialPlan.gradeLevel.split(',').map(s => s.trim()).filter(Boolean)
      : [GRADE_LEVELS[0]]
  );`,
  `  const [selectedGrades, setSelectedGrades] = useState<string[]>(
    initialPlan?.gradeLevel 
      ? initialPlan.gradeLevel.split(',').map(s => s.trim()).filter(Boolean)
      : []
  );`
);

content2 = content2.replace(
  `        setSelectedGrades(levels.length > 0 ? levels : [GRADE_LEVELS[0]]);`,
  `        setSelectedGrades(levels.length > 0 ? levels : []);`
);

content2 = content2.replace(oldUseEffect, newUseEffect);

fs.writeFileSync('src/components/PBLLessonPlanForm.tsx', content2);

console.log("Patched both forms to start empty");
