import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, setDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Student, AttendanceSession } from '../types';
import { Loader2, Save, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface AttendanceTrackingProps {
  students: Student[];
  gradeLevel: string;
  teacherId: string;
  semester: string;
  academicYear: string;
}

export function AttendanceTracking({ students, gradeLevel, teacherId, semester, academicYear }: AttendanceTrackingProps) {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState<string>('คาบ 1');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'leave' | 'sick' | 'absent' | 'late'>>({});
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Initialize all students as 'present' if no data exists
  useEffect(() => {
    fetchSession();
  }, [date, period, gradeLevel, students]);

  const fetchSession = async () => {
    setIsLoading(true);
    setSaveStatus(null);
    try {
      const q = query(
        collection(db, 'attendanceSessions'),
        where('gradeLevel', '==', gradeLevel),
        where('date', '==', date),
        where('period', '==', period)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // Load existing
        const docSnap = querySnapshot.docs[0];
        setCurrentSessionId(docSnap.id);
        const data = docSnap.data() as AttendanceSession;
        setAttendanceData(data.attendanceData || {});
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

  const handleStatusChange = (studentId: string, status: 'present' | 'leave' | 'sick' | 'absent') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAllPresent = () => {
    const updatedData: Record<string, 'present' | 'leave' | 'sick' | 'absent'> = {};
    students.forEach(s => {
      updatedData[s.id] = 'present';
    });
    setAttendanceData(updatedData);
  };

  const handleClearAttendance = () => {
    setAttendanceData({});
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const now = new Date().toISOString();
      const sessionData = {
        gradeLevel,
        date,
        period,
        teacherId,
        semester,
        academicYear,
        attendanceData,
        updatedAt: now
      };

      if (currentSessionId) {
        // Update
        await setDoc(doc(db, 'attendanceSessions', currentSessionId), sessionData, { merge: true });
      } else {
        // Create
        const docRef = await addDoc(collection(db, 'attendanceSessions'), {
          ...sessionData,
          createdAt: now
        });
        setCurrentSessionId(docRef.id);
      }
      
      setSaveStatus({ type: 'success', message: 'บันทึกข้อมูลการเข้าเรียนเรียบร้อยแล้ว' });
      
      // Also fire a global toast for clearer visibility
      window.dispatchEvent(new CustomEvent('app-custom-toast', {
        detail: {
          message: `บันทึกการเช็คชื่อชั้น ${gradeLevel} (คาบ ${period}) วันที่ ${date} สำเร็จและจัดเก็บเข้าคลาวด์เรียบร้อยแล้ว ✅`,
          type: 'success',
          title: 'บันทึกการเข้าเรียนสำเร็จ'
        }
      }));

      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Error saving attendance:', error);
      setSaveStatus({ type: 'error', message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    } finally {
      setIsSaving(false);
    }
  };

  const activeStudents = students.filter(s => s.status === 'active');
  const sortedStudents = [...activeStudents].sort((a, b) => a.number - b.number);

  const stats = {
    present: Object.values(attendanceData).filter(s => s === 'present').length,
    leave: Object.values(attendanceData).filter(s => s === 'leave').length,
    sick: Object.values(attendanceData).filter(s => s === 'sick').length,
    absent: Object.values(attendanceData).filter(s => s === 'absent').length,
    late: Object.values(attendanceData).filter(s => s === 'late').length,
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header Controls */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">วันที่</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">คาบเรียน (ตามตารางสอน)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-48 appearance-none"
              >
                <option value="กิจกรรมโฮมรูม">กิจกรรมโฮมรูม</option>
                <option value="คาบ 1">คาบ 1</option>
                <option value="คาบ 2">คาบ 2</option>
                <option value="คาบ 3">คาบ 3</option>
                <option value="คาบ 4">คาบ 4</option>
                <option value="คาบพักกลางวัน">คาบพักกลางวัน</option>
                <option value="คาบ 5">คาบ 5</option>
                <option value="คาบ 6">คาบ 6</option>
                <option value="คาบ 7">คาบ 7</option>
                <option value="คาบ 8">คาบ 8</option>
                <option value="กิจกรรมหลังเลิกเรียน">กิจกรรมหลังเลิกเรียน</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          {saveStatus && (
            <span className={`text-sm ${saveStatus.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {saveStatus.message}
            </span>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAttendance}
              disabled={isSaving || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-200 font-bold transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <XCircle className="h-4 w-4" /> ล้างข้อมูล
            </button>
            <button
              onClick={handleMarkAllPresent}
              disabled={isSaving || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100 font-bold transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <CheckCircle2 className="h-4 w-4" /> มาเรียนทั้งหมด
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              บันทึก
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 border-b border-slate-100 divide-x divide-slate-100">
        <div className="p-4 text-center bg-emerald-50/30">
          <div className="text-2xl font-black text-emerald-600">{stats.present}</div>
          <div className="text-xs font-medium text-emerald-600/70 uppercase tracking-wider">มา</div>
        </div>
        <div className="p-4 text-center bg-amber-50/30">
          <div className="text-2xl font-black text-amber-500">{stats.leave}</div>
          <div className="text-xs font-medium text-amber-500/70 uppercase tracking-wider">ลา</div>
        </div>
        <div className="p-4 text-center bg-orange-50/30">
          <div className="text-2xl font-black text-orange-500">{stats.sick}</div>
          <div className="text-xs font-medium text-orange-500/70 uppercase tracking-wider">ป่วย</div>
        </div>
        <div className="p-4 text-center bg-blue-50/30">
          <div className="text-2xl font-black text-blue-500">{stats.late}</div>
          <div className="text-xs font-medium text-blue-500/70 uppercase tracking-wider">สาย</div>
        </div>
        <div className="p-4 text-center bg-rose-50/30">
          <div className="text-2xl font-black text-rose-500">{stats.absent}</div>
          <div className="text-xs font-medium text-rose-500/70 uppercase tracking-wider">ขาด</div>
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold border-b border-slate-100 w-16 text-center">เลขที่</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-100 w-24 text-center">รหัสนักเรียน</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-100">ชื่อ - นามสกุล</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-100 text-center">สถานะการเข้าเรียน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sortedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 text-center text-slate-500 font-medium">
                      {student.number}
                    </td>
                    <td className="px-6 py-3 text-center text-slate-400 text-sm">
                      {student.studentId}
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-bold text-slate-700">
                        {student.firstName} {student.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-center gap-1.5 sm:gap-2">
                        <button
                          onClick={() => handleStatusChange(student.id, 'present')}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                            attendanceData[student.id] === 'present'
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">มา</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, 'leave')}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                            attendanceData[student.id] === 'leave'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <HelpCircle className="h-3.5 w-3.5" /> <span className="hidden sm:inline">ลา</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, 'sick')}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                            attendanceData[student.id] === 'sick'
                              ? 'bg-orange-500 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <AlertCircle className="h-3.5 w-3.5" /> <span className="hidden sm:inline">ป่วย</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, 'late')}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                            attendanceData[student.id] === 'late'
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5" /> <span className="hidden sm:inline">สาย</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, 'absent')}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                            attendanceData[student.id] === 'absent'
                              ? 'bg-rose-500 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <XCircle className="h-3.5 w-3.5" /> <span className="hidden sm:inline">ขาด</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
