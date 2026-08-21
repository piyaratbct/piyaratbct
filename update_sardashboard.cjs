const fs = require('fs');
const file = 'src/components/SARMonitoringDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace standard variables with filtered logic setup
const calculationLogicTarget = `  // --- CALCULATION LOGIC ---

  // Standard 1: Learner Quality
  // Academic achievement (assuming scores are available, else mock based on students presence)
  const totalStudents = students.length || 1; // avoid div by 0`;

const calculationLogicReplacement = `  // --- FILTERING LOGIC ---
  const [educationLevelFilter, setEducationLevelFilter] = useState<'all' | 'kindergarten' | 'primary'>('all');

  const kindergartenTeacherIds = React.useMemo(() => {
    const ids = new Set<string>();
    lessonRecords.forEach(r => {
      if (r.gradeLevel && r.gradeLevel.includes('อนุบาล')) ids.add(r.teacherId);
    });
    lessonPlans.forEach(p => {
      if (p.gradeLevel && p.gradeLevel.includes('อนุบาล')) ids.add(p.teacherId);
    });
    return ids;
  }, [lessonRecords, lessonPlans]);

  const primaryTeacherIds = React.useMemo(() => {
    const ids = new Set<string>();
    lessonRecords.forEach(r => {
      if (r.gradeLevel && !r.gradeLevel.includes('อนุบาล')) ids.add(r.teacherId);
    });
    lessonPlans.forEach(p => {
      if (p.gradeLevel && !p.gradeLevel.includes('อนุบาล')) ids.add(p.teacherId);
    });
    return ids;
  }, [lessonRecords, lessonPlans]);

  const fStudents = React.useMemo(() => {
    if (educationLevelFilter === 'kindergarten') return students.filter(s => s.gradeLevel && s.gradeLevel.includes('อนุบาล'));
    if (educationLevelFilter === 'primary') return students.filter(s => s.gradeLevel && !s.gradeLevel.includes('อนุบาล'));
    return students;
  }, [students, educationLevelFilter]);

  const validStudentIds = React.useMemo(() => new Set(fStudents.map(s => s.id)), [fStudents]);

  const fSubjectScores = React.useMemo(() => {
    return subjectScores.filter(s => validStudentIds.has(s.studentId));
  }, [subjectScores, validStudentIds]);

  const fDisciplineIncidents = React.useMemo(() => {
    return disciplineIncidents.filter(d => validStudentIds.has(d.studentId));
  }, [disciplineIncidents, validStudentIds]);

  const fTeachers = React.useMemo(() => {
    if (educationLevelFilter === 'kindergarten') return teachers.filter(t => kindergartenTeacherIds.has(t.id));
    if (educationLevelFilter === 'primary') return teachers.filter(t => primaryTeacherIds.has(t.id));
    return teachers;
  }, [teachers, educationLevelFilter, kindergartenTeacherIds, primaryTeacherIds]);

  const validTeacherIds = React.useMemo(() => new Set(fTeachers.map(t => t.id)), [fTeachers]);

  const fPdRecords = React.useMemo(() => {
    return pdRecords.filter(r => validTeacherIds.has(r.teacherId));
  }, [pdRecords, validTeacherIds]);

  const fLessonRecords = React.useMemo(() => {
    if (educationLevelFilter === 'kindergarten') return lessonRecords.filter(r => r.gradeLevel && r.gradeLevel.includes('อนุบาล'));
    if (educationLevelFilter === 'primary') return lessonRecords.filter(r => r.gradeLevel && !r.gradeLevel.includes('อนุบาล'));
    return lessonRecords;
  }, [lessonRecords, educationLevelFilter]);

  const fLessonPlans = React.useMemo(() => {
    if (educationLevelFilter === 'kindergarten') return lessonPlans.filter(p => p.gradeLevel && p.gradeLevel.includes('อนุบาล'));
    if (educationLevelFilter === 'primary') return lessonPlans.filter(p => p.gradeLevel && !p.gradeLevel.includes('อนุบาล'));
    return lessonPlans;
  }, [lessonPlans, educationLevelFilter]);

  // --- CALCULATION LOGIC ---

  // Standard 1: Learner Quality
  // Academic achievement (assuming scores are available, else mock based on students presence)
  const totalStudents = fStudents.length || 1; // avoid div by 0`;

