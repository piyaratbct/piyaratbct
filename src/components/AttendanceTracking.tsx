import React, { useState, useEffect } from 'react';
import { MilkReportPrintTemplate } from './MilkReportPrintTemplate';
import { collection, query, where, getDocs, setDoc, doc, addDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Student, AttendanceSession, TeacherSchedule, PERIODS } from '../types';
import { Loader2, Save, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface AttendanceTrackingProps {
  students: Student[];
  gradeLevel: string;
  teacherId: string;
  teacherName?: string;
  semester: string;
  academicYear: string;
  initialDate?: string;
  initialPeriod?: string;
  onClose?: () => void;
}

export function AttendanceTracking({ students, gradeLevel, teacherId, teacherName, semester, academicYear, initialDate, initialPeriod, onClose }: AttendanceTrackingProps) {
  const [date, setDate] = useState<string>(initialDate || new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState<string>(initialPeriod || PERIODS[1]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [applyToAllPeriods, setApplyToAllPeriods] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'leave' | 'sick' | 'absent' | 'late'>>({});
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [schedules, setSchedules] = useState<TeacherSchedule[]>([]);
  const [termStartDate, setTermStartDate] = useState<string>('');
  const [termEndDate, setTermEndDate] = useState<string>('');
  const [showMilkReport, setShowMilkReport] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState({ name: '', subDistrict: '', district: '', province: '' });

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        const docSnap = await getDoc(doc(db, "config", "school"));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSchoolInfo({
            name: data.schoolName || '',
            subDistrict: data.schoolSubDistrict || '',
            district: data.schoolDistrict || '',
            province: data.schoolProvince || ''
          });
        }
      } catch (err) {
        console.error("Error fetching school config:", err);
      }
    };
    fetchSchoolInfo();
  }, []);

  // Fetch term dates
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "school"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.termStartDate) setTermStartDate(data.termStartDate);
        if (data.termEndDate) setTermEndDate(data.termEndDate);
      }
    });
    return () => unsub();
  }, []);

  // Fetch teacher schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const q = query(collection(db, 'schedules'));
        const snapshot = await getDocs(q);
        const scheduleList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherSchedule));
        
        // Filter by gradeLevel, semester, academicYear in memory to avoid needing a composite index
        const filteredSchedules = scheduleList.filter(s => 
          s.gradeLevel === gradeLevel &&
          s.semester === semester &&
          s.academicYear === academicYear
        );
        setSchedules(filteredSchedules);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };
    fetchSchedules();
  }, [semester, academicYear, gradeLevel]);

  // Initialize all students as 'present' if no data exists
  useEffect(() => {
    fetchSession();
  }, [date, period, gradeLevel, students]);

  // Automatically select a matching period if one exists for the current date's day of week
  useEffect(() => {
    if (initialPeriod) return; // Do not auto-select if editing an existing session
    if (schedules.length > 0 && date) {
      const parts = date.split('-');
      const dayOfWeek = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getDay();
      const matchingSchedule = schedules.find(s => s.dayOfWeek === dayOfWeek);
      if (matchingSchedule) {
        setPeriod(matchingSchedule.period);
      }
    }
  }, [schedules, date, initialPeriod]);

  const fetchSession = async () => {
    setIsLoading(true);
    setSaveStatus(null);
    try {
      // Query only by date to reduce payload, then filter the rest in memory to avoid index errors
      const q = query(
        collection(db, 'attendanceSessions'),
        where('date', '==', date)
      );
      
      const querySnapshot = await getDocs(q);
      const allDocs = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() as AttendanceSession }));
      const match = allDocs.find(d => d.gradeLevel === gradeLevel && d.period === period);
      
      if (match) {
        // Load existing
        setCurrentSessionId(match.id);
        setAttendanceData(match.attendanceData || {});
      } else {
        // Initialize new
        setCurrentSessionId(null);
        const initialData: Record<string, 'present' | 'leave' | 'sick' | 'absent' | 'late'> = {};
        students.forEach(s => {
          initialData[s.id] = 'present';
        });
        setAttendanceData(initialData);
      }
    } catch (error) {
      console.error('Error fetching attendance session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: 'present' | 'leave' | 'sick' | 'absent' | 'late') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAllPresent = () => {
    const updatedData: Record<string, 'present' | 'leave' | 'sick' | 'absent' | 'late'> = {};
    students.forEach(s => {
      updatedData[s.id] = 'present';
    });
    setAttendanceData(updatedData);
  };

  const handleClearAttendance = () => {
    setAttendanceData({});
  };


  const handleSave = async () => {
    // Removed window.confirm due to iframe restrictions. Checkbox acts as explicit intent.

    setIsSaving(true);
    setSaveStatus(null);
    try {
      const now = new Date().toISOString();
      const selectedDayOfWeek = date ? new Date(Number(date.split('-')[0]), Number(date.split('-')[1]) - 1, Number(date.split('-')[2])).getDay() : -1;

      if (applyToAllPeriods) {
        // Save to all periods
        const sessionsQuery = query(
          collection(db, 'attendanceSessions'),
          where('gradeLevel', '==', gradeLevel),
          where('date', '==', date),
          where('semester', '==', semester),
          where('academicYear', '==', academicYear)
        );
        
        const querySnapshot = await getDocs(sessionsQuery);
        const existingSessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        const targetPeriods = PERIODS.filter(p => !p.includes('พักเบรก') && !p.includes('พักกลางวัน'));

        for (const p of targetPeriods) {
          let matchingSchedule = schedules.find(s => s.dayOfWeek === selectedDayOfWeek && s.period === p);
          if (!matchingSchedule) {
            matchingSchedule = schedules.find(s => s.period === p);
          }
          
          const subject = matchingSchedule ? matchingSchedule.subject : undefined;
          const classTeacherName = (matchingSchedule && matchingSchedule.teacherName) ? matchingSchedule.teacherName : teacherName;

          const sessionData: any = {
            gradeLevel,
            date,
            period: p,
            teacherId,
            semester,
            academicYear,
            attendanceData,
            updatedAt: now
          };
          
          if (subject) sessionData.subject = subject;
          if (classTeacherName) sessionData.teacherName = classTeacherName;

          const existingSession = existingSessions.find((s: any) => s.period === p);
          
          if (existingSession) {
            await setDoc(doc(db, 'attendanceSessions', existingSession.id), sessionData, { merge: true });
          } else {
            await addDoc(collection(db, 'attendanceSessions'), {
              ...sessionData,
              createdAt: now
            });
          }
        }

        setSaveStatus({ type: 'success', message: 'บันทึกข้อมูลการเข้าเรียนสำหรับทุกคาบในวันนี้เรียบร้อยแล้ว' });
        window.dispatchEvent(new CustomEvent('app-custom-toast', {
          detail: {
            message: `บันทึกการเช็กชื่อชั้น ${gradeLevel} สำหรับทุกคาบในวันที่ ${date} สำเร็จและจัดเก็บเข้าคลาวด์เรียบร้อยแล้ว ✅`,
            type: 'success',
            title: 'บันทึกสำเร็จ'
          }
        }));
      } else {
        // Normal single period save
        let matchingSchedule = schedules.find(s => s.dayOfWeek === selectedDayOfWeek && s.period === period);
        if (!matchingSchedule) {
          matchingSchedule = schedules.find(s => s.period === period);
        }
        
        const subject = matchingSchedule ? matchingSchedule.subject : undefined;
        const classTeacherName = (matchingSchedule && matchingSchedule.teacherName) ? matchingSchedule.teacherName : teacherName;

        const sessionData: any = {
          gradeLevel,
          date,
          period,
          teacherId,
          semester,
          academicYear,
          attendanceData,
          updatedAt: now
        };
        
        if (subject) sessionData.subject = subject;
        if (classTeacherName) sessionData.teacherName = classTeacherName;

        if (currentSessionId) {
          await setDoc(doc(db, 'attendanceSessions', currentSessionId), sessionData, { merge: true });
        } else {
          const docRef = await addDoc(collection(db, 'attendanceSessions'), {
            ...sessionData,
            createdAt: now
          });
          setCurrentSessionId(docRef.id);
        }
        
        setSaveStatus({ type: 'success', message: 'บันทึกข้อมูลการเข้าเรียนเรียบร้อยแล้ว' });
        window.dispatchEvent(new CustomEvent('app-custom-toast', {
          detail: {
            message: `บันทึกการเช็กชื่อชั้น ${gradeLevel} (คาบ ${period}) วันที่ ${date} สำเร็จและจัดเก็บเข้าคลาวด์เรียบร้อยแล้ว ✅`,
            type: 'success',
            title: 'บันทึกการเข้าเรียนสำเร็จ'
          }
        }));
      }

      setTimeout(() => {
        setSaveStatus(null);
        if (onClose) onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving attendance:', error);
      setSaveStatus({ type: 'error', message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    } finally {
      setIsSaving(false);
    }
  };



  const activeStudents = students.filter(s => s.status === 'active' || !s.status);
  const sortedStudents = [...activeStudents].sort((a, b) => a.number - b.number);

  const stats = {
    present: Object.values(attendanceData).filter(s => s === 'present').length,
    leave: Object.values(attendanceData).filter(s => s === 'leave').length,
    sick: Object.values(attendanceData).filter(s => s === 'sick').length,
    absent: Object.values(attendanceData).filter(s => s === 'absent').length,
    late: Object.values(attendanceData).filter(s => s === 'late').length,
  };

  const standardPeriods = PERIODS.filter(p => !p.includes('พักเบรก') && !p.includes('พักกลางวัน'));
  
  // Suggest periods based on teacher's schedule for this day and grade
  const selectedDayOfWeek = date ? new Date(Number(date.split('-')[0]), Number(date.split('-')[1]) - 1, Number(date.split('-')[2])).getDay() : -1;
  // Deduplicate by period to avoid duplicate keys in React (which happens if multiple schedules exist for the same period)
  const suggestedSchedules = schedules
    .filter(s => s.dayOfWeek === selectedDayOfWeek)
    .filter((v, i, a) => a.findIndex(t => (t.period === v.period)) === i);

  // When the event to close is fired from the Print Template
  useEffect(() => {
    const handleCloseReport = () => setShowMilkReport(false);
    window.addEventListener('close-milk-report', handleCloseReport);
    return () => window.removeEventListener('close-milk-report', handleCloseReport);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
      {showMilkReport && (
        <MilkReportPrintTemplate 
          students={sortedStudents}
          gradeLevel={gradeLevel}
          semester={semester}
          academicYear={academicYear}
          teacherName={teacherName}
          monthName={new Date(date).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
          daysInMonth={new Date(new Date(date).getFullYear(), new Date(date).getMonth() + 1, 0).getDate()}
          schoolName={schoolInfo.name}
          schoolSubDistrict={schoolInfo.subDistrict}
          schoolDistrict={schoolInfo.district}
          schoolProvince={schoolInfo.province}
          currentDate={date}
        />
      )}
      {/* Header Controls */}
      {onClose && (
        <div className="bg-slate-100 px-4 py-2 flex justify-between items-center border-b border-slate-200">
          <span className="font-bold text-slate-700">แก้ไขการเช็กชื่อนักเรียน</span>
          <button onClick={onClose} className="text-slate-500 hover:bg-slate-200 p-1 rounded-full"><XCircle className="h-5 w-5" /></button>
        </div>
      )}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
        <div className="grid grid-cols-2 sm:flex sm:flex-row flex-wrap gap-2 sm:gap-4 items-start sm:items-end w-full md:w-auto">
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-bold text-slate-500 mb-1">วันที่</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={date}
                min={termStartDate}
                max={termEndDate}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-bold text-slate-500 mb-1 truncate">คาบเรียน (ตารางสอน)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full md:w-56 appearance-none"
              >
                {suggestedSchedules.length > 0 && (
                  <optgroup label="มีเรียนวันนี้">
                    {suggestedSchedules.map(match => (
                      <option key={`suggested-${match.period}`} value={match.period}>
                        {match.period} - {match.subject}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="คาบเรียนทั้งหมด">
                  {standardPeriods.map(p => {
                    const match = suggestedSchedules.find(s => s.period === p);
                    if (match) {
                      return <option key={p} value={p}>{p} - {match.subject}</option>;
                    }
                    return <option key={p} value={p}>{p}</option>;
                  })}
                </optgroup>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          {saveStatus && (
            <span className={`text-sm ${saveStatus.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {saveStatus.message}
            </span>
          )}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowMilkReport(true)}
              className="w-full justify-center sm:w-auto flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 font-bold transition-colors "
            >
              🥛 รายงานดื่มนม
            </button>
            <button
              onClick={handleClearAttendance}
              disabled={isSaving || isLoading}
              className="w-full justify-center sm:w-auto flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-slate-100 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-200 font-bold transition-colors disabled:opacity-50 "
            >
              <XCircle className="h-4 w-4" /> ล้างข้อมูล
            </button>
            <button
              onClick={handleMarkAllPresent}
              disabled={isSaving || isLoading}
              className="w-full justify-center sm:w-auto flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100 font-bold transition-colors disabled:opacity-50 "
            >
              <CheckCircle2 className="h-4 w-4" /> มาเรียนทั้งหมด
            </button>
            

            <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer bg-violet-50 px-3 py-2 rounded-lg border border-violet-200">
              <input
                type="checkbox"
                checked={applyToAllPeriods}
                onChange={(e) => setApplyToAllPeriods(e.target.checked)}
                className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              ใช้ข้อมูลนี้เหมือนกันทุกคาบ
            </label>
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="w-full justify-center sm:w-auto flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold transition-colors disabled:opacity-50  shadow-sm"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              บันทึก
            </button>

          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="overflow-x-auto w-full"><div className="grid grid-cols-5 min-w-[300px] border-b border-slate-100 divide-x divide-slate-100">
        <div className="p-2 sm:p-4 text-center bg-emerald-50/30">
          <div className="text-lg sm:text-2xl font-black text-emerald-600">{stats.present}</div>
          <div className="text-[10px] sm:text-xs font-medium text-emerald-600/70 uppercase tracking-wider">มา</div>
        </div>
        <div className="p-2 sm:p-4 text-center bg-amber-50/30">
          <div className="text-lg sm:text-2xl font-black text-amber-500">{stats.leave}</div>
          <div className="text-[10px] sm:text-xs font-medium text-amber-500/70 uppercase tracking-wider">ลา</div>
        </div>
        <div className="p-2 sm:p-4 text-center bg-orange-50/30">
          <div className="text-lg sm:text-2xl font-black text-orange-500">{stats.sick}</div>
          <div className="text-[10px] sm:text-xs font-medium text-orange-500/70 uppercase tracking-wider">ป่วย</div>
        </div>
        <div className="p-2 sm:p-4 text-center bg-blue-50/30">
          <div className="text-lg sm:text-2xl font-black text-blue-500">{stats.late}</div>
          <div className="text-[10px] sm:text-xs font-medium text-blue-500/70 uppercase tracking-wider">สาย</div>
        </div>
        <div className="p-2 sm:p-4 text-center bg-rose-50/30">
          <div className="text-lg sm:text-2xl font-black text-rose-500">{stats.absent}</div>
          <div className="text-[10px] sm:text-xs font-medium text-rose-500/70 uppercase tracking-wider">ขาด</div>
        </div>
      </div>

      </div>
      {/* Student List */}
      <div className="p-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-indigo-500" />
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        ) : sortedStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50/50">
            <p>ไม่มีข้อมูลนักเรียนในชั้นเรียนนี้</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedStudents.map((student) => (
              <div key={student.id} className="p-3 sm:px-4 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-4 even:bg-slate-50/30">
                <div className="flex items-start gap-2.5">
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm shrink-0">
                     {student.number}
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="font-bold text-slate-700 text-sm truncate whitespace-normal leading-tight">
                       {student.firstName} {student.lastName}
                       {student.nickname && <span className="block sm:inline sm:ml-1 text-slate-500 font-normal">({student.nickname})</span>}
                     </div>
                     <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5">
                       <span>รหัส: {student.studentId}</span>
                       <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                       <span>ชั้น: {student.gradeLevel || '-'}</span>
                     </div>
                   </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-1 sm:gap-2 w-full md:w-auto mt-2 md:mt-0">
                  <div className="grid grid-cols-3 md:flex gap-1 sm:gap-2 w-full md:w-auto">
                    <button
                      onClick={() => handleStatusChange(student.id, 'present')}
                      className={`flex-1 md:flex-none flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 px-0.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all ${
                        attendanceData[student.id] === 'present'
                          ? 'bg-emerald-500 text-white shadow-sm ring-1 ring-emerald-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> <span>มา</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'leave')}
                      className={`flex-1 md:flex-none flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 px-0.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all ${
                        attendanceData[student.id] === 'leave'
                          ? 'bg-amber-500 text-white shadow-sm ring-1 ring-amber-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <HelpCircle className="h-3.5 w-3.5" /> <span>ลา</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'sick')}
                      className={`flex-1 md:flex-none flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 px-0.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all ${
                        attendanceData[student.id] === 'sick'
                          ? 'bg-orange-500 text-white shadow-sm ring-1 ring-orange-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <AlertCircle className="h-3.5 w-3.5" /> <span>ป่วย</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:flex gap-1 sm:gap-2 w-full md:w-auto">
                    <button
                      onClick={() => handleStatusChange(student.id, 'late')}
                      className={`flex-1 md:flex-none flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 px-0.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all ${
                        attendanceData[student.id] === 'late'
                          ? 'bg-blue-500 text-white shadow-sm ring-1 ring-blue-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" /> <span>สาย</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'absent')}
                      className={`flex-1 md:flex-none flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 px-0.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all ${
                        attendanceData[student.id] === 'absent'
                          ? 'bg-rose-500 text-white shadow-sm ring-1 ring-rose-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <XCircle className="h-3.5 w-3.5" /> <span>ขาด</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
