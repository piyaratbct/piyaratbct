import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """  const handleSaveAssessment = async (assessment: StudentAssessment, newWeight?: number, newHeight?: number) => {
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
      }

      if (assessment.id) {"""

replacement = """  const handleSaveAssessment = async (assessment: StudentAssessment, newWeight?: number, newHeight?: number) => {
    try {
      const now = new Date().toISOString();
      const teacherName = currentTeacher
        ? currentTeacher.displayName || currentTeacher.thaiName
        : "ผู้ใช้งาน";
        
      // Attach weight and height to assessment so it's stored per month
      if (newWeight !== undefined) assessment.weight = newWeight;
      if (newHeight !== undefined) assessment.height = newHeight;

      // Also update student weight/height if changed (keep this to maintain latest health profile)
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
      }

      if (assessment.id) {"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
