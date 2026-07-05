import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, setDoc, deleteDoc, addDoc, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Teacher, TeacherSchedule, GRADE_LEVELS, SUBJECTS, SEMESTERS } from '../types';
import { Loader2, Save, Trash2, Plus, Calendar, Clock, User, BookOpen } from 'lucide-react';

interface ScheduleManagerProps {
  systemSemester: string;
  systemAcademicYear: string;
}

export function ScheduleManager({ systemSemester, systemAcademicYear }: ScheduleManagerProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schedules, setSchedules] = useState<TeacherSchedule[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const daysOfWeek = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const periods = ['กิจกรรมโฮมรูม', 'คาบ 1', 'คาบ 2', 'คาบ 3', 'คาบ 4', 'คาบพักกลางวัน', 'คาบ 5', 'คาบ 6', 'คาบ 7', 'คาบ 8', 'กิจกรรมหลังเลิกเรียน'];

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacherId) {
      fetchSchedules(selectedTeacherId);
    } else {
      setSchedules([]);
    }
  }, [selectedTeacherId, systemSemester, systemAcademicYear]);

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

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-indigo-600" /> จัดการตารางสอน
        </h3>
        
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
                        <button 
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
      </div>
    </div>
  );
}
