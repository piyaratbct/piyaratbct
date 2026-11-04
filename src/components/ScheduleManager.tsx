import { useAvailableSubjects } from '../hooks/useAvailableSubjects';
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, setDoc, deleteDoc, addDoc, where, onSnapshot, writeBatch } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Teacher, TeacherSchedule, GRADE_LEVELS, SUBJECTS, PERIODS, BASE_GRADE_LEVELS, sortSubjects } from '../types';
import { Calendar, Trash2, Plus, User, BookOpen, AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface ScheduleManagerProps {
  systemSemester: string;
  systemAcademicYear: string;
  currentTeacher: Teacher;
}

export function ScheduleManager({ systemSemester, systemAcademicYear, currentTeacher }: ScheduleManagerProps) {
  const availableSubjects = useAvailableSubjects();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [curriculums, setCurriculums] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [termStart, setTermStart] = useState<string>('');
  const [termEnd, setTermEnd] = useState<string>('');
  const [allSchedules, setAllSchedules] = useState<TeacherSchedule[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'manage' | 'overview' | 'summary' | 'student_overview'>('manage');
  const [overviewDay, setOverviewDay] = useState<number>(1);
  const [selectedGrade, setSelectedGrade] = useState<string>(GRADE_LEVELS[0]);
  
  const isReadOnly = currentTeacher.role === 'teacher';
  const daysOfWeek = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

  useEffect(() => {
    // Listen to academic settings (holidays, start/end dates)
    const unsubConfig = onSnapshot(
      doc(db, "config", "school"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.termStartDate) setTermStart(data.termStartDate);
          if (data.termEndDate) setTermEnd(data.termEndDate);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, "config/school")
    );

    const calendarDocId = `${systemAcademicYear}_${systemSemester}`;
    const unsubCalendar = onSnapshot(
      doc(db, "schoolCalendar", calendarDocId),
      (docSnap) => {
        if (docSnap.exists() && docSnap.data().holidays) {
          setHolidays(docSnap.data().holidays);
        } else {
          setHolidays([]);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, "schoolCalendar")
    );

    const fetchData = async () => {
      if (!auth?.currentUser) return;
      try {
        const tSnap = await getDocs(collection(db, 'teachers'));
        const activeTeachers = tSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as Teacher))
          .filter(t => (t as any).status === 'active' || (t as any).status === undefined); // In case status is missing
        setTeachers(activeTeachers);

        const sSnap = await getDocs(collection(db, 'schedules'));
        
        const cSnap = await getDocs(collection(db, 'curriculums'));
        setCurriculums(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const relevantSchedules = sSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as TeacherSchedule))
          .filter(s => {
            // ปิดการกรองชั่วคราว เพื่อให้แสดงตารางสอนทั้งหมด (ป้องกันปัญหาข้อมูลเก่าหาย)
            return true;
          });
        setAllSchedules(relevantSchedules);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
    return () => {
      unsubConfig();
      unsubCalendar();
    };
  }, [systemSemester, systemAcademicYear]);

  useEffect(() => {
    if (currentTeacher?.id && !selectedTeacherId) {
      setSelectedTeacherId(currentTeacher.id);
    }
  }, [currentTeacher]);

  const schedules = allSchedules.filter(s => s.teacherId === selectedTeacherId);

    const getTeachingDays = () => {
    if (!termStart || !termEnd) return null;
    
    const [startYear, startMonth, startDay] = termStart.split('-').map(Number);
    const [endYear, endMonth, endDay] = termEnd.split('-').map(Number);
    
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    const daysCount: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const datesToSkip = new Set<string>();
    holidays.forEach(h => {
      // Treat items without type as legacy 'holiday'
      const type = h.type || 'holiday';
      if (type === 'holiday' || type === 'activity_no_class') {
         datesToSkip.add(h.date);
      }
    });

    let cur = new Date(start);
    while (cur <= end) {
      const dayOfWeek = cur.getDay();
      const yyyy = cur.getFullYear();
      const mm = String(cur.getMonth() + 1).padStart(2, '0');
      const dd = String(cur.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      if (dayOfWeek >= 1 && dayOfWeek <= 5 && !datesToSkip.has(dateStr)) {
        daysCount[dayOfWeek]++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return daysCount;
  };

  const teachingDaysCount = getTeachingDays();
  console.log("allSchedules:", allSchedules);
  console.log("selectedTeacherId:", selectedTeacherId);
  console.log("schedules:", schedules);

  const getSubjectFromAffiliation = (affiliation?: string): string => {
    if (!affiliation) return '';
    const clean = affiliation
      .replace(/^กลุ่มสาระการเรียนรู้\s*/, '')
      .replace(/^กลุ่มสาระฯ\s*/, '')
      .replace(/^กลุ่มสาระ\s*/, '')
      .trim();
    
    if (!clean) return '';

    // Direct match with SUBJECTS
    const exact = SUBJECTS.find(s => s === clean);
    if (exact) return exact;

    // Common mapping for learning areas to standard subject
    if (clean.includes('คณิต')) return 'คณิตศาสตร์';
    if (clean.includes('วิทยาศาสตร์')) return 'วิทยาศาสตร์และเทคโนโลยี';
    if (clean.includes('ภาษาไทย')) return 'ภาษาไทย';
    if (clean.includes('ภาษาต่างประเทศ') || clean.includes('อังกฤษ')) return 'ภาษาอังกฤษ';
    if (clean.includes('สังคม')) return 'สังคมศึกษา ศาสนา และวัฒนธรรม';
    if (clean.includes('ประวัติศาสตร์')) return 'ประวัติศาสตร์';
    if (clean.includes('สุขศึกษา') || clean.includes('พลศึกษา') || clean.includes('พละ')) return 'สุขศึกษาและพลศึกษา';
    if (clean.includes('ศิลปะ') || clean.includes('ทัศนศิลป์')) return 'ศิลปะ';
    if (clean.includes('ดนตรี')) return 'ดนตรีสากล';
    if (clean.includes('นาฏศิลป์')) return 'นาฏศิลป์';
    if (clean.includes('การงาน')) return 'การงานอาชีพ';
    if (clean.includes('คอมพิวเตอร์') || clean.includes('เทคโนโลยี')) return 'คอมพิวเตอร์';
    if (clean.includes('จีน')) return 'ภาษาจีน';
    if (clean.includes('ปฐมวัย') || clean.includes('อนุบาล')) return 'การศึกษาปฐมวัย';

    // Substring match
    const partial = SUBJECTS.find(s => clean.includes(s) || s.includes(clean));
    if (partial) return partial;

    return clean;
  };

  const handleAddSchedule = async (dayOfWeek: number, period: string) => {
    if (!selectedTeacherId) return;
    const teacher = teachers.find(t => t.id === selectedTeacherId);
    const teacherName = teacher ? (teacher.thaiName || teacher.displayName) : '';
    
    if (schedules.some(s => s.dayOfWeek === dayOfWeek && s.period === period)) {
      alert('ครูท่านนี้มีสอนในคาบนี้แล้ว');
      return;
    }

    try {
      // 1. Detect subject from teacher's affiliation (กลุ่มสาระการเรียนรู้ที่ครูสังกัด)
      const affiliationSubject = getSubjectFromAffiliation(teacher?.affiliation);

      // 2. Intelligently infer initial grade and subject
      const teacherHomeroom = teacher?.homeroomClass || '';
      const lastSchedule = schedules[schedules.length - 1];

      let initialSubject = affiliationSubject;
      let initialGrade = lastSchedule?.gradeLevel || (teacherHomeroom && GRADE_LEVELS.includes(teacherHomeroom) ? teacherHomeroom : '');

      if (initialSubject === 'การศึกษาปฐมวัย') {
        if (!initialGrade || !initialGrade.startsWith('อนุบาล')) {
          initialGrade = teacherHomeroom?.startsWith('อนุบาล') ? teacherHomeroom : 'อนุบาล 1';
        }
      } else if (initialSubject) {
        // Teacher belongs to an academic/primary subject
        if (!initialGrade || initialGrade.startsWith('อนุบาล')) {
          initialGrade = teacherHomeroom?.startsWith('ประถม') ? teacherHomeroom : 'ประถมศึกษาปีที่ 1/1';
        }
      } else {
        // Fallback if teacher has no affiliation set in profile
        const isKg = (initialGrade || teacherHomeroom).startsWith('อนุบาล');
        initialSubject = isKg ? 'การศึกษาปฐมวัย' : 'ภาษาไทย';
        if (!initialGrade) {
          initialGrade = isKg ? 'อนุบาล 1' : 'ประถมศึกษาปีที่ 1/1';
        }
      }

      const newSchedule = {
        teacherId: selectedTeacherId,
        teacherName,
        dayOfWeek,
        period,
        subject: initialSubject,
        gradeLevel: initialGrade,
        semester: systemSemester,
        academicYear: systemAcademicYear,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'schedules'), newSchedule);
      setAllSchedules([...allSchedules, { id: docRef.id, ...newSchedule }]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateSchedule = async (id: string, field: keyof TeacherSchedule, value: string | number) => {
    try {
      await setDoc(doc(db, 'schedules', id), { [field]: value }, { merge: true });
      setAllSchedules(allSchedules.map(s => s.id === id ? { ...s, [field]: value } : s));
    } catch (error) {
      console.error(error);
    }
  };

  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

  const confirmDelete = async () => {
    if (!scheduleToDelete) return;
    try {
      await deleteDoc(doc(db, 'schedules', scheduleToDelete));
      setAllSchedules(allSchedules.filter(s => s.id !== scheduleToDelete));
    } catch (error) {
      console.error(error);
    } finally {
      setScheduleToDelete(null);
    }
  };

  const handleDeleteAllTeacherSchedules = async () => {
    if (!selectedTeacherId || schedules.length === 0) return;
    try {
      setIsDeletingAll(true);
      const batch = writeBatch(db);
      schedules.forEach(s => {
        batch.delete(doc(db, 'schedules', s.id));
      });
      await batch.commit();

      const deletedCount = schedules.length;
      const teacherName = selectedTeacher?.thaiName || selectedTeacher?.displayName || 'คุณครู';

      // Update local state
      const deletedIds = new Set(schedules.map(s => s.id));
      setAllSchedules(prev => prev.filter(s => !deletedIds.has(s.id)));

      setShowDeleteAllModal(false);

      window.dispatchEvent(new CustomEvent('app-custom-toast', {
        detail: {
          title: 'ลบตารางสอนสำเร็จ',
          message: `ลบตารางสอนทั้งหมดของ ${teacherName} (${deletedCount} คาบ) เรียบร้อยแล้ว`,
          type: 'success'
        }
      }));
    } catch (error) {
      console.error('Error deleting all teacher schedules:', error);
      alert('เกิดข้อผิดพลาดในการลบตารางสอน');
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" /> จัดการตารางสอน
          </h3>
          {!isReadOnly && (
            <div className="flex bg-slate-100 p-1 rounded-lg flex-wrap gap-1">
              <button onClick={() => setViewMode('manage')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'manage' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>จัดตารางสอนรายบุคคล</button>
              <button onClick={() => setViewMode('overview')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>ภาพรวมตารางสอน</button>
              <button onClick={() => setViewMode('summary')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'summary' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>สรุปและโครงสร้างเวลาเรียน</button>
              <button onClick={() => setViewMode('student_overview')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'student_overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>ตารางเรียน (นักเรียน)</button>
            </div>
          )}
        </div>

        {viewMode === 'manage' && (
          <>
            {!isReadOnly && (
              <div className="mb-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 max-w-md">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-indigo-600" /> เลือกคุณครูเพื่อจัดตารางสอน
                    </label>
                    <select
                      value={selectedTeacherId}
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    >
                      <option value="">-- เลือกคุณครู --</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.thaiName || t.displayName} ({t.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedTeacher && (
                    <div className="flex flex-wrap items-center gap-3">
                      {selectedTeacher.affiliation && (
                        <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm text-sm">
                          <span className="text-slate-500 text-xs block font-medium">สังกัดกลุ่มสาระ:</span>
                          <span className="font-bold text-indigo-950 text-xs sm:text-sm">
                            {selectedTeacher.affiliation}
                          </span>
                        </div>
                      )}

                      <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm">
                        <span className="text-slate-500 text-xs block font-medium">ตารางสอนปัจจุบัน:</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-extrabold text-indigo-700 text-lg">{schedules.length}</span>
                          <span className="text-slate-600 text-xs font-medium">คาบ/สัปดาห์</span>
                        </div>
                      </div>

                      {schedules.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowDeleteAllModal(true)}
                          className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 group cursor-pointer"
                          title={`ลบตารางสอนทั้งหมดของ ${selectedTeacher.thaiName || selectedTeacher.displayName}`}
                        >
                          <Trash2 className="h-4 w-4 text-rose-500 group-hover:scale-110 transition-transform" />
                          <span>ลบตารางสอนทั้งหมด ({schedules.length} คาบ)</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedTeacherId && (
              <>
                {/* Misconfigured schedule alert banner (Primary class with Kindergarten subject) */}
                {schedules.some(s => (s.gradeLevel || '').startsWith('ประถม') && s.subject === 'การศึกษาปฐมวัย') && !isReadOnly && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-start gap-3 text-amber-900 text-sm">
                      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">
                          ตรวจพบวิชา "การศึกษาปฐมวัย" ในคาบเรียนระดับประถมศึกษา ({schedules.filter(s => (s.gradeLevel || '').startsWith('ประถม') && s.subject === 'การศึกษาปฐมวัย').length} คาบ)
                        </div>
                        <div className="text-xs text-amber-700 mt-0.5">
                          เกิดจากคาบที่เพิ่มใหม่ซึ่งบันทึกชั้นประถมไว้แต่ไม่ได้เปลี่ยนวิชา สามารถคลิกปุ่มด้านขวาเพื่อปรับเป็นวิชา "ภาษาไทย" ทั้งหมดได้ทันที
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const targetList = schedules.filter(s => (s.gradeLevel || '').startsWith('ประถม') && s.subject === 'การศึกษาปฐมวัย');
                        for (const s of targetList) {
                          await handleUpdateSchedule(s.id, 'subject', 'ภาษาไทย');
                        }
                      }}
                      className="px-4 py-2 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-sm"
                    >
                      ปรับเป็นวิชาภาษาไทยทั้งหมด
                    </button>
                  </div>
                )}

                {isReadOnly ? (
                  <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl">
                    <table className="min-w-full text-sm text-center">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-3 border-r border-slate-200 font-bold text-slate-700 w-24">วัน / คาบ</th>
                          {PERIODS.map(p => (
                            <th key={p} className="p-3 border-r border-slate-200 font-bold text-slate-700 min-w-[120px] whitespace-nowrap">
                              {p.replace(/\s*\(.*\)/, '')}
                              <div className="text-[10px] font-normal text-slate-500 mt-1">
                                {p.match(/\((.*?)\)/)?.[1] || ''}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[1, 2, 3, 4, 5].map(day => (
                          <tr key={day}>
                            <td className="p-3 border-r border-slate-200 font-bold text-slate-800 bg-slate-50">
                              {daysOfWeek[day]}
                            </td>
                            {PERIODS.map(p => {
                              const sched = schedules.find(s => s.dayOfWeek === day && s.period === p);
                              return (
                                <td key={p} className="p-3 border-r border-slate-200 relative group h-20 align-middle">
                                  {sched ? (
                                    <div className="flex flex-col items-center justify-center gap-1">
                                      <span className="font-bold text-indigo-700 whitespace-nowrap">{sched.subject === 'อื่นๆ' ? (sched.customSubject || 'อื่นๆ') : sched.subject}</span>
                                      <span className="text-xs text-slate-500 whitespace-nowrap">{sched.gradeLevel}</span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {[1, 2, 3, 4, 5].map(day => (
                      <div key={day} className="border border-slate-100 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 p-4 font-bold text-slate-800 flex justify-between items-center">
                          <span>วัน{daysOfWeek[day]}</span>
                          {!isReadOnly && (
                            <div className="flex gap-2">
                              <select id={`add-period-${day}`} className="p-1.5 text-xs bg-white border border-slate-200 rounded-lg">
                                {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                              <button onClick={() => {
                                const sel = document.getElementById(`add-period-${day}`) as HTMLSelectElement;
                                handleAddSchedule(day, sel.value);
                              }} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-200 flex items-center gap-1">
                                <Plus className="h-3 w-3" /> เพิ่มคาบ
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="divide-y divide-slate-100">
                          {schedules.filter(s => s.dayOfWeek === day).sort((a, b) => PERIODS.indexOf(a.period) - PERIODS.indexOf(b.period)).map(schedule => {
                            const isPrimary = (schedule.gradeLevel || '').startsWith('ประถม');
                            return (
                              <div key={schedule.id} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center bg-white hover:bg-slate-50 transition-colors">
                                <div className="w-full md:w-1/6 font-bold text-slate-700">{schedule.period}</div>
                                
                                <div className="w-full md:w-2/6">
                                  <select 
                                    value={schedule.subject} 
                                    onChange={(e) => handleUpdateSchedule(schedule.id, 'subject', e.target.value)} 
                                    disabled={isReadOnly} 
                                    className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-100"
                                  >
                                    {availableSubjects
                                      .filter((s: any) => {
                                        // For primary classes, exclude Kindergarten subjects
                                        if (isPrimary && (s.name === 'การศึกษาปฐมวัย' || s.groupName === 'การศึกษาปฐมวัย')) {
                                          return false;
                                        }
                                        return true;
                                      })
                                      .map((s: any, idx: number) => {
                                        if (typeof s === 'string') {
                                          return <option key={`s-${idx}`} value={s}>{s}</option>;
                                        } else if (s.type === 'header') { 
                                          return <option key={`h-${idx}`} disabled className="font-bold text-slate-500 bg-slate-50">{s.label}</option>; 
                                        } else if (s.type === 'single') {
                                          return <option key={`s-${idx}`} value={s.name}>{s.label || s.name}</option>;
                                        } else if (s.type === 'group') {
                                          return (
                                            <optgroup key={`g-${idx}`} label={s.groupName}>
                                              {s.subjects.map((sub: string) => <option key={sub} value={sub}>{sub}</option>)}
                                            </optgroup>
                                          );
                                        }
                                        return null;
                                      })}
                                  </select>
                                  {schedule.subject === 'อื่นๆ' && (
                                    <input type="text" value={schedule.customSubject || ''} onChange={(e) => handleUpdateSchedule(schedule.id, 'customSubject', e.target.value)} disabled={isReadOnly} placeholder="ระบุวิชาอื่นๆ..." className="w-full mt-2 p-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-100" />
                                  )}
                                </div>
                                
                                <div className="w-full md:w-2/6">
                                  <select 
                                    value={schedule.gradeLevel} 
                                    onChange={(e) => {
                                      const newGrade = e.target.value;
                                      handleUpdateSchedule(schedule.id, 'gradeLevel', newGrade);
                                      if (newGrade.startsWith('ประถม') && schedule.subject === 'การศึกษาปฐมวัย') {
                                        handleUpdateSchedule(schedule.id, 'subject', 'ภาษาไทย');
                                      }
                                    }} 
                                    disabled={isReadOnly} 
                                    className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-100"
                                  >
                                    {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                                  </select>
                                </div>
                                
                                <div className="w-full md:w-1/6 flex justify-end">
                                  {!isReadOnly && (
                                    <button onClick={() => setScheduleToDelete(schedule.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          
                          {schedules.filter(s => s.dayOfWeek === day).length === 0 && (
                            <div className="p-6 text-center text-slate-400 text-sm">ไม่มีการสอนในวันนี้</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {viewMode === 'overview' && (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(d => (
                <button
                  key={d}
                  onClick={() => setOverviewDay(d)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${overviewDay === d ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  วัน{daysOfWeek[d]}
                </button>
              ))}
            </div>
            
            <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl">
              <table className="min-w-full text-sm text-center">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 border-r border-slate-200 font-bold text-slate-700 text-left min-w-[150px]">คุณครู</th>
                    {PERIODS.map(p => (
                      <th key={p} className="p-3 border-r border-slate-200 font-bold text-slate-700 min-w-[120px] whitespace-nowrap">
                        {p.replace(/\s*\(.*\)/, '')}
                        <div className="text-[10px] font-normal text-slate-500 mt-1">
                          {p.match(/\((.*?)\)/)?.[1] || ''}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.map(t => {
                    const tScheds = allSchedules.filter(s => s.teacherId === t.id && s.dayOfWeek === overviewDay);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 border-r border-slate-200 font-bold text-slate-800 text-left bg-slate-50">
                          {t.displayName || t.thaiName}
                        </td>
                        {PERIODS.map(p => {
                          const sched = tScheds.find(s => s.period === p);
                          return (
                            <td key={p} className="p-3 border-r border-slate-200 relative group h-16 align-middle">
                              {sched ? (
                                <div className="flex flex-col items-center justify-center gap-1">
                                  <span className="font-bold text-indigo-700 whitespace-nowrap">{sched.subject === 'อื่นๆ' ? (sched.customSubject || 'อื่นๆ') : sched.subject}</span>
                                  <span className="text-xs text-slate-500 whitespace-nowrap">{sched.gradeLevel}</span>
                                </div>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewMode === 'summary' && (
          <div className="space-y-6">
            {!teachingDaysCount && (
              <div className="p-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-medium">ยังไม่ได้กำหนด "วันเปิด-ปิดภาคเรียน" ในเมนูตั้งค่าระบบ ทำให้ไม่สามารถคำนวณชั่วโมงเรียนจริงได้</p>
              </div>
            )}
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-slate-800">สถิติวันเรียนในภาคเรียนนี้ (หลังหักวันหยุด)</h4>
                {teachingDaysCount && (
                   <div className="text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                     รวมทั้งหมด: {Object.values(teachingDaysCount).reduce((a, b) => a + b, 0)} วัน
                   </div>
                )}
              </div>
              <div className="grid grid-cols-5 gap-4 text-center">
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 mb-1">วันจันทร์</div>
                  <div className="text-xl font-black text-indigo-600">{teachingDaysCount ? teachingDaysCount[1] : '-'} <span className="text-xs font-normal text-slate-500">วัน</span></div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 mb-1">วันอังคาร</div>
                  <div className="text-xl font-black text-indigo-600">{teachingDaysCount ? teachingDaysCount[2] : '-'} <span className="text-xs font-normal text-slate-500">วัน</span></div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 mb-1">วันพุธ</div>
                  <div className="text-xl font-black text-indigo-600">{teachingDaysCount ? teachingDaysCount[3] : '-'} <span className="text-xs font-normal text-slate-500">วัน</span></div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 mb-1">วันพฤหัสบดี</div>
                  <div className="text-xl font-black text-indigo-600">{teachingDaysCount ? teachingDaysCount[4] : '-'} <span className="text-xs font-normal text-slate-500">วัน</span></div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 mb-1">วันศุกร์</div>
                  <div className="text-xl font-black text-indigo-600">{teachingDaysCount ? teachingDaysCount[5] : '-'} <span className="text-xs font-normal text-slate-500">วัน</span></div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {BASE_GRADE_LEVELS.map(baseGrade => {
                // Find all schedules that belong to this base grade (e.g. "ประถมศึกษาปีที่ 1" matches "ประถมศึกษาปีที่ 1/1", etc.)
                const gradeSchedules = allSchedules.filter(s => 
    s.gradeLevel && 
    s.gradeLevel.startsWith(baseGrade) && 
    (s.semester === systemSemester || !s.semester) // Fallback for old data without semester
);
                if (gradeSchedules.length === 0) return null;

                // Group by SUBJECT first, then ROOM
                const subjectGroups: Record<string, Record<string, { periods: number, days: number[], teachers: Set<string>, seenPeriods: Set<string>, childSubjects: Record<string, { periods: number, days: number[], teachers: Set<string>, seenPeriods: Set<string> }> }>> = {};
                
                gradeSchedules.forEach(curr => {
                  const subjectName = curr.subject === 'อื่นๆ' ? (curr.customSubject || 'อื่นๆ') : curr.subject;
                  const roomsList = curr.gradeLevel ? curr.gradeLevel.split(',').map(r => r.trim()).filter(r => r.startsWith(baseGrade)) : [baseGrade];
                  
                  
                  // Find curriculum for this scheduled subject
                  const safeSub = (subjectName || '').trim();
                  let curriculumMatch = curriculums.find(c => (c.subjectName || '').trim() === safeSub && (c.gradeLevel === baseGrade || (c.gradeLevels && c.gradeLevels.includes(baseGrade))));
                  if (!curriculumMatch) curriculumMatch = curriculums.find(c => (c.subjectName || '').trim() === safeSub);
                  
                  let groupName = subjectName;
                  let childName = null;
                  
                  if (curriculumMatch && curriculumMatch.parentId) {
                      const parentMatch = curriculums.find(c => c.id === curriculumMatch.parentId);
                      if (parentMatch && parentMatch.subjectName) {
                          groupName = parentMatch.subjectName;
                          childName = subjectName;
                      }
                  }

                  roomsList.forEach(room => {
                      if (!subjectGroups[groupName]) {
                         subjectGroups[groupName] = {};
                      }
                      if (!subjectGroups[groupName][room]) {
                         subjectGroups[groupName][room] = { periods: 0, days: [], teachers: new Set(), seenPeriods: new Set(), childSubjects: {} };
                      }
                      
                      const periodSig = `${curr.dayOfWeek}-${curr.period}`;
                      const teacher = teachers.find(t => t.id === curr.teacherId);
                      const tName = teacher ? (teacher.displayName || teacher.thaiName || '') : '';
                      
                      if (childName) {
                          if (!subjectGroups[groupName][room].childSubjects[childName]) {
                              subjectGroups[groupName][room].childSubjects[childName] = { periods: 0, days: [], teachers: new Set(), seenPeriods: new Set() };
                          }
                          if (!subjectGroups[groupName][room].childSubjects[childName].seenPeriods.has(periodSig)) {
                              subjectGroups[groupName][room].childSubjects[childName].seenPeriods.add(periodSig);
                              subjectGroups[groupName][room].childSubjects[childName].periods += 1;
                              subjectGroups[groupName][room].childSubjects[childName].days.push(curr.dayOfWeek);
                              
                              // Add to parent as well (only if the parent hasn't seen this period FOR THIS CHILD, but actually parent periods are sum of child periods, we can just sum them without cross-child dedup)
                              // Wait, what if two children are taught in the same period? Rare, but we just sum them.
                              // Better to just track parent seenPeriods using a composite key: childName-periodSig to prevent deduping different children, 
                              // BUT if it's the SAME child, dedup it.
                              const parentSig = `${childName}-${periodSig}`;
                              if (!subjectGroups[groupName][room].seenPeriods.has(parentSig)) {
                                  subjectGroups[groupName][room].seenPeriods.add(parentSig);
                                  subjectGroups[groupName][room].periods += 1;
                                  subjectGroups[groupName][room].days.push(curr.dayOfWeek);
                              }
                          }
                          if (tName) {
                              subjectGroups[groupName][room].childSubjects[childName].teachers.add(tName);
                              subjectGroups[groupName][room].teachers.add(tName);
                          }
                      } else {
                          // No parent, standalone
                          if (!subjectGroups[groupName][room].seenPeriods.has(periodSig)) {
                              subjectGroups[groupName][room].seenPeriods.add(periodSig);
                              subjectGroups[groupName][room].periods += 1;
                              subjectGroups[groupName][room].days.push(curr.dayOfWeek);
                          }
                          if (tName) {
                              subjectGroups[groupName][room].teachers.add(tName);
                          }
                      }
                  }); // end roomsList
                });

                return (
                  <div key={baseGrade} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-4 flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-indigo-600" />
                      <h3 className="font-black text-indigo-900 text-lg">{baseGrade}</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                          <tr>
                            <th className="py-3 px-6 font-bold w-1/4">รายวิชา</th>
                            <th className="py-3 px-6 font-bold w-1/5">เป้าหมายตามหลักสูตร</th>
                            <th className="py-3 px-6 font-bold">ข้อมูลการจัดตารางสอนรายห้อง</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {Object.keys(subjectGroups).sort((a, b) => {
                            const currA = curriculums.find(c => c.subjectName === a && (c.gradeLevel === baseGrade || (c.gradeLevels && c.gradeLevels.includes(baseGrade)))) || { subjectName: a };
                            const currB = curriculums.find(c => c.subjectName === b && (c.gradeLevel === baseGrade || (c.gradeLevels && c.gradeLevels.includes(baseGrade)))) || { subjectName: b };
                            return sortSubjects(currA, currB);
                          }).map(sub => {
                            // Find required hours from curriculum
                            // Normalize strings for safer matching
                            const safeSub = (sub || '').trim();
                            // หาจากชื่อวิชาและระดับชั้นก่อน
                            let curriculumMatch = curriculums.find(c => (c.subjectName || '').trim() === safeSub && (c.gradeLevel === baseGrade || (c.gradeLevels && c.gradeLevels.includes(baseGrade))));
                            
                            // ถ้าหาไม่เจอ ลองหาจากชื่อวิชาอย่างเดียว (fallback)
                            if (!curriculumMatch) {
                               curriculumMatch = curriculums.find(c => (c.subjectName || '').trim() === safeSub);
                            }
                            // ถ้ายังไม่เจอ ลองหาแบบ Substring
                            if (!curriculumMatch) {
                               curriculumMatch = curriculums.find(c => ((c.subjectName || '').includes(safeSub) || safeSub.includes(c.subjectName || 'XXX')) && (c.gradeLevel === baseGrade || (c.gradeLevels && c.gradeLevels.includes(baseGrade))));
                            }
                            
                            const requiredHoursYear = curriculumMatch?.totalHours || curriculumMatch?.requiredHoursPerTerm || 0;
                            const requiredHours = Math.round(requiredHoursYear / 2);
                            
                            let diagnosticMsg = '';
                            if (!curriculumMatch) diagnosticMsg = 'ไม่พบชื่อวิชานี้ในโครงสร้างหลักสูตร';
                            else if (requiredHoursYear === 0) diagnosticMsg = 'พบวิชาในหลักสูตรแต่กำหนดชั่วโมงเป็น 0';
                            
                            
                            const rooms = subjectGroups[sub];
                            
                            return (
                              <tr key={sub} className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-6 align-top">
                                  <div className="font-bold text-slate-800">{sub}</div>
                                  {Object.keys(rooms).length > 0 && Object.keys(Object.values(rooms)[0].childSubjects).length > 0 && (
                                      <div className="mt-2 pl-3 border-l-2 border-indigo-200 space-y-1">
                                          {Object.keys(Object.values(rooms)[0].childSubjects).map(child => (
                                              <div key={child} className="text-xs text-slate-600 flex items-center gap-1">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-300"></span>
                                                  {child}
                                                  
                                              </div>
                                          ))}
                                      </div>
                                  )}
                                </td>
                                <td className="py-4 px-6 text-slate-600 align-top">
                                  {requiredHoursYear > 0 ? (
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-slate-700 font-bold"><span className="text-indigo-700 text-base">{requiredHours}</span> ชม./เทอม</span>
                                      <span className="text-xs text-slate-500">(เต็มปี {requiredHoursYear} ชม.)</span>
                                    </div>
                                  ) : '-'}
                                </td>
                                <td className="py-3 px-6">
                                  <div className="space-y-2">
                                    {Object.keys(rooms).sort().map(roomName => {
                                      const rData = rooms[roomName];
                                      let actualHours = 0;
                                      if (teachingDaysCount) {
                                         // Use unique days per period to avoid doubling if logic failed elsewhere, 
                                         // though seenPeriods should have handled it. Just sum based on days array.
                                         rData.days.forEach(d => {
                                            actualHours += teachingDaysCount[d] || 0;
                                         });
                                      }
                                      
                                      let statusColor = "bg-slate-100 text-slate-600";
                                      let statusText = "ไม่ได้กำหนดเวลา";
                                      
                                      if (requiredHours > 0 && teachingDaysCount) {
                                         if (actualHours === requiredHours) {
                                            statusColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
                                            statusText = "ครบถ้วน";
                                         } else if (actualHours > requiredHours) {
                                            statusColor = "bg-amber-100 text-amber-700 border-amber-200";
                                            statusText = `เกินมา ${actualHours - requiredHours} ชม.`;
                                         } else {
                                            statusColor = "bg-rose-100 text-rose-700 border-rose-200";
                                            statusText = `ขาด ${requiredHours - actualHours} ชม.`;
                                         }
                                      }
                                      
                                      return (
                                        <div key={roomName} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-white shadow-sm gap-2">
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                            <span className="font-bold text-slate-700 w-24">{roomName}</span>
                                            <span className="text-slate-500 text-xs flex items-center gap-1.5">
                                              <User className="h-3 w-3" />
                                              ครู{Array.from(rData.teachers).join(', ')}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-4">
                                            <span className="text-xs text-slate-500 whitespace-nowrap">
                                              จัดได้: <span className="font-bold text-slate-700">{teachingDaysCount ? actualHours : '-'} ชม.</span> 
                                              <span className="ml-1 opacity-70">({rData.periods} คาบ)</span>
                                            </span>
                                            <div className={`inline-block px-2 py-0.5 rounded-md border text-[10px] font-bold whitespace-nowrap w-24 text-center ${statusColor}`}>
                                               {statusText}
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'student_overview' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
              <label className="font-bold text-slate-700 whitespace-nowrap">เลือกระดับชั้น:</label>
              <select 
                value={selectedGrade} 
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full md:w-auto p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {GRADE_LEVELS.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            
            <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl">
              <table className="min-w-full text-sm text-center">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 border-r border-slate-200 font-bold text-slate-700 w-24">วัน / คาบ</th>
                    {PERIODS.map(p => (
                      <th key={p} className="p-3 border-r border-slate-200 font-bold text-slate-700 min-w-[120px] whitespace-nowrap">
                        {p.replace(/\s*\(.*\)/, '')}
                        <div className="text-[10px] font-normal text-slate-500 mt-1">
                          {p.match(/\((.*?)\)/)?.[1] || ''}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[1, 2, 3, 4, 5].map(day => (
                    <tr key={day}>
                      <td className="p-3 border-r border-slate-200 font-bold text-slate-800 bg-slate-50">
                        {daysOfWeek[day]}
                      </td>
                      {PERIODS.map(p => {
                        const sched = allSchedules.find(s => s.dayOfWeek === day && s.period === p && s.gradeLevel === selectedGrade);
                        return (
                          <td key={p} className="p-3 border-r border-slate-200 relative group h-20 align-middle">
                            {sched ? (
                              <div className="flex flex-col items-center justify-center gap-1">
                                <span className="font-bold text-indigo-700 whitespace-nowrap">{sched.subject === 'อื่นๆ' ? (sched.customSubject || 'อื่นๆ') : sched.subject}</span>
                                {/* อัปเดตชื่อครูแบบ Real-time โดยดึงจาก teachers list เทียบ ID */}
                                <span className="text-xs text-slate-500 whitespace-nowrap">{teachers.find(t => t.id === sched.teacherId)?.thaiName || sched.teacherName}</span>
                              </div>
                            ) : (
                              <span className="text-slate-300">-</span>
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

      {/* Delete Confirmation Modal */}
      {scheduleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">ยืนยันการลบ?</h3>
              <p className="text-sm text-slate-500 mb-6">คุณแน่ใจหรือไม่ที่จะลบตารางสอนคาบนี้? การกระทำนี้ไม่สามารถกู้คืนได้</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setScheduleToDelete(null)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors"
                >
                  ลบข้อมูล
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete ALL Teacher Schedules Confirmation Modal */}
      {showDeleteAllModal && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-6">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-rose-200">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 text-center mb-1">
                ยืนยันลบตารางสอนทั้งหมด?
              </h3>
              <p className="text-sm text-slate-600 text-center mb-4">
                คุณกำลังจะลบตารางสอนทั้งหมดของ <span className="font-bold text-slate-900">"{selectedTeacher.thaiName || selectedTeacher.displayName}"</span>
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-700 font-bold border-b border-slate-200 pb-1.5">
                  <span>จำนวนคาบที่จะถูกลบ:</span>
                  <span className="text-rose-600 font-black text-sm">{schedules.length} คาบ</span>
                </div>
                <div className="space-y-1 pt-1">
                  <div className="text-slate-500 font-medium">รายการตามวันในสัปดาห์:</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[1, 2, 3, 4, 5].map(day => {
                      const count = schedules.filter(s => s.dayOfWeek === day).length;
                      if (count === 0) return null;
                      return (
                        <div key={day} className="bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 flex justify-between">
                          <span>วัน{daysOfWeek[day]}:</span>
                          <span className="font-bold text-indigo-700">{count} คาบ</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 mb-6 text-xs text-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>คำเตือน: การลบนี้จะมีผลต่อฐานข้อมูลทันที และไม่สามารถกู้คืนข้อมูลตารางสอนเดิมได้</span>
              </div>
              
              <div className="flex gap-3">
                <button 
                  type="button"
                  disabled={isDeletingAll}
                  onClick={() => setShowDeleteAllModal(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm disabled:opacity-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button 
                  type="button"
                  disabled={isDeletingAll}
                  onClick={handleDeleteAllTeacherSchedules}
                  className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isDeletingAll ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>กำลังลบ...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>ยืนยันลบ {schedules.length} คาบ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}