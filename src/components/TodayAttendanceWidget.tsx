import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Clock, Printer } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Student, AttendanceSession, Teacher } from '../types';
import { DailyAttendanceReportModal } from './DailyAttendanceReportModal';

interface TodayAttendanceWidgetProps {
  students: Student[];
  teachers?: Teacher[];
  currentTeacher?: Teacher;
  semester?: string;
  academicYear?: string;
}

export function TodayAttendanceWidget({
  students,
  teachers = [],
  currentTeacher,
  semester = '1',
  academicYear = '2567',
}: TodayAttendanceWidgetProps) {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDailyReportModal, setShowDailyReportModal] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });

  useEffect(() => {
    const q = query(
      collection(db, 'attendanceSessions'),
      where('date', '==', today)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedSessions: AttendanceSession[] = [];
      snapshot.forEach(doc => {
        fetchedSessions.push({ id: doc.id, ...doc.data() } as AttendanceSession);
      });
      setSessions(fetchedSessions);
      setLoading(false);
    }, (error) => {
      const msg = error?.message || String(error);
      if (msg.includes('Quota') || msg.includes('quota') || msg.includes('resource-exhausted') || msg.includes('Free daily read')) {
        console.warn('Notice: Quota limit reached in TodayAttendanceWidget, serving available cached attendance sessions.');
      } else {
        console.error('Error fetching today attendance:', error);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [today]);

  // To prevent double counting if multiple sessions exist for the same grade on the same day
  // we will take the latest updated session for each gradeLevel (or prefer 'กิจกรรมโฮมรูม')
  const getLatestSessionPerGrade = () => {
    const gradeMap = new Map<string, AttendanceSession>();
    
    sessions.forEach(session => {
      const existing = gradeMap.get(session.gradeLevel);
      if (!existing) {
        gradeMap.set(session.gradeLevel, session);
      } else {
        // Prefer homeroom
        const isCurrentHomeroom = session.period.includes('โฮมรูม');
        const isExistingHomeroom = existing.period.includes('โฮมรูม');
        
        if (isCurrentHomeroom && !isExistingHomeroom) {
          gradeMap.set(session.gradeLevel, session);
        } else if (isCurrentHomeroom === isExistingHomeroom) {
          // If both or neither are homeroom, pick the latest updated
          if (new Date(session.updatedAt) > new Date(existing.updatedAt)) {
            gradeMap.set(session.gradeLevel, session);
          }
        }
      }
    });
    
    return Array.from(gradeMap.values());
  };

  const validSessions = getLatestSessionPerGrade();

  // Active students only
  const activeStudents = students.filter(s => s.status === 'active');
  
  // Categorize students by level
  const kgStudents = activeStudents.filter(s => s.gradeLevel.includes('อนุบาล'));
  const prStudents = activeStudents.filter(s => s.gradeLevel.includes('ประถม'));
  
  const totalKg = kgStudents.length;
  const totalPr = prStudents.length;
  const totalStudents = activeStudents.length;

  let presentKg = 0;
  let presentPr = 0;
  
  let absentKg = 0;
  let absentPr = 0;

  let checkedKg = 0;
  let checkedPr = 0;

  // Compute attendance from sessions
  validSessions.forEach(session => {
    const isKg = session.gradeLevel.includes('อนุบาล');
    const isPr = session.gradeLevel.includes('ประถม');
    
    const records = Object.values(session.attendanceData);
    const present = records.filter(s => s === 'present' || s === 'late').length;
    const absent = records.filter(s => s === 'absent' || s === 'sick' || s === 'leave').length;
    
    if (isKg) {
      presentKg += present;
      absentKg += absent;
      checkedKg += records.length;
    } else if (isPr) {
      presentPr += present;
      absentPr += absent;
      checkedPr += records.length;
    }
  });

  const presentTotal = presentKg + presentPr;
  const absentTotal = absentKg + absentPr;
  const checkedTotal = checkedKg + checkedPr;
  
  const kgPercent = totalKg > 0 ? (presentKg / totalKg) * 100 : 0;
  const prPercent = totalPr > 0 ? (presentPr / totalPr) * 100 : 0;
  const totalPercent = totalStudents > 0 ? (presentTotal / totalStudents) * 100 : 0;

  if (loading) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-pulse h-32 flex items-center justify-center">
        <div className="text-slate-400 text-sm font-medium">กำลังโหลดข้อมูลการมาเรียน...</div>
      </div>
    );
  }

  const thaiDateStr = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timeZone: 'Asia/Bangkok'
  });

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            สรุปยอดนักเรียนวันนี้
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{thaiDateStr} (อัปเดตเรียลไทม์)</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-indigo-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-indigo-100">
            <Clock className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-xs font-bold text-indigo-700">เช็คแล้ว {checkedTotal} / {totalStudents} คน</span>
          </div>
          <button
            onClick={() => setShowDailyReportModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all hover:shadow active:scale-95"
            title="พิมพ์สถิตินักเรียนประจำวัน (PDF)"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>พิมพ์สถิติประจำวัน (PDF)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Box */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Users className="h-12 w-12 text-slate-900" />
          </div>
          <span className="text-xs font-bold text-slate-500 mb-1">ยอดรวมทั้งโรงเรียน</span>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-black text-slate-800 leading-none">{presentTotal}</span>
            <span className="text-sm font-bold text-slate-400 leading-none mb-1">/ {totalStudents}</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-auto">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, totalPercent)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-1.5">
            <span className="flex items-center gap-1"><UserCheck className="h-3 w-3 text-emerald-500"/> มา {presentTotal}</span>
            <span className="flex items-center gap-1"><UserX className="h-3 w-3 text-rose-500"/> ลา/ขาด {absentTotal}</span>
          </div>
        </div>

        {/* Kindergarten Box */}
        <div className="bg-pink-50/30 border border-pink-100 p-4 rounded-xl flex flex-col relative overflow-hidden">
          <span className="text-xs font-bold text-pink-600 mb-1">อนุบาล</span>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-black text-pink-700 leading-none">{presentKg}</span>
            <span className="text-sm font-bold text-pink-400 leading-none mb-1">/ {totalKg}</span>
          </div>
          <div className="w-full bg-pink-200/50 h-2 rounded-full overflow-hidden mt-auto">
            <div 
              className="h-full bg-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, kgPercent)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-pink-500 mt-1.5">
            <span>มา {presentKg}</span>
            <span>ลา/ขาด {absentKg}</span>
          </div>
        </div>

        {/* Primary Box */}
        <div className="bg-sky-50/30 border border-sky-100 p-4 rounded-xl flex flex-col relative overflow-hidden">
          <span className="text-xs font-bold text-sky-600 mb-1">ประถมศึกษา</span>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-black text-sky-700 leading-none">{presentPr}</span>
            <span className="text-sm font-bold text-sky-400 leading-none mb-1">/ {totalPr}</span>
          </div>
          <div className="w-full bg-sky-200/50 h-2 rounded-full overflow-hidden mt-auto">
            <div 
              className="h-full bg-sky-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, prPercent)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-sky-500 mt-1.5">
            <span>มา {presentPr}</span>
            <span>ลา/ขาด {absentPr}</span>
          </div>
        </div>
      </div>

      {showDailyReportModal && (
        <DailyAttendanceReportModal
          initialDate={today}
          semester={semester}
          academicYear={academicYear}
          students={students}
          teachers={teachers}
          currentTeacher={currentTeacher}
          onClose={() => setShowDailyReportModal(false)}
        />
      )}
    </div>
  );
}
