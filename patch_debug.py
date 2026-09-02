import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # Find the effect
    old_effect = """  useEffect(() => {
    const currentMonthAssessments: Record<string, StudentAssessment> = {};"""
  
    new_effect = """  useEffect(() => {
    console.log("ALL ASSESSMENTS:", allAssessments);
    console.log("SELECTED MONTH:", selectedMonth);
    console.log("SYSTEM YEAR:", systemAcademicYear, "SEMESTER:", systemSemester);
    const currentMonthAssessments: Record<string, StudentAssessment> = {};"""

    code = code.replace(old_effect, new_effect)

    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/ClassroomModule.tsx')
