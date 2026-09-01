import React, { useState, useEffect } from 'react';
import { Student, GRADE_LEVELS, CharacterAssessment, StudentBadge, AttendanceSession, DisciplineIncident, SubjectScore } from '../types';
import { Award, CheckCircle, Search, Medal, Sparkles, Filter, ChevronDown, User, ShieldCheck, AlertCircle, BookOpen, Flag, Clock, GraduationCap, ShieldAlert } from 'lucide-react';
import { collection, doc, setDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface CharacterAssessmentViewProps {
  students: Student[];
  systemAcademicYear?: string;
  systemSemester?: string;
  currentTeacher: any;
}

const TRAITS = [
  { id: 't1', label: '1. รักชาติ ศาสน์ กษัตริย์', short: 'รักชาติฯ' },
  { id: 't2', label: '2. ซื่อสัตย์สุจริต', short: 'ซื่อสัตย์' },
  { id: 't3', label: '3. มีวินัย', short: 'มีวินัย' },
  { id: 't4', label: '4. ใฝ่เรียนรู้', short: 'ใฝ่เรียนรู้' },
  { id: 't5', label: '5. อยู่อย่างพอเพียง', short: 'พอเพียง' },
  { id: 't6', label: '6. มุ่งมั่นในการทำงาน', short: 'มุ่งมั่น' },
  { id: 't7', label: '7. รักความเป็นไทย', short: 'รักความเป็นไทย' },
  { id: 't8', label: '8. มีจิตสาธารณะ', short: 'จิตสาธารณะ' }
];

export const CharacterAssessmentView: React.FC<CharacterAssessmentViewProps> = ({ 
  students, systemAcademicYear, systemSemester, currentTeacher 
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('ประถมศึกษาปีที่ 1');
  const [assessments, setAssessments] = useState<Record<string, CharacterAssessment>>({});
  const [badges, setBadges] = useState<Record<string, StudentBadge[]>>({});
  const [lessonRecords, setLessonRecords] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [attendanceData, setAttendanceData] = useState<AttendanceSession[]>([]);
  const [disciplineData, setDisciplineData] = useState<DisciplineIncident[]>([]);
  const [scoresData, setScoresData] = useState<SubjectScore[]>([]);
  const [schoolEvents, setSchoolEvents] = useState<any[]>([]);

  
  // If user is a homeroom teacher, maybe pre-select their grade? (Omitted for simplicity, default to P.1)

  const uniqueGrades = React.useMemo(() => {
    const hideGrades = ['ประถมศึกษาปีที่ 1', 'ประถมศึกษาปีที่ 2'];
    return GRADE_LEVELS.filter(g => g.includes('ประถม') && !hideGrades.includes(g));
  }, []);

  const filteredStudents = React.useMemo(() => {
    return students.filter(s => s.gradeLevel === selectedGrade)
      .sort((a, b) => (Number(a.number || '0') - Number(b.number || '0')));
  }, [students, selectedGrade]);

  // Load from Firestore
  useEffect(() => {
    if (!systemAcademicYear || !systemSemester) return;
    
    const q = query(collection(db, 'characterAssessments'), 
      where('academicYear', '==', systemAcademicYear),
      where('semester', '==', systemSemester)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Record<string, any> = {};
      snapshot.docs.forEach(doc => {
        const item = doc.data();
        data[item.studentId] = item;
      });
      setAssessments(data);
    });

    return () => unsubscribe();
  }, [systemAcademicYear, systemSemester]);

  // Load extra auto-gen data
  useEffect(() => {
    if (!systemAcademicYear || !systemSemester) return;
    
    // Attendance
    const unsubAttendance = onSnapshot(query(collection(db, 'attendanceSessions'), 
      where('academicYear', '==', systemAcademicYear), 
      where('semester', '==', systemSemester)
    ), snap => {
      setAttendanceData(snap.docs.map(d => ({id: d.id, ...d.data()} as AttendanceSession)));
    });

    // Discipline
    const unsubDiscipline = onSnapshot(collection(db, 'disciplineIncidents'), snap => {
      setDisciplineData(snap.docs.map(d => ({id: d.id, ...d.data()} as DisciplineIncident)));
    });

    // Scores
    const unsubScores = onSnapshot(query(collection(db, 'subject_scores'),
      where('academicYear', '==', systemAcademicYear),
      where('semester', '==', systemSemester)
    ), snap => {
      setScoresData(snap.docs.map(d => ({id: d.id, ...d.data()} as SubjectScore)));
    });
    
    // School Events (for trait evaluation)
    const unsubEvents = onSnapshot(collection(db, 'schoolEvents'), snap => {
      setSchoolEvents(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    
    // Fetch lesson records for insights
    const unsubRecords = onSnapshot(collection(db, 'records'), snap => {
      setLessonRecords(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });

    return () => {
      unsubAttendance();
      unsubDiscipline();
      unsubScores();
      if(typeof unsubEvents === "function") unsubEvents();
    };
  }, [systemAcademicYear, systemSemester]);

  // Load badges
  useEffect(() => {
    if (!systemAcademicYear || !systemSemester) return;
    
    const q = query(collection(db, 'studentBadges'), 
      where('academicYear', '==', systemAcademicYear),
      where('semester', '==', systemSemester)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Record<string, StudentBadge[]> = {};
      snapshot.docs.forEach(doc => {
        const item = doc.data() as StudentBadge;
        if (!data[item.studentId]) {
          data[item.studentId] = [];
        }
        data[item.studentId].push(item);
      });
      setBadges(data);
    });

    return () => unsubscribe();
  }, [systemAcademicYear, systemSemester]);

  const handleSetAllGood = () => {
    const newData = { ...assessments };
    
    // Map badgeType to Trait ID
    const badgeToTraitMap: Record<string, string> = {
      'honesty': 't2',
      'discipline': 't3',
      'learning': 't4',
      'sufficient': 't5',
      'public_mind': 't8'
    };

    filteredStudents.forEach(student => {
      const studentBadges = badges[student.id] || [];
      const excellentTraits = new Set<string>();
      const warningTraits = new Set<string>(); // For capping at 1 or 2
      
      // -- Base logic from badges
      studentBadges.forEach(b => {
        if (b.badgeType && badgeToTraitMap[b.badgeType]) {
          excellentTraits.add(badgeToTraitMap[b.badgeType]);
        }
      });

      // -- GROUP 1: AUTO-GENERATED LOGIC --
      
      // 1. Discipline & Punctuality (t3: มีวินัย)
      // Check attendance
      let presentCount = 0;
      let totalCount = 0;
      attendanceData.forEach(session => {
        if (session.attendanceData && session.attendanceData[student.id]) {
          totalCount++;
          if (session.attendanceData[student.id] === 'present') presentCount++;
        }
      });
      const attendancePercent = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
      
      // Check discipline incidents (only behavioral infractions)
      
      // Check discipline incidents (only behavioral infractions)
      const badBehaviorTypes = ['fight', 'assault', 'feud', 'bullying', 'vandalism', 'disruption'];
      
      const isOffender = disciplineData.some(inc => 
        inc.offenderIds && 
        inc.offenderIds.includes(student.id) && 
        badBehaviorTypes.includes(inc.type)
      );

      // Legacy incidents where offenderIds isn't used, so we check studentIds
      const isLegacy = disciplineData.some(inc => 
        (!inc.offenderIds || inc.offenderIds.length === 0) &&
        inc.studentIds && 
        inc.studentIds.includes(student.id) && 
        badBehaviorTypes.includes(inc.type)
      );
      
      // -- NEW: Incorporate Lesson Logs (Classroom Evaluations) --
      // Gather scores for each trait (t1-t8) from all lesson records for this student
      const lessonRecordScores: Record<string, number[]> = {
        t1: [], t2: [], t3: [], t4: [], t5: [], t6: [], t7: [], t8: []
      };
      
      lessonRecords.forEach(record => {
        if (record.studentDesirableScores && record.studentDesirableScores[student.id]) {
          const studentScores = record.studentDesirableScores[student.id];
          Object.entries(studentScores).forEach(([indicatorId, score]) => {
             const traitNumber = indicatorId.split('.')[0]; // e.g., "1.1" -> "1"
             const traitKey = `t${traitNumber}`;
             if (lessonRecordScores[traitKey] !== undefined) {
               lessonRecordScores[traitKey].push(score as number);
             }
          });
        }
      });
      
      // Calculate mode or average for each trait from classes
      Object.keys(lessonRecordScores).forEach(traitKey => {
         const scores = lessonRecordScores[traitKey];
         if (scores.length > 0) {
           const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
           // If average is high (>= 2.5), auto-suggest excellent
           if (avg >= 2.5) {
             excellentTraits.add(traitKey);
           } else if (avg < 1.5) {
             // If average is low (< 1.5), auto-suggest warning
             warningTraits.add(traitKey);
           }
         }
      });
      // --------------------------------------------------------

      
      if (attendancePercent >= 90 && !isOffender) {
        excellentTraits.add('t3'); // 90%+ and clean record = 3
      } 
      if (isOffender) {
        warningTraits.add('t3'); // Has explicit offender incidents = cap at 1
      }
      // Note: If isLegacy, we don't auto-deduct. We leave it neutral or let the teacher decide.


      // 2. Learning & Commitment (t4: ใฝ่เรียนรู้, t6: มุ่งมั่นในการทำงาน)
      // Check academic scores
      const studentScores = scoresData.filter(s => s.studentId === student.id);
      let totalScoreSum = 0;
      let scoreCount = 0;
      studentScores.forEach(s => {
        if (s.totalScore !== undefined && s.totalScore > 0) {
          totalScoreSum += s.totalScore;
          scoreCount++;
        }
      });
      const avgScore = scoreCount > 0 ? (totalScoreSum / scoreCount) : 0;
      
      if (avgScore >= 80) {
        excellentTraits.add('t4'); // 80%+ average = 3
        excellentTraits.add('t6'); // 80%+ average = 3
      } else if (scoreCount > 0 && avgScore < 50) {
        warningTraits.add('t4');
        warningTraits.add('t6');
      }

      
      // 3. School Event Attendance
      const attendedEvents = schoolEvents.filter(e => e.attendeeIds && e.attendeeIds.includes(student.id));
      attendedEvents.forEach(e => {
        if (e.evaluatedTraits && e.evaluatedTraits.length > 0) {
          e.evaluatedTraits.forEach((traitId: string) => {
            excellentTraits.add(traitId); // Auto-suggest excellent for attended traits
          });
        }
      });
      
      // Helper function to resolve final score

      const resolveScore = (traitId: string) => {
        if (warningTraits.has(traitId)) return 1; // Needs improvement
        if (excellentTraits.has(traitId)) return 3; // Excellent
        return 2; // Default Good
      };

      if (!newData[student.id]) {
        newData[student.id] = {
          studentId: student.id,
          academicYear: systemAcademicYear!,
          semester: systemSemester!,
          t1: resolveScore('t1'),
          t2: resolveScore('t2'),
          t3: resolveScore('t3'),
          t4: resolveScore('t4'),
          t5: resolveScore('t5'),
          t6: resolveScore('t6'),
          t7: resolveScore('t7'),
          t8: resolveScore('t8')
        };
      } else {
        TRAITS.forEach(t => {
          if ((newData[student.id] as any)[t.id] === undefined) {
             (newData[student.id] as any)[t.id] = resolveScore(t.id);
          } else {
             const newScore = resolveScore(t.id);
             if (newScore !== 2) {
               // Only override if it's excellent or warning
               (newData[student.id] as any)[t.id] = newScore;
             }
          }
        });
      }
    });
    setAssessments(newData);
  };

  const handleScoreChange = (studentId: string, traitId: string, value: number) => {
    setAssessments(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { studentId, academicYear: systemAcademicYear, semester: systemSemester }),
        [traitId]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!systemAcademicYear || !systemSemester) return;
    setIsSaving(true);
    setSaveMessage('');
    try {
      const batchPromises = filteredStudents.map(student => {
        const data = assessments[student.id];
        if (data) {
          const docId = `${student.id}_${systemAcademicYear}_${systemSemester}`;
          return setDoc(doc(db, 'characterAssessments', docId), {
            ...data,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
        return Promise.resolve();
      });
      
      await Promise.all(batchPromises);
      setSaveMessage('บันทึกข้อมูลเรียบร้อยแล้ว');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving character assessments:', error);
      setSaveMessage('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  const getScoreColor = (score: number | undefined) => {
    if (score === 3) return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
    if (score === 2) return 'bg-white text-slate-700 border-slate-200';
    if (score === 1) return 'bg-amber-50 text-amber-700 border-amber-300';
    if (score === 0) return 'bg-rose-50 text-rose-700 border-rose-300 font-bold';
    return 'bg-slate-50 text-slate-400 border-dashed border-slate-300';
  };

  const isTeacherActionAllowed = currentTeacher?.role === 'admin' || currentTeacher?.role === 'academic' || currentTeacher?.role === 'teacher';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-500" />
            ประเมินคุณลักษณะอันพึงประสงค์ 8 ประการ
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            (Manage by Exception) ประเมินเฉพาะความโดดเด่น ระบบจะให้ค่าเริ่มต้นเป็น "ดี (2)" และดึงข้อมูลจากระบบ เช็กชื่อ / พฤติกรรม / ผลการเรียน มาคำนวณคะแนนให้อัตโนมัติ (Data-Driven)
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
           <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="" disabled>เลือกชั้นเรียน</option>
              {uniqueGrades.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <button 
               onClick={handleSetAllGood}
               disabled={!isTeacherActionAllowed}
               className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
             >
               <Sparkles className="h-4 w-4" />
               ประเมินอัตโนมัติ ⚡ (ดึง Data จากทุกระบบ)
             </button>
          </div>
          <div className="flex items-center gap-3">
            {saveMessage && (
              <span className="text-sm font-bold text-emerald-600 animate-pulse flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> {saveMessage}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving || !isTeacherActionAllowed}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
            >
              <CheckCircle className="h-4 w-4" />
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-2 py-3 text-center w-12 sticky left-0 bg-slate-100 z-20 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">ที่</th>
                <th className="px-4 py-3 min-w-[250px] sticky left-[48px] bg-slate-100 z-20 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">ชื่อ-นามสกุล / <span className="text-indigo-600">ร่องรอยหลักฐาน</span></th>
                {TRAITS.map(t => (
                  <th key={t.id} className="px-2 py-3 text-center w-16 border-r border-slate-200 last:border-r-0 leading-tight">
                    <span title={t.label} className="text-xs">{t.short}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => {
                  const studentData = assessments[student.id] || {};
                  const studentBadges = badges[student.id] || [];
                  
                  // Calculate auto-insights
                  let presentCount = 0;
                  let lateCount = 0;
                  let totalCount = 0;
                  attendanceData.forEach(session => {
                    if (session.attendanceData && session.attendanceData[student.id]) {
                      totalCount++;
                      const status = session.attendanceData[student.id];
                      if (status === 'present') presentCount++;
                      if (status === 'late') lateCount++;
                    }
                  });
                  const attendancePercent = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
                  
                  const badBehaviorTypes = ['fight', 'assault', 'feud', 'bullying', 'vandalism', 'disruption'];
                  const studentIncidents = disciplineData.filter(inc => 
                    inc.studentIds && 
                    inc.studentIds.includes(student.id) &&
                    badBehaviorTypes.includes(inc.type)
                  );
                  const hasIncidents = studentIncidents.length > 0;
                  
                  const studentScores = scoresData.filter(s => s.studentId === student.id);
                  let totalScoreSum = 0;
                  let scoreCount = 0;
                  studentScores.forEach(s => {
                    if (s.totalScore !== undefined && s.totalScore > 0) {
                      totalScoreSum += s.totalScore;
                      scoreCount++;
                    }
                  });
                  const avgScore = scoreCount > 0 ? (totalScoreSum / scoreCount) : 0;
                  const insights: any[] = [];
                  
                  // -- NEW: Lesson Records Insights --
                  const lessonRecordScores: Record<string, number[]> = { t1: [], t2: [], t3: [], t4: [], t5: [], t6: [], t7: [], t8: [] };
                  lessonRecords.forEach(record => {
                    if (record.studentDesirableScores && record.studentDesirableScores[student.id]) {
                      const studentScores = record.studentDesirableScores[student.id];
                      Object.entries(studentScores).forEach(([indicatorId, score]) => {
                         const traitNumber = indicatorId.split('.')[0];
                         const traitKey = `t${traitNumber}`;
                         if (lessonRecordScores[traitKey] !== undefined) {
                           lessonRecordScores[traitKey].push(score as number);
                         }
                      });
                    }
                  });
                  Object.keys(lessonRecordScores).forEach(traitKey => {
                     const scores = lessonRecordScores[traitKey];
                     if (scores.length > 0) {
                       const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                       const traitInfo = TRAITS.find(t => t.id === traitKey);
                       if (traitInfo) {
                           if (avg >= 2.5) {
                               insights.push({ source: 'lesson', type: 'positive', text: `บันทึกหลังสอน: ${traitInfo.short} (ดีเยี่ยม ${avg.toFixed(1)})` });
                           } else if (avg < 1.5) {
                               insights.push({ source: 'lesson', type: 'warning', text: `บันทึกหลังสอน: ${traitInfo.short} (ควรปรับปรุง ${avg.toFixed(1)})` });
                           } else {
                               insights.push({ source: 'lesson', type: 'neutral', text: `บันทึกหลังสอน: ${traitInfo.short} (ประเมินแล้ว ${avg.toFixed(1)})` });
                           }
                       }
                     }
                  });
                  // ------------------------------------

                  const attendedEvents = schoolEvents.filter(e => e.attendeeIds && e.attendeeIds.includes(student.id));
                  const eventTraitMap: Record<string, string[]> = {};
                  attendedEvents.forEach(e => {
                    if (e.evaluatedTraits) {
                      e.evaluatedTraits.forEach((tId: string) => {
                        if (!eventTraitMap[tId]) eventTraitMap[tId] = [];
                        eventTraitMap[tId].push(e.title);
                      });
                    }
                  });
                  Object.keys(eventTraitMap).forEach(tId => {
                    const trait = TRAITS.find(t => t.id === tId);
                    if (trait) {
                      insights.push({ source: 'event', type: 'positive', text: `กิจกรรม: ${eventTraitMap[tId].join(', ')} -> โดดเด่น ${trait.short}` });
                    }
                  });
                  
                  if (totalCount > 0) {
                    if (attendancePercent >= 90 && !hasIncidents) {
                      insights.push({ source: 'attendance', type: 'positive', text: `เช็คชื่อ: มาเรียนสม่ำเสมอ ${attendancePercent.toFixed(0)}% (เพิ่มวินัย)` });
                    }
                    if (lateCount >= 3) {
                      insights.push({ source: 'attendance', type: 'warning', text: `เช็คชื่อ: มาสายบ่อย ${lateCount} ครั้ง (หักวินัย)` });
                    }
                  }
                  
                  if (hasIncidents) {
                    insights.push({ source: 'discipline', type: 'danger', text: `งานปกครอง: คดีพฤติกรรม ${studentIncidents.length} รายการ (หักวินัย)` });
                  }
                  
                  if (scoreCount > 0) {
                    if (avgScore >= 80) {
                      insights.push({ source: 'academic', type: 'positive', text: `ผลการเรียน: เฉลี่ย ${avgScore.toFixed(0)}% (เพิ่มใฝ่เรียน/มุ่งมั่น)` });
                    } else if (avgScore < 50) {
                      insights.push({ source: 'academic', type: 'warning', text: `ผลการเรียน: เฉลี่ย ${avgScore.toFixed(0)}% (หักใฝ่เรียน/มุ่งมั่น)` });
                    }
                  }

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-2 py-3 text-center sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0] font-medium text-slate-500">
                        {student.number || '-'}
                      </td>
                      <td className="px-4 py-3 sticky left-[48px] bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_0_#e2e8f0]">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{student.firstName} {student.lastName}</span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {studentBadges.map((badge, idx) => (
                              <span key={`b-${idx}`} className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100" title={`โดย ${badge.teacherName}`}>
                                <Medal className="h-3 w-3" />
                                {badge.description}
                              </span>
                            ))}
                            {insights.map((insight, idx) => (
                              <span key={`i-${idx}`} className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border ${
                                insight.type === 'positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                insight.type === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                insight.type === 'neutral' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                                'bg-rose-50 text-rose-700 border-rose-100'
                              }`}>
                                {insight.source === 'lesson' && <BookOpen className="h-3 w-3" />}
                                {insight.source === 'event' && <Flag className="h-3 w-3" />}
                                {insight.source === 'attendance' && <Clock className="h-3 w-3" />}
                                {insight.source === 'discipline' && <ShieldAlert className="h-3 w-3" />}
                                {insight.source === 'academic' && <GraduationCap className="h-3 w-3" />}
                                {(!insight.source && insight.type === 'positive') && <Sparkles className="h-3 w-3" />}
                                {(!insight.source && insight.type === 'warning') && <AlertCircle className="h-3 w-3" />}
                                {(!insight.source && insight.type === 'danger') && <AlertCircle className="h-3 w-3" />}
                                {insight.text}
                              </span>
                            ))}
                            {studentBadges.length === 0 && insights.length === 0 && (
                               <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                 (ยังไม่มีข้อมูลหลักฐานประกอบ)
                               </span>
                            )}
                          </div>
                        </div>
                      </td>
                      {TRAITS.map(t => {
                        const score = (studentData as any)[t.id];
                        return (
                          <td key={t.id} className="px-1 py-3 text-center border-r border-slate-200 last:border-r-0">
                              <select
                                value={score !== undefined ? score : ''}
                                onChange={(e) => handleScoreChange(student.id, t.id, Number(e.target.value))}
                                disabled={!isTeacherActionAllowed}
                                className={`w-full text-center py-1 px-1 rounded border cursor-pointer outline-none transition-colors text-sm font-semibold ${(score === 3 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : score === 2 ? 'bg-white text-slate-700 border-slate-200' : score === 1 ? 'bg-amber-50 text-amber-700 border-amber-200' : score === 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-400 border-slate-200')}`}
                              >
                               <option value="" disabled>-</option>
                               <option value={3}>3</option>
                               <option value={2}>2</option>
                               <option value={1}>1</option>
                               <option value={0}>0</option>
                             </select>
                          </td>
                        );
                      })}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                    ไม่พบข้อมูลนักเรียนในชั้น {selectedGrade}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-300 inline-block"></span> = ดีเยี่ยม (3)</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-white border border-slate-300 inline-block"></span> = ดี (2)</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-50 border border-amber-300 inline-block"></span> = ผ่าน (1)</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-50 border border-rose-300 inline-block"></span> = ไม่ผ่าน (0)</div>
        </div>
      </div>
    </div>
  );
};
