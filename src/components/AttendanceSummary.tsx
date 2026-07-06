import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AttendanceSession, GRADE_LEVELS } from '../types';
import { CalendarDays, Clock, CheckCircle2, XCircle, AlertCircle, HelpCircle, FileText, Users, Loader2 } from 'lucide-react';
import { AttendanceStudentCumulative } from './AttendanceStudentCumulative';

interface AttendanceSummaryProps {
  systemAcademicYear?: string;
  systemSemester?: string;
}

export function AttendanceSummary({ systemAcademicYear, systemSemester }: AttendanceSummaryProps) {
  const [selectedGrade, setSelectedGrade] = useState<string>(GRADE_LEVELS[0]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'daily' | 'cumulative'>('daily');

  useEffect(() => {
    if (viewMode === 'cumulative') return;

    const fetchAttendance = async () => {
      setIsLoading(true);
      try {
        let q = query(
          collection(db, 'attendanceSessions'),
          where('gradeLevel', '==', selectedGrade),
          where('date', '==', selectedDate)
        );
        
        if (systemAcademicYear) {
          q = query(q, where('academicYear', '==', systemAcademicYear));
        }
        if (systemSemester) {
          q = query(q, where('semester', '==', systemSemester));
        }

        const querySnapshot = await getDocs(q);
        const data: AttendanceSession[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as AttendanceSession);
        });
        
        // Sort by period
        data.sort((a, b) => a.period.localeCompare(b.period));
        
        setSessions(data);
      } catch (error) {
        console.error("Error fetching attendance summary:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedGrade, selectedDate, systemAcademicYear, systemSemester, viewMode]);

  // Compute daily totals across all sessions for the selected grade and date
  const totalStudents = sessions.length > 0 ? Object.keys(sessions[0].attendanceData || {}).length : 0;
  
  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-lg font-black text-slate-800">สรุปการเช็กชื่อนักเรียน (Attendance Summary)</h3>
          <p className="text-sm text-slate-500">รายงานสรุปการเข้าเรียนประจำวันและรายคาบเรียน รวมถึงสถิติสะสม</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-1 rounded-xl border border-slate-100">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${
              viewMode === 'daily' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CalendarDays className="h-4 w-4" /> สรุปรายวัน
          </button>
          <button
            onClick={() => setViewMode('cumulative')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${
              viewMode === 'cumulative' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="h-4 w-4" /> สรุปสะสมรายบุคคล
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select 
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
        >
          {GRADE_LEVELS.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        {viewMode === 'daily' && (
          <div className="relative shadow-sm">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>

      {viewMode === 'cumulative' ? (
        <AttendanceStudentCumulative 
          gradeLevel={selectedGrade}
          systemAcademicYear={systemAcademicYear}
          systemSemester={systemSemester}
        />
      ) : (
        <>
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-sm font-bold">กำลังโหลดข้อมูล...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <FileText className="h-12 w-12 mb-3 text-slate-300" />
          <h4 className="text-lg font-black text-slate-500">ไม่พบข้อมูลการเช็กชื่อ</h4>
          <p className="text-sm mt-1">ยังไม่มีการบันทึกการเช็กชื่อสำหรับชั้น {selectedGrade} ในวันที่เลือก</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Daily Overview */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-indigo-500" />
              ภาพรวมประจำวัน ({selectedDate}) - ชั้น {selectedGrade}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {(() => {
                let totalPresent = 0, totalLeave = 0, totalSick = 0, totalAbsent = 0, totalLate = 0;
                sessions.forEach(session => {
                  totalPresent += Object.values(session.attendanceData || {}).filter(s => s === 'present').length;
                  totalLeave += Object.values(session.attendanceData || {}).filter(s => s === 'leave').length;
                  totalSick += Object.values(session.attendanceData || {}).filter(s => s === 'sick').length;
                  totalAbsent += Object.values(session.attendanceData || {}).filter(s => s === 'absent').length;
                  totalLate += Object.values(session.attendanceData || {}).filter(s => s === 'late').length;
                });
                
                // Average out based on number of sessions to get an approximate daily summary
                const numSessions = sessions.length || 1;
                const avgPresent = Math.round(totalPresent / numSessions);
                const avgLeave = Math.round(totalLeave / numSessions);
                const avgSick = Math.round(totalSick / numSessions);
                const avgAbsent = Math.round(totalAbsent / numSessions);
                const avgLate = Math.round(totalLate / numSessions);
                
                return (
                  <>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div className="text-sm font-bold text-emerald-600 mb-1 flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> มาเรียนเฉลี่ย</div>
                      <div className="text-2xl font-black text-slate-800">{avgPresent} <span className="text-sm font-medium text-slate-500">คน</span></div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div className="text-sm font-bold text-amber-500 mb-1 flex items-center gap-1.5"><HelpCircle className="h-4 w-4" /> ลาเฉลี่ย</div>
                      <div className="text-2xl font-black text-slate-800">{avgLeave} <span className="text-sm font-medium text-slate-500">คน</span></div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div className="text-sm font-bold text-orange-500 mb-1 flex items-center gap-1.5"><AlertCircle className="h-4 w-4" /> ป่วยเฉลี่ย</div>
                      <div className="text-2xl font-black text-slate-800">{avgSick} <span className="text-sm font-medium text-slate-500">คน</span></div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div className="text-sm font-bold text-blue-500 mb-1 flex items-center gap-1.5"><Clock className="h-4 w-4" /> สายเฉลี่ย</div>
                      <div className="text-2xl font-black text-slate-800">{avgLate} <span className="text-sm font-medium text-slate-500">คน</span></div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div className="text-sm font-bold text-rose-500 mb-1 flex items-center gap-1.5"><XCircle className="h-4 w-4" /> ขาดเฉลี่ย</div>
                      <div className="text-2xl font-black text-slate-800">{avgAbsent} <span className="text-sm font-medium text-slate-500">คน</span></div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <h4 className="font-bold text-slate-800 pt-2 flex items-center gap-2">
             <Clock className="h-5 w-5 text-indigo-500" /> สรุปรายคาบเรียน
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sessions.map((session, idx) => {
              const stats = {
                present: Object.values(session.attendanceData || {}).filter(s => s === 'present').length,
                leave: Object.values(session.attendanceData || {}).filter(s => s === 'leave').length,
                sick: Object.values(session.attendanceData || {}).filter(s => s === 'sick').length,
                absent: Object.values(session.attendanceData || {}).filter(s => s === 'absent').length,
                late: Object.values(session.attendanceData || {}).filter(s => s === 'late').length,
              };
              const total = stats.present + stats.leave + stats.sick + stats.absent + stats.late;
              
              return (
                <div key={session.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                      <Clock className="h-4 w-4 text-indigo-500" /> {session.period}
                      {session.subject && <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs ml-1">{session.subject}</span>}
                      {session.teacherName && <span className="text-slate-500 text-xs font-normal">({session.teacherName})</span>}
                    </div>
                    <div className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                      {total} คน
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> มา: {stats.present}
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <HelpCircle className="h-3.5 w-3.5" /> ลา: {stats.leave}
                    </div>
                    <div className="flex items-center gap-1.5 text-orange-500">
                      <AlertCircle className="h-3.5 w-3.5" /> ป่วย: {stats.sick}
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-500">
                      <Clock className="h-3.5 w-3.5" /> สาย: {stats.late}
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-500">
                      <XCircle className="h-3.5 w-3.5" /> ขาด: {stats.absent}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