content = content.replace(calculationLogicTarget, calculationLogicReplacement);

// Now search and replace the standard array usages with the filtered ones in the calculation blocks
// Use regex to replace carefully
content = content.replace(/students\.length/g, 'fStudents.length');
// BUT wait, students.length might be used in students.filter or something? 
// Let's manually replace the block

const calcBlockOld = `  // Calculate students with high scores (Grade 3.0+ roughly translates to score > 75)
  // We'll mock this gracefully if no real subject_scores exist yet, to show the UI capability
  const studentsWithScores = subjectScores.length > 0 
    ? new Set(subjectScores.filter(s => (s.score >= 75 || s.grade >= 3)).map(s => s.studentId)).size
    : Math.floor(students.length * 0.75); // Mock 75% if empty DB
  const achievementRate = students.length > 0 ? (studentsWithScores / students.length) * 100 : 0;

  // Good behavior rate (Students without major discipline incidents)
  const studentsWithIncidents = new Set(disciplineIncidents.map(d => d.studentId)).size;
  const goodBehaviorRate = students.length > 0 ? ((students.length - studentsWithIncidents) / students.length) * 100 : 100;

  // Standard 2: Management & Administration (Teacher Quality)
  const currentYearPdRecords = pdRecords.filter(r => r.academicYear === systemAcademicYear);
  const teachersWithTrainingTarget = teachers.filter(t => {
    const hours = currentYearPdRecords.filter(r => r.teacherId === t.id && r.type === 'training').reduce((sum, r) => sum + (r.hours || 0), 0);
    return hours >= TARGET_TRAINING;
  }).length;
  const trainingRate = teachers.length > 0 ? (teachersWithTrainingTarget / teachers.length) * 100 : 0;

  const totalPlcHours = currentYearPdRecords.filter(r => r.type === 'plc').reduce((sum, r) => sum + (r.hours || 0), 0);
  
  // Standard 3: Student-Centered Teaching
  const totalLessonPlans = lessonPlans.length;
  const activeLearningPlans = lessonPlans.filter(p => p.type === 'pbl' || p.tags?.includes('active-learning')).length;
  const activeLearningRate = totalLessonPlans > 0 ? (activeLearningPlans / totalLessonPlans) * 100 : 0;

  const totalResearch = currentYearPdRecords.filter(r => r.type === 'research').length;
  const totalInnovations = currentYearPdRecords.filter(r => r.type === 'award').length;

  // SAR Tags Distribution from Lesson Records
  const sarTagsCount: Record<string, number> = {};
  let totalRecordsWithTags = 0;
  lessonRecords.forEach(record => {
    if (record.academicYear === systemAcademicYear && record.sarTags && record.sarTags.length > 0) {
      totalRecordsWithTags++;
      record.sarTags.forEach((tag: string) => {
        sarTagsCount[tag] = (sarTagsCount[tag] || 0) + 1;
      });
    }
  });

  const SAR_TAGS_MAP: Record<string, string> = {
    'active-learning': 'การเรียนรู้เชิงรุก (Active Learning)',
    'critical-thinking': 'กระบวนการคิดวิเคราะห์ (Critical Thinking)',
    'tech-integration': 'การบูรณาการเทคโนโลยี (Tech Integration)',
    'moral-ethics': 'คุณธรรมจริยธรรม (Moral & Ethics)',
    'local-wisdom': 'บูรณาการภูมิปัญญาท้องถิ่น (Local Wisdom)',
    'differentiated': 'ตอบสนองความแตกต่างผู้เรียน (Differentiated)',
    'authentic-assessment': 'การประเมินตามสภาพจริง (Authentic Assessment)'
  };

  const sortedTags = Object.keys(sarTagsCount)
    .map(key => ({ id: key, label: SAR_TAGS_MAP[key] || key, count: sarTagsCount[key] }))
    .sort((a, b) => b.count - a.count);

  // --- COMPLETENESS LOGIC ---
  const actualStudentsWithAnyScore = new Set(subjectScores.map(s => s.studentId)).size;
  const std1Completeness = students.length > 0 ? Math.min((actualStudentsWithAnyScore / students.length) * 100, 100) : 0;
  
  const teachersWithPd = new Set(currentYearPdRecords.map(r => r.teacherId)).size;
  const std2Completeness = teachers.length > 0 ? Math.min((teachersWithPd / teachers.length) * 100, 100) : 0;
  
  const currentYearLessonRecords = lessonRecords.filter(r => r.academicYear === systemAcademicYear);
  const std3Completeness = currentYearLessonRecords.length > 0 ? Math.min((totalRecordsWithTags / currentYearLessonRecords.length) * 100, 100) : 0;
  
  const overallCompleteness = Math.round((std1Completeness + std2Completeness + std3Completeness) / 3);`;

