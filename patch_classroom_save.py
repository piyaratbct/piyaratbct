import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """  const handleSaveAssessment = async (assessment: StudentAssessment) => {
    try {
      const now = new Date().toISOString();
      const teacherName = currentTeacher
        ? currentTeacher.displayName || currentTeacher.thaiName
        : "ผู้ใช้งาน";"""

replacement = """  const handleSaveAssessment = async (assessment: StudentAssessment, newWeight?: number, newHeight?: number) => {
    try {
      const now = new Date().toISOString();
      const teacherName = currentTeacher
        ? currentTeacher.displayName || currentTeacher.thaiName
        : "ผู้ใช้งาน";
        
      // Also update student weight/height if changed
      const currentStudent = students.find(s => s.id === assessment.studentId);
      if (currentStudent && (newWeight !== currentStudent.weight || newHeight !== currentStudent.height)) {
        try {
          await updateDoc(doc(db, "students", currentStudent.id), {
            ...(newWeight !== undefined ? { weight: newWeight } : {}),
            ...(newHeight !== undefined ? { height: newHeight } : {}),
            updatedAt: now
          });
        } catch (error) {
          console.error("Error updating student weight/height", error);
        }
      }"""

content = content.replace(target, replacement)

# We need to make sure the prop for AssessmentModal matches
target2 = """            onClose={() => setEvaluatingStudent(null)}
            onSave={handleSaveAssessment}
          />"""
# We don't need to change this because handleSaveAssessment signature update is sufficient for TS, it accepts 3 params and AssessmentModal passes 3.

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
