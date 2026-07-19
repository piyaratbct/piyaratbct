import React, { useState } from 'react';
import { Settings, BarChart3, TrendingUp, Award, BookOpen, ChevronDown, CheckCircle, Search, FileText, Wrench, CalendarDays, AlertCircle } from 'lucide-react';
import { Student, GRADE_LEVELS, SUBJECTS, SubjectScore, SubjectSettings } from '../types';
import { AttendanceSummary } from './AttendanceSummary';
import { SubjectSettingsModal } from './SubjectSettingsModal';
import { LessonAchieve } from './LessonAchieve';
import { collection, query, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useEffect } from 'react';

interface EvaluationModuleProps {
  systemAcademicYear?: string;
  systemSemester?: string;
  students: Student[];
}

export const EvaluationModule: React.FC<EvaluationModuleProps> = ({ systemAcademicYear, systemSemester, students }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'kindergarten' | 'attendance'>('overview');
  const [selectedGrade, setSelectedGrade] = useState<string>(GRADE_LEVELS.find(g => g.includes('ประถม')) || GRADE_LEVELS[0]);
  const [selectedSubject, setSelectedSubject] = useState<string>(SUBJECTS[0]);
  
  const [scores, setScores] = useState<Record<string, SubjectScore>>({});
  const [draftScores, setDraftScores] = useState<Record<string, SubjectScore>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showWarningToast, setShowWarningToast] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  
  const [gradesSubTab, setGradesSubTab] = useState<'part1' | 'part2'>('part1');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [subjectSettings, setSubjectSettings] = useState<SubjectSettings | null>(null);

  const uniqueGrades = React.useMemo(() => {
    const dbGrades = new Set(students.map(s => s.gradeLevel));
    const hideIfEmpty = ['ประถมศึกษาปีที่ 1', 'ประถมศึกษาปีที่ 2'];
    const filteredGradeLevels = GRADE_LEVELS.filter(g => !hideIfEmpty.includes(g) || dbGrades.has(g));
    const extraGrades = Array.from(dbGrades).filter(g => typeof g === 'string' && !GRADE_LEVELS.includes(g) && g !== 'จบการศึกษา') as string[];
    extraGrades.sort();
    return [...filteredGradeLevels, ...extraGrades];
  }, [students]);

  useEffect(() => {
    const prathomGrades = uniqueGrades.filter(g => g.includes('ประถม'));
    if (!prathomGrades.includes(selectedGrade) && prathomGrades.length > 0) {
      setSelectedGrade(prathomGrades[0]);
    }
  }, [uniqueGrades, selectedGrade]);

  useEffect(() => {
    const q = query(collection(db, "subject_scores"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedScores: Record<string, SubjectScore> = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data() as SubjectScore;
          // key by studentId_academicYear_semester_subject
          const key = `${data.studentId}_${data.academicYear}_${data.semester}_${data.subject}`;
          fetchedScores[key] = data;
        });
        setScores(fetchedScores);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "subject_scores");
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync draft scores when tab changes or selection changes
  useEffect(() => {
    setDraftScores(scores);
  }, [scores, activeTab, selectedGrade, selectedSubject]);

  useEffect(() => {
    const settingsId = `${systemAcademicYear}_${systemSemester}_${selectedGrade}_${selectedSubject}`.replace(/[\/]/g, '-');
    const unsubscribe = onSnapshot(
      doc(db, "subject_settings", settingsId),
      (docSnap) => {
        if (docSnap.exists()) {
          setSubjectSettings(docSnap.data() as SubjectSettings);
        } else {
          setSubjectSettings({
            id: settingsId,
            academicYear: systemAcademicYear || '',
            semester: systemSemester || '',
            gradeLevel: selectedGrade,
            subject: selectedSubject,
            beforeMidKnowledge: [{ id: 'default_bmk_1', name: 'งานที่ 1', maxScore: 20 }],
            beforeMidSoftSkill: [{ id: 'default_bms_1', name: 'การส่งงาน', maxScore: 10 }],
            afterMidKnowledge: [{ id: 'default_amk_1', name: 'งานที่ 2', maxScore: 20 }],
            afterMidSoftSkill: [{ id: 'default_ams_1', name: 'พฤติกรรม', maxScore: 10 }]
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "subject_settings");
      }
    );
    return () => unsubscribe();
  }, [systemAcademicYear, systemSemester, selectedGrade, selectedSubject]);

  const handleSaveSettings = async (newSettings: SubjectSettings) => {
    try {
      await setDoc(doc(db, "subject_settings", newSettings.id), newSettings);
      setShowSettingsModal(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "subject_settings");
    }
  };

  const calculateGrade = (total: number): string => {
    if (total >= 80) return "4";
    if (total >= 75) return "3.5";
    if (total >= 70) return "3";
    if (total >= 65) return "2.5";
    if (total >= 60) return "2";
    if (total >= 55) return "1.5";
    if (total >= 50) return "1";
    return "0";
  };

  type ScoreField = 'preTestScore' | 'postTestScore' | 'beforeMidKnowledgeScore' | 'beforeMidSoftSkillScore' | 'midtermScore' | 'afterMidKnowledgeScore' | 'afterMidSoftSkillScore' | 'finalScore';

  const handleScoreChange = (studentId: string, field: ScoreField, value: string) => {
    let numValue = value === '' ? 0 : Number(value);
    if (numValue < 0) numValue = 0;
    const key = `${studentId}_${systemAcademicYear}_${systemSemester}_${selectedSubject}`;
    
    setDraftScores(prev => {
      const existing = prev[key] || {
        id: `sc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        gradeLevel: selectedGrade,
        academicYear: systemAcademicYear || '',
        semester: systemSemester || '',
        subject: selectedSubject,
        teacherId: 'current-teacher', // Ideally from props, but ok for now
        preTestScore: 0,
        postTestScore: 0,
        beforeMidKnowledgeScore: 0,
        beforeMidSoftSkillScore: 0,
        midtermScore: 0,
        afterMidKnowledgeScore: 0,
        afterMidSoftSkillScore: 0,
        finalScore: 0,
        totalScore: 0,
        grade: "0",
        activities: {},
        updatedAt: new Date().toISOString()
      };

      const updated = { ...existing, [field]: numValue };
      updated.totalScore = 
        Math.round((updated.beforeMidKnowledgeScore || 0) + 
        (updated.beforeMidSoftSkillScore || 0) + 
        (updated.midtermScore || 0) + 
        (updated.afterMidKnowledgeScore || 0) + 
        (updated.afterMidSoftSkillScore || 0) + 
        (updated.finalScore || 0));
      updated.grade = calculateGrade(updated.totalScore);

      return { ...prev, [key]: updated };
    });
  };

  const handleActivityScoreChange = (studentId: string, category: keyof Omit<SubjectSettings, 'id' | 'academicYear' | 'semester' | 'gradeLevel' | 'subject'>, activityId: string, value: string) => {
    let numValue = value === '' ? 0 : Number(value);
    if (numValue < 0) numValue = 0;
    const key = `${studentId}_${systemAcademicYear}_${systemSemester}_${selectedSubject}`;
    
    setDraftScores(prev => {
      const existing = prev[key] || {
        id: `sc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        gradeLevel: selectedGrade,
        academicYear: systemAcademicYear || '',
        semester: systemSemester || '',
        subject: selectedSubject,
        teacherId: 'current-teacher', 
        preTestScore: 0, postTestScore: 0,
        beforeMidKnowledgeScore: 0, beforeMidSoftSkillScore: 0,
        midtermScore: 0,
        afterMidKnowledgeScore: 0, afterMidSoftSkillScore: 0,
        finalScore: 0, totalScore: 0, grade: "0",
        activities: {},
        updatedAt: new Date().toISOString()
      };

      const updatedActivities = { ...(existing.activities || {}), [activityId]: numValue };
      
      // Compute raw sum and target max
      const rawSum = subjectSettings?.[category]?.reduce((sum, act) => sum + (updatedActivities[act.id] || 0), 0) || 0;
      const rawMaxSum = subjectSettings?.[category]?.reduce((sum, act) => sum + Number(act.maxScore), 0) || 0;
      
      const targetMax = category === 'beforeMidKnowledge' ? 20 : 
                        category === 'beforeMidSoftSkill' ? 10 : 
                        category === 'afterMidKnowledge' ? 20 : 
                        category === 'afterMidSoftSkill' ? 10 : 0;
      
      // Proportional calculation (rounded to 2 decimal places)
      let categorySum = rawSum;
      if (rawMaxSum > 0) {
        categorySum = Number(((rawSum / rawMaxSum) * targetMax).toFixed(2));
      }
      
      const updated = { ...existing, activities: updatedActivities };
      
      // Update the parent score field based on the category
      if (category === 'beforeMidKnowledge') updated.beforeMidKnowledgeScore = categorySum;
      if (category === 'beforeMidSoftSkill') updated.beforeMidSoftSkillScore = categorySum;
      if (category === 'afterMidKnowledge') updated.afterMidKnowledgeScore = categorySum;
      if (category === 'afterMidSoftSkill') updated.afterMidSoftSkillScore = categorySum;

      updated.totalScore = 
        Math.round((updated.beforeMidKnowledgeScore || 0) + 
        (updated.beforeMidSoftSkillScore || 0) + 
        (updated.midtermScore || 0) + 
        (updated.afterMidKnowledgeScore || 0) + 
        (updated.afterMidSoftSkillScore || 0) + 
        (updated.finalScore || 0));
      updated.grade = calculateGrade(updated.totalScore);

      return { ...prev, [key]: updated };
    });
  };

  const handleSaveScores = async () => {
    setIsSaving(true);
    try {
      // Save all draft scores for the current selection
      const studentsInGrade = students.filter(s => s.gradeLevel === selectedGrade);
      
      const promises = studentsInGrade.map(student => {
        const key = `${student.id}_${systemAcademicYear}_${systemSemester}_${selectedSubject}`;
        const scoreData = draftScores[key];
        
        if (scoreData) {
          // If total score > 0, it means we have something to save
          const docId = `${student.id}_${systemAcademicYear}_${systemSemester}_${selectedSubject}`.replace(/[\/]/g, '-');
          return setDoc(doc(db, "subject_scores", docId), scoreData);
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      
      // Check for at-risk students
      const failingStudents = studentsInGrade.filter(s => {
        const key = `${s.id}_${systemAcademicYear}_${systemSemester}_${selectedSubject}`;
        const scoreData = draftScores[key];
        return scoreData && scoreData.totalScore > 0 && scoreData.totalScore < 50;
      });

      if (failingStudents.length > 0) {
        setWarningCount(failingStudents.length);
        setShowWarningToast(true);
        setTimeout(() => setShowWarningToast(false), 5000);
      } else {
        alert("บันทึกคะแนนเรียบร้อยแล้ว");
      }
      
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "subject_scores");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      
      {/* Toast Notification */}
      {showWarningToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border-l-4 border-rose-500 rounded-xl shadow-xl p-4 flex items-start gap-3 max-w-sm animate-in slide-in-from-bottom-5">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-full flex-shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">พบนักเรียนกลุ่มเฝ้าระวัง</h4>
            <p className="text-sm text-slate-600 mt-1">
              บันทึกคะแนนสำเร็จ แต่มีนักเรียนจำนวน <span className="font-bold text-rose-600">{warningCount} คน</span> ที่ได้คะแนนรวมต่ำกว่า 50 คะแนน
            </p>
          </div>
        </div>
      )}

      <div className="print:hidden space-y-6">
        {/* Module Header with attractive display */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-300 opacity-20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="h-16 w-16 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center shadow-inner border border-white/30">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">3. การวัดและประเมินผลผู้เรียน (LessonAchieve)</h2>
              <p className="text-emerald-100 font-medium mt-1">รายงานผลสัมฤทธิ์ทางการเรียนและวิเคราะห์สถิติภาพรวม</p>
            </div>
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap bg-white rounded-xl p-1 shadow-sm border border-slate-100 max-w-2xl gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'overview' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="h-4 w-4" /> ภาพรวมผลสัมฤทธิ์
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'grades' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <FileText className="h-4 w-4" /> บันทึกคะแนน (ประถม)
            </button>
            <button
              onClick={() => setActiveTab('kindergarten')}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'kindergarten' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Award className="h-4 w-4" /> ประเมินอนุบาล
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'attendance' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <CalendarDays className="h-4 w-4" /> สรุปการเช็กชื่อ
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            
          {activeTab === 'overview' && (
            <div className="p-6">
              <LessonAchieve />
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800">บันทึกคะแนน</h3>
                  <p className="text-sm text-slate-500">จัดการข้อมูลคะแนนเก็บ คะแนนสอบย่อย กลางภาค และปลายภาค</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <select 
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {SUBJECTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <select 
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {uniqueGrades.filter(g => g.includes('ประถม')).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => setShowSettingsModal(true)}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                  >
                    <Settings className="h-4 w-4" /> ตั้งค่ากิจกรรม
                  </button>
                </div>
              </div>

              {/* Sub tabs for grades */}
              <div className="flex border-b border-slate-200 mb-6">
                <button
                  onClick={() => setGradesSubTab('part1')}
                  className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${gradesSubTab === 'part1' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  ส่วนที่ 1: เก็บระหว่างเรียน
                </button>
                <button
                  onClick={() => setGradesSubTab('part2')}
                  className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${gradesSubTab === 'part2' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  ส่วนที่ 2: สอบ (กลางภาค/ปลายภาค)
                </button>
              </div>

              <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl max-w-full">
                {gradesSubTab === 'part1' && subjectSettings ? (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th rowSpan={2} className="px-2 py-3 text-center w-12 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">เลขที่</th>
                        <th rowSpan={2} className="px-4 py-3 w-40 whitespace-nowrap sticky left-[48px] bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">ชื่อ-นามสกุล</th>
                        <th colSpan={subjectSettings.beforeMidKnowledge.length} className="px-3 py-2 text-center border-b border-r border-slate-200 bg-emerald-50/50">ความรู้ก่อนกลางภาค (20)</th>
                        <th colSpan={subjectSettings.beforeMidSoftSkill.length} className="px-3 py-2 text-center border-b border-r border-slate-200 bg-emerald-50/50">จิตพิสัยก่อนกลางภาค (10)</th>
                        <th colSpan={subjectSettings.afterMidKnowledge.length} className="px-3 py-2 text-center border-b border-r border-slate-200 bg-emerald-50/50">ความรู้หลังกลางภาค (20)</th>
                        <th colSpan={subjectSettings.afterMidSoftSkill.length} className="px-3 py-2 text-center border-b border-r border-slate-200 bg-emerald-50/50">จิตพิสัยหลังกลางภาค (10)</th>
                        <th rowSpan={2} className="px-3 py-3 text-center border-l border-slate-200 bg-indigo-50 font-bold">รวมเก็บคะแนน<br/><span className="text-xs text-indigo-500 font-normal">(60)</span></th>
                      </tr>
                      <tr>
                        {subjectSettings.beforeMidKnowledge.map(act => (
                          <th key={act.id} className="px-2 py-2 text-center border-r border-slate-200 bg-emerald-50/50 font-medium text-xs whitespace-nowrap min-w-[60px]">
                            {act.name}<br/><span className="text-slate-400">({act.maxScore})</span>
                          </th>
                        ))}
                        {subjectSettings.beforeMidSoftSkill.map(act => (
                          <th key={act.id} className="px-2 py-2 text-center border-r border-slate-200 bg-emerald-50/50 font-medium text-xs whitespace-nowrap min-w-[60px]">
                            {act.name}<br/><span className="text-slate-400">({act.maxScore})</span>
                          </th>
                        ))}
                        {subjectSettings.afterMidKnowledge.map(act => (
                          <th key={act.id} className="px-2 py-2 text-center border-r border-slate-200 bg-emerald-50/50 font-medium text-xs whitespace-nowrap min-w-[60px]">
                            {act.name}<br/><span className="text-slate-400">({act.maxScore})</span>
                          </th>
                        ))}
                        {subjectSettings.afterMidSoftSkill.map(act => (
                          <th key={act.id} className="px-2 py-2 text-center border-r border-slate-200 bg-emerald-50/50 font-medium text-xs whitespace-nowrap min-w-[60px]">
                            {act.name}<br/><span className="text-slate-400">({act.maxScore})</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.filter(s => s.gradeLevel === selectedGrade).length > 0 ? (
                        students.filter(s => s.gradeLevel === selectedGrade)
                          .sort((a, b) => (Number(a.number || '0') - Number(b.number || '0')))
                          .map((student) => {
                            const key = `${student.id}_${systemAcademicYear}_${systemSemester}_${selectedSubject}`;
                            const score = draftScores[key] || { activities: {}, totalScore: '-', grade: '-' };
                            const part1Total = Number(((Number(score.beforeMidKnowledgeScore) || 0) + (Number(score.beforeMidSoftSkillScore) || 0) + (Number(score.afterMidKnowledgeScore) || 0) + (Number(score.afterMidSoftSkillScore) || 0)).toFixed(2));
                            
                            return (
                            <tr key={student.id} className={`group border-b border-slate-100 transition-colors ${score.totalScore > 0 && score.totalScore < 50 ? 'bg-rose-50/70 hover:bg-rose-100' : 'hover:bg-slate-50'}`}>
                              <td className="px-2 py-3 text-center font-medium sticky left-0 bg-white z-10 border-r border-slate-200 group-hover:bg-slate-50 shadow-[1px_0_0_#e2e8f0]">{student.number}</td>
                              <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap sticky left-[48px] bg-white z-10 border-r border-slate-200 group-hover:bg-slate-50 shadow-[1px_0_0_#e2e8f0]">{student.firstName} {student.lastName}</td>
                              
                              {subjectSettings.beforeMidKnowledge.map(act => (
                                <td key={act.id} className="px-2 py-2 text-center border-r border-slate-100 bg-emerald-50/30">
                                  <input 
                                    type="number" min={0} max={act.maxScore}
                                    className="w-12 text-center border border-slate-200 rounded p-1 text-xs outline-none focus:ring-1 focus:ring-emerald-500" 
                                    placeholder="0"
                                    value={score.activities?.[act.id] === 0 ? '' : score.activities?.[act.id] || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val !== '' && (Number(val) > act.maxScore || Number(val) < 0)) return;
                                      handleActivityScoreChange(student.id, 'beforeMidKnowledge', act.id, val);
                                    }}
                                  />
                                </td>
                              ))}
                              {subjectSettings.beforeMidSoftSkill.map(act => (
                                <td key={act.id} className="px-2 py-2 text-center border-r border-slate-100 bg-emerald-50/30">
                                  <input 
                                    type="number" min={0} max={act.maxScore}
                                    className="w-12 text-center border border-slate-200 rounded p-1 text-xs outline-none focus:ring-1 focus:ring-emerald-500" 
                                    placeholder="0"
                                    value={score.activities?.[act.id] === 0 ? '' : score.activities?.[act.id] || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val !== '' && (Number(val) > act.maxScore || Number(val) < 0)) return;
                                      handleActivityScoreChange(student.id, 'beforeMidSoftSkill', act.id, val);
                                    }}
                                  />
                                </td>
                              ))}
                              {subjectSettings.afterMidKnowledge.map(act => (
                                <td key={act.id} className="px-2 py-2 text-center border-r border-slate-100 bg-emerald-50/30">
                                  <input 
                                    type="number" min={0} max={act.maxScore}
                                    className="w-12 text-center border border-slate-200 rounded p-1 text-xs outline-none focus:ring-1 focus:ring-emerald-500" 
                                    placeholder="0"
                                    value={score.activities?.[act.id] === 0 ? '' : score.activities?.[act.id] || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val !== '' && (Number(val) > act.maxScore || Number(val) < 0)) return;
                                      handleActivityScoreChange(student.id, 'afterMidKnowledge', act.id, val);
                                    }}
                                  />
                                </td>
                              ))}
                              {subjectSettings.afterMidSoftSkill.map(act => (
                                <td key={act.id} className="px-2 py-2 text-center border-r border-slate-100 bg-emerald-50/30">
                                  <input 
                                    type="number" min={0} max={act.maxScore}
                                    className="w-12 text-center border border-slate-200 rounded p-1 text-xs outline-none focus:ring-1 focus:ring-emerald-500" 
                                    placeholder="0"
                                    value={score.activities?.[act.id] === 0 ? '' : score.activities?.[act.id] || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val !== '' && (Number(val) > act.maxScore || Number(val) < 0)) return;
                                      handleActivityScoreChange(student.id, 'afterMidSoftSkill', act.id, val);
                                    }}
                                  />
                                </td>
                              ))}
                              
                              <td className="px-3 py-3 text-center font-bold text-slate-800 border-l border-slate-100 bg-indigo-50/30">
                                {part1Total}
                              </td>
                            </tr>
                          )})
                      ) : (
                        <tr>
                          <td colSpan={20} className="px-4 py-8 text-center text-slate-500">
                            ไม่พบข้อมูลนักเรียนในชั้น {selectedGrade}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  gradesSubTab === 'part2' ? (
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="px-2 py-3 text-center w-12 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">เลขที่</th>
                          <th className="px-4 py-3 w-40 whitespace-nowrap sticky left-[48px] bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">ชื่อ-นามสกุล</th>
                          <th className="px-3 py-3 text-center border-r border-slate-200 bg-sky-50">Pre-Test<br/><span className="text-xs font-normal text-slate-400">ก่อนเรียน</span></th>
                          <th className="px-3 py-3 text-center border-r border-slate-200 bg-amber-50">สอบกลางภาค<br/><span className="text-xs font-normal text-amber-500">(20)</span></th>
                          <th className="px-3 py-3 text-center border-r border-slate-200 bg-rose-50">สอบปลายภาค<br/><span className="text-xs font-normal text-rose-500">(20)</span></th>
                          <th className="px-3 py-3 text-center border-r border-slate-200 bg-sky-50">Post-Test<br/><span className="text-xs font-normal text-slate-400">หลังเรียน</span></th>
                          <th className="px-4 py-3 text-center border-r border-slate-200 bg-indigo-50">รวมทั้งหมด<br/><span className="text-xs font-normal text-indigo-500">(100)</span></th>
                          <th className="px-4 py-3 text-center bg-indigo-50">เกรด</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.filter(s => s.gradeLevel === selectedGrade).length > 0 ? (
                          students.filter(s => s.gradeLevel === selectedGrade)
                            .sort((a, b) => (Number(a.number || '0') - Number(b.number || '0')))
                            .map((student) => {
                              const key = `${student.id}_${systemAcademicYear}_${systemSemester}_${selectedSubject}`;
                              const score = draftScores[key] || { 
                                preTestScore: '', postTestScore: '', 
                                midtermScore: '', finalScore: '', 
                                totalScore: '-', grade: '-' 
                              };
                              
                              return (
                              <tr key={student.id} className={`group border-b border-slate-100 transition-colors ${score.totalScore > 0 && score.totalScore < 50 ? 'bg-rose-50/70 hover:bg-rose-100' : 'hover:bg-slate-50'}`}>
                                <td className="px-2 py-3 text-center font-medium sticky left-0 bg-white z-10 border-r border-slate-200 group-hover:bg-slate-50 shadow-[1px_0_0_#e2e8f0]">{student.number}</td>
                                <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap sticky left-[48px] bg-white z-10 border-r border-slate-200 group-hover:bg-slate-50 shadow-[1px_0_0_#e2e8f0]">{student.firstName} {student.lastName}</td>
                                <td className="px-3 py-3 text-center border-r border-slate-100 bg-sky-50/30">
                                  <input 
                                    type="number" min={0} 
                                    className="w-14 text-center border border-slate-200 rounded p-1 text-xs outline-none focus:ring-1 focus:ring-sky-500" 
                                    placeholder="0"
                                    value={score.preTestScore === 0 ? '' : score.preTestScore}
                                    onChange={(e) => handleScoreChange(student.id, 'preTestScore', e.target.value)}
                                  />
                                </td>
                                <td className="px-3 py-3 text-center border-r border-slate-100 bg-amber-50/30">
                                  <input 
                                    type="number" min={0} max={20}
                                    className="w-14 text-center border border-slate-200 rounded p-1 text-xs outline-none focus:ring-1 focus:ring-amber-500" 
                                    placeholder="0"
                                    value={score.midtermScore === 0 ? '' : score.midtermScore}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val !== '' && (Number(val) > 20 || Number(val) < 0)) return;
                                      handleScoreChange(student.id, 'midtermScore', val);
                                    }}
                                  />
                                </td>
                                <td className="px-3 py-3 text-center border-r border-slate-100 bg-rose-50/30">
                                  <input 
                                    type="number" min={0} max={20}
                                    className="w-14 text-center border border-slate-200 rounded p-1 text-xs outline-none focus:ring-1 focus:ring-rose-500" 
                                    placeholder="0"
                                    value={score.finalScore === 0 ? '' : score.finalScore}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val !== '' && (Number(val) > 20 || Number(val) < 0)) return;
                                      handleScoreChange(student.id, 'finalScore', val);
                                    }}
                                  />
                                </td>
                                <td className="px-3 py-3 text-center border-r border-slate-100 bg-sky-50/30">
                                  <input 
                                    type="number" min={0} 
                                    className="w-14 text-center border border-slate-200 rounded p-1 text-xs outline-none focus:ring-1 focus:ring-sky-500" 
                                    placeholder="0"
                                    value={score.postTestScore === 0 ? '' : score.postTestScore}
                                    onChange={(e) => handleScoreChange(student.id, 'postTestScore', e.target.value)}
                                  />
                                </td>
                                <td className="px-4 py-3 text-center font-bold text-slate-800 border-r border-slate-100 bg-indigo-50/30">
                                  {score.totalScore}
                                </td>
                                <td className="px-4 py-3 text-center font-black text-emerald-600 bg-indigo-50/30">
                                  {score.grade}
                                </td>
                              </tr>
                            )})
                        ) : (
                          <tr>
                            <td colSpan={12} className="px-4 py-8 text-center text-slate-500">
                              ไม่พบข้อมูลนักเรียนในชั้น {selectedGrade}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-slate-500">กำลังโหลดการตั้งค่า...</div>
                  )
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={handleSaveScores}
                  disabled={isSaving}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" /> 
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'kindergarten' && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">การวัดและประเมินผลระดับอนุบาล</h3>
              <p className="text-slate-500">
                ฟังก์ชันสำหรับประเมินพัฒนาการนักเรียนระดับปฐมวัย<br/>
                (รอการกำหนดรูปแบบและวิธีการประเมิน)
              </p>
            </div>
          )}
          {activeTab === 'attendance' && (
            <AttendanceSummary 
              systemAcademicYear={systemAcademicYear}
              systemSemester={systemSemester}
              students={students}
            />
          )}

          </div>
        </div>
      </div>
    
      {showSettingsModal && subjectSettings && (
        <SubjectSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          settings={subjectSettings}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
};
