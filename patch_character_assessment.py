import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # 1. Add state for lessonRecords
    if "const [lessonRecords, setLessonRecords]" not in code:
        state_str = "  const [badges, setBadges] = useState<Record<string, StudentBadge[]>>({});\n"
        state_replace = "  const [badges, setBadges] = useState<Record<string, StudentBadge[]>>({});\n  const [lessonRecords, setLessonRecords] = useState<any[]>([]);\n"
        code = code.replace(state_str, state_replace)

    # 2. Add useEffect for lessonRecords
    if "setLessonRecords(snap.docs.map(d" not in code:
        ue_str = """    // Student Badges
    const unsubBadges = onSnapshot(query(collection(db, 'studentBadges'), """
        ue_replace = """    // Lesson Records (for desirable characteristics evaluation from classes)
    const unsubLessonRecords = onSnapshot(query(collection(db, 'lessonRecords'), 
      where('academicYear', '==', systemAcademicYear), 
      where('semester', '==', systemSemester)
    ), snap => {
      setLessonRecords(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });

    // Student Badges
    const unsubBadges = onSnapshot(query(collection(db, 'studentBadges'), """
        code = code.replace(ue_str, ue_replace)

    # 3. Add unsubscribe
    if "unsubLessonRecords();" not in code:
        unsub_str = """      unsubAttendance();
      unsubDiscipline();
      unsubScores();
      unsubEvents();
      unsubBadges();"""
        unsub_replace = """      unsubAttendance();
      unsubDiscipline();
      unsubScores();
      unsubEvents();
      unsubBadges();
      unsubLessonRecords();"""
        code = code.replace(unsub_str, unsub_replace)

    # 4. Integrate lessonRecords into handleSetAllGood
    if "lessonRecordScores" not in code:
        logic_str = """      const isLegacy = disciplineData.some(inc => 
        (!inc.offenderIds || inc.offenderIds.length === 0) &&
        inc.studentIds && 
        inc.studentIds.includes(student.id) && 
        badBehaviorTypes.includes(inc.type)
      );"""
      
        logic_replace = """      const isLegacy = disciplineData.some(inc => 
        (!inc.offenderIds || inc.offenderIds.length === 0) &&
        inc.studentIds && 
        inc.studentIds.includes(student.id) && 
        badBehaviorTypes.includes(inc.type)
      );
      
      // -- NEW: Incorporate Lesson Logs (Classroom Evaluations) --
      // Gather scores for each trait (t1-t8) from all lesson records for this student
      const lessonRecordScores: Record<string, number[]> = {
        t1: [], t2: [], t3: [], t4: [], t5: [], t6: [], t7: [], t8: []
      };
      
      lessonRecords.forEach(record => {
        if (record.studentDesirableScores && record.studentDesirableScores[student.id]) {
          const studentScores = record.studentDesirableScores[student.id];
          Object.entries(studentScores).forEach(([indicatorId, score]) => {
             const traitNumber = indicatorId.split('.')[0]; // e.g., "1.1" -> "1"
             const traitKey = `t${traitNumber}`;
             if (lessonRecordScores[traitKey] !== undefined) {
               lessonRecordScores[traitKey].push(score as number);
             }
          });
        }
      });
      
      // Calculate mode or average for each trait from classes
      Object.keys(lessonRecordScores).forEach(traitKey => {
         const scores = lessonRecordScores[traitKey];
         if (scores.length > 0) {
           const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
           // If average is high (>= 2.5), auto-suggest excellent
           if (avg >= 2.5) {
             excellentTraits.add(traitKey);
           } else if (avg < 1.5) {
             // If average is low (< 1.5), auto-suggest warning
             warningTraits.add(traitKey);
           }
         }
      });
      // --------------------------------------------------------
"""
        code = code.replace(logic_str, logic_replace)

    with open(filename, 'w') as f:
        f.write(code)
    print("Success")

fix('src/components/CharacterAssessmentView.tsx')
