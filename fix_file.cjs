const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

const prefix = `
export function LessonPlanForm({
  teacherId,
  onSave,
  initialPlan,
  onCancel,
  currentUserRole,
  systemAcademicYear,
  systemSemester,
}: {
  teacherId: string;
  onSave: (plan: Omit<LessonPlan, "id" | "createdAt" | "updatedAt">) => void;
  initialPlan?: LessonPlan | null;
  onCancel?: () => void;
  currentUserRole?: string;
  systemAcademicYear: string;
  systemSemester: string;
}) {
  const [subject, setSubject] = useState<string>(initialPlan?.subject || SUBJECTS[0]);
  const [customSubject, setCustomSubject] = useState(initialPlan?.customSubject || "");
  const [selectedGrades, setSelectedGrades] = useState<string[]>(
    initialPlan?.gradeLevel 
      ? initialPlan.gradeLevel.split(',').map(s => s.trim()).filter(Boolean)
      : [GRADE_LEVELS[0]]
  );
  const defaultSemester = systemSemester === '1' || systemSemester === '2' ? \`\${systemSemester}/\${systemAcademicYear}\` : \`1/\${systemAcademicYear}\`;
  const [semester, setSemester] = useState(initialPlan?.semester || defaultSemester);
  const [date, setDate] = useState(initialPlan?.date || new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState(initialPlan?.title || "");
  const [coreIndicators, setCoreIndicators] = useState(initialPlan?.coreIndicators || "");
  const [targetIndicators, setTargetIndicators] = useState(initialPlan?.targetIndicators || "");
  const [objectives, setObjectives] = useState(initialPlan?.objectives || "");
  const [competencies, setCompetencies] = useState(initialPlan?.competencies || "");
  
  // New states for curriculum integration
  const [curriculums, setCurriculums] = useState<any[]>([]);
  const [usedIndicators, setUsedIndicators] = useState<Set<string>>(new Set());
  const [isLoadingIndicators, setIsLoadingIndicators] = useState(false);
  
  const [tableGradeFilter, setTableGradeFilter] = useState<string>('all');
  
  // Calculate remaining indicators
  let totalRemaining = 0;
  curriculums.forEach(curr => {
    curr.standards.forEach((std: any) => {
      std.indicators.forEach((ind: any) => {
        if (!usedIndicators.has(ind.code)) {
          totalRemaining++;
        }
      });
    });
  });

  const [activities, setActivities] = useState(initialPlan?.activities || "");
  const [materials, setMaterials] = useState(initialPlan?.materials || "");
  const [evaluation, setEvaluation] = useState(initialPlan?.evaluation || "");
  const [attachments, setAttachments] = useState<Attachment[]>(initialPlan?.attachments || []);
  const [errorMsg, setErrorMsg] = useState("");

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };
`;

code = code.replace(/  useEffect\(\(\) => \{\n    const fetchCurriculumData = async \(\) => \{/, prefix + '\n  useEffect(() => {\n    const fetchCurriculumData = async () => {');
fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
