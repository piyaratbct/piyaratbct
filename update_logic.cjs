const fs = require('fs');
const file = 'src/components/SARMonitoringDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const importTarget = `import { Teacher, Student, PDRecord } from '../types';`;
const importNew = `import { Teacher, Student, PDRecord, KindergartenAssessment } from '../types';`;
content = content.replace(importTarget, importNew);

const stateTarget = `const [lessonRecords, setLessonRecords] = useState<any[]>([]);`;
const stateNew = `const [lessonRecords, setLessonRecords] = useState<any[]>([]);
  const [kgAssessments, setKgAssessments] = useState<KindergartenAssessment[]>([]);`;
content = content.replace(stateTarget, stateNew);

const fetchTarget = `// 5. Lesson Records
      const recordsUnsub = onSnapshot(query(collection(db, 'records')), (snap) => {
        setLessonRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => console.error("Error loading Lesson Records:", err));

      setLoading(false);

      return () => {
        pdUnsub();
        plansUnsub();
        discUnsub();
        scoresUnsub();
        recordsUnsub();
      };`;

const fetchNew = `// 5. Lesson Records
      const recordsUnsub = onSnapshot(query(collection(db, 'records')), (snap) => {
        setLessonRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => console.error("Error loading Lesson Records:", err));

      // 6. Kindergarten Assessments
      const kgUnsub = onSnapshot(query(collection(db, 'kindergarten_assessments')), (snap) => {
        setKgAssessments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as KindergartenAssessment)));
      }, (err) => console.error("Error loading KG Assessments:", err));

      setLoading(false);

      return () => {
        pdUnsub();
        plansUnsub();
        discUnsub();
        scoresUnsub();
        recordsUnsub();
        kgUnsub();
      };`;
content = content.replace(fetchTarget, fetchNew);

const filterTarget = `const fSubjectScores = React.useMemo(() => {
    return subjectScores.filter(s => validStudentIds.has(s.studentId));
  }, [subjectScores, validStudentIds]);`;

const filterNew = `const fSubjectScores = React.useMemo(() => {
    return subjectScores.filter(s => validStudentIds.has(s.studentId));
  }, [subjectScores, validStudentIds]);

  const fKgAssessments = React.useMemo(() => {
    return kgAssessments.filter(a => validStudentIds.has(a.studentId) && a.academicYear === systemAcademicYear);
  }, [kgAssessments, validStudentIds, systemAcademicYear]);`;
content = content.replace(filterTarget, filterNew);

fs.writeFileSync(file, content);
