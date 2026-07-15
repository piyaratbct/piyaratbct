import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """  const handleDeleteAssessment = async () => {
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

replacement = """  const handleDeleteAssessment = async () => {
    if (!assessmentToDelete) return;
    try {
      const studentId = assessmentToDelete.studentId;
      await deleteDoc(doc(db, "assessments", assessmentToDelete.id));
      
      // Update student's weight and height when assessment is deleted
      if (studentId) {
        try {
          // Find the latest assessment for this student that is NOT the one being deleted
          const remainingAssessments = allAssessments.filter(a => a.studentId === studentId && a.id !== assessmentToDelete.id && a.weight !== undefined && a.height !== undefined);
          
          if (remainingAssessments.length > 0) {
            // Sort to find latest by month
            remainingAssessments.sort((a, b) => (b.month || "").localeCompare(a.month || ""));
            const latest = remainingAssessments[0];
            await updateDoc(doc(db, "students", studentId), {
              weight: latest.weight,
              height: latest.height
            });
          } else {
            await updateDoc(doc(db, "students", studentId), {
              weight: deleteField(),
              height: deleteField()
            });
          }
        } catch (updateErr) {
          console.error("Failed to update student weight and height", updateErr);
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
