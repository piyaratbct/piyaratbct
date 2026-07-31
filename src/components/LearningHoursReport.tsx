import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TeacherSchedule, AttendanceSession, GRADE_LEVELS, Student } from '../types';
import { BookOpen, Clock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  systemAcademicYear: string;
  systemSemester: string;
  students: Student[];
}

export function LearningHoursReport({ systemAcademicYear, systemSemester, students }: Props) {
  const [selectedGrade, setSelectedGrade] = useState<string>(GRADE_LEVELS[0]);
  const [schedules, setSchedules] = useState<TeacherSchedule[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const uniqueGrades = useMemo(() => {
    const dbGrades = new Set(students.map(s => s.gradeLevel));
    const hideIfEmpty = ['ประถมศึกษาปีที่ 1', 'ประถมศึกษาปีที่ 2'];
    const filteredGradeLevels = GRADE_LEVELS.filter(g => !hideIfEmpty.includes(g) || dbGrades.has(g));
    const extraGrades = Array.from(dbGrades).filter(g => typeof g === 'string' && !GRADE_LEVELS.includes(g) && g !== 'จบการศึกษา') as string[];
    extraGrades.sort();
    return [...filteredGradeLevels, ...extraGrades];
  }, [students]);

  useEffect(() => {
    if (!uniqueGrades.includes(selectedGrade)) {
      setSelectedGrade(uniqueGrades[0]);
    }
  }, [uniqueGrades, selectedGrade]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch schedules
        const sq = query(
          collection(db, 'schedules'),
          where('academicYear', '==', systemAcademicYear),
          where('semester', '==', systemSemester)
        );
        const stSnap = await getDocs(sq);
        const stData = stSnap.docs.map(d => ({ id: d.id, ...d.data() } as TeacherSchedule));
        setSchedules(stData);

        // Fetch attendance sessions
        const aq = query(
          collection(db, 'attendanceSessions'),
          where('academicYear', '==', systemAcademicYear),
          where('semester', '==', systemSemester)
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
      subjectMap[sch.subject].periodsPerWeek += 1;
      subjectMap[sch.subject].targetPeriodsTotal += 20; // 20 weeks estimation
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
  }, [schedules, sessions, selectedGrade]);

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
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-500" />
            รายงานชั่วโมงเรียนและแผนการสอน
          </h3>
          <p className="text-sm text-slate-500">ตรวจสอบความคืบหน้าการจัดการเรียนการสอนเทียบกับโครงสร้างหลักสูตร 20 สัปดาห์</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full md:w-48 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
          >
            {uniqueGrades.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

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
                    <h4 className="font-bold text-slate-800 line-clamp-1" title={item.subject}>{item.subject}</h4>
                    <p className="text-xs text-slate-500">ครู: {item.teacherName}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-slate-50 p-2 rounded-lg text-center">
                  <span className="block text-xs font-medium text-slate-500">คาบ/สัปดาห์</span>
                  <span className="block text-lg font-bold text-slate-800">{item.periodsPerWeek}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg text-center">
                  <span className="block text-xs font-medium text-slate-500">สอนไปแล้ว (คาบ)</span>
                  <span className="block text-lg font-bold text-emerald-600">{item.taughtPeriods} <span className="text-xs font-normal text-slate-400">/ {item.targetPeriodsTotal}</span></span>
                </div>
              </div>
              
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
