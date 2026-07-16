import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

old_overlay = """      {/* Print Overlay */}
      {printStudents && (
        <AssessmentPrintTemplate"""

new_overlay = """      {/* Print Overlay */}
      {printHealthStudents && (
        <HealthPrintTemplate
          students={printHealthStudents}
          allAssessments={allAssessments}
          teacher={currentTeacher!}
          academicYear={systemAcademicYear}
          semester={systemSemester}
          months={showHistoryCompare ? Array.from(new Set(allAssessments.filter(a => a.month).map(a => a.month))).sort().reverse().slice(0, 4) : (selectedMonth ? [selectedMonth] : [])}
          onClose={() => setPrintHealthStudents(null)}
        />
      )}
      {printStudents && (
        <AssessmentPrintTemplate"""

content = content.replace(old_overlay, new_overlay)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
