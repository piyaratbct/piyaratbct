const fs = require('fs');
let code = fs.readFileSync('src/components/LessonLogForm.tsx', 'utf8');

const target = `  const [date, setDate] = useState(getTodayString());
  const [content, setContent] = useState('');`;

const replacement = `  const [date, setDate] = useState(getTodayString());
  const [content, setContent] = useState('');
  
  // Added for Lesson Plan Import
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<LessonPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [lessonPlanId, setLessonPlanId] = useState<string | undefined>(initialRecord?.lessonPlanId);

  const fetchPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const q = query(
        collection(db, 'lessonPlans'),
        where('teacherId', '==', teacherId)
      );
      const snapshot = await getDocs(q);
      const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LessonPlan));
      
      // Sort by date descending
      plans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setAvailablePlans(plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleOpenPlanModal = () => {
    setShowPlanModal(true);
    fetchPlans();
  };

  const handleImportPlan = (plan: LessonPlan) => {
    setSubject(plan.subject as SubjectType);
    setSelectedGrades([plan.gradeLevel]);
    if (plan.semester) setSemester(plan.semester);
    // Merge plan info into content
    const planContent = \`\${plan.title}\\n\${plan.objectives ? 'จุดประสงค์:\\n' + plan.objectives : ''}\`;
    setContent(planContent.trim());
    setActivities(plan.activities || '');
    setLessonPlanId(plan.id);
    setShowPlanModal(false);
    
    // Toast notification
    window.dispatchEvent(new CustomEvent('app-custom-toast', {
      detail: {
        message: 'นำข้อมูลจากแผนการสอนมาเติมในฟอร์มเรียบร้อยแล้ว',
        type: 'success',
        title: 'นำเข้าสำเร็จ'
      }
    }));
  };`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/LessonLogForm.tsx', code, 'utf8');
