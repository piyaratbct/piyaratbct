const fs = require('fs');

let content = fs.readFileSync('src/components/LessonLogForm.tsx', 'utf8');

content = content.replace(
  "const [subject, setSubject] = useState<SubjectType>('ภาษาไทย');",
  "const [subject, setSubject] = useState<string>(initialRecord?.subject || '');"
);

content = content.replace(
  "const [selectedGrades, setSelectedGrades] = useState<string[]>([GRADE_LEVELS[0]]);",
  "const [selectedGrades, setSelectedGrades] = useState<string[]>(initialRecord?.gradeLevel ? initialRecord.gradeLevel.split(',').map(s => s.trim()).filter(Boolean) : []);"
);

const oldUseEffect = `  useEffect(() => {
    if (availableSubjects.length > 0 && !initialRecord && !preloadedPlan) {
      const allSelectable = availableSubjects.flatMap(s => typeof s === 'string' ? [s] : s.type === 'single' ? [s.name] : s.subjects);
      if (!allSelectable.includes(subject)) {
        setSubject(allSelectable[0] as SubjectType);
      }
    }
  }, [availableSubjects, initialRecord, subject, preloadedPlan]);`;

const newUseEffect = `  useEffect(() => {
    if (availableSubjects.length > 0 && !initialRecord && !preloadedPlan && subject !== "") {
      const allSelectable = availableSubjects.flatMap(s => typeof s === 'string' ? [s] : s.type === 'single' ? [s.name] : s.subjects);
      if (!allSelectable.includes(subject) && subject !== "") {
        // Allow empty
      }
    }
  }, [availableSubjects, initialRecord, subject, preloadedPlan]);`;

if (content.includes(oldUseEffect)) {
  content = content.replace(oldUseEffect, newUseEffect);
}

fs.writeFileSync('src/components/LessonLogForm.tsx', content);

// PBLLessonLogForm.tsx

let content2 = fs.readFileSync('src/components/PBLLessonLogForm.tsx', 'utf8');

content2 = content2.replace(
  "const [subject, setSubject] = useState<string>(initialRecord?.subject);",
  "const [subject, setSubject] = useState<string>(initialRecord?.subject || '');"
);
content2 = content2.replace(
  "const [subject, setSubject] = useState<string>(initialRecord?.subject || 'บูรณาการ (PBL)');",
  "const [subject, setSubject] = useState<string>(initialRecord?.subject || '');"
);
content2 = content2.replace(
  "const [selectedGrades, setSelectedGrades] = useState<string[]>([GRADE_LEVELS[0]]);",
  "const [selectedGrades, setSelectedGrades] = useState<string[]>(initialRecord?.gradeLevel ? initialRecord.gradeLevel.split(',').map(s => s.trim()).filter(Boolean) : []);"
);

if (content2.includes(oldUseEffect)) {
  content2 = content2.replace(oldUseEffect, newUseEffect);
}

fs.writeFileSync('src/components/PBLLessonLogForm.tsx', content2);
console.log("Patched lesson logs");
