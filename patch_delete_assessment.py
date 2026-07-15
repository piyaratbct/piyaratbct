import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# Import deleteField
content = content.replace("  deleteDoc,\n} from \"firebase/firestore\";", "  deleteDoc,\n  deleteField,\n} from \"firebase/firestore\";")

target = """  const handleDeleteAssessment = async () => {
    if (!assessmentToDelete) return;
    try {
      await deleteDoc(doc(db, "assessments", assessmentToDelete.id));
      setAssessmentToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "assessments");
    }
  };"""

replacement = """  const handleDeleteAssessment = async () => {
    if (!assessmentToDelete) return;
    try {
      const studentId = assessmentToDelete.studentId;
      await deleteDoc(doc(db, "assessments", assessmentToDelete.id));
      
      // Clear student's weight and height when assessment is deleted
      if (studentId) {
        try {
          await updateDoc(doc(db, "students", studentId), {
            weight: deleteField(),
            height: deleteField()
          });
        } catch (updateErr) {
          console.error("Failed to clear student weight and height", updateErr);
        }
      }

      setAssessmentToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "assessments");
    }
  };"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
