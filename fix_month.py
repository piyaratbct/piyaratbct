import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_state = """  // Assessments state
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [allAssessments, setAllAssessments] = useState<StudentAssessment[]>([]);"""
  
    new_state = """  // Assessments state
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [isAssessmentsLoaded, setIsAssessmentsLoaded] = useState<boolean>(false);
  const [allAssessments, setAllAssessments] = useState<StudentAssessment[]>([]);"""

    code = code.replace(old_state, new_state)

    old_fetch = """        setAllAssessments(fetchedAssessments);
      },
      (error) => {"""
      
    new_fetch = """        setAllAssessments(fetchedAssessments);
        setIsAssessmentsLoaded(true);
      },
      (error) => {"""
      
    code = code.replace(old_fetch, new_fetch)

    old_effect = """  useEffect(() => {
    const currentMonthAssessments: Record<string, StudentAssessment> = {};"""
    
    new_effect = """  useEffect(() => {
    if (isAssessmentsLoaded && selectedMonth === "") {
       const availableMonths = Array.from(new Set(allAssessments.map(a => a.month).filter(Boolean))) as string[];
       if (availableMonths.length > 0) {
          availableMonths.sort().reverse();
          setSelectedMonth(availableMonths[0]);
       } else {
          setSelectedMonth(new Date().toISOString().slice(0, 7));
       }
    }
  }, [isAssessmentsLoaded, allAssessments, selectedMonth]);

  useEffect(() => {
    const currentMonthAssessments: Record<string, StudentAssessment> = {};"""

    code = code.replace(old_effect, new_effect)
    
    # One more thing: when changing selectedGrade, we might want to auto-select the latest month for THAT grade?
    # Actually, allAssessments is already ALL grades (it just fetches all from "assessments").
    # But filtering only happens by selectedMonth. 
    # If the user switches grade, the selectedMonth stays whatever they had.
    # The requirement is just "when teacher comes back to look, it retains previous data".
    # This means when first loaded, pick latest month.

    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/ClassroomModule.tsx')
