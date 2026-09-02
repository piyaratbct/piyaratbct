import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_effect = """  useEffect(() => {
    console.log("ALL ASSESSMENTS:", allAssessments);
    console.log("SELECTED MONTH:", selectedMonth);
    console.log("SYSTEM YEAR:", systemAcademicYear, "SEMESTER:", systemSemester);
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
  
    new_effect = """  useEffect(() => {
    const currentMonthAssessments: Record<string, StudentAssessment> = {};
    allAssessments.forEach((assessment) => {
      // For assessments, if month is selected, it uniquely identifies the point in time (YYYY-MM).
      // We should not restrict by systemAcademicYear or systemSemester, because if the term changes,
      // teachers still need to view past months' data.
      const matchMonth = (assessment.month || "") === selectedMonth;
      
      if (matchMonth) {
        currentMonthAssessments[assessment.studentId] = assessment;
      }
    });
    setAssessments(currentMonthAssessments);
  }, [allAssessments, selectedMonth]);"""

    if old_effect in code:
        code = code.replace(old_effect, new_effect)
        with open(filename, 'w') as f:
            f.write(code)
        print("Patched successfully")
    else:
        print("Effect not found")

fix('src/components/ClassroomModule.tsx')
