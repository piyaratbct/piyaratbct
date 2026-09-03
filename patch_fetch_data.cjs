const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

const hookCode = `  useEffect(() => {
    if (!systemAcademicYear || !systemSemester || !selectedGrade || !selectedSubject) return;

    // Fetch schedules
    const sq = query(
      collection(db, 'schedules'),
      where('academicYear', '==', systemAcademicYear),
      where('semester', '==', systemSemester),
      where('gradeLevel', '==', selectedGrade),
      where('subject', '==', selectedSubject)
    );
    const unSubSchedules = onSnapshot(sq, (snap) => {
      setSchedules(snap.docs.map(d => ({ id: d.id, ...d.data() } as TeacherSchedule)));
    });

    // Fetch attendance
    const aq = query(
      collection(db, 'attendanceSessions'),
      where('academicYear', '==', systemAcademicYear),
      where('semester', '==', systemSemester),
      where('gradeLevel', '==', selectedGrade),
      where('subject', '==', selectedSubject)
    );
    const unSubAttendance = onSnapshot(aq, (snap) => {
      setAttendanceSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceSession)));
    });

    return () => {
      unSubSchedules();
      unSubAttendance();
    };
  }, [systemAcademicYear, systemSemester, selectedGrade, selectedSubject]);

  useEffect(() => {`;

code = code.replace('  useEffect(() => {\n    const q = query(collection(db, "subject_scores"));', hookCode + '\n    const q = query(collection(db, "subject_scores"));');

fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf-8');
console.log("Patched fetching hooks");
