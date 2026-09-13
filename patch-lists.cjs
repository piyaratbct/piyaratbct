const fs = require('fs');

// LessonPlanList
let planList = fs.readFileSync('src/components/LessonPlanList.tsx', 'utf8');
if (!planList.includes('initialSubject?: string;')) {
  planList = planList.replace('onEvaluate?: (plan: LessonPlan) => void;', 'onEvaluate?: (plan: LessonPlan) => void;\n  initialSubject?: string;\n  initialGrade?: string;');
  planList = planList.replace('onEvaluate\n}: LessonPlanListProps) => {', 'onEvaluate,\n  initialSubject,\n  initialGrade\n}: LessonPlanListProps) => {');
  planList = planList.replace('const [selectedSubject, setSelectedSubject] = useState<string>("ทั้งหมด");', 'const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || "ทั้งหมด");');
  planList = planList.replace('const [selectedGrade, setSelectedGrade] = useState<string>("ทั้งหมด");', 'const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade || "ทั้งหมด");');
  fs.writeFileSync('src/components/LessonPlanList.tsx', planList);
}

// LessonLogList
let logList = fs.readFileSync('src/components/LessonLogList.tsx', 'utf8');
if (!logList.includes('initialSubject?: string;')) {
  logList = logList.replace('onEvaluate?: (record: LessonRecord) => void;', 'onEvaluate?: (record: LessonRecord) => void;\n  initialSubject?: string;\n  initialGrade?: string;');
  logList = logList.replace('onEvaluate\n}: LessonLogListProps) => {', 'onEvaluate,\n  initialSubject,\n  initialGrade\n}: LessonLogListProps) => {');
  logList = logList.replace('const [selectedSubject, setSelectedSubject] = useState<string>("ทั้งหมด");', 'const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || "ทั้งหมด");');
  logList = logList.replace('const [selectedGrade, setSelectedGrade] = useState<string>("ทั้งหมด");', 'const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade || "ทั้งหมด");');
  fs.writeFileSync('src/components/LessonLogList.tsx', logList);
}
console.log("Patched list components");
