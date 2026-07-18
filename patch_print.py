with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# Add import
old_import = 'import { AssessmentPrintTemplate } from "./AssessmentPrintTemplate";'
new_import = 'import { AssessmentPrintTemplate } from "./AssessmentPrintTemplate";\nimport { KindergartenPrintTemplate } from "./KindergartenPrintTemplate";'
content = content.replace(old_import, new_import)

# Replace the render logic
old_print = """      {printStudents && (
        <AssessmentPrintTemplate
          students={printStudents}
          assessments={assessments}
          teacher={currentTeacher!}
          academicYear={systemAcademicYear}
          semester={systemSemester}
          onClose={() => setPrintStudents(null)}
        />
      )}"""
new_print = """      {printStudents && isKindergarten && (
        <KindergartenPrintTemplate
          students={printStudents}
          assessments={assessments}
          teacher={currentTeacher!}
          academicYear={systemAcademicYear || ''}
          semester={systemSemester || ''}
          onClose={() => setPrintStudents(null)}
        />
      )}
      {printStudents && !isKindergarten && (
        <AssessmentPrintTemplate
          students={printStudents}
          assessments={assessments}
          teacher={currentTeacher!}
          academicYear={systemAcademicYear || ''}
          semester={systemSemester || ''}
          onClose={() => setPrintStudents(null)}
        />
      )}"""
content = content.replace(old_print, new_print)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
