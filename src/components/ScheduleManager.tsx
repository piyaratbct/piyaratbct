import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, setDoc, deleteDoc, addDoc, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Teacher, TeacherSchedule, GRADE_LEVELS, SUBJECTS, SEMESTERS, PERIODS } from '../types';
import { Loader2, Save, Trash2, Plus, Calendar, Clock, User, BookOpen, ShieldCheck } from 'lucide-react';

import { MapPin } from 'lucide-react';

interface ScheduleManagerProps {
  systemSemester: string;
  systemAcademicYear: string;
  currentTeacher: Teacher;
}

const formatPeriodHeader = (period: string) => {
  const match = period.match(/(.*?)\s*\((.*?)\)/);
  if (match) {
    return (
      <div className="flex flex-col items-center leading-tight">
        <span>{match[1].replace('กิจกรรม', '')}</span>
        <span className="text-[10px] text-slate-500 font-normal mt-0.5">{match[2].replace(' น.', '')}</span>
      </div>
    );
  }
  return period;
};

const formatShortGrade = (grade: string) => {
  if (!grade) return '';
  return grade
    .replace('อนุบาลปีที่ ', 'อ.')
    .replace('ประถมศึกษาปีที่ ', 'ป.')
    .replace('มัธยมศึกษาปีที่ ', 'ม.');
};