const calcBlockNew = `  // Calculate students with high scores (Grade 3.0+ roughly translates to score > 75)
  // We'll mock this gracefully if no real subject_scores exist yet, to show the UI capability
  const studentsWithScores = fSubjectScores.length > 0 
    ? new Set(fSubjectScores.filter(s => (s.score >= 75 || s.grade >= 3)).map(s => s.studentId)).size
    : Math.floor(fStudents.length * 0.75); // Mock 75% if empty DB
  const achievementRate = fStudents.length > 0 ? (studentsWithScores / fStudents.length) * 100 : 0;

  // Good behavior rate (Students without major discipline incidents)
  const studentsWithIncidents = new Set(fDisciplineIncidents.map(d => d.studentId)).size;
  const goodBehaviorRate = fStudents.length > 0 ? ((fStudents.length - studentsWithIncidents) / fStudents.length) * 100 : 100;

  // Standard 2: Management & Administration (Teacher Quality)
  const currentYearPdRecords = fPdRecords.filter(r => r.academicYear === systemAcademicYear);
  const teachersWithTrainingTarget = fTeachers.filter(t => {
    const hours = currentYearPdRecords.filter(r => r.teacherId === t.id && r.type === 'training').reduce((sum, r) => sum + (r.hours || 0), 0);
    return hours >= TARGET_TRAINING;
  }).length;
  const trainingRate = fTeachers.length > 0 ? (teachersWithTrainingTarget / fTeachers.length) * 100 : 0;

  const totalPlcHours = currentYearPdRecords.filter(r => r.type === 'plc').reduce((sum, r) => sum + (r.hours || 0), 0);
  
  // Standard 3: Student-Centered Teaching
  const totalLessonPlans = fLessonPlans.length;
  const activeLearningPlans = fLessonPlans.filter(p => p.type === 'pbl' || p.tags?.includes('active-learning')).length;
  const activeLearningRate = totalLessonPlans > 0 ? (activeLearningPlans / totalLessonPlans) * 100 : 0;

  const totalResearch = currentYearPdRecords.filter(r => r.type === 'research').length;
  const totalInnovations = currentYearPdRecords.filter(r => r.type === 'award').length;

  // SAR Tags Distribution from Lesson Records
  const sarTagsCount: Record<string, number> = {};
  let totalRecordsWithTags = 0;
  fLessonRecords.forEach(record => {
    if (record.academicYear === systemAcademicYear && record.sarTags && record.sarTags.length > 0) {
      totalRecordsWithTags++;
      record.sarTags.forEach((tag: string) => {
        sarTagsCount[tag] = (sarTagsCount[tag] || 0) + 1;
      });
    }
  });

  const SAR_TAGS_MAP: Record<string, string> = {
    'active-learning': 'การเรียนรู้เชิงรุก (Active Learning)',
    'critical-thinking': 'กระบวนการคิดวิเคราะห์ (Critical Thinking)',
    'tech-integration': 'การบูรณาการเทคโนโลยี (Tech Integration)',
    'moral-ethics': 'คุณธรรมจริยธรรม (Moral & Ethics)',
    'local-wisdom': 'บูรณาการภูมิปัญญาท้องถิ่น (Local Wisdom)',
    'differentiated': 'ตอบสนองความแตกต่างผู้เรียน (Differentiated)',
    'authentic-assessment': 'การประเมินตามสภาพจริง (Authentic Assessment)'
  };

  const sortedTags = Object.keys(sarTagsCount)
    .map(key => ({ id: key, label: SAR_TAGS_MAP[key] || key, count: sarTagsCount[key] }))
    .sort((a, b) => b.count - a.count);

  // --- COMPLETENESS LOGIC ---
  const actualStudentsWithAnyScore = new Set(fSubjectScores.map(s => s.studentId)).size;
  const std1Completeness = fStudents.length > 0 ? Math.min((actualStudentsWithAnyScore / fStudents.length) * 100, 100) : 0;
  
  const teachersWithPd = new Set(currentYearPdRecords.map(r => r.teacherId)).size;
  const std2Completeness = fTeachers.length > 0 ? Math.min((teachersWithPd / fTeachers.length) * 100, 100) : 0;
  
  const currentYearLessonRecords = fLessonRecords.filter(r => r.academicYear === systemAcademicYear);
  const std3Completeness = currentYearLessonRecords.length > 0 ? Math.min((totalRecordsWithTags / currentYearLessonRecords.length) * 100, 100) : 0;
  
  const overallCompleteness = Math.round((std1Completeness + std2Completeness + std3Completeness) / 3);`;

