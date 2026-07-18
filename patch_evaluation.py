with open('src/components/EvaluationModule.tsx', 'r') as f:
    content = f.read()

# Add states
old_states = """  const [scores, setScores] = useState<Record<string, SubjectScore>>({});
  const [draftScores, setDraftScores] = useState<Record<string, SubjectScore>>({});
  const [isSaving, setIsSaving] = useState(false);"""
new_states = """  const [scores, setScores] = useState<Record<string, SubjectScore>>({});
  const [draftScores, setDraftScores] = useState<Record<string, SubjectScore>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showWarningToast, setShowWarningToast] = useState(false);
  const [warningCount, setWarningCount] = useState(0);"""
content = content.replace(old_states, new_states)

# update handleSaveScores
old_save = """  const handleSaveScores = async () => {
    setIsSaving(true);
    try {
      // Save all draft scores for the current selection
      const studentsInGrade = students.filter(s => s.gradeLevel === selectedGrade);
      
      const promises = studentsInGrade.map(student => {
        const key = `${student.id}_${systemAcademicYear}_${systemSemester}_${selectedSubject}`;
        const scoreData = draftScores[key];
        
        if (scoreData) {
          // If total score > 0, it means we have something to save
          const docId = `${student.id}_${systemAcademicYear}_${systemSemester}_${selectedSubject}`.replace(/[\/]/g, '-');
          return setDoc(doc(db, "subject_scores", docId), scoreData);
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      alert("บันทึกคะแนนเรียบร้อยแล้ว");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "subject_scores");
    } finally {
      setIsSaving(false);
    }
  };"""

new_save = """  const handleSaveScores = async () => {
    setIsSaving(true);
    try {
      // Save all draft scores for the current selection
      const studentsInGrade = students.filter(s => s.gradeLevel === selectedGrade);
      
      const promises = studentsInGrade.map(student => {
        const key = `${student.id}_${systemAcademicYear}_${systemSemester}_${selectedSubject}`;
        const scoreData = draftScores[key];
        
        if (scoreData) {
          // If total score > 0, it means we have something to save
          const docId = `${student.id}_${systemAcademicYear}_${systemSemester}_${selectedSubject}`.replace(/[\/]/g, '-');
          return setDoc(doc(db, "subject_scores", docId), scoreData);
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      
      // Check for at-risk students
      const failingStudents = studentsInGrade.filter(s => {
        const key = `${s.id}_${systemAcademicYear}_${systemSemester}_${selectedSubject}`;
        const scoreData = draftScores[key];
        return scoreData && scoreData.totalScore > 0 && scoreData.totalScore < 50;
      });

      if (failingStudents.length > 0) {
        setWarningCount(failingStudents.length);
        setShowWarningToast(true);
        setTimeout(() => setShowWarningToast(false), 5000);
      } else {
        alert("บันทึกคะแนนเรียบร้อยแล้ว");
      }
      
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "subject_scores");
    } finally {
      setIsSaving(false);
    }
  };"""
content = content.replace(old_save, new_save)


# Highlight row
old_tr = """                          return (
                          <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-3 text-center font-medium">{student.number}</td>"""
new_tr = """                          return (
                          <tr key={student.id} className={`border-b border-slate-100 transition-colors ${score.totalScore > 0 && score.totalScore < 50 ? 'bg-rose-50/70 hover:bg-rose-100' : 'hover:bg-slate-50'}`}>
                            <td className="px-4 py-3 text-center font-medium">{student.number}</td>"""
content = content.replace(old_tr, new_tr)

# Add Toast Notification UI inside return
old_return = """  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="print:hidden space-y-6">"""

new_return = """  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      
      {/* Toast Notification */}
      {showWarningToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border-l-4 border-rose-500 rounded-xl shadow-xl p-4 flex items-start gap-3 max-w-sm animate-in slide-in-from-bottom-5">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-full flex-shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">พบนักเรียนกลุ่มเฝ้าระวัง</h4>
            <p className="text-sm text-slate-600 mt-1">
              บันทึกคะแนนสำเร็จ แต่มีนักเรียนจำนวน <span className="font-bold text-rose-600">{warningCount} คน</span> ที่ได้คะแนนรวมต่ำกว่า 50 คะแนน
            </p>
          </div>
        </div>
      )}

      <div className="print:hidden space-y-6">"""
content = content.replace(old_return, new_return)

with open('src/components/EvaluationModule.tsx', 'w') as f:
    f.write(content)
