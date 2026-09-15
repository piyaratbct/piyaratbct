import React, { useState } from 'react';
import { Settings, BarChart3, TrendingUp, Award, BookOpen, ChevronDown, CheckCircle, Search, FileText, Wrench, CalendarDays, AlertCircle, Star } from 'lucide-react';
import { Student, GRADE_LEVELS, SUBJECTS, SubjectScore, SubjectSettings, ActivityColumn, TeacherSchedule, AttendanceSession } from '../types';
import { AttendanceSummary } from './AttendanceSummary';
import { LearningHoursReport } from './LearningHoursReport';
import { SubjectSettingsModal } from './SubjectSettingsModal';
import { SubjectScorePrintTemplate } from './SubjectScorePrintTemplate';
import { AttendancePrintTemplate } from './AttendancePrintTemplate';
import { StudentReportPrintTemplate } from './StudentReportPrintTemplate';

import { Printer } from 'lucide-react';

import { LessonAchieve } from './LessonAchieve';
import { collection, query, onSnapshot, setDoc, doc, where } from 'firebase/firestore';
import { useAvailableSubjects } from '../hooks/useAvailableSubjects';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useEffect } from 'react';
import { CharacterAssessmentView } from './CharacterAssessmentView';
import { ShieldCheck } from 'lucide-react';

interface EvaluationModuleProps {
  systemAcademicYear?: string;
  systemSemester?: string;
  students: Student[];
  currentTeacher?: any;
  initialTab?: 'overview' | 'grades' | 'kindergarten' | 'attendance' | 'character';
  initialSubject?: string;
  initialGrade?: string;
}

