const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

const targetObj = "  const [objectives, setObjectives] = useState(\"\");";
code = code.replace(targetObj, `  const [objectives, setObjectives] = useState("");
  const [curriculums, setCurriculums] = useState<any[]>([]);
  const [usedIndicators, setUsedIndicators] = useState<Set<string>>(new Set());
  const [isLoadingIndicators, setIsLoadingIndicators] = useState(false);`);

fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
