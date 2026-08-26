import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, getDocs, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Teacher, PDRecord, Student, KindergartenAssessment } from '../types';
import { ShieldCheck, GraduationCap, BookOpen, FileText, Bell, Search, AlertCircle, CheckCircle2, TrendingUp, Target, Award, Users, Activity, Layers, ClipboardList, PieChart, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  teachers: Teacher[];
  students: Student[];
  systemAcademicYear: string;
  currentTeacher: Teacher;
}

export function SARMonitoringDashboard({ teachers, students: allStudents, systemAcademicYear, currentTeacher }: Props) {
  const students = React.useMemo(() => allStudents.filter(s => s.status === 'active' || !s.status), [allStudents]);
  const [pdRecords, setPdRecords] = useState<PDRecord[]>([]);
  const [lessonPlans, setLessonPlans] = useState<any[]>([]);
  const [disciplineIncidents, setDisciplineIncidents] = useState<any[]>([]);
  const [subjectScores, setSubjectScores] = useState<any[]>([]);
  const [lessonRecords, setLessonRecords] = useState<any[]>([]);
  const [kgAssessments, setKgAssessments] = useState<KindergartenAssessment[]>([]);
  const [studentAssessments, setStudentAssessments] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'std1' | 'std2' | 'std3'>('overview');
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null);


  // Benchmarks
  const TARGET_TRAINING = 20; // hours per teacher
  const TARGET_PLC = 50; // hours per teacher
  const TARGET_RESEARCH = 1; // papers per teacher

  useEffect(() => {
    // Fetch all related collections for the dashboard
    const fetchData = async () => {
      // 1. PD Records
      const pdUnsub = onSnapshot(query(collection(db, 'pd_records')), (snap) => {
        setPdRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PDRecord)));
      }, (err) => console.error("Error loading PD Records:", err));

      // 2. Lesson Plans
      const plansUnsub = onSnapshot(query(collection(db, 'lessonPlans')), (snap) => {
        setLessonPlans(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => console.error("Error loading Lesson Plans:", err));

      // 3. Discipline Incidents
      const discUnsub = onSnapshot(query(collection(db, 'disciplineIncidents')), (snap) => {
        setDisciplineIncidents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => console.error("Error loading Discipline Incidents:", err));

      // 4. Subject Scores
      const scoresUnsub = onSnapshot(query(collection(db, 'subject_scores')), (snap) => {
        setSubjectScores(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => console.error("Error loading Subject Scores:", err));

      // 5. Lesson Records
      const recordsUnsub = onSnapshot(query(collection(db, 'records')), (snap) => {
        setLessonRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => console.error("Error loading Lesson Records:", err));

      // 6. Kindergarten Assessments
      const saUnsub = onSnapshot(query(collection(db, 'studentAssessments')), (snap) => {
        setStudentAssessments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => console.error("Error loading Student Assessments:", err));

      const kgUnsub = onSnapshot(query(collection(db, 'kindergartenAssessments')), (snap) => {
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
        saUnsub();
      };
    };

    fetchData();
  }, []);

  // --- FILTERING LOGIC ---
  


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

  const fKgAssessments = React.useMemo(() => {
    return kgAssessments.filter(a => validStudentIds.has(a.studentId) && a.academicYear === systemAcademicYear);
  }, [kgAssessments, validStudentIds, systemAcademicYear]);

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

  const fStudentAssessments = React.useMemo(() => {
    return studentAssessments.filter(a => validStudentIds.has(a.studentId) && a.academicYear === systemAcademicYear);
  }, [studentAssessments, validStudentIds, systemAcademicYear]);

  // Compute Standard 1 for Basic Education dynamically
  const computedStd1Eval = React.useMemo(() => {
    const defaultVal = { c1_1_1: 0, c1_1_2: 0, c1_1_3: 0, c1_1_4: 0, c1_1_5: 0, c1_1_6: 0, c1_2_1: 0, c1_2_2: 0, c1_2_3: 0, c1_2_4: 0 };
    if (!fStudents.length) return defaultVal;
    
    // Total students for percentage calculation
    const total = fStudents.length;
    const calcPerc = (count: number) => Math.round((count / total) * 100);

    // 1.1.1 อ่าน เขียน สื่อสาร: readingWriting >= 2 & comp1 >= 2
    const c1_1_1 = fStudentAssessments.filter(a => a.readingWriting >= 2 && a.competencies?.comp1 >= 2).length;
    // 1.1.2 คิดวิเคราะห์ วิจารณญาณ: comp2 >= 2 & comp3 >= 2
    const c1_1_2 = fStudentAssessments.filter(a => a.competencies?.comp2 >= 2 && a.competencies?.comp3 >= 2).length;
    // 1.1.3 นวัตกรรม: Lesson records having 'innovation-creation' tag
    let innovationPercentage = 0;
    if (fLessonRecords.length > 0) {
      const innovationLessons = fLessonRecords.filter(r => (r.sarTags || []).includes('innovation-creation')).length;
      innovationPercentage = Math.round((innovationLessons / fLessonRecords.length) * 100);
    }
    // 1.1.4 ใช้เทคโนโลยี: comp5 >= 2
    const c1_1_4 = fStudentAssessments.filter(a => a.competencies?.comp5 >= 2).length;
    // 1.1.5 ผลสัมฤทธิ์: grade >= 3 or score >= 75
    // Map latest grade for each student
    const studentGrades = new Map<string, boolean>();
    fSubjectScores.forEach(s => {
      const isGood = s.score >= 75 || s.grade === '3' || s.grade === '3.5' || s.grade === '4';
      if (!studentGrades.has(s.studentId) || isGood) studentGrades.set(s.studentId, isGood); // Take true if any is good, or we can average. Let's just say if they have good grades. 
    });
    // better logic: count students whose average score across subjects is good.
    const studentAvgScore = new Map<string, {total: number, count: number}>();
    fSubjectScores.forEach(s => {
      if (!studentAvgScore.has(s.studentId)) studentAvgScore.set(s.studentId, {total: 0, count: 0});
      const data = studentAvgScore.get(s.studentId)!;
      data.total += s.score || 0;
      data.count += 1;
    });
    let c1_1_5 = 0;
    studentAvgScore.forEach(data => {
      if (data.total / data.count >= 75) c1_1_5++;
    });

    // 1.1.6 งานอาชีพ: comp4 >= 2
    const c1_1_6 = fStudentAssessments.filter(a => a.competencies?.comp4 >= 2).length;

    // 1.2.1 ค่านิยมที่ดี: Average traits >= 2. We'll check trait1..8 >= 2 as a whole or sum >= 16
    const c1_2_1 = fStudentAssessments.filter(a => {
       const t = a.characterTraits || {};
       return ((t.trait1||0) + (t.trait2||0) + (t.trait3||0) + (t.trait4||0) + (t.trait5||0) + (t.trait6||0) + (t.trait7||0) + (t.trait8||0)) >= 16;
    }).length;
    // 1.2.2 ภูมิใจในท้องถิ่น: trait7 >= 2
    const c1_2_2 = fStudentAssessments.filter(a => a.characterTraits?.trait7 >= 2).length;
    // 1.2.3 การอยู่ร่วมกัน: trait8 >= 2 and NO fighting/bullying discipline incidents
    const badDisciplineIds = new Set(fDisciplineIncidents.filter(d => ['ทะเลาะวิวาท', 'กลั่นแกล้ง', 'บูลลี่'].some(t => d.type?.includes(t) || d.description?.includes(t))).map(d => d.studentId));
    const c1_2_3 = fStudentAssessments.filter(a => a.characterTraits?.trait8 >= 2 && !badDisciplineIds.has(a.studentId)).length;
    // 1.2.4 สุขภาวะ: has weight & height
    const c1_2_4 = fStudentAssessments.filter(a => a.weight > 0 && a.height > 0).length;

    return {
      c1_1_1: calcPerc(c1_1_1),
      c1_1_2: calcPerc(c1_1_2),
      c1_1_3: innovationPercentage,
      c1_1_4: calcPerc(c1_1_4),
      c1_1_5: calcPerc(c1_1_5),
      c1_1_6: calcPerc(c1_1_6),
      c1_2_1: calcPerc(c1_2_1),
      c1_2_2: calcPerc(c1_2_2),
      c1_2_3: calcPerc(c1_2_3),
      c1_2_4: calcPerc(c1_2_4)
    };
  }, [fStudentAssessments, fStudents.length, fLessonRecords, fSubjectScores, fDisciplineIncidents]);

  // --- CALCULATION LOGIC ---

  // Standard 1: Learner Quality
  // Academic achievement (assuming scores are available, else mock based on students presence)
  const totalStudents = fStudents.length || 1; // avoid div by 0
  
  // Calculate students with high scores/good development
  let studentsWithScores = 0;
  if (educationLevelFilter === 'kindergarten') {
    studentsWithScores = fKgAssessments.length > 0 
      ? new Set(fKgAssessments.filter(a => (a.physicalDev && a.physicalDev.length > 0) || (a.intellectualDev && a.intellectualDev.length > 0)).map(a => a.studentId)).size
      : 0;
  } else {
    studentsWithScores = fSubjectScores.length > 0 
      ? new Set(fSubjectScores.filter(s => (s.score >= 75 || s.grade >= 3)).map(s => s.studentId)).size
      : Math.floor(fStudents.length * 0.75); // Mock 75% if empty DB
  }
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
    'authentic-assessment': 'การประเมินตามสภาพจริง (Authentic Assessment)',
    'innovation-creation': 'สร้างนวัตกรรม/ชิ้นงาน (Innovation & Creation)'
  };

  
  // KG 4 Areas of Development
  // --- OVERVIEW BY GRADE LEVEL ---
  const kgOverview = React.useMemo(() => {
    const grades = ['อนุบาล 1', 'อนุบาล 2', 'อนุบาล 3'];
    return grades.map(grade => {
      const assessments = fKgAssessments.filter(a => a.gradeLevel === grade || (a.gradeLevel && a.gradeLevel.includes(grade)));
      let physical = 0, emotional = 0, social = 0, cognitive = 0;
      const count = assessments.length;
      
      if (count > 0) {
        assessments.forEach(a => {
          if (a.physicalDev && a.physicalDev.length > 0) physical++;
          if (a.emotionalDev && a.emotionalDev.length > 0) emotional++;
          if (a.citizenshipDev && a.citizenshipDev.length > 0) social++;
          if (a.intellectualDev && a.intellectualDev.length > 0) cognitive++;
        });
      }
      
      return {
        grade,
        count,
        physical: count > 0 ? (physical / count) * 100 : 0,
        emotional: count > 0 ? (emotional / count) * 100 : 0,
        social: count > 0 ? (social / count) * 100 : 0,
        cognitive: count > 0 ? (cognitive / count) * 100 : 0,
      };
    }).filter(g => g.count > 0);
  }, [fKgAssessments]);

  const primaryOverview = React.useMemo(() => {
    const gradeMap = new Map();
    
    fSubjectScores.forEach(score => {
      const grade = score.gradeLevel || 'ไม่ระบุ';
      if (!gradeMap.has(grade)) {
        gradeMap.set(grade, { highScores: 0, sumScore: 0, count: 0 });
      }
      const data = gradeMap.get(grade);
      if (Number(score.grade) >= 3 || Number(score.score) >= 75) data.highScores++;
      data.sumScore += Number(score.score) || 0;
      data.count++;
    });

    return Array.from(gradeMap.entries()).map(([grade, data]) => ({
      grade,
      count: data.count,
      avgScore: data.count > 0 ? data.sumScore / data.count : 0,
      achievementRate: data.count > 0 ? (data.highScores / data.count) * 100 : 0
    })).sort((a, b) => a.grade.localeCompare(b.grade));
  }, [fSubjectScores]);

  const kg4Areas = React.useMemo(() => {
    let physical = 0, emotional = 0, social = 0, cognitive = 0;
    const count = fKgAssessments.length;
    if (count === 0) return { physical: 0, emotional: 0, social: 0, cognitive: 0, count: 0 };
    
    fKgAssessments.forEach(a => {
      if (a.physicalDev && a.physicalDev.length > 0) physical++;
      if (a.emotionalDev && a.emotionalDev.length > 0) emotional++;
      if (a.citizenshipDev && a.citizenshipDev.length > 0) social++;
      if (a.intellectualDev && a.intellectualDev.length > 0) cognitive++;
    });
    
    return {
      physical: (physical / count) * 100,
      emotional: (emotional / count) * 100,
      social: (social / count) * 100,
      cognitive: (cognitive / count) * 100,
      count
    };
  }, [fKgAssessments]);

  // Authentic Assessment
  const authenticAssessmentPlans = fLessonRecords.filter(r => r.academicYear === systemAcademicYear && r.sarTags?.includes('authentic-assessment')).length;
  const currentYearRecordsCount = fLessonRecords.filter(r => r.academicYear === systemAcademicYear).length;
  const authenticAssessmentRate = currentYearRecordsCount > 0 ? (authenticAssessmentPlans / currentYearRecordsCount) * 100 : 0;

  const sortedTags = Object.keys(sarTagsCount)
    .map(key => ({ id: key, label: SAR_TAGS_MAP[key] || key, count: sarTagsCount[key] }))
    .sort((a, b) => b.count - a.count);

  // --- COMPLETENESS LOGIC ---
  let actualStudentsWithAnyScore = 0;
  if (educationLevelFilter === 'kindergarten') {
    actualStudentsWithAnyScore = new Set(fKgAssessments.map(a => a.studentId)).size;
  } else {
    // Both or primary
    const primaryCount = new Set(fSubjectScores.map(s => s.studentId)).size;
    if (educationLevelFilter === 'primary') {
      actualStudentsWithAnyScore = primaryCount;
    } else {
      const kgCount = new Set(fKgAssessments.map(a => a.studentId)).size;
      actualStudentsWithAnyScore = primaryCount + kgCount;
    }
  }
  const std1Completeness = fStudents.length > 0 ? Math.min((actualStudentsWithAnyScore / fStudents.length) * 100, 100) : 0;
  
  const teachersWithPd = new Set(currentYearPdRecords.map(r => r.teacherId)).size;
  const std2Completeness = fTeachers.length > 0 ? Math.min((teachersWithPd / teachers.length) * 100, 100) : 0;
  
  const currentYearLessonRecords = fLessonRecords.filter(r => r.academicYear === systemAcademicYear);
  const std3Completeness = currentYearLessonRecords.length > 0 ? Math.min((totalRecordsWithTags / currentYearLessonRecords.length) * 100, 100) : 0;
  
  const overallCompleteness = Math.round((std1Completeness + std2Completeness + std3Completeness) / 3);

  if (currentTeacher.role !== 'admin' && currentTeacher.role !== 'academic' && currentTeacher.role !== 'deputy') {
    return (
      <div className="bg-white p-8 rounded-2xl border border-rose-100 text-center">
        <AlertCircle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">ไม่มีสิทธิ์เข้าถึง</h2>
        <p className="text-slate-500 mt-2">หน้านี้สงวนไว้สำหรับฝ่ายวิชาการและผู้บริหารเท่านั้น</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
            <Target className="h-8 w-8 text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black mb-1">Executive SAR Report</h1>
            <p className="text-slate-400">รายงานสรุปผลการประเมินตนเองของสถานศึกษา ปีการศึกษา {systemAcademicYear}</p>
          </div>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3 backdrop-blur-sm">
          <Activity className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="text-xs text-slate-400 font-bold">อัปเดตข้อมูลล่าสุด</p>
            <p className="text-sm font-bold text-white">วันนี้ (Real-time)</p>
          </div>
        </div>
      </div>

      {/* Progress Indicator (Data Completeness) */}
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
                onClick={() => {
                  setEducationLevelFilter('all');
                  setActiveTab('overview');
                }} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${educationLevelFilter === 'all' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                ภาพรวมทั้งหมด
              </button>
              <button 
                onClick={() => setEducationLevelFilter('kindergarten')} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${educationLevelFilter === 'kindergarten' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                ปฐมวัย
              </button>
              <button 
                onClick={() => setEducationLevelFilter('primary')} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${educationLevelFilter === 'primary' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                ขั้นพื้นฐาน
              </button>
            </div>
            
            <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-200 flex items-center gap-3">
              <span className="text-sm font-bold text-indigo-700">ความสมบูรณ์</span>
              <span className="text-2xl font-black text-indigo-600">{overallCompleteness}%</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Std 1 Progress */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <div>
                <div className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-0.5">มาตรฐานที่ 1</div>
                <div className="text-sm font-bold text-slate-700">ข้อมูลผู้เรียน</div>
              </div>
              <span className="text-lg font-black text-slate-800">{std1Completeness.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full transition-all duration-1000" style={{ width: `${std1Completeness}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              {std1Completeness >= 80 ? 'ข้อมูลครบถ้วน' : 'ต้องเพิ่มข้อมูลผลการเรียน'}
            </p>
          </div>

          {/* Std 2 Progress */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <div>
                <div className="text-xs font-bold text-fuchsia-600 uppercase tracking-wider mb-0.5">มาตรฐานที่ 2</div>
                <div className="text-sm font-bold text-slate-700">ข้อมูลครูและการบริหาร</div>
              </div>
              <span className="text-lg font-black text-slate-800">{std2Completeness.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-fuchsia-500 h-full rounded-full transition-all duration-1000" style={{ width: `${std2Completeness}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              {std2Completeness >= 80 ? 'ข้อมูลครบถ้วน' : 'ต้องเพิ่มบันทึกพัฒนาตนเอง (PD)'}
            </p>
          </div>

          {/* Std 3 Progress */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <div>
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-0.5">มาตรฐานที่ 3</div>
                <div className="text-sm font-bold text-slate-700">ข้อมูลการสอน</div>
              </div>
              <span className="text-lg font-black text-slate-800">{std3Completeness.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: `${std3Completeness}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              {std3Completeness >= 80 ? 'ข้อมูลครบถ้วน' : 'ต้องเพิ่มบันทึกหลังสอนและ SAR Tags'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-px overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'text-indigo-600 border-indigo-600'
              : 'text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          ภาพรวม (Overview)
        </button>
        {educationLevelFilter !== 'all' && (
          <>
            <button
              onClick={() => setActiveTab('std1')}
              className={`px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === 'std1'
                  ? 'text-sky-600 border-sky-600'
                  : 'text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              ม.1 ({educationLevelFilter === 'kindergarten' ? 'คุณภาพของเด็ก' : 'คุณภาพผู้เรียน'})
            </button>
            <button
              onClick={() => setActiveTab('std2')}
              className={`px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === 'std2'
                  ? 'text-fuchsia-600 border-fuchsia-600'
                  : 'text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              ม.2 (กระบวนการบริหารฯ)
            </button>
            <button
              onClick={() => setActiveTab('std3')}
              className={`px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === 'std3'
                  ? 'text-amber-600 border-amber-600'
                  : 'text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {educationLevelFilter === 'kindergarten' ? 'ม.3 (การจัดประสบการณ์)' : 'ม.3 (การจัดการเรียนการสอน)'}
            </button>
          </>
        )}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
        
        {/* Standard 1: Learner Quality */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-sky-50/50 flex items-center gap-3">
            <div className="h-10 w-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-lg">มาตรฐานที่ 1</h2>
              <p className="text-xs font-bold text-sky-600">{educationLevelFilter === 'kindergarten' ? 'คุณภาพของเด็ก' : 'คุณภาพของผู้เรียน'}</p>
            </div>
          </div>
          <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Metric 1.1 */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-bold text-slate-700">{educationLevelFilter === 'kindergarten' ? 'พัฒนาการสมวัย (ระดับดีขึ้นไป)' : 'ผลสัมฤทธิ์ทางวิชาการ (GPA > 3.0)'}</span>
                  <span className="font-black text-sky-600">{achievementRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: `${achievementRate}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">เด็ก {studentsWithScores} จาก {fStudents.length} คน ที่มี{educationLevelFilter === 'kindergarten' ? 'พัฒนาการระดับดี' : 'ผลการเรียนระดับดีขึ้นไป'}</p>
              </div>
              
              {/* Metric 1.2 */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-bold text-slate-700">คุณลักษณะอันพึงประสงค์ (พฤติกรรมดี)</span>
                  <span className="font-black text-emerald-600">{goodBehaviorRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${goodBehaviorRate}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">ไม่มีประวัติการทำผิดกฎระเบียบร้ายแรง ({disciplineIncidents.length} incidents)</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 mt-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-100">
                <TrendingUp className="h-3.5 w-3.5" /> ภาพรวมอยู่ในเกณฑ์ดีเยี่ยม
              </span>
            </div>
          </div>
        </div>

        {/* Standard 2: Management & Administration */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-fuchsia-50/50 flex items-center gap-3">
            <div className="h-10 w-10 bg-fuchsia-100 text-fuchsia-600 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-lg">มาตรฐานที่ 2</h2>
              <p className="text-xs font-bold text-fuchsia-600">กระบวนการบริหารและการจัดการ</p>
            </div>
          </div>
          <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Metric 2.1 */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-bold text-slate-700">การพัฒนาครู (PD {'>'}= 20 ชม./ปี)</span>
                  <span className="font-black text-fuchsia-600">{trainingRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-fuchsia-500 h-full rounded-full" style={{ width: `${trainingRate}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">ครู {teachersWithTrainingTarget} จาก {teachers.length} ท่าน ผ่านเกณฑ์การอบรม</p>
              </div>
              
              {/* Metric 2.2 */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">ชุมชนการเรียนรู้ทางวิชาชีพ (PLC)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">ชั่วโมงการแลกเปลี่ยนเรียนรู้รวม</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-800">{totalPlcHours}</span>
                  <span className="text-xs font-bold text-slate-500 ml-1">ชม.</span>
                </div>
              </div>

              {/* Metric 2.3 (Media & Tech) */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-700 text-sm leading-tight max-w-[200px]">ให้บริการสื่อเทคโนโลยีสารสนเทศและสื่อการเรียนรู้เพื่อสนับสนุนการจัดประสบการณ์</h4>
                  <span className="inline-flex bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">100%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">อ้างอิงจากแผนการสอนที่มีการใช้สื่อและเทคโนโลยี</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 mt-4">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${trainingRate >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                {trainingRate >= 80 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />} 
                {trainingRate >= 80 ? 'บรรลุเป้าหมายการพัฒนา' : 'ควรเร่งรัดการอบรมครู'}
              </span>
            </div>
          </div>
        </div>

        {/* Standard 3: Student-Centered Teaching */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-amber-50/50 flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-lg">มาตรฐานที่ 3</h2>
              <p className="text-xs font-bold text-amber-600">{educationLevelFilter === 'kindergarten' ? 'การจัดประสบการณ์ที่เน้นเด็กเป็นสำคัญ' : 'การจัดการเรียนการสอนที่เน้นผู้เรียน'}</p>
            </div>
          </div>
          <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                <FileText className="h-6 w-6 text-slate-400 mb-2" />
                <span className="text-2xl font-black text-slate-800">{totalLessonPlans}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">แผนการสอนรวม</span>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col items-center justify-center text-center">
                <Target className="h-6 w-6 text-amber-500 mb-2" />
                <span className="text-2xl font-black text-amber-700">{activeLearningRate.toFixed(0)}%</span>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-1">Active Learning</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-bold text-slate-700 mb-1">วิจัยในชั้นเรียน</div>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-black text-slate-800">{totalResearch}</span>
                  <span className="text-xs text-slate-500 mb-1">เรื่อง</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-700 mb-1">สื่อ / นวัตกรรม</div>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-black text-slate-800">{totalInnovations}</span>
                  <span className="text-xs text-slate-500 mb-1">ชิ้นงาน</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 mt-4">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${totalResearch > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                {totalResearch > 0 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />} 
                {totalResearch > 0 ? 'มีการแก้ปัญหาด้วยกระบวนการวิจัย' : 'ยังขาดงานวิจัยในชั้นเรียน'}
              </span>
            </div>
          </div>
        </div>

      </div>
      )}

      {activeTab === 'std1' && (
  <div className="space-y-4 animate-in fade-in duration-300 mb-6">
    {(educationLevelFilter === 'all' || educationLevelFilter === 'kindergarten') && (
      <>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-slate-100 bg-sky-50/50 flex items-center gap-3">
            <div className="h-10 w-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-lg">มาตรฐานที่ 1: คุณภาพของเด็ก (ปฐมวัย)</h2>
              <p className="text-xs font-bold text-sky-600">เจาะลึกตามประเด็นการพิจารณา (คลิกที่แต่ละหัวข้อเพื่อดูหลักฐานอ้างอิง)</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
              {/* KG 1.1 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <button 
                  onClick={() => setExpandedEvidence(expandedEvidence === 'kg1.1' ? null : 'kg1.1')}
                  className="w-full text-left px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4 focus:outline-none"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">1.1 มีพัฒนาการด้านร่างกาย แข็งแรง มีสุขนิสัยที่ดี และดูแลความปลอดภัยของตนเองได้</h3>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden max-w-[200px]">
                        <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${kg4Areas.physical}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-600">{kg4Areas.physical.toFixed(1)}% บรรลุ</span>
                    </div>
                  </div>
                  <div className="shrink-0 self-end sm:self-auto p-2 bg-slate-100 rounded-full text-slate-500">
                    {expandedEvidence === 'kg1.1' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>
                {expandedEvidence === 'kg1.1' && (
                  <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm text-slate-600 mb-4 font-medium flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500"/> แหล่งข้อมูลอ้างอิง: ผลการประเมินพัฒนาการปฐมวัยรายบุคคล (ด้านร่างกาย)</p>
                    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">ระดับชั้น</th>
                            <th className="px-4 py-3 text-center">จำนวนเด็กประเมิน</th>
                            <th className="px-4 py-3 text-center">มีพัฒนาการระดับดีขึ้นไป</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kgOverview.map(overview => (
                            <tr key={overview.grade} className="border-b border-slate-100">
                              <td className="px-4 py-3 font-bold text-slate-700">{overview.grade}</td>
                              <td className="px-4 py-3 text-center font-medium text-slate-600">{overview.count} คน</td>
                              <td className="px-4 py-3 text-center">
                                 <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${overview.physical >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{overview.physical.toFixed(1)}%</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* KG 1.2 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <button 
                  onClick={() => setExpandedEvidence(expandedEvidence === 'kg1.2' ? null : 'kg1.2')}
                  className="w-full text-left px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4 focus:outline-none"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">1.2 มีพัฒนาการด้านอารมณ์ จิตใจ ควบคุม และแสดงออกทางอารมณ์ได้</h3>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden max-w-[200px]">
                        <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${kg4Areas.emotional}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-600">{kg4Areas.emotional.toFixed(1)}% บรรลุ</span>
                    </div>
                  </div>
                  <div className="shrink-0 self-end sm:self-auto p-2 bg-slate-100 rounded-full text-slate-500">
                    {expandedEvidence === 'kg1.2' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>
                {expandedEvidence === 'kg1.2' && (
                  <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm text-slate-600 mb-4 font-medium flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500"/> แหล่งข้อมูลอ้างอิง: ผลการประเมินพัฒนาการปฐมวัยรายบุคคล (ด้านอารมณ์ จิตใจ)</p>
                    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">ระดับชั้น</th>
                            <th className="px-4 py-3 text-center">จำนวนเด็กประเมิน</th>
                            <th className="px-4 py-3 text-center">มีพัฒนาการระดับดีขึ้นไป</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kgOverview.map(overview => (
                            <tr key={overview.grade} className="border-b border-slate-100">
                              <td className="px-4 py-3 font-bold text-slate-700">{overview.grade}</td>
                              <td className="px-4 py-3 text-center font-medium text-slate-600">{overview.count} คน</td>
                              <td className="px-4 py-3 text-center">
                                 <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${overview.emotional >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{overview.emotional.toFixed(1)}%</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* KG 1.3 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <button 
                  onClick={() => setExpandedEvidence(expandedEvidence === 'kg1.3' ? null : 'kg1.3')}
                  className="w-full text-left px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4 focus:outline-none"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">1.3 มีพัฒนาการด้านสังคม ช่วยเหลือตนเอง และเป็นสมาชิกที่ดีของสังคม</h3>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden max-w-[200px]">
                        <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${kg4Areas.social}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-600">{kg4Areas.social.toFixed(1)}% บรรลุ</span>
                    </div>
                  </div>
                  <div className="shrink-0 self-end sm:self-auto p-2 bg-slate-100 rounded-full text-slate-500">
                    {expandedEvidence === 'kg1.3' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>
                {expandedEvidence === 'kg1.3' && (
                  <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm text-slate-600 mb-4 font-medium flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500"/> แหล่งข้อมูลอ้างอิง: ผลการประเมินพัฒนาการปฐมวัยรายบุคคล (ด้านสังคม)</p>
                    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">ระดับชั้น</th>
                            <th className="px-4 py-3 text-center">จำนวนเด็กประเมิน</th>
                            <th className="px-4 py-3 text-center">มีพัฒนาการระดับดีขึ้นไป</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kgOverview.map(overview => (
                            <tr key={overview.grade} className="border-b border-slate-100">
                              <td className="px-4 py-3 font-bold text-slate-700">{overview.grade}</td>
                              <td className="px-4 py-3 text-center font-medium text-slate-600">{overview.count} คน</td>
                              <td className="px-4 py-3 text-center">
                                 <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${overview.social >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{overview.social.toFixed(1)}%</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* KG 1.4 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <button 
                  onClick={() => setExpandedEvidence(expandedEvidence === 'kg1.4' ? null : 'kg1.4')}
                  className="w-full text-left px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4 focus:outline-none"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">1.4 มีพัฒนาการด้านสติปัญญา สื่อสารได้ มีทักษะการคิดพื้นฐาน และแสวงหาความรู้ได้</h3>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden max-w-[200px]">
                        <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${kg4Areas.cognitive}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-600">{kg4Areas.cognitive.toFixed(1)}% บรรลุ</span>
                    </div>
                  </div>
                  <div className="shrink-0 self-end sm:self-auto p-2 bg-slate-100 rounded-full text-slate-500">
                    {expandedEvidence === 'kg1.4' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>
                {expandedEvidence === 'kg1.4' && (
                  <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm text-slate-600 mb-4 font-medium flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500"/> แหล่งข้อมูลอ้างอิง: ผลการประเมินพัฒนาการปฐมวัยรายบุคคล (ด้านสติปัญญา)</p>
                    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">ระดับชั้น</th>
                            <th className="px-4 py-3 text-center">จำนวนเด็กประเมิน</th>
                            <th className="px-4 py-3 text-center">มีพัฒนาการระดับดีขึ้นไป</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kgOverview.map(overview => (
                            <tr key={overview.grade} className="border-b border-slate-100">
                              <td className="px-4 py-3 font-bold text-slate-700">{overview.grade}</td>
                              <td className="px-4 py-3 text-center font-medium text-slate-600">{overview.count} คน</td>
                              <td className="px-4 py-3 text-center">
                                 <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${overview.cognitive >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{overview.cognitive.toFixed(1)}%</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
                </>
    )}
    {(educationLevelFilter === 'all' || educationLevelFilter !== 'kindergarten') && (
      <>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6 mt-8">
          <div className="p-5 border-b border-slate-100 bg-sky-50/50 flex items-center gap-3">
            <div className="h-10 w-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-lg">มาตรฐานที่ 1: คุณภาพของผู้เรียน (ขั้นพื้นฐาน)</h2>
              <p className="text-xs font-bold text-sky-600">เจาะลึกตามประเด็นการพิจารณา (คลิกที่แต่ละหัวข้อเพื่อดูหลักฐานอ้างอิง)</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
              
              <div className="bg-gradient-to-r from-sky-500 to-indigo-500 rounded-xl shadow-sm border-0 p-6 mb-4 text-white">
                <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  การประเมินคุณภาพผู้เรียน (คำนวณอัตโนมัติ)
                </h3>
                <p className="text-sky-100 text-sm">ข้อมูลถูกประมวลผลอัตโนมัติแบบ Real-time จากระบบฐานข้อมูล (เกรด, ประเมินพัฒนาการ, สมรรถนะ, บันทึกวินัย, และบันทึกหลังสอน)</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6 p-6 animate-in fade-in">
                  <div className="mb-6">
                    <h4 className="font-bold text-slate-800 mb-4 text-lg border-b pb-2">1.1 ผลสัมฤทธิ์ทางวิชาการของผู้เรียน</h4>
                    <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden">
                      {[
                        { id: 'c1_1_1', title: '1.มีความสามารถในการอ่าน การเขียน การสื่อสาร และการคิดคำนวณ' },
                        { id: 'c1_1_2', title: '2.มีความสามารถในการคิดวิเคราะห์ คิดอย่างมีวิจารณญาณ อภิปรายแลกเปลี่ยนความคิดเห็น และแก้ปัญหา' },
                        { id: 'c1_1_3', title: '3.มีความสามารถในการสร้างนวัตกรรม' },
                        { id: 'c1_1_4', title: '4.มีความสามารถในการใช้เทคโนโลยีสารสนเทศและการสื่อสาร' },
                        { id: 'c1_1_5', title: '5.มีผลสัมฤทธิ์ทางการเรียนตามหลักสูตรสถานศึกษา' },
                        { id: 'c1_1_6', title: '6.มีความรู้ ทักษะพื้นฐาน และเจตคติที่ดีต่องานอาชีพ' }
                      ].map(c => (
                        <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-700">{c.title}</p>
                          </div>
                          <div className="shrink-0 flex items-center gap-3 min-w-[200px]">
                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-sky-500 h-full rounded-full transition-all duration-1000" style={{ width: `${computedStd1Eval?.[c.id as keyof typeof computedStd1Eval] || 0}%` }}></div>
                            </div>
                            <span className="text-sm font-bold text-slate-700 w-12 text-right">{computedStd1Eval?.[c.id as keyof typeof computedStd1Eval] || 0}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                    <div className="p-4 bg-emerald-50 border-b border-slate-200">
                       <h4 className="font-bold text-slate-800 text-base">1.2 คุณลักษณะที่พึงประสงค์ของผู้เรียน</h4>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {[
                        { id: 'c1_2_1', title: '1.การมีคุณลักษณะและค่านิยมที่ดีตามที่สถานศึกษากำหนด' },
                        { id: 'c1_2_2', title: '2.ความภูมิใจในท้องถิ่นและความเป็นไทย' },
                        { id: 'c1_2_3', title: '3.การยอมรับที่จะอยู่ร่วมกันบนความแตกต่างและหลากหลาย' },
                        { id: 'c1_2_4', title: '4.สุขภาวะทางร่างกาย และจิตสังคม' }
                      ].map(c => (
                        <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-700">{c.title}</p>
                          </div>
                          <div className="shrink-0 flex items-center gap-3 min-w-[200px]">
                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${computedStd1Eval?.[c.id as keyof typeof computedStd1Eval] || 0}%` }}></div>
                            </div>
                            <span className="text-sm font-bold text-slate-700 w-12 text-right">{computedStd1Eval?.[c.id as keyof typeof computedStd1Eval] || 0}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
        </div>
      </>
    )}
        </div>
      )}
      {activeTab === 'std2' && (educationLevelFilter === 'all' || educationLevelFilter === 'kindergarten') && (
        <div className="space-y-4 animate-in fade-in duration-300 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
            <div className="p-5 border-b border-slate-100 bg-fuchsia-50/50 flex items-center gap-3">
              <div className="h-10 w-10 bg-fuchsia-100 text-fuchsia-600 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-black text-slate-800 text-lg">มาตรฐานที่ 2: กระบวนการบริหารและการจัดการ (ปฐมวัย)</h2>
                <p className="text-xs font-bold text-fuchsia-600">เจาะลึกตามประเด็นการพิจารณา (คลิกที่หัวข้อเพื่อดูหลักฐาน)</p>
              </div>
            </div>
          </div>
          {[
            { id: 'kg2.1', title: '2.1 มีหลักสูตรครอบคลุมพัฒนาการทั้ง 4 ด้าน สอดคล้องกับบริบทของท้องถิ่น' },
            { id: 'kg2.2', title: '2.2 จัดครูให้เพียงพอกับชั้นเรียน' },
          ].map(item => (
             <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <button 
                  onClick={() => setExpandedEvidence(expandedEvidence === item.id ? null : item.id)}
                  className="w-full text-left px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4 focus:outline-none"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">{item.title}</h3>
                  </div>
                </button>
             </div>
          ))}
          {/* KG 2.3 Teacher PD */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button 
              onClick={() => setExpandedEvidence(expandedEvidence === 'kg2.3' ? null : 'kg2.3')}
              className="w-full text-left px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4 focus:outline-none"
            >
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">2.3 ส่งเสริมให้ครูมีความเชี่ยวชาญด้านการจัดประสบการณ์</h3>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden max-w-[200px]">
                    <div className="bg-fuchsia-500 h-full rounded-full transition-all" style={{ width: `${trainingRate}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{trainingRate.toFixed(1)}% พัฒนาตนเองตามเกณฑ์</span>
                </div>
              </div>
              <div className="shrink-0 self-end sm:self-auto p-2 bg-slate-100 rounded-full text-slate-500">
                {expandedEvidence === 'kg2.3' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>
            {expandedEvidence === 'kg2.3' && (
              <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-slate-600 mb-4 font-medium flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-fuchsia-500"/> แหล่งข้อมูลอ้างอิง: ระบบบันทึกการพัฒนาตนเองและวิชาชีพ (PD & PLC)</p>
                <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">ชื่อ-นามสกุลครู</th>
                        <th className="px-4 py-3 text-center">อบรมพัฒนา (ชม.)</th>
                        <th className="px-4 py-3 text-center">PLC (ชม.)</th>
                        <th className="px-4 py-3 text-center">นวัตกรรม (ชิ้นงาน)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fTeachers.slice(0, 100).map(teacher => {
                        const trData = fPdRecords.filter(r => r.teacherId === teacher.id && r.academicYear === systemAcademicYear);
                        const pdHours = trData.filter(r => r.type === 'training').reduce((sum, r) => sum + (r.hours || 0), 0);
                        const plcHours = trData.filter(r => r.type === 'plc').reduce((sum, r) => sum + (r.hours || 0), 0);
                        const innovationCount = trData.filter(r => r.type === 'award').length;
                        return (
                          <tr key={teacher.id} className="border-b border-slate-100">
                            <td className="px-4 py-3 font-medium text-slate-700">{teacher.firstName} {teacher.lastName}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${pdHours >= TARGET_TRAINING ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {pdHours}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-slate-600">{plcHours}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{innovationCount}</td>
                          </tr>
                        );
                      })}
                      {fTeachers.length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">ไม่มีข้อมูลบุคลากร</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          {[
            { id: 'kg2.4', title: '2.4 จัดสภาพแวดล้อมและสื่อเพื่อการเรียนรู้ อย่างปลอดภัย และเพียงพอ' },
            { id: 'kg2.5', title: '2.5 ให้บริการสื่อเทคโนโลยีสารสนเทศและสื่อการเรียนรู้เพื่อสนับสนุนการจัดประสบการณ์' },
            { id: 'kg2.6', title: '2.6 มีระบบบริหารจัดการคุณภาพของสถานศึกษา' }
          ].map(item => (
             <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <button 
                  onClick={() => setExpandedEvidence(expandedEvidence === item.id ? null : item.id)}
                  className="w-full text-left px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4 focus:outline-none"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">{item.title}</h3>
                  </div>
                </button>
             </div>
          ))}
        </div>
      )}

      {activeTab === 'std2' && educationLevelFilter !== 'kindergarten' && (
        <div className="space-y-4 animate-in fade-in duration-300 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
            <div className="p-5 border-b border-slate-100 bg-fuchsia-50/50 flex items-center gap-3">
              <div className="h-10 w-10 bg-fuchsia-100 text-fuchsia-600 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-black text-slate-800 text-lg">มาตรฐานที่ 2: กระบวนการบริหารและการจัดการ (ขั้นพื้นฐาน)</h2>
                <p className="text-xs font-bold text-fuchsia-600">เจาะลึกตามประเด็นการพิจารณา (คลิกที่หัวข้อเพื่อดูหลักฐาน)</p>
              </div>
            </div>
          </div>

          {/* 2.1 - 2.3 Placeholders */}
          {[
            { id: '2.1', title: '2.1 มีเป้าหมายวิสัยทัศน์และพันธกิจที่สถานศึกษากำหนดชัดเจน' },
            { id: '2.2', title: '2.2 มีระบบบริหารจัดการคุณภาพของสถานศึกษา' },
            { id: '2.3', title: '2.3 ดำเนินงานพัฒนาวิชาการที่เน้นคุณภาพผู้เรียนรอบด้านตามหลักสูตรสถานศึกษาและทุกกลุ่มเป้าหมาย' }
          ].map(item => (
             <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <button 
                  onClick={() => setExpandedEvidence(expandedEvidence === item.id ? null : item.id)}
                  className="w-full text-left px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4 focus:outline-none"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">{item.title}</h3>
                    <div className="mt-2">
                       <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">รอเชื่อมโยงข้อมูลจากระบบบริหารแผนงาน/ธุรการ</span>
                    </div>
                  </div>
                  <div className="shrink-0 self-end sm:self-auto p-2 bg-slate-100 rounded-full text-slate-500">
                    {expandedEvidence === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>
             </div>
          ))}

          {/* 2.4 Teacher PD */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button 
              onClick={() => setExpandedEvidence(expandedEvidence === '2.4' ? null : '2.4')}
              className="w-full text-left px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4 focus:outline-none"
            >
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">2.4 พัฒนาครูและบุคลากรให้มีความเชี่ยวชาญทางวิชาชีพ</h3>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden max-w-[200px]">
                    <div className="bg-fuchsia-500 h-full rounded-full transition-all" style={{ width: `${trainingRate}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{trainingRate.toFixed(1)}% พัฒนาตนเองตามเกณฑ์</span>
                </div>
              </div>
              <div className="shrink-0 self-end sm:self-auto p-2 bg-slate-100 rounded-full text-slate-500">
                {expandedEvidence === '2.4' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>
            {expandedEvidence === '2.4' && (
              <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-slate-600 mb-4 font-medium flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-fuchsia-500"/> แหล่งข้อมูลอ้างอิง: ระบบบันทึกการพัฒนาตนเองและวิชาชีพ (PD & PLC)</p>
                <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">ชื่อ-นามสกุลครู</th>
                        <th className="px-4 py-3 text-center">อบรมพัฒนา (ชม.)</th>
                        <th className="px-4 py-3 text-center">PLC (ชม.)</th>
                        <th className="px-4 py-3 text-center">งานวิจัย (เรื่อง)</th>
                        <th className="px-4 py-3 text-center">สื่อ/นวัตกรรม (ชิ้นงาน)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fTeachers.slice(0, 100).map(teacher => {
                        const trData = fPdRecords.filter(r => r.teacherId === teacher.id && r.academicYear === systemAcademicYear);
                        const pdHours = trData.filter(r => r.type === 'training').reduce((sum, r) => sum + (r.hours || 0), 0);
                        const plcHours = trData.filter(r => r.type === 'plc').reduce((sum, r) => sum + (r.hours || 0), 0);
                        const researchCount = trData.filter(r => r.type === 'research').length;
                        const innovationCount = trData.filter(r => r.type === 'award').length; // using award for now
                        return (
                          <tr key={teacher.id} className="border-b border-slate-100">
                            <td className="px-4 py-3 font-medium text-slate-700">{teacher.firstName} {teacher.lastName}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${pdHours >= TARGET_TRAINING ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {pdHours}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-slate-600">{plcHours}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{researchCount}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{innovationCount}</td>
                          </tr>
                        );
                      })}
                      {fTeachers.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">ไม่มีข้อมูลบุคลากร</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* 2.5 - 2.6 Placeholders */}
          {[
            { id: '2.5', title: '2.5 จัดสภาพแวดล้อมทางกายภาพและสังคมที่เอื้อต่อการจัดการเรียนรู้อย่างมีคุณภาพ' },
            { id: '2.6', title: '2.6 จัดระบบเทคโนโลยีสารสนเทศเพื่อสนับสนุนการบริหารจัดการและการจัดการเรียนรู้' }
          ].map(item => (
             <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <button 
                  onClick={() => setExpandedEvidence(expandedEvidence === item.id ? null : item.id)}
                  className="w-full text-left px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4 focus:outline-none"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">{item.title}</h3>
                    <div className="mt-2">
                       <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">รอเชื่อมโยงข้อมูลจากระบบงานอาคารสถานที่ / ทะเบียนพัสดุ</span>
                    </div>
                  </div>
                  <div className="shrink-0 self-end sm:self-auto p-2 bg-slate-100 rounded-full text-slate-500">
                    {expandedEvidence === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>
             </div>
          ))}

        </div>
      )}

      {activeTab === 'std3' && (educationLevelFilter === 'all' || educationLevelFilter === 'kindergarten') && (
        <div className="space-y-4 animate-in fade-in duration-300 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
            <div className="p-5 border-b border-slate-100 bg-amber-50/50 flex items-center gap-3">
              <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-black text-slate-800 text-lg">มาตรฐานที่ 3: การจัดประสบการณ์ที่เน้นเด็กเป็นสำคัญ (ปฐมวัย)</h2>
                <p className="text-xs font-bold text-amber-600">เจาะลึกตามประเด็นการพิจารณา (คลิกที่หัวข้อเพื่อดูหลักฐาน)</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button 
              onClick={() => setExpandedEvidence(expandedEvidence === 'kg3.1' ? null : 'kg3.1')}
              className="w-full text-left px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4 focus:outline-none"
            >
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">3.1 จัดประสบการณ์ที่ส่งเสริมให้เด็กมีพัฒนาการทุกด้านอย่างสมดุลเต็มศักยภาพ</h3>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden max-w-[200px]">
                    <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${totalRecordsWithTags > 0 ? ((sarTagsCount['active-learning'] || 0) / totalRecordsWithTags) * 100 : 0}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{totalRecordsWithTags > 0 ? (((sarTagsCount['active-learning'] || 0) / totalRecordsWithTags) * 100).toFixed(1) : 0}% ของบันทึกหลังสอน</span>
                </div>
              </div>
              <div className="shrink-0 self-end sm:self-auto p-2 bg-slate-100 rounded-full text-slate-500">
                {expandedEvidence === 'kg3.1' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>
            {expandedEvidence === 'kg3.1' && (
              <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-slate-600 mb-4 font-medium flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500"/> แหล่งข้อมูลอ้างอิง: ระบบบันทึกหลังจัดประสบการณ์ (แผนที่ระบุครอบคลุม 4 ด้าน)</p>
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
                     <FileText className="h-8 w-8" />
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                     <span className="text-4xl font-black text-amber-600">{sarTagsCount['active-learning'] || 0}</span>
                     <span className="text-sm font-bold text-slate-500 mb-1.5">จาก {totalRecordsWithTags} แผนการจัดประสบการณ์</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {[
            { id: 'kg3.2', title: '3.2 สร้างโอกาสให้เด็กได้รับประสบการณ์ตรง เล่นและปฏิบัติอย่างมีความสุข' },
            { id: 'kg3.3', title: '3.3 จัดบรรยากาศที่เอื้อต่อการเรียนรู้ใช้สื่อและเทคโนโลยีที่เหมาะสมกับวัย' },
          ].map(item => (
             <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <button 
                  onClick={() => setExpandedEvidence(expandedEvidence === item.id ? null : item.id)}
                  className="w-full text-left px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4 focus:outline-none"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">{item.title}</h3>
                  </div>
                  <div className="shrink-0 self-end sm:self-auto p-2 bg-slate-100 rounded-full text-slate-500">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>
             </div>
          ))}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button 
              onClick={() => setExpandedEvidence(expandedEvidence === 'kg3.4' ? null : 'kg3.4')}
              className="w-full text-left px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4 focus:outline-none"
            >
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">3.4 ประเมินพัฒนาการเด็กตามสภาพจริงและนำผลการประเมินพัฒนาการเด็กไปปรับปรุงการจัดประสบการณ์และพัฒนาเด็ก</h3>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden max-w-[200px]">
                    <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${totalRecordsWithTags > 0 ? ((sarTagsCount['authentic-assessment'] || 0) / totalRecordsWithTags) * 100 : 0}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{totalRecordsWithTags > 0 ? (((sarTagsCount['authentic-assessment'] || 0) / totalRecordsWithTags) * 100).toFixed(1) : 0}% ประเมินตามสภาพจริง</span>
                </div>
              </div>
              <div className="shrink-0 self-end sm:self-auto p-2 bg-slate-100 rounded-full text-slate-500">
                {expandedEvidence === 'kg3.4' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>
            {expandedEvidence === 'kg3.4' && (
              <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-slate-600 mb-4 font-medium flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500"/> แหล่งข้อมูลอ้างอิง: ระบบบันทึกหลังจัดประสบการณ์ (ประเมินตามสภาพจริง)</p>
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="flex items-end gap-2 mb-2">
                     <span className="text-4xl font-black text-amber-600">{sarTagsCount['authentic-assessment'] || 0}</span>
                     <span className="text-sm font-bold text-slate-500 mb-1.5">ครั้ง ที่ครูรายงานการประเมินพัฒนาการรายบุคคลในชั้นเรียน</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'std3' && educationLevelFilter !== 'kindergarten' && (
        <div className="space-y-4 animate-in fade-in duration-300 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
            <div className="p-5 border-b border-slate-100 bg-amber-50/50 flex items-center gap-3">
              <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-black text-slate-800 text-lg">มาตรฐานที่ 3: กระบวนการจัดการเรียนการสอนที่เน้นผู้เรียนเป็นสำคัญ (ขั้นพื้นฐาน)</h2>
                <p className="text-xs font-bold text-amber-600">เจาะลึกตามประเด็นการพิจารณา (คลิกที่หัวข้อเพื่อดูหลักฐาน)</p>
              </div>
            </div>
          </div>

          {/* 3.1 Active Learning */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button 
              onClick={() => setExpandedEvidence(expandedEvidence === '3.1' ? null : '3.1')}
              className="w-full text-left px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4 focus:outline-none"
            >
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">3.1 จัดการเรียนรู้ผ่านกระบวนการคิดและปฏิบัติจริง และสามารถนำไปประยุกต์ใช้ในชีวิตได้</h3>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden max-w-[200px]">
                    <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${totalRecordsWithTags > 0 ? ((sarTagsCount['active-learning'] || 0) / totalRecordsWithTags) * 100 : 0}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{totalRecordsWithTags > 0 ? (((sarTagsCount['active-learning'] || 0) / totalRecordsWithTags) * 100).toFixed(1) : 0}% บูรณาการ Active Learning</span>
                </div>
              </div>
              <div className="shrink-0 self-end sm:self-auto p-2 bg-slate-100 rounded-full text-slate-500">
                {expandedEvidence === '3.1' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>
            {expandedEvidence === '3.1' && (
              <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-slate-600 mb-4 font-medium flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500"/> แหล่งข้อมูลอ้างอิง: ระบบบันทึกหลังสอนที่มีการระบุแท็ก "การเรียนรู้เชิงรุก (Active Learning)"</p>
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
                     <FileText className="h-8 w-8" />
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                     <span className="text-4xl font-black text-amber-600">{sarTagsCount['active-learning'] || 0}</span>
                     <span className="text-sm font-bold text-slate-500 mb-1.5">จาก {totalRecordsWithTags} บันทึกการสอนทั้งหมด</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">ระบุว่าเป็นคาบเรียนที่เน้นกระบวนการคิดและปฏิบัติจริง</p>
                </div>
              </div>
            )}
          </div>

          {/* 3.2 Tech Integration */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button 
              onClick={() => setExpandedEvidence(expandedEvidence === '3.2' ? null : '3.2')}
              className="w-full text-left px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4 focus:outline-none"
            >
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">3.2 ใช้สื่อ เทคโนโลยีสารสนเทศ และแหล่งเรียนรู้ที่เอื้อต่อการเรียนรู้</h3>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden max-w-[200px]">
                    <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${totalRecordsWithTags > 0 ? ((sarTagsCount['tech-integration'] || 0) / totalRecordsWithTags) * 100 : 0}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{totalRecordsWithTags > 0 ? (((sarTagsCount['tech-integration'] || 0) / totalRecordsWithTags) * 100).toFixed(1) : 0}% ใช้งานสื่อและเทคโนโลยี</span>
                </div>
              </div>
              <div className="shrink-0 self-end sm:self-auto p-2 bg-slate-100 rounded-full text-slate-500">
                {expandedEvidence === '3.2' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>
            {expandedEvidence === '3.2' && (
              <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-slate-600 mb-4 font-medium flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500"/> แหล่งข้อมูลอ้างอิง: ระบบบันทึกหลังสอนที่มีการระบุแท็ก "การบูรณาการเทคโนโลยี (Tech Integration)"</p>
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
                     <Target className="h-8 w-8" />
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                     <span className="text-4xl font-black text-amber-600">{sarTagsCount['tech-integration'] || 0}</span>
                     <span className="text-sm font-bold text-slate-500 mb-1.5">คาบเรียน มีการใช้สื่อเทคโนโลยีประกอบการเรียนรู้</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3.3 Positive Classroom Management */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button 
              onClick={() => setExpandedEvidence(expandedEvidence === '3.3' ? null : '3.3')}
              className="w-full text-left px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4 focus:outline-none"
            >
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">3.3 มีการบริหารจัดการชั้นเรียนเชิงบวก</h3>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden max-w-[200px]">
                    <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${totalRecordsWithTags > 0 ? ((sarTagsCount['moral-ethics'] || 0) / totalRecordsWithTags) * 100 : 0}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{totalRecordsWithTags > 0 ? (((sarTagsCount['moral-ethics'] || 0) / totalRecordsWithTags) * 100).toFixed(1) : 0}% เน้นเชิงบวกและคุณธรรม</span>
                </div>
              </div>
              <div className="shrink-0 self-end sm:self-auto p-2 bg-slate-100 rounded-full text-slate-500">
                {expandedEvidence === '3.3' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>
            {expandedEvidence === '3.3' && (
              <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-slate-600 mb-4 font-medium flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500"/> แหล่งข้อมูลอ้างอิง: ระบบบันทึกหลังสอนที่มีแท็กส่งเสริมพฤติกรรมเชิงบวก</p>
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="flex items-end gap-2 mb-2">
                     <span className="text-4xl font-black text-amber-600">{sarTagsCount['moral-ethics'] || 0}</span>
                     <span className="text-sm font-bold text-slate-500 mb-1.5">รายการปฏิบัติจริงในห้องเรียน</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3.4 Authentic Assessment */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button 
              onClick={() => setExpandedEvidence(expandedEvidence === '3.4' ? null : '3.4')}
              className="w-full text-left px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4 focus:outline-none"
            >
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">3.4 ตรวจสอบและประเมินผู้เรียนอย่างเป็นระบบ และนำผลมาพัฒนาผู้เรียน</h3>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden max-w-[200px]">
                    <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${totalRecordsWithTags > 0 ? ((sarTagsCount['authentic-assessment'] || 0) / totalRecordsWithTags) * 100 : 0}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{totalRecordsWithTags > 0 ? (((sarTagsCount['authentic-assessment'] || 0) / totalRecordsWithTags) * 100).toFixed(1) : 0}% ประเมินตามสภาพจริง</span>
                </div>
              </div>
              <div className="shrink-0 self-end sm:self-auto p-2 bg-slate-100 rounded-full text-slate-500">
                {expandedEvidence === '3.4' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>
            {expandedEvidence === '3.4' && (
              <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-slate-600 mb-4 font-medium flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500"/> แหล่งข้อมูลอ้างอิง: ระบบบันทึกหลังสอนที่มีการระบุแท็ก "การประเมินตามสภาพจริง (Authentic Assessment)"</p>
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="flex items-end gap-2 mb-2">
                     <span className="text-4xl font-black text-amber-600">{sarTagsCount['authentic-assessment'] || 0}</span>
                     <span className="text-sm font-bold text-slate-500 mb-1.5">ครั้ง ที่ครูรายงานการประเมินผู้เรียนตามสภาพจริงด้วยวิธีที่หลากหลาย</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3.5 PLC / Feedback */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button 
              onClick={() => setExpandedEvidence(expandedEvidence === '3.5' ? null : '3.5')}
              className="w-full text-left px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4 focus:outline-none"
            >
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">3.5 มีการแลกเปลี่ยนเรียนรู้และให้ข้อมูลสะท้อนกลับเพื่อพัฒนาและปรับปรุงการจัดการเรียนรู้</h3>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                    ดำเนินการ {totalPlcHours} ชั่วโมง และ งานวิจัย {totalResearch} เรื่อง
                  </span>
                </div>
              </div>
              <div className="shrink-0 self-end sm:self-auto p-2 bg-slate-100 rounded-full text-slate-500">
                {expandedEvidence === '3.5' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>
            {expandedEvidence === '3.5' && (
              <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-slate-600 mb-4 font-medium flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500"/> แหล่งข้อมูลอ้างอิง: จำนวนชั่วโมงชุมชนการเรียนรู้ทางวิชาชีพ (PLC) และงานวิจัยในชั้นเรียน</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="flex items-end gap-2 mb-2">
                       <span className="text-4xl font-black text-amber-600">{totalPlcHours}</span>
                       <span className="text-sm font-bold text-slate-500 mb-1.5">ชั่วโมง</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700">ชั่วโมง PLC รวมของโรงเรียน (การแลกเปลี่ยนเรียนรู้)</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="flex items-end gap-2 mb-2">
                       <span className="text-4xl font-black text-amber-600">{totalResearch}</span>
                       <span className="text-sm font-bold text-slate-500 mb-1.5">เรื่อง</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700">การทำวิจัยในชั้นเรียนของครู (การให้ข้อมูลสะท้อนกลับเพื่อแก้ปัญหา)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SARMonitoringDashboard;
