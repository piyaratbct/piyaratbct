const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

const effectTarget = `  useEffect(() => {
    if (initialPlan) {`;

const effectReplacement = `  useEffect(() => {
    const fetchCurriculumData = async () => {
      if (!subject || selectedGrades.length === 0) {
        setCurriculums([]);
        return;
      }
      setIsLoadingIndicators(true);
      try {
        // Fetch curriculums for the selected subject
        const qCurriculums = query(collection(db, 'curriculums'), where('subjectName', '==', subject));
        const snapshotCurriculums = await getDocs(qCurriculums);
        const fetchedCurriculums = snapshotCurriculums.docs.map(doc => doc.data() as CurriculumSubject);
        
        // Filter by selected grades (exact match, or if grade is "ป.1/1" but curriculum is "ป.1" we might want to be smart, but let's stick to exact match first. Actually, standard practice in Thai schools is curriculum per grade level (e.g. "ประถมศึกษาปีที่ 1"). The selectedGrades might have sub-rooms. Let's normalize).
        const normalizedSelectedGrades = selectedGrades.map(g => g.split('/')[0].trim());
        const matchedCurriculums = fetchedCurriculums.filter(c => normalizedSelectedGrades.includes(c.gradeLevel.split('/')[0].trim()));
        setCurriculums(matchedCurriculums);

        // Fetch existing lesson plans for the same teacher, subject, semester, and grade
        // To find used indicators
        const qPlans = query(collection(db, 'lessonPlans'), 
          where('teacherId', '==', teacherId),
          where('subject', '==', subject),
          where('semester', '==', semester)
        );
        const snapshotPlans = await getDocs(qPlans);
        const used = new Set<string>();
        snapshotPlans.docs.forEach(doc => {
          const plan = doc.data() as LessonPlan;
          if (plan.id === initialPlan?.id) return; // exclude current plan
          
          // Check if plan has overlapping grades
          const planGrades = plan.gradeLevel.split(',').map(s => s.trim());
          const hasOverlap = planGrades.some(g => selectedGrades.includes(g));
          if (hasOverlap) {
             if (plan.coreIndicators) {
               plan.coreIndicators.split(',').forEach(i => used.add(i.trim()));
             }
             if (plan.targetIndicators) {
               plan.targetIndicators.split(',').forEach(i => used.add(i.trim()));
             }
          }
        });
        setUsedIndicators(used);

      } catch (error) {
        console.error("Error fetching curriculum data", error);
      } finally {
        setIsLoadingIndicators(false);
      }
    };
    fetchCurriculumData();
  }, [subject, selectedGrades, semester, teacherId, initialPlan]);

  useEffect(() => {
    if (initialPlan) {`;

code = code.replace(effectTarget, effectReplacement);
fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
