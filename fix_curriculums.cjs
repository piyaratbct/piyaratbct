const fs = require('fs');

function fixLessonPlanForm() {
  let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');
  
  const oldFetch = `        const qCurriculums = query(collection(db, 'curriculums'), where('subjectName', '==', subject));
        const snapshotCurriculums = await getDocs(qCurriculums);
        const fetchedCurriculums = snapshotCurriculums.docs.map(doc => doc.data() as CurriculumSubject);`;
        
  const newFetch = `        // Modified to support fuzzy matching
        const qCurriculums = query(collection(db, 'curriculums'));
        const snapshotCurriculums = await getDocs(qCurriculums);
        let fetchedCurriculums = snapshotCurriculums.docs.map(doc => doc.data() as CurriculumSubject);
        
        const activeSubject = subject === 'อื่นๆ' ? customSubject : subject;
        fetchedCurriculums = fetchedCurriculums.filter(c => {
          const cName = c.subjectName || '';
          if (!activeSubject) return false;
          return cName === activeSubject || cName.includes(activeSubject) || activeSubject.includes(cName);
        });`;
        
  code = code.replace(oldFetch, newFetch);
  
  // also add customSubject to dependency array
  code = code.replace(/\}, \[subject, selectedGrades, semester, teacherId, initialPlan\]\);/, '}, [subject, customSubject, selectedGrades, semester, teacherId, initialPlan]);');
  
  fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
}

function fixPBLLessonPlanForm() {
  let code = fs.readFileSync('src/components/PBLLessonPlanForm.tsx', 'utf8');
  
  const oldFetch = `        // Fetch curriculums for the selected subject
        const qCurriculums = query(collection(db, 'curriculums'), where('subjectName', '==', subject));
        const snapshotCurriculums = await getDocs(qCurriculums);
        const fetchedCurriculums = snapshotCurriculums.docs.map(doc => doc.data() as CurriculumSubject);`;
        
  const newFetch = `        // Modified to support fuzzy matching based on integratedSubjects
        const qCurriculums = query(collection(db, 'curriculums'));
        const snapshotCurriculums = await getDocs(qCurriculums);
        let fetchedCurriculums = snapshotCurriculums.docs.map(doc => doc.data() as CurriculumSubject);
        
        if (integratedSubjects) {
          const subjectsArray = integratedSubjects.split(',').map(s => s.trim()).filter(Boolean);
          fetchedCurriculums = fetchedCurriculums.filter(c => {
            const cName = c.subjectName || '';
            return subjectsArray.some(s => cName === s || cName.includes(s) || s.includes(cName));
          });
        } else {
          fetchedCurriculums = [];
        }`;
        
  code = code.replace(oldFetch, newFetch);
  
  // change dependency array
  code = code.replace(/\}, \[subject, selectedGrades, semester, teacherId, initialPlan\]\);/, '}, [integratedSubjects, selectedGrades, semester, teacherId, initialPlan]);');
  
  fs.writeFileSync('src/components/PBLLessonPlanForm.tsx', code, 'utf8');
}

fixLessonPlanForm();
fixPBLLessonPlanForm();
