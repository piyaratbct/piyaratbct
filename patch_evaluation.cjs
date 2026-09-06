const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

// 1. Add states and read-only logic just before "const [scores, setScores]"
const stateToAdd = `
  const [viewYear, setViewYear] = useState<string>(systemAcademicYear || '2567');
  const [viewSemester, setViewSemester] = useState<string>(systemSemester || '1');
  
  useEffect(() => {
    if (systemAcademicYear) setViewYear(systemAcademicYear);
  }, [systemAcademicYear]);
  
  useEffect(() => {
    if (systemSemester) setViewSemester(systemSemester);
  }, [systemSemester]);

  const isHistorical = viewYear !== systemAcademicYear || viewSemester !== systemSemester;
  const isReadOnly = isHistorical && currentTeacher?.role !== 'admin' && currentTeacher?.role !== 'academic';
`;

code = code.replace("const [scores, setScores] = useState<Record<string, SubjectScore>>({});", stateToAdd + "\n  const [scores, setScores] = useState<Record<string, SubjectScore>>({});");

// 2. Replace usages inside side effects and event handlers
// Replace `!systemAcademicYear || !systemSemester`
code = code.replace(/!systemAcademicYear \|\| !systemSemester/g, "!viewYear || !viewSemester");

// Replace `systemAcademicYear, systemSemester` in dependency arrays
code = code.replace(/\[systemAcademicYear, systemSemester,/g, "[viewYear, viewSemester,");

// Replace string interpolations
code = code.replace(/\$\{systemAcademicYear\}/g, "${viewYear}");
code = code.replace(/\$\{systemSemester\}/g, "${viewSemester}");

// Replace object assignments
code = code.replace(/academicYear: systemAcademicYear/g, "academicYear: viewYear");
code = code.replace(/semester: systemSemester/g, "semester: viewSemester");

// Replace exact matches in queries
code = code.replace(/where\('academicYear', '==', systemAcademicYear\)/g, "where('academicYear', '==', viewYear)");
code = code.replace(/where\('semester', '==', systemSemester\)/g, "where('semester', '==', viewSemester)");

// In prop passes to modals
code = code.replace(/systemAcademicYear=\{systemAcademicYear\}/g, "systemAcademicYear={viewYear}");
code = code.replace(/systemSemester=\{systemSemester\}/g, "systemSemester={viewSemester}");
code = code.replace(/academicYear=\{systemAcademicYear \|\| "2567"\}/g, "academicYear={viewYear || \"2567\"}");

// 3. Add read-only guard to save handlers
code = code.replace(/const handleSaveScores = async \(\) => \{/g, "const handleSaveScores = async () => {\n    if (isReadOnly) return;");
code = code.replace(/const handleScoreChange = \(studentId: string, part: string, value: string, field\?: string\) => \{/g, "const handleScoreChange = (studentId: string, part: string, value: string, field?: string) => {\n    if (isReadOnly) return;");
code = code.replace(/const handleSaveSettings = async \(newSettings: SubjectSettings\) => \{/g, "const handleSaveSettings = async (newSettings: SubjectSettings) => {\n    if (isReadOnly) return;");
code = code.replace(/const toggleScoutCamp = async \(studentId: string\) => \{/g, "const toggleScoutCamp = async (studentId: string) => {\n    if (isReadOnly) return;");

fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf-8');
console.log('Patched EvaluationModule.tsx');
