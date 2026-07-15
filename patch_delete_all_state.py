import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """  const [studentToDelete, setStudentToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);"""

replacement = """  const [studentToDelete, setStudentToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);"""

content = content.replace(target, replacement)

target2 = """  const handleDeleteAssessment = async () => {"""

replacement2 = """  const handleDeleteAllStudents = async () => {
    try {
      setIsDeletingAll(true);
      const studentsToDelete = students.filter(s => s.gradeLevel === selectedGrade);
      
      const chunks = [];
      for (let i = 0; i < studentsToDelete.length; i += 500) {
        chunks.push(studentsToDelete.slice(i, i + 500));
      }

      for (const chunk of chunks) {
        const batch = writeBatch(db);
        for (const student of chunk) {
          batch.delete(doc(db, "students", student.id));
        }
        await batch.commit();
      }
      
      setShowDeleteAllConfirm(false);
      setIsDeletingAll(false);
    } catch (error) {
      console.error("Failed to delete all students:", error);
      setIsDeletingAll(false);
      handleFirestoreError(error, OperationType.DELETE, "students");
    }
  };

  const handleDeleteAssessment = async () => {"""

content = content.replace(target2, replacement2)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