export function ScheduleManager({ systemSemester, systemAcademicYear, currentTeacher }: ScheduleManagerProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schedules, setSchedules] = useState<TeacherSchedule[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'manage' | 'overview'>('manage');
  const [myTodaySchedules, setMyTodaySchedules] = useState<TeacherSchedule[]>([]);
  
  const daysOfWeek = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const periods = PERIODS;

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (viewMode === 'manage') {
      if (selectedTeacherId) {
        fetchSchedules(selectedTeacherId);
      } else {
        setSchedules([]);
      }
    } else if (viewMode === 'overview') {
      fetchAllSchedules();
    }
  }, [selectedTeacherId, systemSemester, systemAcademicYear, viewMode]);

  // Fetch today's schedule for the current user
  useEffect(() => {
    if (viewMode === 'today' && currentTeacher) {
      const fetchMyTodaySchedules = async () => {
        setIsLoading(true);
        try {
          const q = query(
            collection(db, 'schedules'), 
            where('teacherId', '==', currentTeacher.id),
            where('semester', '==', systemSemester),
            where('academicYear', '==', systemAcademicYear)
          );
          const snapshot = await getDocs(q);
          const scheduleList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherSchedule));
          
          const today = new Date().getDay();
          const todayList = scheduleList.filter(s => s.dayOfWeek === today);
          
          // Sort by period
          todayList.sort((a, b) => periods.indexOf(a.period) - periods.indexOf(b.period));
          
          setMyTodaySchedules(todayList);
        } catch (error) {
          console.error("Error fetching my today schedules:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchMyTodaySchedules();
    }
  }, [viewMode, currentTeacher, systemSemester, systemAcademicYear]);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'teachers'));
      const teacherList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));
      setTeachers(teacherList);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllSchedules = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'schedules'),
        where('semester', '==', systemSemester),
        where('academicYear', '==', systemAcademicYear)
      );
      const snapshot = await getDocs(q);
      const scheduleList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherSchedule));
      setSchedules(scheduleList);
    } catch (error) {
      console.error("Error fetching all schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchedules = async (teacherId: string) => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'schedules'));
      const snapshot = await getDocs(q);
      const scheduleList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherSchedule));
      
      // Filter by teacherId in memory
      const filteredSchedules = scheduleList.filter(s => 
        s.teacherId === teacherId &&
        String(s.semester) === String(systemSemester) &&
        String(s.academicYear) === String(systemAcademicYear)
      );
      setSchedules(filteredSchedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSchedule = async (dayOfWeek: number, period: string) => {
    if (!selectedTeacherId) return;
    
    const teacher = teachers.find(t => t.id === selectedTeacherId);
    const teacherName = teacher ? (teacher.thaiName || teacher.displayName) : '';

    // Check if already exists
    if (schedules.some(s => s.dayOfWeek === dayOfWeek && s.period === period)) {
      console.warn('มีวิชาในคาบนี้แล้ว');
      return;
    }

    setIsSaving(true);
    try {
      const newSchedule: Omit<TeacherSchedule, 'id'> = {
        teacherId: selectedTeacherId,
        teacherName,
        dayOfWeek,
        period,
        subject: SUBJECTS[0],
        gradeLevel: GRADE_LEVELS[0],
        semester: systemSemester,
        academicYear: systemAcademicYear,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'schedules'), newSchedule);
      setSchedules([...schedules, { id: docRef.id, ...newSchedule }]);
    } catch (error) {
      console.error("Error adding schedule:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSchedule = async (id: string, field: keyof TeacherSchedule, value: string | number) => {
    try {
      await setDoc(doc(db, 'schedules', id), { [field]: value }, { merge: true });
      setSchedules(schedules.map(s => s.id === id ? { ...s, [field]: value } : s));
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'schedules', id));
      setSchedules(schedules.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };

  if (currentTeacher.role !== 'admin' && currentTeacher.role !== 'academic' && currentTeacher.role !== 'discipline') {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center animate-in fade-in">
        <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">จัดการตารางสอน</h3>
        <p className="text-slate-500">ส่วนนี้ใช้สำหรับจัดโครงสร้างครูประจำชั้น และจัดสรรตารางสอนให้กับบุคลากร</p>
        <p className="mt-4 text-sm text-rose-500 font-medium">คุณไม่มีสิทธิ์เข้าถึงการจัดการตารางสอน</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" /> จัดการตารางสอน
          </h3>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('manage')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'manage' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              จัดตารางสอนรายบุคคล
            </button>
            <button
              onClick={() => setViewMode('overview')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              ภาพรวมตารางสอน
            </button>
          </div>
        </div>
        
        {viewMode === 'manage' && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">เลือกคุณครู</label>
          <select 
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="w-full md:w-1/2 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- เลือกคุณครู --</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.displayName || t.thaiName} ({t.email})</option>
            ))}
          </select>
        </div>

        {selectedTeacherId && (
          <div className="space-y-8">
            {[1, 2, 3, 4, 5].map(day => (
              <div key={day} className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="bg-slate-50 p-4 font-bold text-slate-800 flex justify-between items-center">
                  <span>วัน{daysOfWeek[day]}</span>
                  <div className="flex gap-2">
                    {(currentTeacher.role === 'admin' || currentTeacher.role === 'academic' || currentTeacher.role === 'discipline') && (
                      <>
                        <select id={`add-period-${day}`} className="p-1.5 text-xs bg-white border border-slate-200 rounded-lg">
                          {periods.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <button 
                          onClick={() => {
                            const sel = document.getElementById(`add-period-${day}`) as HTMLSelectElement;
                            handleAddSchedule(day, sel.value);
                          }}
                          className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-200 flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" /> เพิ่มคาบ
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="divide-y divide-slate-100">
                  {schedules.filter(s => s.dayOfWeek === day).sort((a, b) => periods.indexOf(a.period) - periods.indexOf(b.period)).map(schedule => (
                    <div key={schedule.id} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center bg-white hover:bg-slate-50 transition-colors">
                      <div className="w-full md:w-1/6 font-bold text-slate-700">{schedule.period}</div>
                      
                      <div className="w-full md:w-2/6">
                        <select 
                          value={schedule.subject}
                          onChange={(e) => handleUpdateSchedule(schedule.id, 'subject', e.target.value)}
                          className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      
                      <div className="w-full md:w-2/6">
                        <select 
                          value={schedule.gradeLevel}
                          onChange={(e) => handleUpdateSchedule(schedule.id, 'gradeLevel', e.target.value)}
                          className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      
                      <div className="w-full md:w-1/6 flex justify-end">
                        {(currentTeacher.role === 'admin' || currentTeacher.role === 'academic' || currentTeacher.role === 'discipline') && (
                          <button 
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {schedules.filter(s => s.dayOfWeek === day).length === 0 && (
                    <div className="p-6 text-center text-slate-400 text-sm">
                      ไม่มีการสอนในวันนี้
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
          </>
        )}
        
        {viewMode === 'overview' && (
          <div className="space-y-8">
            <p className="text-slate-500 mb-4">ภาพรวมตารางสอนของครูทั้งหมดในระบบ สำหรับภาคเรียนที่ {systemSemester}/{systemAcademicYear}</p>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200">
                      <th className="p-3 text-center font-bold text-slate-700 text-sm border-r border-slate-200 w-32">วัน</th>
                      {periods.map(period => (
                        <th key={period} className="p-2 text-center font-bold text-slate-700 text-sm border-r border-slate-200 min-w-[100px]">
                          {formatPeriodHeader(period)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map(day => (
                      <tr key={day} className="border-b border-slate-200">
                        <td className="p-3 font-bold text-slate-800 border-r border-slate-200 bg-slate-50 text-center">
                          {daysOfWeek[day]}
                        </td>
                        {periods.map(period => {
                          const schedulesInPeriod = schedules.filter(s => s.dayOfWeek === day && s.period === period);
                          return (
                            <td key={period} className="p-2 border-r border-slate-200 align-top">
                              {schedulesInPeriod.length > 0 ? (
                                <div className="space-y-2">
                                  {schedulesInPeriod.map(s => {
                                    const teacher = teachers.find(t => t.id === s.teacherId);
                                    const displayName = teacher?.displayName || s.teacherName;
                                    return (
                                      <div key={s.id} className="bg-indigo-50 border border-indigo-100 rounded p-1.5 text-xs">
                                        <div className="font-bold text-indigo-900 truncate" title={s.teacherName}>{displayName}</div>
                                        <div className="text-indigo-700 flex justify-between gap-1 mt-0.5">
                                          <span className="truncate flex-1">{s.subject}</span>
                                          <span className="font-medium whitespace-nowrap">{formatShortGrade(s.gradeLevel)}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-slate-300 text-center text-xs py-2">-</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