export const EvaluationModule: React.FC<EvaluationModuleProps> = ({ systemAcademicYear, systemSemester, students: allStudents, currentTeacher, initialTab, initialSubject, initialGrade }) => {
  const students = React.useMemo(() => allStudents.filter(s => s.status === 'active' || !s.status), [allStudents]);
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'kindergarten' | 'attendance' | 'character'>(initialTab || 'overview');
  const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade || GRADE_LEVELS.find(g => g.includes('ประถม')) || GRADE_LEVELS[0]);
  const fetchedAvailableSubjects = useAvailableSubjects(selectedGrade);
    const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || '');
  const [scoutCampAttendees, setScoutCampAttendees] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
    
    // Auto-switch tabs if needed based on subject type
    if (selectedSubjectType === 'activity' && gradesSubTab === 'part1') {
      setGradesSubTab('part2');
    }
    if (initialSubject) setSelectedSubject(initialSubject);
    if (initialGrade) setSelectedGrade(initialGrade);
  }, [initialTab, initialSubject, initialGrade]);


  useEffect(() => {
    if ((selectedSubject && selectedSubject.includes('ลูกเสือ'))) {
      const q = query(collection(db, 'schoolEvents'), where('type', '==', 'scout_camp'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let attendees = new Set<string>();
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.attendeeIds) {
            data.attendeeIds.forEach((id: string) => attendees.add(id));
          }
        });
        setScoutCampAttendees(attendees);
      });
      return () => unsubscribe();
    }
  }, [selectedSubject]);
  
  
  const [viewYear, setViewYear] = useState<string>(systemAcademicYear || '2567');
  const [viewSemester, setViewSemester] = useState<string>(systemSemester || '1');
  
  useEffect(() => {
    if (systemAcademicYear) setViewYear(systemAcademicYear);
  }, [systemAcademicYear]);
  
  useEffect(() => {
    if (systemSemester) setViewSemester(systemSemester);
  }, [systemSemester]);

  const isHistorical = viewYear !== systemAcademicYear || viewSemester !== systemSemester;

  const [scores, setScores] = useState<Record<string, SubjectScore>>({});
  const [draftScores, setDraftScores] = useState<Record<string, SubjectScore>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showWarningToast, setShowWarningToast] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  
  const [gradesSubTab, setGradesSubTab] = useState<'attendance' | 'part1' | 'part2' | 'part3' | 'part4' | 'part5'>('attendance');
  const [schedules, setSchedules] = useState<TeacherSchedule[]>([]);

  const selectedSubjectType = React.useMemo(() => {
    const subj = fetchedAvailableSubjects.find(s => {
      if (typeof s === 'string') return s === selectedSubject;
      if (s.type === 'single') return s.name === selectedSubject;
      if (s.type === 'group') return s.subjects.includes(selectedSubject);
      return false;
    });
    
    if (subj && subj.subjectType) {
      return subj.subjectType;
    }
    
    // Fallback logic
    return (selectedSubject.includes('กิจกรรม') || selectedSubject.includes('ลูกเสือ') || selectedSubject.includes('ชุมนุม') || selectedSubject.includes('แนะแนว')) ? 'activity' : 'academic';
  }, [selectedSubject, fetchedAvailableSubjects]);

  const isTeacherAssigned = React.useMemo(() => {
    if (!currentTeacher || !selectedSubject || !selectedGrade) return false;
    
    // Admin, Academic, Deputy always have access
    if (['admin', 'academic', 'deputy'].includes(currentTeacher?.role)) return true;
    
    // Check if the current teacher is assigned to this subject and grade in the schedules
    return schedules.some(
      s => s.teacherId === currentTeacher.id && 
           s.subject === selectedSubject && 
           s.gradeLevel === selectedGrade
    );
  }, [currentTeacher, schedules, selectedSubject, selectedGrade]);

  const isReadOnly = (isHistorical && currentTeacher?.role !== 'admin' && currentTeacher?.role !== 'academic') || (!isHistorical && selectedSubject !== '' && !isTeacherAssigned);

  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPrintAttendance, setShowPrintAttendance] = useState(false);
  const [showPrintScore, setShowPrintScore] = useState(false);
  const [showPrintReport, setShowPrintReport] = useState(false);
  const [subjectSettings, setSubjectSettings] = useState<SubjectSettings | null>(null);
  const [lessonPlanEvals, setLessonPlanEvals] = useState<{
    beforeMidKnowledge: ActivityColumn[];
    beforeMidSoftSkill: ActivityColumn[];
    afterMidKnowledge: ActivityColumn[];
    afterMidSoftSkill: ActivityColumn[];
  }>({
    beforeMidKnowledge: [], beforeMidSoftSkill: [], afterMidKnowledge: [], afterMidSoftSkill: []
  });

  const effectiveSettings = React.useMemo(() => {
    if (!subjectSettings) return null;
    return {
      ...subjectSettings,
      beforeMidKnowledge: [...subjectSettings.beforeMidKnowledge, ...lessonPlanEvals.beforeMidKnowledge],
      beforeMidSoftSkill: [...subjectSettings.beforeMidSoftSkill, ...lessonPlanEvals.beforeMidSoftSkill],
      afterMidKnowledge: [...subjectSettings.afterMidKnowledge, ...lessonPlanEvals.afterMidKnowledge],
      afterMidSoftSkill: [...subjectSettings.afterMidSoftSkill, ...lessonPlanEvals.afterMidSoftSkill]
    };
  }, [subjectSettings, lessonPlanEvals]);


  const uniqueGrades = React.useMemo(() => {
    const dbGrades = new Set(students.map(s => s.gradeLevel).filter(Boolean));
    const hideGrades = ['ประถมศึกษาปีที่ 1', 'ประถมศึกษาปีที่ 2'];
    const extraGrades = Array.from(dbGrades).filter(g => typeof g === 'string' && !GRADE_LEVELS.includes(g) && g !== 'จบการศึกษา') as string[];
    extraGrades.sort();
    return [...GRADE_LEVELS.filter(g => !hideGrades.includes(g)), ...extraGrades];
  }, [students]);

  const attendanceStats = React.useMemo(() => {
    // calculate total target periods for the selected subject
    const periodsPerWeek = schedules.filter(s => s.subject === selectedSubject).length;
    // assuming 20 weeks per semester
    let totalTargetPeriods = periodsPerWeek * 20;

    // Override with Curriculum Structure if available
    const currSubj = fetchedAvailableSubjects.find(s => {
      if (s.type === 'single') return s.name === selectedSubject;
      if (s.type === 'group') return s.groupName === selectedSubject;
      return false;
    });

    if (currSubj) {
      // Both totalHours and requiredHoursPerTerm hold the YEARLY hours (due to the UI label in CurriculumManager)
      const yearlyHours = currSubj.totalHours || currSubj.requiredHoursPerTerm || 0;
      if (yearlyHours > 0) {
        totalTargetPeriods = Math.round(yearlyHours / 2); // Term Target
      }
    }

    // for each student, calculate how many times they were present/late/leave/sick
    const studentStats: Record<string, { present: number, leave: number, sick: number, absent: number, late: number }> = {};
    
    students.forEach(s => {
      studentStats[s.id] = { present: 0, leave: 0, sick: 0, absent: 0, late: 0 };
    });

    attendanceSessions.filter(sess => sess.subject === selectedSubject).forEach(sess => {
      Object.entries(sess.attendanceData).forEach(([studentId, statusStr]) => {
        const status = statusStr as keyof typeof studentStats[string];
        if (studentStats[studentId] && studentStats[studentId][status] !== undefined) {
          studentStats[studentId][status]++;
        }
      });
    });

    return {
      totalTargetPeriods,
      studentStats
    };
  }, [schedules, attendanceSessions, selectedSubject, students, fetchedAvailableSubjects]);

  useEffect(() => {
    const prathomGrades = uniqueGrades.filter(g => g.includes('ประถม'));
    if (!prathomGrades.includes(selectedGrade) && prathomGrades.length > 0) {
      setSelectedGrade(prathomGrades[0]);
    }
  }, [uniqueGrades, selectedGrade]);

  useEffect(() => {
    if (!viewYear || !viewSemester || !selectedGrade || !selectedSubject) return;

    // Fetch ALL schedules for the term to allow smart filtering
    const sq = query(
      collection(db, 'schedules'),
      where('academicYear', '==', viewYear),
      where('semester', '==', viewSemester)
    );
    const unSubSchedules = onSnapshot(sq, (snap) => {
      setSchedules(snap.docs.map(d => ({ id: d.id, ...d.data() } as TeacherSchedule)));
    });

    // Fetch attendance
    const aq = query(
      collection(db, 'attendanceSessions'),
      where('academicYear', '==', viewYear),
      where('semester', '==', viewSemester),
      where('gradeLevel', '==', selectedGrade),
      where('subject', '==', selectedSubject)
    );
    const unSubAttendance = onSnapshot(aq, (snap) => {
      setAttendanceSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceSession)));
    });

    return () => {
      unSubSchedules();
      unSubAttendance();
    };
  }, [viewYear, viewSemester, selectedGrade, selectedSubject]);

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
    const settingsId = `${viewYear}_${viewSemester}_${selectedGrade}_${selectedSubject}`.replace(/[\/]/g, '-');
    
    // Fetch lesson plans for this subject to dynamically inject columns
    const lpQuery = query(
      collection(db, 'lessonPlans'),
      where('gradeLevel', '>=', ''), // We'll filter in memory to handle comma separated grades
    );
    const unsubLp = onSnapshot(lpQuery, (lpSnap) => {
      const dynamicEvals = {
        beforeMidKnowledge: [] as ActivityColumn[],
        beforeMidSoftSkill: [] as ActivityColumn[],
        afterMidKnowledge: [] as ActivityColumn[],
        afterMidSoftSkill: [] as ActivityColumn[]
      };
      
      lpSnap.docs.forEach(doc => {
        const p = doc.data() as any;
        // Check if plan matches current view
        const expectedSemesterStr = `ภาคเรียนที่ ${viewSemester}/${viewYear}`;
        const semesterMatch = !p.semester || p.semester === viewSemester || p.semester === expectedSemesterStr || p.semester.includes(viewSemester);
        const subjectMatch = p.subject === selectedSubject || p.customSubject === selectedSubject;
        const planGrades = p.gradeLevel ? p.gradeLevel.split(',').map((s: string) => s.trim()) : [];
        const gradeMatch = planGrades.includes(selectedGrade) || p.gradeLevel === selectedGrade || (p.gradeLevel && p.gradeLevel.includes(selectedGrade)) || (selectedGrade && selectedGrade.includes(p.gradeLevel));
        
        if (semesterMatch && subjectMatch && gradeMatch && p.structuredEvaluations) {
          p.structuredEvaluations.forEach((ev: any) => {
             const act: ActivityColumn = {
               id: ev.id,
               name: `${ev.name} (${p.title})`,
               maxScore: ev.maxScore || 0
             };
             if (ev.scorePeriod === 'after_mid') {
               if (ev.kpa === 'K') dynamicEvals.afterMidKnowledge.push(act);
               else dynamicEvals.afterMidSoftSkill.push(act);
             } else {
               if (ev.kpa === 'K') dynamicEvals.beforeMidKnowledge.push(act);
               else dynamicEvals.beforeMidSoftSkill.push(act);
             }
          });
        }
      });
      setLessonPlanEvals(dynamicEvals);
    });

    const unsubscribe = onSnapshot(
      doc(db, "subject_settings", settingsId),
      (docSnap) => {
        if (docSnap.exists()) {
          setSubjectSettings(docSnap.data() as SubjectSettings);
        } else {
          setSubjectSettings({
            id: settingsId,
            academicYear: viewYear || '',
            semester: viewSemester || '',
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
  }, [viewYear, viewSemester, selectedGrade, selectedSubject]);

  const handleSaveSettings = async (newSettings: SubjectSettings) => {
    if (isReadOnly) return;
    try {
      await setDoc(doc(db, "subject_settings", newSettings.id), newSettings);
      setShowSettingsModal(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "subject_settings");
    }
  };

  const calculateGrade = (total: number, subject: string, activities?: any, isScoutAttended?: boolean, attendancePercentage?: number): string => {
    if ((subject && subject.includes('ลูกเสือ'))) {
      const campAttended = isScoutAttended || activities?.scoutCamp === 1;
      const attScore = (attendancePercentage !== undefined && attendancePercentage > 0) ? attendancePercentage : total;
      return (attScore >= 80 && campAttended) ? "ผ" : "มผ";
    }
    if (subject === 'กิจกรรมอ่าน-เขียน') {
      if (total >= 80) return "3 (ดีเยี่ยม)";
      if (total >= 65) return "2 (ดี)";
      if (total >= 50) return "1 (ผ่าน)";
      return "0 (ไม่ผ่าน)";
    }
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
    const key = `${studentId}_${viewYear}_${viewSemester}_${selectedSubject}`;
    
    setDraftScores(prev => {
      const existing = prev[key] || {
        id: `sc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        gradeLevel: selectedGrade,
        academicYear: viewYear || '',
        semester: viewSemester || '',
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
      updated.grade = calculateGrade(updated.totalScore, selectedSubject, updated.activities, scoutCampAttendees.has(studentId), attendanceStats?.studentStats?.[studentId] ? (attendanceStats.totalTargetPeriods > 0 ? ((attendanceStats.studentStats[studentId].present + attendanceStats.studentStats[studentId].late) / attendanceStats.totalTargetPeriods) * 100 : ((attendanceStats.studentStats[studentId].present + attendanceStats.studentStats[studentId].late) / (attendanceStats.studentStats[studentId].present + attendanceStats.studentStats[studentId].late + attendanceStats.studentStats[studentId].leave + attendanceStats.studentStats[studentId].sick + attendanceStats.studentStats[studentId].absent)) * 100) : 0);

      return { ...prev, [key]: updated };
    });
  };

  const handleActivityScoreChange = (studentId: string, category: keyof Omit<SubjectSettings, 'id' | 'academicYear' | 'semester' | 'gradeLevel' | 'subject'>, activityId: string, value: string) => {
    let numValue = value === '' ? 0 : Number(value);
    if (numValue < 0) numValue = 0;
    const key = `${studentId}_${viewYear}_${viewSemester}_${selectedSubject}`;
    
    setDraftScores(prev => {
      const existing = prev[key] || {
        id: `sc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        gradeLevel: selectedGrade,
        academicYear: viewYear || '',
        semester: viewSemester || '',
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
      const rawSum = effectiveSettings?.[category]?.reduce((sum, act) => sum + (updatedActivities[act.id] || 0), 0) || 0;
      const rawMaxSum = effectiveSettings?.[category]?.reduce((sum, act) => sum + Number(act.maxScore), 0) || 0;
      
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
      updated.grade = calculateGrade(updated.totalScore, selectedSubject, updated.activities, scoutCampAttendees.has(studentId), attendanceStats?.studentStats?.[studentId] ? (attendanceStats.totalTargetPeriods > 0 ? ((attendanceStats.studentStats[studentId].present + attendanceStats.studentStats[studentId].late) / attendanceStats.totalTargetPeriods) * 100 : ((attendanceStats.studentStats[studentId].present + attendanceStats.studentStats[studentId].late) / (attendanceStats.studentStats[studentId].present + attendanceStats.studentStats[studentId].late + attendanceStats.studentStats[studentId].leave + attendanceStats.studentStats[studentId].sick + attendanceStats.studentStats[studentId].absent)) * 100) : 0);

      return { ...prev, [key]: updated };
    });
  };

  const handleSaveScores = async () => {
    if (isReadOnly) return;
    setIsSaving(true);
    try {
      // Save all draft scores for the current selection
      const studentsInGrade = students.filter(s => s.gradeLevel === selectedGrade);
      
      const promises = studentsInGrade.map(student => {
        const key = `${student.id}_${viewYear}_${viewSemester}_${selectedSubject}`;
        const scoreData = draftScores[key];
        
        if (scoreData) {
          // If total score > 0, it means we have something to save
          const docId = `${student.id}_${viewYear}_${viewSemester}_${selectedSubject}`.replace(/[\/]/g, '-');
          return setDoc(doc(db, "subject_scores", docId), scoreData);
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      
      // Check for at-risk students
      const failingStudents = studentsInGrade.filter(s => {
        const key = `${s.id}_${viewYear}_${viewSemester}_${selectedSubject}`;
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

  const subjectTeacherName = React.useMemo(() => {
    const schedule = schedules.find(s => s.gradeLevel === selectedGrade && (s.subject === selectedSubject || s.customSubject === selectedSubject));
    if (schedule && schedule.teacherName) {
      return schedule.teacherName;
    }
    return currentTeacher ? (currentTeacher.thaiName || currentTeacher.displayName || `${currentTeacher.firstName || ''} ${currentTeacher.lastName || ''}`.trim()) : undefined;
  }, [schedules, selectedGrade, selectedSubject, currentTeacher]);

  const formatColumnHeader = (name: string, maxScore: number) => {
    let namePart = name;
    let indicatorPart = null;
    
    // Check if the name contains an indicator wrapped in parentheses, usually separated by a space
    const parenIndex = name.indexOf(' (');
    if (parenIndex !== -1 && name.endsWith(')')) {
      namePart = name.substring(0, parenIndex);
      indicatorPart = name.substring(parenIndex + 1);
    }

    return (
      <div className="flex flex-col items-center justify-center leading-tight">
        <span className="mb-1">{namePart}</span>
        {indicatorPart && <span className="text-[10px] text-indigo-500 font-normal leading-tight max-w-[80px] whitespace-normal break-words">{indicatorPart}</span>}
        <span className="text-slate-400 mt-1">({maxScore})</span>
      </div>
    );
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
            <div className="min-w-0 w-full overflow-hidden">
              <h2 className="text-2xl font-black tracking-tight drop-shadow-sm truncate w-full">
                <span className="block sm:inline">3. วัดและประเมินผล</span>
                <span className="text-xl opacity-90 block sm:inline sm:ml-2">(LessonAchieve)</span>
              </h2>
              <p className="text-emerald-100 font-medium mt-1 sm:mt-2 leading-tight sm:leading-normal">
                รายงานผลสัมฤทธิ์ทางการเรียน <br className="sm:hidden" /> และวิเคราะห์สถิติภาพรวม
              </p>
            </div>
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl">
            {isReadOnly && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/80 text-white text-xs font-bold rounded-lg border border-rose-400">
                <AlertCircle className="h-4 w-4" />
                <span>
                  {isHistorical 
                    ? `โหมดดูข้อมูลย้อนหลัง (อ่านอย่างเดียว)` 
                    : `คุณไม่มีสิทธิ์แก้ไขคะแนนวิชานี้ (สิทธิ์เฉพาะครูผู้สอน หรือ ฝ่ายวิชาการ)`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>ปีการศึกษา:</span>
              <select 
                className="bg-white/20 border border-white/30 text-white rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-white/50 [&>option]:text-slate-800"
                value={viewYear}
                onChange={e => setViewYear(e.target.value)}
              >
                {[2567, 2568, 2569, 2570, 2571, 2572].map(y => (
                  <option key={y} value={y.toString()}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>ภาคเรียนที่:</span>
              <select 
                className="bg-white/20 border border-white/30 text-white rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-white/50 [&>option]:text-slate-800"
                value={viewSemester}
                onChange={e => setViewSemester(e.target.value)}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">ฤดูร้อน</option>
              </select>
            </div>
          </div>

        </div>

        {/* Tabs and Content */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar bg-white/50 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm border border-slate-100 w-full gap-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-none flex flex-row items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs lg:text-sm font-bold transition-all ${
                activeTab === 'overview' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
              }`}
            >
              <TrendingUp className="h-5 w-5 lg:h-4 lg:w-4 shrink-0" /> <span className="text-left leading-tight whitespace-nowrap">ภาพรวมผลสัมฤทธิ์</span>
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`flex-none flex flex-row items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs lg:text-sm font-bold transition-all ${
                activeTab === 'grades' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
              }`}
            >
              <FileText className="h-5 w-5 lg:h-4 lg:w-4 shrink-0" /> <span className="text-left leading-tight whitespace-nowrap">บันทึกคะแนน (ประถม)</span>
            </button>
            <button
              onClick={() => setActiveTab('kindergarten')}
              className={`flex-none flex flex-row items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs lg:text-sm font-bold transition-all ${
                activeTab === 'kindergarten' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
              }`}
            >
              <Award className="h-5 w-5 lg:h-4 lg:w-4 shrink-0" /> <span className="text-left leading-tight whitespace-nowrap">ประเมินอนุบาล</span>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex-none flex flex-row items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs lg:text-sm font-bold transition-all ${
                activeTab === 'attendance' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
              }`}
            >
              <CalendarDays className="h-5 w-5 lg:h-4 lg:w-4 shrink-0" /> <span className="text-left leading-tight whitespace-nowrap">รายงานชั่วโมงเรียน</span>
            </button>
            
            <button
              onClick={() => setActiveTab('character')}
              className={`flex-none flex flex-row items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs lg:text-sm font-bold transition-all ${
                activeTab === 'character' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
              }`}
            >
              <ShieldCheck className="h-5 w-5 lg:h-4 lg:w-4 shrink-0" /> <span className="text-left leading-tight whitespace-nowrap">คุณลักษณะฯ 8 ประการ</span>
            </button>

          </div>

          {/* Tab Content */}
                      
          {activeTab === 'overview' && (
            <div>
              <LessonAchieve />
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6 overflow-hidden">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-800">บันทึกคะแนน</h2>
                  <p className="text-sm text-slate-500">จัดการข้อมูลคะแนนเก็บ คะแนนสอบย่อย กลางภาค และปลายภาค</p>
                </div>
                
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                                    <select 
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full sm:w-auto border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="" disabled>-- กรุณาเลือกวิชา --</option>
                    {(() => {
                       
                      let finalSubjects = fetchedAvailableSubjects;
                      if (currentTeacher && !['admin', 'academic', 'deputy'].includes(currentTeacher.role)) {
                        const teacherSubjectsForGrade = new Set<string>(schedules.filter(s => s.teacherId === currentTeacher.id && s.gradeLevel === selectedGrade).map(s => s.subject === 'อื่นๆ' ? (s.customSubject || s.subject) : s.subject));
                        if (teacherSubjectsForGrade.size > 0) {
                            // Filter grouped data
                            finalSubjects = finalSubjects.map(item => {
                              if (typeof item === 'string') return item;
                              if (item.type === 'header') return item; // Keep headers initially
                              if (item.type === 'single' && teacherSubjectsForGrade.has(item.name)) return item;
                              if (item.type === 'group') {
                                const validChildren = item.subjects.filter((sub: string) => teacherSubjectsForGrade.has(sub));
                                if (validChildren.length > 0) return { ...item, subjects: validChildren };
                              }
                              return null;
                            }).filter(Boolean);
                            
                            // Remove empty headers
                            finalSubjects = finalSubjects.filter((item, index, array) => {
                                if (item.type === 'header') {
                                    // A header is empty if it's the last item, or if the next item is also a header
                                    if (index === array.length - 1) return false;
                                    if (array[index + 1].type === 'header') return false;
                                }
                                return true;
                            });
                        }
                      }
                      
                      return finalSubjects.map((s: any, idx: number) => {
                        if (typeof s === 'string') {
                          return <option key={`s-${idx}`} value={s}>{s}</option>;
                        } else if (s.type === 'header') { return <option key={`h-${idx}`} disabled className="font-bold text-slate-500 bg-slate-50">{s.label}</option>; } else if (s.type === 'single') {
                          return <option key={`s-${idx}`} value={s.name}>{s.label || s.name}</option>;
                        } else if (s.type === 'group') {
                          return (
                            <optgroup key={`g-${idx}`} label={s.groupName}>
                              {s.subjects.map((sub: string) => <option key={sub} value={sub}>{sub}</option>)}
                            </optgroup>
                          );
                        }
                        return null;
                      });

                    })()}
                  </select>
                  <select 
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full sm:w-auto border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="" disabled>-- กรุณาเลือกวิชา --</option>
                    {(() => {
                       let availableGrades = uniqueGrades.filter(g => g.includes('ประถม'));
                       // Smart Filter: If not admin/academic, only show grades they teach for the selected subject
                       if (currentTeacher && !['admin', 'academic', 'deputy'].includes(currentTeacher.role)) {
                          const teacherGradesForSubject = new Set<string>(schedules.filter(s => s.teacherId === currentTeacher.id && (s.subject === selectedSubject || s.customSubject === selectedSubject)).map(s => s.gradeLevel));
                          if (teacherGradesForSubject.size > 0) {
                              availableGrades = Array.from(teacherGradesForSubject).filter(g => g.includes('ประถม')).sort();
                          }
                       }
                       
      const kg = availableGrades.filter(g => g.includes('อนุบาล'));
      const pr = availableGrades.filter(g => g.includes('ประถม'));
      return (
        <>
          {kg.length > 0 && (
            <optgroup label="ระดับปฐมวัย">
              {kg.map(g => <option key={g} value={g}>{g}</option>)}
            </optgroup>
          )}
          {pr.length > 0 && (
            <optgroup label="ระดับประถมศึกษา">
              {pr.map(g => <option key={g} value={g}>{g}</option>)}
            </optgroup>
          )}
        </>
      );
      
                    })()}
                  </select>
                  <button 
                    onClick={() => setShowSettingsModal(true)}
                    className="w-full justify-center sm:w-auto flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap"
                  >
                    <Settings className="h-4 w-4" /> ตั้งค่ากิจกรรม
                  </button>
                  <button
                    onClick={() => setShowPrintAttendance(true)}
                    className="w-full justify-center sm:w-auto flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm whitespace-nowrap"
                  >
                    <Printer className="h-4 w-4" /> พิมพ์เวลาเรียน
                  </button>
                  <button
                    onClick={() => setShowPrintScore(true)}
                    className="w-full justify-center sm:w-auto flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm whitespace-nowrap"
                  >
                    <Printer className="h-4 w-4" /> พิมพ์คะแนน (ปพ.5)
                  </button>
                  <button
                    onClick={() => setShowPrintReport(true)}
                    className="w-full justify-center sm:w-auto flex items-center gap-2 bg-pink-600 text-white hover:bg-pink-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm whitespace-nowrap"
                  >
                    <Printer className="h-4 w-4" /> สมุดพก (ปพ.6)
                  </button>
                </div>
              </div>

              {!(selectedSubject && selectedSubject.includes('อ่าน-เขียน')) ? ( <>
              {/* Sub tabs for grades */}
                            <div className="flex overflow-x-auto border-b border-slate-200 mb-6">
                <button
                  onClick={() => setGradesSubTab('attendance')}
                  className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${gradesSubTab === 'attendance' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  เวลาเรียน (ปพ.5)
                </button>
                {selectedSubjectType === 'academic' ? (
                  <>
                    <button
                      onClick={() => setGradesSubTab('part1')}
                      className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${gradesSubTab === 'part1' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                      ส่วนที่ 1: เก็บระหว่างเรียน
                    </button>
                    <button
                      onClick={() => setGradesSubTab('part2')}
                      className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${gradesSubTab === 'part2' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                      ส่วนที่ 2: ผลการเรียน
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setGradesSubTab('part2')}
                    className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${gradesSubTab === 'part2' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    ประเมินผลกิจกรรม (ผ/มผ)
                  </button>
                )}

              </div>

              <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl max-w-full">
                                {gradesSubTab === 'attendance' ? (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-center w-16 border-r border-slate-200">เลขที่</th>
                        <th className="px-4 py-3 w-60 border-r border-slate-200">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-3 text-center border-r border-slate-200 text-emerald-600">มาเรียน</th>
                        <th className="px-4 py-3 text-center border-r border-slate-200 text-amber-500">สาย</th>
                        <th className="px-4 py-3 text-center border-r border-slate-200 text-sky-500">ลากิจ</th>
                        <th className="px-4 py-3 text-center border-r border-slate-200 text-purple-500">ลาป่วย</th>
                        <th className="px-4 py-3 text-center border-r border-slate-200 text-rose-500">ขาดเรียน</th>
                        <th className="px-4 py-3 text-center border-r border-slate-200">รวม (ครั้ง)</th>
                        <th className="px-4 py-3 text-center border-r border-slate-200">เวลาเรียนเต็ม (คาบ)</th>
                        <th className="px-4 py-3 text-center">ร้อยละ (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.filter(s => s.gradeLevel === selectedGrade)
                          .sort((a, b) => (Number(a.number || '0') - Number(b.number || '0')))
                          .map((student) => {
                        const stats = attendanceStats.studentStats[student.id];
                        const totalAttended = stats.present + stats.late;
                        const totalRecords = stats.present + stats.late + stats.leave + stats.sick + stats.absent;
                        
                        // Percentage can be calculated from target periods or total records if target periods is 0
                        const baseTotal = attendanceStats.totalTargetPeriods > 0 ? attendanceStats.totalTargetPeriods : totalRecords;
                        const percentage = baseTotal > 0 ? (totalAttended / baseTotal) * 100 : 0;
                        const isAtRisk = baseTotal > 0 && percentage < 80;
                        const attendancePercentage = percentage;

                        return (
                          <tr key={student.id} className={`hover:bg-slate-50 transition-colors ${isAtRisk ? 'bg-rose-50/30' : ''}`}>
                            <td className="px-4 py-3 text-center border-r border-slate-200 text-slate-500">{student.number}</td>
                            <td className="px-4 py-3 border-r border-slate-200 font-medium whitespace-nowrap">
                              <span>{student.firstName} {student.lastName}</span>
                            </td>
                            <td className="px-4 py-3 text-center border-r border-slate-200 text-emerald-600 font-medium">{stats.present}</td>
                            <td className="px-4 py-3 text-center border-r border-slate-200 text-amber-500 font-medium">{stats.late}</td>
                            <td className="px-4 py-3 text-center border-r border-slate-200 text-sky-500 font-medium">{stats.leave}</td>
                            <td className="px-4 py-3 text-center border-r border-slate-200 text-purple-500 font-medium">{stats.sick}</td>
                            <td className="px-4 py-3 text-center border-r border-slate-200 text-rose-500 font-medium">{stats.absent}</td>
                            <td className="px-4 py-3 text-center border-r border-slate-200 font-bold text-slate-700">{totalAttended}</td>
                            <td className="px-4 py-3 text-center border-r border-slate-200 text-slate-500">{baseTotal}</td>
                            <td className={`px-4 py-3 text-center font-bold ${isAtRisk ? 'text-rose-600' : 'text-emerald-600'}`}>
                              <div className="flex items-center justify-center gap-2">
                                <span>{percentage.toFixed(1)}%</span>
                                {isAtRisk && <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold" title="เวลาเรียนไม่ถึง 80% (ไม่มีสิทธิ์สอบ)">มส.</span>}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : gradesSubTab === 'part1' && subjectSettings ? (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th rowSpan={2} className="px-2 py-3 text-center w-12 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">เลขที่</th>
                        <th rowSpan={2} className="px-4 py-3 w-40 whitespace-nowrap sticky left-[48px] bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">ชื่อ-นามสกุล</th>
                        <th colSpan={effectiveSettings.beforeMidKnowledge.length} className="px-3 py-2 text-center border-b border-r border-slate-200 bg-emerald-50/50">ความรู้ก่อนกลางภาค (20)</th>
                        <th colSpan={effectiveSettings.beforeMidSoftSkill.length} className="px-3 py-2 text-center border-b border-r border-slate-200 bg-emerald-50/50">จิตพิสัยก่อนกลางภาค (10)</th>
                        <th colSpan={effectiveSettings.afterMidKnowledge.length} className="px-3 py-2 text-center border-b border-r border-slate-200 bg-emerald-50/50">ความรู้หลังกลางภาค (20)</th>
                        <th colSpan={effectiveSettings.afterMidSoftSkill.length} className="px-3 py-2 text-center border-b border-r border-slate-200 bg-emerald-50/50">จิตพิสัยหลังกลางภาค (10)</th>
                        <th rowSpan={2} className="px-3 py-3 text-center border-l border-slate-200 bg-indigo-50 font-bold">รวมเก็บคะแนน<br/><span className="text-xs text-indigo-500 font-normal">(60)</span></th>
                      </tr>
                      <tr>
                        {effectiveSettings.beforeMidKnowledge.map(act => (
                          <th key={act.id} className="px-2 py-2 text-center border-r border-slate-200 bg-emerald-50/50 font-medium text-xs whitespace-nowrap min-w-[60px]">
                            {formatColumnHeader(act.name, act.maxScore)}
                          </th>
                        ))}
                        {effectiveSettings.beforeMidSoftSkill.map(act => (
                          <th key={act.id} className="px-2 py-2 text-center border-r border-slate-200 bg-emerald-50/50 font-medium text-xs whitespace-nowrap min-w-[60px]">
                            {formatColumnHeader(act.name, act.maxScore)}
                          </th>
                        ))}
                        {effectiveSettings.afterMidKnowledge.map(act => (
                          <th key={act.id} className="px-2 py-2 text-center border-r border-slate-200 bg-emerald-50/50 font-medium text-xs whitespace-nowrap min-w-[60px]">
                            {formatColumnHeader(act.name, act.maxScore)}
                          </th>
                        ))}
                        {effectiveSettings.afterMidSoftSkill.map(act => (
                          <th key={act.id} className="px-2 py-2 text-center border-r border-slate-200 bg-emerald-50/50 font-medium text-xs whitespace-nowrap min-w-[60px]">
                            {formatColumnHeader(act.name, act.maxScore)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.filter(s => s.gradeLevel === selectedGrade).length > 0 ? (
                        students.filter(s => s.gradeLevel === selectedGrade)
                          .sort((a, b) => (Number(a.number || '0') - Number(b.number || '0')))
                          .map((student) => {
                            const key = `${student.id}_${viewYear}_${viewSemester}_${selectedSubject}`;
                            const isScoutCampAttended = scoutCampAttendees.has(student.id);
                            const score = draftScores[key] || { activities: {}, totalScore: '-', grade: '-' };
                            const stats = attendanceStats.studentStats[student.id];
                            const totalAttended = stats.present + stats.late;
                            const totalRecords = stats.present + stats.late + stats.leave + stats.sick + stats.absent;
                            const baseTotal = attendanceStats.totalTargetPeriods > 0 ? attendanceStats.totalTargetPeriods : totalRecords;
                            const attendancePercentage = baseTotal > 0 ? (totalAttended / baseTotal) * 100 : 0;
                            const part1Total = Number(((Number(score.beforeMidKnowledgeScore) || 0) + (Number(score.beforeMidSoftSkillScore) || 0) + (Number(score.afterMidKnowledgeScore) || 0) + (Number(score.afterMidSoftSkillScore) || 0)).toFixed(2));
                            
                            return (
                            <tr key={student.id} className={`group border-b border-slate-100 transition-colors ${score.totalScore > 0 && score.totalScore < 50 ? 'bg-rose-50/70 hover:bg-rose-100' : 'hover:bg-slate-50'}`}>
                              <td className="px-2 py-3 text-center font-medium sticky left-0 bg-white z-10 border-r border-slate-200 group-hover:bg-slate-50 shadow-[1px_0_0_#e2e8f0]">{student.number}</td>
                              <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap sticky left-[48px] bg-white z-10 border-r border-slate-200 group-hover:bg-slate-50 shadow-[1px_0_0_#e2e8f0]">{student.firstName} {student.lastName}</td>
                              
                              {effectiveSettings.beforeMidKnowledge.map(act => (
                                <td key={act.id} className="px-2 py-2 text-center border-r border-slate-100 bg-emerald-50/30">
                                  <input disabled={student.status !== "active" || isReadOnly} type="number" min={0} max={act.maxScore}
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
                              {effectiveSettings.beforeMidSoftSkill.map(act => (
                                <td key={act.id} className="px-2 py-2 text-center border-r border-slate-100 bg-emerald-50/30">
                                  <input disabled={student.status !== "active" || isReadOnly} type="number" min={0} max={act.maxScore}
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
                              {effectiveSettings.afterMidKnowledge.map(act => (
                                <td key={act.id} className="px-2 py-2 text-center border-r border-slate-100 bg-emerald-50/30">
                                  <input disabled={student.status !== "active" || isReadOnly} type="number" min={0} max={act.maxScore}
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
                              {effectiveSettings.afterMidSoftSkill.map(act => (
                                <td key={act.id} className="px-2 py-2 text-center border-r border-slate-100 bg-emerald-50/30">
                                  <input disabled={student.status !== "active" || isReadOnly} type="number" min={0} max={act.maxScore}
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
                  selectedSubjectType === 'activity' ? (
                    <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-2 py-3 text-center w-12 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">เลขที่</th>
                        <th className="px-4 py-3 w-40 whitespace-nowrap sticky left-[48px] bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">ชื่อ-นามสกุล</th>
                        {(selectedSubject && selectedSubject.includes('ลูกเสือ')) ? (
                          <>
                            <th className="px-3 py-3 text-center border-r border-slate-200 bg-emerald-50">เวลาเรียน<br/><span className="text-xs font-normal text-slate-400">(ร้อยละ)</span></th>
                            <th className="px-3 py-3 text-center border-r border-slate-200 bg-emerald-50">กิจกรรมเข้าค่าย<br/><span className="text-xs font-normal text-slate-400">(ผ่าน/ไม่ผ่าน)</span></th>
                          </>
                        ) : (
                           <>
                            <th className="px-3 py-3 text-center border-r border-slate-200 bg-emerald-50">เวลาเรียน<br/><span className="text-xs font-normal text-slate-400">(ร้อยละ)</span></th>
                            <th className="px-3 py-3 text-center border-r border-slate-200 bg-emerald-50">ผลงาน/ปฏิบัติ<br/><span className="text-xs font-normal text-slate-400">(ร้อยละ)</span></th>
                          </>
                        )}
                        <th className="px-4 py-3 text-center bg-emerald-50">ผลการประเมินรวม<br/><span className="text-xs font-normal text-slate-400">(ผ/มผ)</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.filter(s => s.gradeLevel === selectedGrade).length > 0 ? (
                        students.filter(s => s.gradeLevel === selectedGrade)
                          .sort((a, b) => (Number(a.number || '0') - Number(b.number || '0')))
                          .map((student) => {
                            const key = `${student.id}_${viewYear}_${viewSemester}_${selectedSubject}`;
                            const isScoutCampAttended = scoutCampAttendees.has(student.id);
                            const score = draftScores[key] || { totalScore: '' };
                            const stats = attendanceStats.studentStats[student.id];
                            const totalAttended = stats.present + stats.late;
                            const totalRecords = stats.present + stats.late + stats.leave + stats.sick + stats.absent;
                            const baseTotal = attendanceStats.totalTargetPeriods > 0 ? attendanceStats.totalTargetPeriods : totalRecords;
                            const attendancePercentage = baseTotal > 0 ? (totalAttended / baseTotal) * 100 : 0;
                            
                            return (
                            <tr key={student.id} className="group border-b border-slate-100 transition-colors hover:bg-slate-50">
                              <td className="px-2 py-3 text-center font-medium sticky left-0 bg-white z-10 border-r border-slate-200 group-hover:bg-slate-50 shadow-[1px_0_0_#e2e8f0]">{student.number}</td>
                              <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap sticky left-[48px] bg-white z-10 border-r border-slate-200 group-hover:bg-slate-50 shadow-[1px_0_0_#e2e8f0]">{student.firstName} {student.lastName}</td>
                              <td className="px-3 py-3 text-center border-r border-slate-100 bg-emerald-50/30">
                                <input disabled={student.status !== "active" || isReadOnly || (attendancePercentage !== undefined && attendancePercentage > 0)} type="number" min={0} max={100}
                                  className={`w-16 p-1.5 text-center border border-slate-200 rounded focus:ring-2 focus:ring-emerald-500 outline-none ${(attendancePercentage !== undefined && attendancePercentage > 0) ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'}`}
                                  value={(attendancePercentage !== undefined && attendancePercentage > 0) ? attendancePercentage.toFixed(0) : (score.totalScore === '-' ? '' : score.totalScore)}
                                  title={(attendancePercentage !== undefined && attendancePercentage > 0) ? 'คำนวณอัตโนมัติจากแท็บเวลาเรียน' : ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const numVal = val === '' ? 0 : Number(val);
                                    setDraftScores(prev => ({
                                      ...prev,
                                      [key]: {
                                        ...(prev[key] || {
                                          id: `sc-${Date.now()}`,
                                          studentId: student.id,
                                          gradeLevel: selectedGrade,
                                          academicYear: viewYear || '',
                                          semester: viewSemester || '',
                                          subject: selectedSubject,
                                          teacherId: 'current-teacher',
                                          beforeMidKnowledgeScore: 0,
                                          beforeMidSoftSkillScore: 0,
                                          midtermScore: 0,
                                          afterMidKnowledgeScore: 0,
                                          afterMidSoftSkillScore: 0,
                                          finalScore: 0,
                                          activities: {}
                                        }),
                                        totalScore: numVal,
                                        grade: calculateGrade(numVal, selectedSubject, prev[key]?.activities, isScoutCampAttended, attendancePercentage)
                                      }
                                    }));
                                  }}
                                />
                              </td>
                              {(selectedSubject && selectedSubject.includes('ลูกเสือ')) ? (
                              <td className="px-3 py-3 text-center border-r border-slate-100 bg-emerald-50/30">
                                <label className="flex items-center justify-center gap-2 cursor-pointer">
                                  <input 
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                                    checked={isScoutCampAttended || score.activities?.scoutCamp === 1}
                                    disabled={isScoutCampAttended}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked;
                                      setDraftScores(prev => {
                                        const currentScore = prev[key] || {
                                          id: `sc-${Date.now()}`,
                                          studentId: student.id,
                                          gradeLevel: selectedGrade,
                                          academicYear: viewYear || '',
                                          semester: viewSemester || '',
                                          subject: selectedSubject,
                                          teacherId: 'current-teacher',
                                          beforeMidKnowledgeScore: 0,
                                          beforeMidSoftSkillScore: 0,
                                          midtermScore: 0,
                                          afterMidKnowledgeScore: 0,
                                          afterMidSoftSkillScore: 0,
                                          finalScore: 0,
                                          totalScore: 0,
                                          activities: {}
                                        };
                                        const newActivities = { ...currentScore.activities, scoutCamp: isChecked ? 1 : 0 };
                                        return {
                                          ...prev,
                                          [key]: {
                                            ...currentScore,
                                            activities: newActivities,
                                            grade: calculateGrade(currentScore.totalScore, selectedSubject, newActivities, isScoutCampAttended, attendancePercentage)
                                          }
                                        };
                                      });
                                    }}
                                  />
                                  {isScoutCampAttended && <span className="absolute -top-2 -right-2 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>}
                                  <span className="text-xs font-medium text-slate-600">เข้าร่วม</span>
                                </label>
                              </td>
                              ) : (
                                <td className="px-3 py-3 text-center border-r border-slate-100 bg-emerald-50/30">
                                  <input disabled={student.status !== "active" || isReadOnly} type="number" min={0} max={100}
                                    className="w-16 p-1.5 text-center border border-slate-200 rounded bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={score.activities?.practicalScore === undefined ? '' : score.activities.practicalScore}
                                    placeholder="ผลงาน"
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const numVal = val === '' ? 0 : Number(val);
                                      setDraftScores(prev => {
                                        const currentScore = prev[key] || {
                                          id: `sc-${Date.now()}`,
                                          studentId: student.id,
                                          gradeLevel: selectedGrade,
                                          academicYear: viewYear || '',
                                          semester: viewSemester || '',
                                          subject: selectedSubject,
                                          teacherId: 'current-teacher',
                                          activities: {}
                                        };
                                        
                                        const attScore = currentScore.totalScore === '-' || currentScore.totalScore === '' || currentScore.totalScore === undefined ? 0 : Number(currentScore.totalScore);
                                        const totalAvg = (attScore + numVal) / 2;
                                        
                                        return {
                                          ...prev,
                                          [key]: {
                                            ...currentScore,
                                            activities: { ...currentScore.activities, practicalScore: numVal },
                                            grade: totalAvg >= 80 ? 'ผ' : 'มผ' 
                                          }
                                        };
                                      });
                                    }}
                                  />
                                </td>
                              )}
                              <td className="px-4 py-3 text-center font-bold text-lg text-emerald-700 bg-emerald-50/50">
                                {score.grade || '-'}
                              </td>
                            </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                            ไม่พบข้อมูลนักเรียนในชั้น {selectedGrade}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  ) : (
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
                              const key = `${student.id}_${viewYear}_${viewSemester}_${selectedSubject}`;
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
                                  <input disabled={student.status !== "active" || isReadOnly} type="number" min={0} 
                                    className="w-14 text-center border border-slate-200 rounded p-1 text-xs outline-none focus:ring-1 focus:ring-sky-500" 
                                    placeholder="0"
                                    value={score.preTestScore === 0 ? '' : score.preTestScore}
                                    onChange={(e) => handleScoreChange(student.id, 'preTestScore', e.target.value)}
                                  />
                                </td>
                                <td className="px-3 py-3 text-center border-r border-slate-100 bg-amber-50/30">
                                  <input disabled={student.status !== "active" || isReadOnly} type="number" min={0} max={20}
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
                                  <input disabled={student.status !== "active" || isReadOnly} type="number" min={0} max={20}
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
                                  <input disabled={student.status !== "active" || isReadOnly} type="number" min={0} 
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
                                  {calculateGrade(score.totalScore || 0, selectedSubject, score.activities, scoutCampAttendees.has(student.id), undefined) || '-'}
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
                  )) : (
                    <div className="p-8 text-center text-slate-500">กำลังโหลดการตั้งค่า...</div>
                  )
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={handleSaveScores}
                  disabled={isSaving || isReadOnly}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" /> 
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>

              </>
              ) : (
                <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl max-w-full mt-6">
                  <div className="flex justify-between items-center px-4 py-3 bg-amber-50/50 border-b border-amber-200 rounded-t-xl">
                    <h3 className="font-bold text-amber-800 text-sm flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" /> การประเมินการอ่าน คิดวิเคราะห์ และเขียน (5 ตัวชี้วัด)
                    </h3>
                  </div>
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-2 py-3 text-center w-12 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]" rowSpan={2}>เลขที่</th>
                        <th className="px-4 py-3 w-40 whitespace-nowrap sticky left-[48px] bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]" rowSpan={2}>ชื่อ-นามสกุล</th>
                        <th className="px-2 py-2 text-center border-r border-slate-200 bg-sky-50" colSpan={5}>ตัวชี้วัด (3=ดีเยี่ยม, 2=ดี, 1=ผ่าน, 0=ไม่ผ่าน)</th>
                        <th className="px-3 py-3 text-center border-r border-slate-200 bg-emerald-50" rowSpan={2}>สรุปผลประเมิน<br/><span className="text-xs font-normal text-slate-400">(สพฐ.)</span></th>
                      </tr>
                      <tr>
                        <th className="px-2 py-2 text-center border-r border-slate-200 bg-sky-50/50 font-medium text-xs whitespace-nowrap w-20">1. การอ่าน</th>
                        <th className="px-2 py-2 text-center border-r border-slate-200 bg-sky-50/50 font-medium text-xs whitespace-nowrap w-20">2. จับประเด็น</th>
                        <th className="px-2 py-2 text-center border-r border-slate-200 bg-sky-50/50 font-medium text-xs whitespace-nowrap w-20">3. วิเคราะห์</th>
                        <th className="px-2 py-2 text-center border-r border-slate-200 bg-sky-50/50 font-medium text-xs whitespace-nowrap w-20">4. ประเมินค่า</th>
                        <th className="px-2 py-2 text-center border-r border-slate-200 bg-sky-50/50 font-medium text-xs whitespace-nowrap w-20">5. การเขียน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.filter(s => s.gradeLevel === selectedGrade).length > 0 ? (
                        students.filter(s => s.gradeLevel === selectedGrade)
                          .sort((a, b) => (Number(a.number || '0') - Number(b.number || '0')))
                          .map((student) => {
                            const key = `${student.id}_${viewYear}_${viewSemester}_${selectedSubject}`;
                            const score = draftScores[key] || { grade: '', activities: {} };
                            
                            const setIndicatorScore = (indicatorId: string, val: string) => {
                               const numVal = val === '' ? 0 : Number(val);
                               setDraftScores(prev => {
                                  const current = prev[key] || {
                                      id: `sc-${Date.now()}`,
                                      studentId: student.id,
                                      gradeLevel: selectedGrade,
                                      academicYear: viewYear || '',
                                      semester: viewSemester || '',
                                      subject: selectedSubject,
                                      teacherId: 'current-teacher',
                                      activities: {}
                                  };
                                  const newActivities = { ...current.activities, [indicatorId]: numVal };
                                  // Auto calculate overall grade
                                  const totalInd = ['rw1', 'rw2', 'rw3', 'rw4', 'rw5'].reduce((sum, id) => sum + (newActivities[id] || 0), 0);
                                  let newGrade = "";
                                  if (totalInd >= 12) newGrade = "3 (ดีเยี่ยม)";
                                  else if (totalInd >= 10) newGrade = "2 (ดี)";
                                  else if (totalInd >= 8) newGrade = "1 (ผ่าน)";
                                  else newGrade = "0 (ไม่ผ่าน)";
                                  
                                  return {
                                      ...prev,
                                      [key]: {
                                          ...current,
                                          activities: newActivities,
                                          grade: newGrade
                                      }
                                  };
                               });
                            };
                            
                            return (
                            <tr key={student.id} className="group border-b border-slate-100 transition-colors hover:bg-slate-50">
                              <td className="px-2 py-3 text-center font-medium sticky left-0 bg-white z-10 border-r border-slate-200 group-hover:bg-slate-50 shadow-[1px_0_0_#e2e8f0]">{student.number}</td>
                              <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap sticky left-[48px] bg-white z-10 border-r border-slate-200 group-hover:bg-slate-50 shadow-[1px_0_0_#e2e8f0]">{student.firstName} {student.lastName}</td>
                              
                              {['rw1', 'rw2', 'rw3', 'rw4', 'rw5'].map(indicatorId => (
                                <td key={indicatorId} className="px-2 py-3 text-center border-r border-slate-100 bg-sky-50/10">
                                  <select
                                    className="w-14 p-1.5 border border-slate-200 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none text-slate-700 font-medium text-center appearance-none"
                                    value={score.activities?.[indicatorId] ?? ''}
                                    onChange={(e) => setIndicatorScore(indicatorId, e.target.value)}
                                  >
                                    <option value="">-</option>
                                    <option value="3">3</option>
                                    <option value="2">2</option>
                                    <option value="1">1</option>
                                    <option value="0">0</option>
                                  </select>
                                </td>
                              ))}

                              <td className="px-3 py-3 text-center border-r border-slate-100 bg-emerald-50/30 font-bold text-lg text-emerald-700">
                                {score.grade || "-"}
                              </td>
                            </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                            ไม่พบข้อมูลนักเรียนในชั้น {selectedGrade}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              
              )}            </div>
          )}

          {activeTab === 'kindergarten' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-black text-slate-800">
                <span className="block sm:inline">วัดและประเมินผล</span>
                <span className="block sm:inline sm:ml-1">ระดับอนุบาล</span>
              </h2>
              <p className="text-slate-500">
                ฟังก์ชันสำหรับประเมินพัฒนาการนักเรียนระดับปฐมวัย<br/>
                (รอการกำหนดรูปแบบและวิธีการประเมิน)
              </p>
            </div>
          )}

          {activeTab === 'learning_hours' && (
            <LearningHoursReport 
              selectedGrade={selectedGrade}
              systemAcademicYear={viewYear}
              systemSemester={viewSemester}
              students={students}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceSummary 
              systemAcademicYear={viewYear}
              systemSemester={viewSemester}
              students={students}
            />
          )}

          {activeTab === 'character' && (
            <CharacterAssessmentView 
              students={students}
              systemAcademicYear={viewYear}
              systemSemester={viewSemester}
              currentTeacher={currentTeacher}
            />
          )}

        </div>
      </div>
    
      {showSettingsModal && subjectSettings && (
        <SubjectSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          settings={effectiveSettings || subjectSettings || undefined}
          onSave={handleSaveSettings}
        />
      )}
      
      {showPrintAttendance && (
        <AttendancePrintTemplate
          students={students.filter(s => s.gradeLevel === selectedGrade)}
          attendanceStats={attendanceStats}
          subject={selectedSubject}
          gradeLevel={selectedGrade}
          academicYear={viewYear || "2567"}
          semester={systemSemester || "1"}
          teacherName={subjectTeacherName}
          onClose={() => setShowPrintAttendance(false)}
        />
      )}

      {showPrintScore && (
        <SubjectScorePrintTemplate
          students={students}
          scores={scores}
          subject={selectedSubject}
          gradeLevel={selectedGrade}
          academicYear={viewYear || "2567"}
          semester={systemSemester || "1"}
          settings={subjectSettings}
          teacherName={subjectTeacherName}
          attendanceStats={attendanceStats}
          onClose={() => setShowPrintScore(false)}
        />
      )}

      {showPrintReport && (
        <StudentReportPrintTemplate
          students={students}
          scores={scores}
          gradeLevel={selectedGrade}
          academicYear={viewYear || "2567"}
          semester={systemSemester || "1"}
          onClose={() => setShowPrintReport(false)}
        />
      )}
    </div>
  );
};
