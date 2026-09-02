import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_init = """  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [hasInitializedMonth, setHasInitializedMonth] = useState(false);"""
  
    new_init = """  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );"""

    code = code.replace(old_init, new_init)

    old_effect = """  useEffect(() => {
    // Determine which month to show
    let monthToShow = selectedMonth;
    
    // Auto-select latest month if not explicitly set yet and we have data
    if (!hasInitializedMonth && allAssessments.length > 0) {
      // Find the most recent month in the data
      const availableMonths = Array.from(new Set(allAssessments.map(a => a.month).filter(Boolean))) as string[];
      if (availableMonths.length > 0) {
        availableMonths.sort().reverse();
        monthToShow = availableMonths[0];
        setSelectedMonth(monthToShow);
        setHasInitializedMonth(true);
      } else {
         // Fallback if no data has month
         monthToShow = new Date().toISOString().slice(0, 7);
         setSelectedMonth(monthToShow);
         setHasInitializedMonth(true);
      }
    } else if (!hasInitializedMonth && allAssessments.length === 0) {
       // Only if we are sure there is no data at all (might be initial load, but safe fallback)
       monthToShow = new Date().toISOString().slice(0, 7);
       setSelectedMonth(monthToShow);
       setHasInitializedMonth(true);
    }

    const currentMonthAssessments: Record<string, StudentAssessment> = {};
    allAssessments.forEach((assessment) => {
      // Filter by month, academic year, and semester
      const matchMonth = (assessment.month || "") === monthToShow;
      const matchYear = !assessment.academicYear || assessment.academicYear === systemAcademicYear;
      const matchSemester = !assessment.semester || assessment.semester === systemSemester;
      
      if (matchMonth && matchYear && matchSemester) {
        currentMonthAssessments[assessment.studentId] = assessment;
      }
    });
    setAssessments(currentMonthAssessments);
  }, [allAssessments, selectedMonth, systemAcademicYear, systemSemester, hasInitializedMonth]);"""
  
    new_effect = """  useEffect(() => {
    const currentMonthAssessments: Record<string, StudentAssessment> = {};
    allAssessments.forEach((assessment) => {
      // Filter by month, academic year, and semester
      // Fallback for older data that might not have academicYear or semester
      const matchMonth = (assessment.month || "") === selectedMonth;
      const matchYear = !assessment.academicYear || assessment.academicYear === systemAcademicYear;
      const matchSemester = !assessment.semester || assessment.semester === systemSemester;
      
      if (matchMonth && matchYear && matchSemester) {
        currentMonthAssessments[assessment.studentId] = assessment;
      }
    });
    setAssessments(currentMonthAssessments);
  }, [allAssessments, selectedMonth, systemAcademicYear, systemSemester]);"""

    code = code.replace(old_effect, new_effect)

    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/ClassroomModule.tsx')
