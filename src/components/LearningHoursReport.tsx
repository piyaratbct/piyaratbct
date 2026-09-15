import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TeacherSchedule, AttendanceSession, GRADE_LEVELS, Student } from '../types';
import { BookOpen, Clock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  systemAcademicYear: string;
  systemSemester: string;
  students: Student[];
  selectedGrade: string;
}

export function LearningHoursReport({ systemAcademicYear, systemSemester, students, selectedGrade }: Props) {
  const [schedules, setSchedules] = useState<TeacherSchedule[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalLearningDays, setTotalLearningDays] = useState(100);
  const [timeView, setTimeView] = useState<'term' | 'year'>('term');

  const uniqueGrades = useMemo(() => {
    const dbGrades = new Set(students.map(s => s.gradeLevel));
    const hideIfEmpty = ['ประถมศึกษาปีที่ 1', 'ประถมศึกษาปีที่ 2'];
    const filteredGradeLevels = GRADE_LEVELS.filter(g => !hideIfEmpty.includes(g) || dbGrades.has(g));
    const extraGrades = Array.from(dbGrades).filter(g => typeof g === 'string' && !GRADE_LEVELS.includes(g) && g !== 'จบการศึกษา') as string[];
    extraGrades.sort();
    return [...filteredGradeLevels, ...extraGrades];
  }, [students]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "school"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.totalLearningDays) setTotalLearningDays(data.totalLearningDays);
      }
    });
    return () => unsub();
  }, []);

  

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch schedules
        const sq = query(
          collection(db, 'schedules'),
          where('academicYear', '==', systemAcademicYear)
        );
        const stSnap = await getDocs(sq);
        const stData = stSnap.docs.map(d => ({ id: d.id, ...d.data() } as TeacherSchedule));
        setSchedules(stData);

        // Fetch attendance sessions
        const aq = query(
          collection(db, 'attendanceSessions'),
          where('academicYear', '==', systemAcademicYear)
        );
        const atSnap = await getDocs(aq);
        const atData = atSnap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceSession));
        setSessions(atData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [systemAcademicYear, systemSemester]);

  // Aggregate data for the selected grade
    const [curriculums, setCurriculums] = useState<any[]>([]);

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

  const reportData = useMemo(() => {
    const gradeSchedules = schedules.filter(s => {
      if (!s.gradeLevel) return false;
      const rooms = s.gradeLevel.split(',').map(r => r.trim());
      return rooms.includes(selectedGrade) && (timeView === 'year' || s.semester === systemSemester);
    });
    const gradeSessions = sessions.filter(s => {
      if (!s.gradeLevel) return false;
      const rooms = s.gradeLevel.split(',').map(r => r.trim());
      return rooms.includes(selectedGrade) && (timeView === 'year' || s.semester === systemSemester);
    });

    // Group by subject
    const subjectMap: Record<string, {
      subject: string;
      teacherName: string;
      periodsPerWeek: number;
      curriculumYearTarget: number; // From curriculum
      curriculumTermTarget: number; // curriculumYearTarget / 2
      scheduleTermTarget: number;   // periodsPerWeek * weeks
      targetPeriodsTotal: number;   // Final target used for progress (defaults to curriculumTermTarget)
      taughtPeriods: number;
      lastTaughtDate: string | null;
      dataSource: string;
      childSubjects: Record<string, { periodsPerWeek: number, taughtPeriods: number, targetPeriodsTotal: number }>;
    }> = {};
    const seenPeriodsPerSubject: Record<string, Set<string>> = {};
    const seenSessionsPerSubject: Record<string, Set<string>> = {};

    // 1. Base targets from Curriculum Manager
    const getBaseGrade = (g: string) => g ? g.split('/')[0].trim() : '';
    const targetBaseGrade = getBaseGrade(selectedGrade);
    
    const relevantCurriculums = curriculums.filter(c => {
      if (c.gradeLevel && getBaseGrade(c.gradeLevel) === targetBaseGrade) return true;
      if (c.gradeLevels && c.gradeLevels.some(g => getBaseGrade(g) === targetBaseGrade)) return true;
      return false;
    });

    relevantCurriculums.forEach(curr => {
      if (!curr.subjectName) return;
      // If the subject is a child subject (has parentId), skip it here because its targets and progress will be aggregated into the Parent Subject.
      if (curr.parentId) return;
      
      const totalHours = curr.totalHours || curr.requiredHoursPerTerm || 0; // ชั่วโมง/ปีการศึกษา
      
      subjectMap[curr.subjectName] = {
        subject: curr.subjectName,
        teacherName: '-',
        periodsPerWeek: 0,
        curriculumYearTarget: totalHours,
        curriculumTermTarget: Math.round(totalHours / 2),
        scheduleTermTarget: 0,
        targetPeriodsTotal: timeView === 'year' ? totalHours : Math.round(totalHours / 2),
        taughtPeriods: 0,
        lastTaughtDate: null,
        dataSource: 'curriculum',
        childSubjects: {}
      };
    });

    // 2. Overlay with schedules to get teachers and periods per week
    gradeSchedules.forEach(sch => {
      let subjectName = sch.subject === 'อื่นๆ' ? (sch.customSubject || 'อื่นๆ') : sch.subject;
      const safeSub = (subjectName || '').trim();
      let currMatch = curriculums.find(c => (c.subjectName || '').trim() === safeSub && (c.gradeLevel === targetBaseGrade || (c.gradeLevels && c.gradeLevels.includes(targetBaseGrade))));
      if (!currMatch) currMatch = curriculums.find(c => (c.subjectName || '').trim() === safeSub);
      
      let isChild = false;
      let childName = subjectName;
      if (currMatch && currMatch.parentId) {
          const parentMatch = curriculums.find(c => c.id === currMatch.parentId);
          if (parentMatch && parentMatch.subjectName) {
              subjectName = parentMatch.subjectName; // Group under parent
              isChild = true;
          }
      }

      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = {
          subject: subjectName,
          teacherName: sch.teacherName || '-',
          periodsPerWeek: 0,
          curriculumYearTarget: 0,
          curriculumTermTarget: 0,
          scheduleTermTarget: 0,
          targetPeriodsTotal: 0,
          taughtPeriods: 0,
          lastTaughtDate: null,
          dataSource: 'schedule',
          childSubjects: {}
        };
      } else {
        if (subjectMap[subjectName].teacherName === '-') {
          subjectMap[subjectName].teacherName = sch.teacherName || '-';
        } else if (sch.teacherName && !subjectMap[subjectName].teacherName.includes(sch.teacherName)) {
           subjectMap[subjectName].teacherName += `, ${sch.teacherName}`;
        }
      }
      
      // Deduplicate periods (if multiple teachers teach the same period)
      if (!seenPeriodsPerSubject[subjectName]) {
         seenPeriodsPerSubject[subjectName] = new Set();
      }
      
      // For children, we track uniqueness per child subject to allow same period across different child subjects (rare but possible),
      // OR we just assume they teach different periods. If it's the SAME child subject, deduplicate.
      const periodSig = isChild ? `${childName}-${sch.dayOfWeek}-${sch.period}` : `${sch.dayOfWeek}-${sch.period}`;
      if (!seenPeriodsPerSubject[subjectName].has(periodSig)) {
         seenPeriodsPerSubject[subjectName].add(periodSig);
         subjectMap[subjectName].periodsPerWeek += 1;
         if (isChild) {
             if (!subjectMap[subjectName].childSubjects[childName]) {
                 subjectMap[subjectName].childSubjects[childName] = { periodsPerWeek: 0, taughtPeriods: 0, targetPeriodsTotal: 0 };
             }
             subjectMap[subjectName].childSubjects[childName].periodsPerWeek += 1;
         }
      }
    });
    
    // Calculate expected schedule target
    const learningWeeks = Math.max(1, Math.round(totalLearningDays / 5));
    
    Object.keys(subjectMap).forEach(subj => {
        subjectMap[subj].scheduleTermTarget = subjectMap[subj].periodsPerWeek * learningWeeks;
        
        // If it's still 0 (or wasn't in curriculum), we fallback to schedule calculation
        if (subjectMap[subj].targetPeriodsTotal === 0 && subjectMap[subj].periodsPerWeek > 0) {
           subjectMap[subj].targetPeriodsTotal = subjectMap[subj].scheduleTermTarget;
           subjectMap[subj].dataSource = 'schedule_fallback';
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
          curriculumYearTarget: 0,
          curriculumTermTarget: 0,
          scheduleTermTarget: 0,
          targetPeriodsTotal: 0,
          taughtPeriods: 0,
          lastTaughtDate: null,
          dataSource: 'session',
          childSubjects: {}
        };
      }
      if (!seenSessionsPerSubject[subjectName]) {
         seenSessionsPerSubject[subjectName] = new Set();
      }
      const sessionSig = `${sess.date}-${sess.period}`;
      if (!seenSessionsPerSubject[subjectName].has(sessionSig)) {
         seenSessionsPerSubject[subjectName].add(sessionSig);
         subjectMap[subjectName].taughtPeriods += 1;
         if (isChild) {
             if (!subjectMap[subjectName].childSubjects[childName]) {
                 subjectMap[subjectName].childSubjects[childName] = { periodsPerWeek: 0, taughtPeriods: 0, targetPeriodsTotal: 0 };
             }
             subjectMap[subjectName].childSubjects[childName].taughtPeriods += 1;
         }
      }
      
      if (!subjectMap[subjectName].lastTaughtDate || sess.date > subjectMap[subjectName].lastTaughtDate!) {
        subjectMap[subjectName].lastTaughtDate = sess.date;
      }
    });

    return Object.values(subjectMap).sort((a, b) => b.targetPeriodsTotal - a.targetPeriodsTotal);
  }, [schedules, sessions, selectedGrade, totalLearningDays, curriculums, timeView, systemSemester]);

  const hasMissingHours = reportData.some(item => item.dataSource === 'schedule_fallback');
  const hasMismatchHours = reportData.some(item => 
    item.dataSource === 'curriculum' && 
    item.periodsPerWeek > 0 && 
    item.targetPeriodsTotal !== item.scheduleTermTarget
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-3 font-medium">กำลังโหลดข้อมูลชั่วโมงเรียน...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-500" />
            รายงานชั่วโมงเรียนและแผนการสอน (Progress)
          </h3>
          <p className="text-sm text-slate-500">ตรวจสอบความคืบหน้าการจัดการเรียนการสอนโดยอ้างอิงเป้าหมายเวลาเรียนจากระบบจัดการหลักสูตรเป็นหลัก</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setTimeView('term')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              timeView === 'term' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            รายภาคเรียน ({systemSemester})
          </button>
          <button
            onClick={() => setTimeView('year')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              timeView === 'year' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            รายปีการศึกษา ({systemAcademicYear})
          </button>
        </div>
      </div>
      
      {hasMissingHours && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-800 text-sm">พบรายวิชาที่ไม่ได้กำหนดชั่วโมงเรียนในโครงสร้างหลักสูตร</h4>
            <p className="text-sm text-amber-700 mt-1">
              มีบางรายวิชาที่มีตารางสอนหรือมีการบันทึกการสอนแล้ว แต่ยังไม่ได้กำหนดโครงสร้างเวลาเรียน (ชั่วโมง/ปีการศึกษา) ไว้ในระบบหลักสูตร ทำให้ไม่สามารถคำนวณความคืบหน้า (%) ได้ กรุณาไปที่เมนู <strong>จัดการหลักสูตรและรายวิชา</strong> เพื่อตั้งค่าเวลาเรียน
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportData.map((item, idx) => {
          const progress = item.targetPeriodsTotal > 0 ? Math.min(100, Math.round((item.taughtPeriods / item.targetPeriodsTotal) * 100)) : 0;
          return (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-col">
                      <h4 className="font-bold text-slate-800 line-clamp-1" title={item.subject}>{item.subject}</h4>
                      {Object.keys(item.childSubjects || {}).length > 0 && (
                          <div className="mt-1 space-y-1">
                              {Object.keys(item.childSubjects).map(child => (
                                  <div key={child} className="text-[10px] text-slate-600 flex items-center justify-between gap-2 bg-slate-50 px-2 py-1 rounded">
                                      <div className="flex items-center gap-1 line-clamp-1">
                                          <span className="w-1 h-1 rounded-full bg-indigo-300 shrink-0"></span>
                                          {child}
                                      </div>
                                      <div className="shrink-0 font-medium whitespace-nowrap">
                                          {item.childSubjects[child].taughtPeriods} / {item.childSubjects[child].periodsPerWeek} คาบ
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">ครู: {item.teacherName}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-50 p-2 rounded-lg text-center">
                  <span className="block text-[10px] font-medium text-slate-500 leading-tight">คาบ/สัปดาห์<br/>(จากตารางสอน)</span>
                  <span className="block text-lg font-bold text-slate-800 mt-1">{item.periodsPerWeek}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg text-center">
                  <span className="block text-[10px] font-medium text-slate-500 leading-tight">ความคืบหน้า<br/>สอนไปแล้ว (คาบ)</span>
                  <span className="block text-lg font-bold text-emerald-600 mt-1">{item.taughtPeriods} <span className="text-xs font-normal text-slate-400">/ {item.targetPeriodsTotal}</span></span>
                </div>
              </div>
              
              {item.dataSource === 'curriculum' && item.periodsPerWeek > 0 && (
                  <div className="mb-4">
                      {item.targetPeriodsTotal === item.scheduleTermTarget ? (
                          <div className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-1.5 rounded flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3" />
                              ตารางสอนสอดคล้องกับหลักสูตร ({item.scheduleTermTarget} คาบ)
                          </div>
                      ) : (
                          <div className="text-[11px] bg-orange-50 text-orange-700 px-2 py-1.5 rounded flex items-start gap-1.5 border border-orange-100">
                              <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                              <div className="leading-tight">
                                <span className="font-semibold block mb-0.5">ตารางสอนไม่สอดคล้องกับหลักสูตร</span>
                                หลักสูตรระบุ {item.curriculumYearTarget} ชม./ปี ({item.targetPeriodsTotal} คาบ/เทอม) <br/>
                                แต่ตารางสอนมี {item.periodsPerWeek} คาบ/สัปดาห์ (คาดการณ์ {item.scheduleTermTarget} คาบ)
                              </div>
                          </div>
                      )}
                  </div>
              )}
              
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>ความคืบหน้า ({progress}%)</span>
                  {progress >= 100 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${progress < 50 ? 'bg-amber-400' : progress < 100 ? 'bg-indigo-500' : 'bg-emerald-500'}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              {item.lastTaughtDate && (
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
                  <span>อัปเดตล่าสุด:</span>
                  <span className="font-medium text-slate-700">{item.lastTaughtDate}</span>
                </div>
              )}
            </div>
          );
        })}
        
        {reportData.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl flex flex-col items-center">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">ไม่มีข้อมูลตารางสอน</h3>
            <p className="text-slate-500 mt-1 text-sm max-w-sm">ยังไม่มีการจัดตารางสอนหรือไม่มีการบันทึกการเข้าเรียนในระดับชั้นนี้สำหรับภาคเรียนที่เลือก</p>
          </div>
        )}
      </div>
    </div>
  );
}
