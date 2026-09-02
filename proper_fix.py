import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # Find the current state
    old_state = """  // Assessments state
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [isAssessmentsLoaded, setIsAssessmentsLoaded] = useState<boolean>(false);
  const [allAssessments, setAllAssessments] = useState<StudentAssessment[]>([]);"""
  
    new_state = """  // Assessments state
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [hasAutoSelected, setHasAutoSelected] = useState<boolean>(false);
  const [allAssessments, setAllAssessments] = useState<StudentAssessment[]>([]);"""

    if old_state in code:
        code = code.replace(old_state, new_state)
    else:
        print("old_state not found")

    # Find the fetch
    old_fetch = """        setAllAssessments(fetchedAssessments);
        setIsAssessmentsLoaded(true);
      },"""
      
    new_fetch = """        setAllAssessments(fetchedAssessments);
      },"""
      
    if old_fetch in code:
        code = code.replace(old_fetch, new_fetch)
    else:
        print("old_fetch not found")

    # Find the effect
    old_effect = """  useEffect(() => {
    if (isAssessmentsLoaded && selectedMonth === "") {
       const availableMonths = Array.from(new Set(allAssessments.map(a => a.month).filter(Boolean))) as string[];
       if (availableMonths.length > 0) {
          availableMonths.sort().reverse();
          setSelectedMonth(availableMonths[0]);
       } else {
          setSelectedMonth(new Date().toISOString().slice(0, 7));
       }
    }
  }, [isAssessmentsLoaded, allAssessments, selectedMonth]);"""
  
    new_effect = """  useEffect(() => {
    if (!hasAutoSelected && allAssessments.length > 0) {
       const availableMonths = Array.from(new Set(allAssessments.map(a => a.month).filter(Boolean))) as string[];
       if (availableMonths.length > 0) {
          availableMonths.sort().reverse();
          setSelectedMonth(availableMonths[0]);
          setHasAutoSelected(true);
       }
    }
  }, [allAssessments, hasAutoSelected]);"""

    if old_effect in code:
        code = code.replace(old_effect, new_effect)
    else:
        print("old_effect not found")

    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/ClassroomModule.tsx')
