const fs = require('fs');
let content = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

const useAvailableStr = "  const fetchedAvailableSubjects = useAvailableSubjects(selectedGrade);\n";
content = content.replace(useAvailableStr, "");

const selectedGradeStr = "  const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade || GRADE_LEVELS.find(g => g.includes('ประถม')) || GRADE_LEVELS[0]);\n";
content = content.replace(selectedGradeStr, selectedGradeStr + useAvailableStr);

fs.writeFileSync('src/components/EvaluationModule.tsx', content);
