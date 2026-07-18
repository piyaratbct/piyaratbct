with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
old_import = 'import { AssessmentModal } from "./AssessmentModal";'
new_import = 'import { AssessmentModal } from "./AssessmentModal";\nimport { KindergartenAssessmentModal } from "./KindergartenAssessmentModal";\nimport { KindergartenAssessment } from "../types";'
content = content.replace(old_import, new_import)

# 2. Update assessments state to any
old_assessments = """  const [assessments, setAssessments] = useState<
    Record<string, StudentAssessment>
  >({});"""
new_assessments = """  const [assessments, setAssessments] = useState<
    Record<string, any>
  >({});"""
content = content.replace(old_assessments, new_assessments)

# 3. Add getInitialKindergartenAssessment
old_get_initial = """  // Initialize empty assessment if not exist"""
new_get_initial = """  const isKindergarten = selectedGrade.startsWith("อนุบาล");

  const getInitialKindergartenAssessment = (studentId: string): KindergartenAssessment => {
    return {
      id: `ka-${Date.now()}`,
      studentId,
      gradeLevel: selectedGrade,
      semester: systemSemester || '',
      academicYear: systemAcademicYear || '',
      teacherId: currentTeacher?.id || "t-unknown",
      standard1: 0,
      standard2: 0,
      standard3: 0,
      standard4: 0,
      standard5: 0,
      standard6: 0,
      standard7: 0,
      standard8: 0,
      standard9: 0,
      standard10: 0,
      standard11: 0,
      standard12: 0,
      updatedAt: new Date().toISOString(),
    };
  };

  // Initialize empty assessment if not exist"""
content = content.replace(old_get_initial, new_get_initial)

# 4. Modify handleSaveAssessment to handle any
old_save = """  const handleSaveAssessment = async (assessment: StudentAssessment, newWeight?: number, newHeight?: number) => {"""
new_save = """  const handleSaveAssessment = async (assessment: any, newWeight?: number, newHeight?: number) => {"""
content = content.replace(old_save, new_save)

# 5. Modify the AssessmentModal render
old_modal = """        {/* Assessment Modal/Form Overlay */}
        {evaluatingStudent && (
          <AssessmentModal
            student={evaluatingStudent}
            existingAssessment={
              assessments[evaluatingStudent.id] ||
              getInitialAssessment(evaluatingStudent.id)
            }
            onClose={() => setEvaluatingStudent(null)}
            onSave={handleSaveAssessment}
          />
        )}"""
new_modal = """        {/* Assessment Modal/Form Overlay */}
        {evaluatingStudent && isKindergarten && (
          <KindergartenAssessmentModal
            student={evaluatingStudent}
            existingAssessment={
              assessments[evaluatingStudent.id] ||
              getInitialKindergartenAssessment(evaluatingStudent.id)
            }
            onClose={() => setEvaluatingStudent(null)}
            onSave={handleSaveAssessment}
          />
        )}
        {evaluatingStudent && !isKindergarten && (
          <AssessmentModal
            student={evaluatingStudent}
            existingAssessment={
              assessments[evaluatingStudent.id] ||
              getInitialAssessment(evaluatingStudent.id)
            }
            onClose={() => setEvaluatingStudent(null)}
            onSave={handleSaveAssessment}
          />
        )}"""
content = content.replace(old_modal, new_modal)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
