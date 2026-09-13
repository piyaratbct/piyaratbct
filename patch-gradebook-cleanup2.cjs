const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomHub.tsx', 'utf8');

const fetchPlansLogic = `    const fetchPlans = async () => {
      try {
        // In Firestore, if the teacher selected "อื่นๆ" and typed a custom subject, 
        // the 'subject' field might be "อื่นๆ" and the actual name is in 'customSubject'.
        // So we query by teacherId and gradeLevel, then filter in memory for simplicity.
        const q = query(
          collection(db, 'lessonPlans'),
          where('teacherId', '==', currentTeacher.id)
        );
        const snapshot = await getDocs(q);
        const fetched: LessonPlan[] = [];
        snapshot.forEach(doc => {
          fetched.push({ id: doc.id, ...doc.data() } as LessonPlan);
        });
        
        const filteredPlans = fetched.filter(p => {
          
          // plan.semester is usually "ภาคเรียนที่ 1/2569", but systemSemester is just "1" and systemAcademicYear is "2569"
          const expectedSemesterStr = \`ภาคเรียนที่ \${systemSemester}/\${systemAcademicYear}\`;
          const semesterMatch = !p.semester || p.semester === systemSemester || p.semester === expectedSemesterStr || p.semester.includes(systemSemester);
          const subjectMatch = p.subject === subjectName || p.customSubject === subjectName;
          
          // gradeLevel in plan might be comma separated, e.g., "ประถมศึกษาปีที่ 1/1, ประถมศึกษาปีที่ 1/2"
          const planGrades = p.gradeLevel ? p.gradeLevel.split(',').map(s => s.trim()) : [];
          const gradeMatch = planGrades.includes(gradeLevel) || p.gradeLevel === gradeLevel || p.gradeLevel.includes(gradeLevel) || gradeLevel.includes(p.gradeLevel);
          
          console.log("Checking plan:", p.title, {
             planSubject: p.subject, planCustom: p.customSubject, hubSubject: subjectName, subjectMatch,
             planSemester: p.semester, hubSemester: systemSemester, semesterMatch,
             planGrade: p.gradeLevel, hubGrade: gradeLevel, gradeMatch
          });
          
          return semesterMatch && subjectMatch && gradeMatch;
        });
        
        // Sort by unit number then plan number
        filteredPlans.sort((a, b) => {
           const uA = Number(a.unitNumber) || 0;
           const uB = Number(b.unitNumber) || 0;
           if (uA !== uB) return uA - uB;
           return (Number(a.planNumber) || 0) - (Number(b.planNumber) || 0);
        });
        
        setLessonPlans(filteredPlans);`;

const newFetchPlansLogic = `    const fetchPlans = async () => {
      try {
        // In Firestore, if the teacher selected "อื่นๆ" and typed a custom subject, 
        // the 'subject' field might be "อื่นๆ" and the actual name is in 'customSubject'.
        // So we query by teacherId and gradeLevel, then filter in memory for simplicity.
        const q = query(
          collection(db, 'lessonPlans'),
          where('teacherId', '==', currentTeacher.id)
        );
        const snapshot = await getDocs(q);
        const fetched: LessonPlan[] = [];
        snapshot.forEach(doc => {
          fetched.push({ id: doc.id, ...doc.data() } as LessonPlan);
        });
        
        const filteredPlans = fetched.filter(p => {
          
          // plan.semester is usually "ภาคเรียนที่ 1/2569", but systemSemester is just "1" and systemAcademicYear is "2569"
          const expectedSemesterStr = \`ภาคเรียนที่ \${systemSemester}/\${systemAcademicYear}\`;
          const semesterMatch = !p.semester || p.semester === systemSemester || p.semester === expectedSemesterStr || p.semester.includes(systemSemester);
          const subjectMatch = p.subject === subjectName || p.customSubject === subjectName;
          
          // gradeLevel in plan might be comma separated, e.g., "ประถมศึกษาปีที่ 1/1, ประถมศึกษาปีที่ 1/2"
          const planGrades = p.gradeLevel ? p.gradeLevel.split(',').map(s => s.trim()) : [];
          const gradeMatch = planGrades.includes(gradeLevel) || p.gradeLevel === gradeLevel || p.gradeLevel.includes(gradeLevel) || gradeLevel.includes(p.gradeLevel);
          
          return semesterMatch && subjectMatch && gradeMatch;
        });
        
        // Sort by unit number then plan number
        filteredPlans.sort((a, b) => {
           const uA = Number(a.unitNumber) || 0;
           const uB = Number(b.unitNumber) || 0;
           if (uA !== uB) return uA - uB;
           return (Number(a.planNumber) || 0) - (Number(b.planNumber) || 0);
        });
        
        setLessonPlans(filteredPlans);
        
        // Build valid eval IDs from current plans
        const validEvalIds = new Set(
          filteredPlans.flatMap(p => (p.structuredEvaluations || []).map(e => e.id))
        );`;

content = content.replace(fetchPlansLogic, newFetchPlansLogic);

const gbSyncLogic = `        const gbDocId = \`\${systemAcademicYear}_\${systemSemester}_\${safeSubject}_\${safeGrade}\`;
        
        const gbRef = doc(db, 'gradebooks', gbDocId);
        onSnapshot(gbRef, (docSnap) => {
           if (docSnap.exists() && docSnap.data().scores) {
              setGradebookData(docSnap.data().scores);
           } else {
              setGradebookData({});
           }
           setLoading(false);
        });`;

const newGbSyncLogic = `        const gbDocId = \`\${systemAcademicYear}_\${systemSemester}_\${safeSubject}_\${safeGrade}\`;
        
        const gbRef = doc(db, 'gradebooks', gbDocId);
        onSnapshot(gbRef, (docSnap) => {
           if (docSnap.exists() && docSnap.data().scores) {
              const rawScores = docSnap.data().scores;
              const cleanedScores: Record<string, Record<string, number>> = {};
              let hasChanges = false;
              
              // Clean up orphan scores where the eval ID no longer exists in any plan
              Object.keys(rawScores).forEach(studentId => {
                 const studentScores = rawScores[studentId];
                 cleanedScores[studentId] = {};
                 
                 Object.keys(studentScores).forEach(evalId => {
                    if (validEvalIds.has(evalId)) {
                       cleanedScores[studentId][evalId] = studentScores[evalId];
                    } else {
                       hasChanges = true; // Orphan found
                    }
                 });
                 
                 // Remove empty student objects
                 if (Object.keys(cleanedScores[studentId]).length === 0) {
                    delete cleanedScores[studentId];
                 }
              });
              
              setGradebookData(cleanedScores);
              
              // If we found orphan scores, proactively save the cleaned up version
              // to keep the database clean
              if (hasChanges) {
                 setDoc(gbRef, { scores: cleanedScores }, { merge: true }).catch(e => console.error(e));
              }
           } else {
              setGradebookData({});
           }
           setLoading(false);
        });`;

content = content.replace(gbSyncLogic, newGbSyncLogic);

fs.writeFileSync('src/components/ClassroomHub.tsx', content);
console.log("Patched ClassroomHub cleanup logic 2");