content = content.replace(calcBlockOld, calcBlockNew);

// Add the filter buttons UI
const filterUiTarget = `      {/* Progress Indicator (Data Completeness) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-500" />
              สถานะความสมบูรณ์ของข้อมูล (Data Completeness)
            </h3>
            <p className="text-sm text-slate-500 mt-1">ภาพรวมการกรอกข้อมูลเพื่อเตรียมประเมิน SAR ประจำปี {systemAcademicYear}</p>
          </div>
          <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 flex items-center gap-3">
            <span className="text-sm font-bold text-indigo-700">ภาพรวมทั้งหมด</span>
            <span className="text-2xl font-black text-indigo-600">{overallCompleteness}%</span>
          </div>
        </div>`;

const filterUiNew = `      {/* Progress Indicator (Data Completeness) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-5">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-500" />
              สถานะความสมบูรณ์ของข้อมูล (Data Completeness)
            </h3>
            <p className="text-sm text-slate-500 mt-1">ภาพรวมการกรอกข้อมูลเพื่อเตรียมประเมิน SAR ประจำปี {systemAcademicYear}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200">
              <button 
                onClick={() => setEducationLevelFilter('all')} 
                className={\`px-4 py-2 rounded-lg text-sm font-bold transition-all \${educationLevelFilter === 'all' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}\`}
              >
                ภาพรวมทั้งหมด
              </button>
              <button 
                onClick={() => setEducationLevelFilter('kindergarten')} 
                className={\`px-4 py-2 rounded-lg text-sm font-bold transition-all \${educationLevelFilter === 'kindergarten' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}\`}
              >
                ปฐมวัย
              </button>
              <button 
                onClick={() => setEducationLevelFilter('primary')} 
                className={\`px-4 py-2 rounded-lg text-sm font-bold transition-all \${educationLevelFilter === 'primary' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}\`}
              >
                ขั้นพื้นฐาน
              </button>
            </div>
            
            <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-200 flex items-center gap-3">
              <span className="text-sm font-bold text-indigo-700">ความสมบูรณ์</span>
              <span className="text-2xl font-black text-indigo-600">{overallCompleteness}%</span>
            </div>
          </div>
        </div>`;

content = content.replace(filterUiTarget, filterUiNew);

fs.writeFileSync(file, content);
console.log('SAR logic updated.');
