import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """      const safeGradeLevel = assessment.gradeLevel.replace(/\//g, "-");
      const targetMonth = assessment.month || selectedMonth;
      const targetYear = assessment.academicYear || systemAcademicYear;"""

replacement = """      const safeGradeLevel = assessment.gradeLevel.replace(/\//g, "-");
      const targetMonth = assessment.month || selectedMonth || new Date().toISOString().slice(0, 7);
      const targetYear = assessment.academicYear || systemAcademicYear;"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
