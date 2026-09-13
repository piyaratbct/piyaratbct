const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomHub.tsx', 'utf8');

const fetchPlansLogic = `      try {
        // In Firestore, if the teacher selected "อื่นๆ" and typed a custom subject, 
        // the 'subject' field might be "อื่นๆ" and the actual name is in 'customSubject'.
        // So we query by teacherId and gradeLevel, then filter in memory for simplicity.
        const q = query(
          collection(db, 'lesson_plans'),
          where('teacherId', '==', currentTeacher.id),
          where('gradeLevel', '==', gradeLevel)
        );
        const snap = await getDocs(q);
        const plans: LessonPlan[] = [];
        snap.forEach(d => {
           const p = { id: d.id, ...d.data() } as LessonPlan;
           const actualSubject = p.subject === 'อื่นๆ' ? p.customSubject : p.subject;
           if (actualSubject === subjectName && p.academicYear === systemAcademicYear && p.semester === systemSemester) {
             plans.push(p);
           }
        });
        // Sort by unit number/plan number
        plans.sort((a, b) => {
           const uA = Number(a.unitNumber) || 0;
           const uB = Number(b.unitNumber) || 0;
           if (uA !== uB) return uA - uB;
           return (Number(a.planNumber) || 0) - (Number(b.planNumber) || 0);
        });
        setLessonPlans(plans);`;

const newFetchPlansLogic = `      try {
        // In Firestore, if the teacher selected "อื่นๆ" and typed a custom subject, 
        // the 'subject' field might be "อื่นๆ" and the actual name is in 'customSubject'.
        // So we query by teacherId and gradeLevel, then filter in memory for simplicity.
        const q = query(
          collection(db, 'lesson_plans'),
          where('teacherId', '==', currentTeacher.id),
          where('gradeLevel', '==', gradeLevel)
        );
        const snap = await getDocs(q);
        const plans: LessonPlan[] = [];
        snap.forEach(d => {
           const p = { id: d.id, ...d.data() } as LessonPlan;
           const actualSubject = p.subject === 'อื่นๆ' ? p.customSubject : p.subject;
           if (actualSubject === subjectName && p.academicYear === systemAcademicYear && p.semester === systemSemester) {
             plans.push(p);
           }
        });
        // Sort by unit number/plan number
        plans.sort((a, b) => {
           const uA = Number(a.unitNumber) || 0;
           const uB = Number(b.unitNumber) || 0;
           if (uA !== uB) return uA - uB;
           return (Number(a.planNumber) || 0) - (Number(b.planNumber) || 0);
        });
        setLessonPlans(plans);
        
        // Build valid eval IDs from current plans
        const validEvalIds = new Set(
          plans.flatMap(p => (p.structuredEvaluations || []).map(e => e.id))
        );`;

content = content.replace(fetchPlansLogic, newFetchPlansLogic);


const gbSyncLogic = `        const gbRef = doc(db, 'gradebooks', gbDocId);
        onSnapshot(gbRef, (docSnap) => {
           if (docSnap.exists() && docSnap.data().scores) {
              setGradebookData(docSnap.data().scores);
           } else {
              setGradebookData({});
           }
           setLoading(false);
        });`;

const newGbSyncLogic = `        const gbRef = doc(db, 'gradebooks', gbDocId);
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
console.log("Patched ClassroomHub cleanup logic");
