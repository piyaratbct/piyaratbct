const fs = require('fs');
let content = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

const targetStr = `  // Aggregate data for the selected grade
  const reportData = useMemo(() => {
    const gradeSchedules = schedules.filter(s => s.gradeLevel === selectedGrade);
    const gradeSessions = sessions.filter(s => s.gradeLevel === selectedGrade);

    // Group by subject
    const subjectMap: Record<string, {
      subject: string;
      teacherName: string;
      periodsPerWeek: number;
      targetPeriodsTotal: number; // assuming 20 weeks
      taughtPeriods: number;
      lastTaughtDate: string | null;
    }> = {};

    gradeSchedules.forEach(sch => {
      if (!subjectMap[sch.subject]) {
        subjectMap[sch.subject] = {
          subject: sch.subject,
          teacherName: sch.teacherName || '-',
          periodsPerWeek: 0,
          targetPeriodsTotal: 0,
          taughtPeriods: 0,
          lastTaughtDate: null
        };
      }
      
      const learningWeeks = Math.max(1, Math.round(totalLearningDays / 5));
      subjectMap[sch.subject].periodsPerWeek += 1;
      subjectMap[sch.subject].targetPeriodsTotal += learningWeeks;
    });

    gradeSessions.forEach(sess => {
      if (!sess.subject) return;
      if (!subjectMap[sess.subject]) {
        subjectMap[sess.subject] = {
          subject: sess.subject,
          teacherName: sess.teacherName || '-',
          periodsPerWeek: 0,
          targetPeriodsTotal: 0,
          taughtPeriods: 0,
          lastTaughtDate: null
        };
      }
      subjectMap[sess.subject].taughtPeriods += 1;
      
      if (!subjectMap[sess.subject].lastTaughtDate || sess.date > subjectMap[sess.subject].lastTaughtDate!) {
        subjectMap[sess.subject].lastTaughtDate = sess.date;
      }
    });

    return Object.values(subjectMap).sort((a, b) => b.periodsPerWeek - a.periodsPerWeek);
  }, [schedules, sessions, selectedGrade, totalLearningDays]);`;

const newTargetStr = `  const [curriculums, setCurriculums] = useState<any[]>([]);

  useEffect(() => {
    const fetchCurriculums = async () => {
      try {
        const q = query(collection(db, 'curriculums'));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCurriculums(data);
      } catch (error) {
        console.error("Error fetching curriculums:", error);
      }
    };
    fetchCurriculums();
  }, []);

  // Aggregate data for the selected grade
  const reportData = useMemo(() => {
    const gradeSchedules = schedules.filter(s => s.gradeLevel === selectedGrade);
    const gradeSessions = sessions.filter(s => s.gradeLevel === selectedGrade);

    // Group by subject
    const subjectMap: Record<string, {
      subject: string;
      teacherName: string;
      periodsPerWeek: number;
      targetPeriodsTotal: number;
      taughtPeriods: number;
      lastTaughtDate: string | null;
      dataSource: string;
    }> = {};

    // 1. First populate from curriculums for the selected grade
    const getBaseGrade = (g: string) => g ? g.split('/')[0].trim() : '';
    const targetBaseGrade = getBaseGrade(selectedGrade);
    
    const relevantCurriculums = curriculums.filter(c => {
      if (c.gradeLevel) return getBaseGrade(c.gradeLevel) === targetBaseGrade;
      return false;
    });

    relevantCurriculums.forEach(curr => {
      if (!curr.subjectName || curr.isParent) return; // Skip parents, we track children/standalone
      
      // Attempt to find total hours, default to 0 if not specified
      const totalHours = curr.totalHours || 0;
      
      subjectMap[curr.subjectName] = {
        subject: curr.subjectName,
        teacherName: '-',
        periodsPerWeek: 0,
        targetPeriodsTotal: totalHours,
        taughtPeriods: 0,
        lastTaughtDate: null,
        dataSource: 'curriculum'
      };
    });

    // 2. Overlay with schedules
    gradeSchedules.forEach(sch => {
      const subjectName = sch.subject === 'อื่นๆ' ? (sch.customSubject || 'อื่นๆ') : sch.subject;
      
      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = {
          subject: subjectName,
          teacherName: sch.teacherName || '-',
          periodsPerWeek: 0,
          targetPeriodsTotal: 0,
          taughtPeriods: 0,
          lastTaughtDate: null,
          dataSource: 'schedule'
        };
      } else {
        // Update teacher name if it was empty from curriculum
        if (subjectMap[subjectName].teacherName === '-') {
          subjectMap[subjectName].teacherName = sch.teacherName || '-';
        } else if (sch.teacherName && !subjectMap[subjectName].teacherName.includes(sch.teacherName)) {
           subjectMap[subjectName].teacherName += \`, \${sch.teacherName}\`;
        }
      }
      
      const learningWeeks = Math.max(1, Math.round(totalLearningDays / 5));
      subjectMap[subjectName].periodsPerWeek += 1;
      
      // If we don't have hours from curriculum, infer from schedule
      if (subjectMap[subjectName].dataSource !== 'curriculum') {
        subjectMap[subjectName].targetPeriodsTotal += learningWeeks;
      }
    });

    // 3. Overlay with taught sessions
    gradeSessions.forEach(sess => {
      if (!sess.subject) return;
      const subjectName = sess.subject;
      
      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = {
          subject: subjectName,
          teacherName: sess.teacherName || '-',
          periodsPerWeek: 0,
          targetPeriodsTotal: 0,
          taughtPeriods: 0,
          lastTaughtDate: null,
          dataSource: 'session'
        };
      }
      subjectMap[subjectName].taughtPeriods += 1;
      
      if (!subjectMap[subjectName].lastTaughtDate || sess.date > subjectMap[subjectName].lastTaughtDate!) {
        subjectMap[subjectName].lastTaughtDate = sess.date;
      }
    });

    return Object.values(subjectMap).sort((a, b) => b.targetPeriodsTotal - a.targetPeriodsTotal);
  }, [schedules, sessions, selectedGrade, totalLearningDays, curriculums]);`;

content = content.replace(targetStr, newTargetStr);
fs.writeFileSync('src/components/LearningHoursReport.tsx', content);
console.log("Patched LearningHoursReport to use Curriculum hours");
