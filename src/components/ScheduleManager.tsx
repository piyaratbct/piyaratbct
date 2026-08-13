import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, setDoc, deleteDoc, addDoc, orderBy, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Teacher, TeacherSchedule, GRADE_LEVELS, SUBJECTS, SEMESTERS, PERIODS } from '../types';
import { Loader2, Save, Trash2, Plus, Calendar, Clock, User, BookOpen, ShieldCheck } from 'lucide-react';

import { MapPin, Users } from 'lucide-react';

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
    .replace('อนุบาล ', 'อ.')
    .replace('ประถมศึกษาปีที่ ', 'ป.')
    .replace('มัธยมศึกษาปีที่ ', 'ม.');
};

export function ScheduleManager({ systemSemester, systemAcademicYear, currentTeacher }: ScheduleManagerProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schedules, setSchedules] = useState<TeacherSchedule[]>([]);
  const [allSchedules, setAllSchedules] = useState<TeacherSchedule[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
      const [viewMode, setViewMode] = useState<'manage' | 'overview' | 'summary' | 'student_overview'>('manage');
  const [totalLearningDays, setTotalLearningDays] = useState(100);
  const [summaryTab, setSummaryTab] = useState<'teacher' | 'subject'>('subject');
  const [targetPeriodsMap, setTargetPeriodsMap] = useState<Record<string, number>>({});
  const [selectedLevelGroup, setSelectedLevelGroup] = useState<string>('lower_primary');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [myTodaySchedules, setMyTodaySchedules] = useState<TeacherSchedule[]>([]);
  

  const handleSaveTarget = async (groupId: string, subject: string, targetPeriods: number) => {
    try {
      const key = `${groupId}-${subject}`;
      // Update local state first for fast response
      setTargetPeriodsMap(prev => ({ ...prev, [key]: targetPeriods }));
      
      const docId = `${systemAcademicYear}_${systemSemester}_${groupId}_${subject}`.replace(/\//g, '-').replace(/\s/g, '_');
      await setDoc(doc(db, 'subjectTargets', docId), {
        academicYear: systemAcademicYear,
        semester: systemSemester,
        groupId,
        subject,
        targetPeriods
      }, { merge: true });
    } catch (e) {
      console.error('Error saving targets', e);
    }
  };

  const daysOfWeek = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const periods = PERIODS;

    useEffect(() => {
    fetchTeachers();
    fetchAllData();
  }, [systemSemester, systemAcademicYear]);

  useEffect(() => {
    if (selectedTeacherId) {
      setSchedules(allSchedules.filter(s => s.teacherId === selectedTeacherId));
    } else {
      setSchedules([]);
    }
  }, [selectedTeacherId, allSchedules]);

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

    const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'schedules'),
        where('semester', '==', systemSemester),
        where('academicYear', '==', systemAcademicYear)
      );
      const snapshot = await getDocs(q);
      const scheduleList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherSchedule));
      setAllSchedules(scheduleList);
      if (selectedTeacherId) {
        setSchedules(scheduleList.filter(s => s.teacherId === selectedTeacherId));
      }
    } catch (error) {
      console.error("Error fetching all schedules:", error);
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
      alert('ครูท่านนี้มีสอนในคาบนี้แล้ว');
      return;
    }

    // Check class collision
    if (allSchedules.some(s => s.dayOfWeek === dayOfWeek && s.period === period && s.gradeLevel === GRADE_LEVELS[0])) {
      if (!confirm(`ห้อง ${GRADE_LEVELS[0]} มีครูท่านอื่นสอนในคาบนี้แล้ว ต้องการจัดซ้อนกันหรือไม่?`)) {
        return;
      }
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
      setAllSchedules([...allSchedules, { id: docRef.id, ...newSchedule }]);
    } catch (error) {
      console.error("Error adding schedule:", error);
    } finally {
      setIsSaving(false);
    }
  };

    const handleUpdateSchedule = async (id: string, field: keyof TeacherSchedule, value: string | number) => {
    const currentSchedule = allSchedules.find(s => s.id === id);
    if (!currentSchedule) return;

    // If changing grade level, check for collision
    if (field === 'gradeLevel') {
      const colliding = allSchedules.find(s => 
        s.id !== id && 
        s.dayOfWeek === currentSchedule.dayOfWeek && 
        s.period === currentSchedule.period && 
        s.gradeLevel === value
      );
      if (colliding) {
        if (!confirm(`ห้อง ${value} มีครูท่านอื่นสอนในคาบนี้แล้ว ต้องการจัดซ้อนกันหรือไม่?`)) {
          return; // Cancel update
        }
      }
    }
    try {
      await setDoc(doc(db, 'schedules', id), { [field]: value }, { merge: true });
      setAllSchedules(allSchedules.map(s => {
        if (s.id === id) {
          const updated = { ...s, [field]: value };
          // If changing grade level or period, we should probably warn, but for now just update
          return updated;
        }
        return s;
      }));
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'schedules', id));
      setAllSchedules(allSchedules.filter(s => s.id !== id));
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
            <button
              onClick={() => setViewMode('summary')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'summary' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              สรุปและโครงสร้างเวลาเรียน
            </button>
            <button
              onClick={() => setViewMode('student_overview')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'student_overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              ตารางเรียน (นักเรียน)
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
        
                
        
        {viewMode === 'summary' && (
          <div className="space-y-6">
            <div className="flex bg-slate-100 p-1 rounded-lg w-fit mb-6">
              <button 
                onClick={() => setSummaryTab('subject')}
                className={"px-4 py-2 text-sm font-bold rounded-md transition-all " + (summaryTab === 'subject' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
              >
                โครงสร้างเวลาเรียนรายวิชา
              </button>
              <button 
                onClick={() => setSummaryTab('teacher')}
                className={"px-4 py-2 text-sm font-bold rounded-md transition-all " + (summaryTab === 'teacher' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
              >
                สรุปจำนวนคาบสอนครู
              </button>
            </div>

            {summaryTab === 'teacher' && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 animate-in fade-in duration-300">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-500" />
                  สรุปจำนวนคาบสอนของครูแต่ละท่าน
                </h3>
                
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-sm uppercase tracking-wider">
                        <th className="p-4 font-bold w-20 text-center">ลำดับ</th>
                        <th className="p-4 font-bold">ชื่อ-นามสกุล</th>
                        <th className="p-4 font-bold text-center w-64">จำนวนคาบสอน (ต่อสัปดาห์)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {teachers
                        .map(t => ({
                          ...t,
                          totalPeriods: allSchedules.filter(s => s.teacherId === t.id).length
                        }))
                        .sort((a, b) => b.totalPeriods - a.totalPeriods)
                        .map((t, index) => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-slate-500 text-center font-medium">{index + 1}</td>
                          <td className="p-4 font-bold text-slate-800">{t.thaiName || t.displayName}</td>
                          <td className="p-4 text-center">
                            <span className={"inline-flex items-center justify-center min-w-[3rem] px-3 py-1.5 rounded-full text-sm font-bold shadow-sm " + (
                              t.totalPeriods === 0 ? 'bg-slate-100 text-slate-500 border border-slate-200' : 
                              t.totalPeriods > 20 ? 'bg-rose-100 text-rose-700 border border-rose-200' : 
                              'bg-indigo-100 text-indigo-700 border border-indigo-200'
                            )}>
                              {t.totalPeriods}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            
            {summaryTab === 'subject' && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 animate-in fade-in duration-300">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                      <BookOpen className="h-5 w-5 text-indigo-500" />
                      โครงสร้างเวลาเรียนรายวิชา (ตามระดับชั้น)
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-xl">
                      กำหนดเป้าหมายคาบเรียนต่อสัปดาห์ที่ต้องการ สำหรับแต่ละกลุ่มระดับชั้น เพื่อนำไปเปรียบเทียบกับจำนวนคาบที่จัดจริงในตารางสอน
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <label className="text-sm font-bold text-slate-600 whitespace-nowrap">กลุ่มระดับชั้น:</label>
                    <select 
                      value={selectedLevelGroup}
                      onChange={(e) => setSelectedLevelGroup(e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm w-full md:w-64"
                    >
                      <option value="early_childhood">ระดับปฐมวัย (อ.1-อ.3)</option>
                      <option value="lower_primary">ระดับประถมศึกษาตอนต้น (ป.1-ป.3)</option>
                      <option value="upper_primary">ระดับประถมศึกษาตอนปลาย (ป.4-ป.6)</option>
                    </select>
                  </div>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-sm">
                          <th className="p-4 font-bold w-64 border-r border-slate-200">รายวิชา</th>
                          <th className="p-4 font-bold text-center w-40 bg-indigo-50 text-indigo-800 border-r border-slate-200">เป้าหมาย<br/><span className="text-xs font-normal">(คาบ/สัปดาห์)</span></th>
                          {(() => {
                            let displayGrades: string[] = [];
                            if (selectedLevelGroup === 'early_childhood') displayGrades = ['อ.1', 'อ.2', 'อ.3'];
                            if (selectedLevelGroup === 'lower_primary') displayGrades = ['ป.1', 'ป.2', 'ป.3'];
                            if (selectedLevelGroup === 'upper_primary') displayGrades = ['ป.4', 'ป.5', 'ป.6'];
                            
                            return displayGrades.map(g => (
                              <th key={g} className="p-4 font-bold text-center border-r border-slate-200 w-40">จัดตารางแล้ว<br/><span className="text-indigo-600">{g}</span></th>
                            ));
                          })()}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(() => {
                          let baseGrades: string[] = [];
                          if (selectedLevelGroup === 'early_childhood') baseGrades = ['อนุบาล 1', 'อนุบาล 2', 'อนุบาล 3'];
                          if (selectedLevelGroup === 'lower_primary') baseGrades = ['ประถมศึกษาปีที่ 1', 'ประถมศึกษาปีที่ 2', 'ประถมศึกษาปีที่ 3'];
                          if (selectedLevelGroup === 'upper_primary') baseGrades = ['ประถมศึกษาปีที่ 4', 'ประถมศึกษาปีที่ 5', 'ประถมศึกษาปีที่ 6'];

                          const getBaseGrade = (g: string) => g.split('/')[0].trim();
                          
                          // Find all unique subjects scheduled for this group
                          const subjectsSet = new Set<string>(SUBJECTS);
                          allSchedules.forEach(s => {
                            if (baseGrades.includes(getBaseGrade(s.gradeLevel))) {
                              subjectsSet.add(s.subject);
                            }
                          });
                          
                          let groupSubjects = Array.from(subjectsSet);
                          groupSubjects.sort((a, b) => {
                             const idxA = SUBJECTS.indexOf(a);
                             const idxB = SUBJECTS.indexOf(b);
                             if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                             if (idxA !== -1) return -1;
                             if (idxB !== -1) return 1;
                             return a.localeCompare(b);
                          });

                          return groupSubjects.map((subject, idx) => {
                            const key = selectedLevelGroup + '-' + subject;
                            const targetPeriods = targetPeriodsMap[key] || 0;
                            const hasTarget = targetPeriods > 0;
                            
                            return (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-bold text-slate-700 border-r border-slate-200">{subject}</td>
                                <td className="p-4 text-center bg-indigo-50/30 border-r border-slate-200">
                                  <input 
                                    type="number" 
                                    step="1" 
                                    min="0"
                                    value={targetPeriods || ''}
                                    onChange={(e) => handleSaveTarget(selectedLevelGroup, subject, parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-16 text-center border border-slate-200 rounded-md py-1 px-2 text-sm font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                  />
                                </td>
                                {baseGrades.map((baseG, index) => {
                                  const classCounts: Record<string, Set<string>> = {};
                                  allSchedules.forEach(s => {
                                    if (getBaseGrade(s.gradeLevel) === baseG && s.subject === subject) {
                                      if (!classCounts[s.gradeLevel]) {
                                        classCounts[s.gradeLevel] = new Set<string>();
                                      }
                                      classCounts[s.gradeLevel].add(s.dayOfWeek + '-' + s.period);
                                    }
                                  });
                                  
                                  const classNames = Object.keys(classCounts).sort();
                                  
                                  return (
                                    <td key={index} className="p-3 align-top border-r border-slate-200">
                                      {classNames.length === 0 ? (
                                        <div className="text-center text-slate-300 text-xs mt-2">-</div>
                                      ) : (
                                        <div className="flex flex-col gap-1.5 items-center">
                                          {classNames.map(cName => {
                                            const count = classCounts[cName].size;
                                            const isMatched = count === targetPeriods;
                                            const shortCName = formatShortGrade(cName);
                                            return (
                                              <div key={cName} className={"flex items-center justify-between w-full max-w-[120px] px-2 py-1 rounded-md text-xs font-bold " + (
                                                !hasTarget ? 'bg-slate-100 text-slate-600' :
                                                isMatched ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                'bg-rose-50 text-rose-700 border border-rose-100'
                                              )}>
                                                <span>{shortCName}</span>
                                                <span className={"w-5 h-5 flex items-center justify-center rounded-full " + (!hasTarget ? 'bg-slate-200' : isMatched ? 'bg-emerald-200' : 'bg-rose-200 text-rose-800')}>{count}</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

{viewMode === 'student_overview' && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                ภาพรวมตารางเรียน (ตารางสอนในมุมมองของนักเรียน) แยกตามระดับชั้น
              </h3>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">เลือกระดับชั้น</label>
                <select 
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full md:w-1/2 p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- เลือกระดับชั้น --</option>
                  {GRADE_LEVELS.filter(g => g !== 'ประถมศึกษาปีที่ 1' && g !== 'ประถมศึกษาปีที่ 2').map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedGrade && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 font-bold">ตารางเรียนของชั้น {selectedGrade} สำหรับภาคเรียนที่ {systemSemester}/{systemAcademicYear}</p>
                </div>
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px] border-collapse bg-white">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200">
                            <th className="p-3 text-center font-bold text-slate-700 text-sm border-r border-slate-200 w-24">วัน</th>
                            {periods.map(period => (
                              <th key={period} className="p-2 text-center font-bold text-slate-700 text-sm border-r border-slate-200 min-w-[100px]">
                                {formatPeriodHeader(period)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[1, 2, 3, 4, 5].map(day => (
                            <tr key={day} className="border-b border-slate-200 hover:bg-slate-50/50">
                              <td className="p-3 font-bold text-slate-800 border-r border-slate-200 bg-slate-50 text-center">
                                {daysOfWeek[day]}
                              </td>
                              {periods.map(period => {
                                const isBreak = period.includes('พักเบรก') || period.includes('พักกลางวัน');
                                if (isBreak) {
                                  if (day === 1) {
                                    return (
                                      <td key={period} rowSpan={5} className="p-2 border-r border-slate-200 bg-slate-200/70 align-middle text-center shadow-inner">
                                        <div className="h-full flex items-center justify-center min-h-[300px]">
                                          <span className="text-slate-500 font-black text-lg tracking-wider whitespace-nowrap">{period.includes('พักกลางวัน') ? 'พักกลางวัน' : 'พักเบรก'}</span>
                                        </div>
                                      </td>
                                    );
                                  }
                                  return null;
                                }

                                const schedulesInSlot = allSchedules.filter(s => s.dayOfWeek === day && s.period === period && s.gradeLevel === selectedGrade);
                                return (
                                  <td key={period} className="p-2 border-r border-slate-200 align-top">
                                    {schedulesInSlot.length > 0 ? (
                                      <div className="space-y-2">
                                        {(() => {
                                          const subjectGroups: Record<string, string[]> = {};
                                          schedulesInSlot.forEach(s => {
                                            if (!subjectGroups[s.subject]) subjectGroups[s.subject] = [];
                                            if (s.teacherName && !subjectGroups[s.subject].includes(s.teacherName)) {
                                              subjectGroups[s.subject].push(s.teacherName);
                                            }
                                          });
                                          
                                          return Object.entries(subjectGroups).map(([subj, teachers], idx) => (
                                            <div key={idx} className="bg-indigo-50 text-indigo-700 p-2 rounded-lg border border-indigo-100 flex flex-col justify-center items-center text-center">
                                              <div className="font-bold text-sm mb-1">{subj}</div>
                                              {teachers.map((t, tIdx) => (
                                                <div key={tIdx} className="text-xs opacity-80 whitespace-nowrap">{t}</div>
                                              ))}
                                            </div>
                                          ));
                                        })()}
                                      </div>
                                    ) : (
                                      <div className="h-full min-h-[60px] flex items-center justify-center">
                                        <span className="text-slate-300 text-xs">-</span>
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
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
                          const isBreak = period.includes('พักเบรก') || period.includes('พักกลางวัน');
                          if (isBreak) {
                            if (day === 1) {
                              return (
                                <td key={period} rowSpan={5} className="p-2 border-r border-slate-200 bg-slate-200/70 align-middle text-center shadow-inner">
                                  <div className="h-full flex items-center justify-center min-h-[300px]">
                                    <span className="text-slate-500 font-black text-lg tracking-wider whitespace-nowrap">{period.includes('พักกลางวัน') ? 'พักกลางวัน' : 'พักเบรก'}</span>
                                  </div>
                                </td>
                              );
                            }
                            return null;
                          }

                          const schedulesInPeriod = allSchedules.filter(s => s.dayOfWeek === day && s.period === period);
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
