import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, setDoc, deleteDoc, addDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Teacher, TeacherSchedule, GRADE_LEVELS, SUBJECTS, PERIODS } from '../types';
import { Calendar, Trash2, Plus, User, BookOpen } from 'lucide-react';

interface ScheduleManagerProps {
  systemSemester: string;
  systemAcademicYear: string;
  currentTeacher: Teacher;
}

export function ScheduleManager({ systemSemester, systemAcademicYear, currentTeacher }: ScheduleManagerProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [allSchedules, setAllSchedules] = useState<TeacherSchedule[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'manage' | 'overview' | 'summary' | 'student_overview'>('manage');
  const [overviewDay, setOverviewDay] = useState<number>(1);
  const [selectedGrade, setSelectedGrade] = useState<string>(GRADE_LEVELS[0]);
  
  const isReadOnly = currentTeacher.role === 'teacher';
  const daysOfWeek = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tSnap = await getDocs(collection(db, 'teachers'));
        const activeTeachers = tSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as Teacher))
          .filter(t => (t as any).status === 'active' || (t as any).status === undefined); // In case status is missing
        setTeachers(activeTeachers);

        const sSnap = await getDocs(collection(db, 'schedules'));
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
  }, [systemSemester, systemAcademicYear]);

  useEffect(() => {
    if (currentTeacher?.id && !selectedTeacherId) {
      setSelectedTeacherId(currentTeacher.id);
    }
  }, [currentTeacher]);

  const schedules = allSchedules.filter(s => s.teacherId === selectedTeacherId);
  console.log("allSchedules:", allSchedules);
  console.log("selectedTeacherId:", selectedTeacherId);
  console.log("schedules:", schedules);

  const handleAddSchedule = async (dayOfWeek: number, period: string) => {
    if (!selectedTeacherId) return;
    const teacher = teachers.find(t => t.id === selectedTeacherId);
    const teacherName = teacher ? (teacher.thaiName || teacher.displayName) : '';
    
    if (schedules.some(s => s.dayOfWeek === dayOfWeek && s.period === period)) {
      alert('ครูท่านนี้มีสอนในคาบนี้แล้ว');
      return;
    }

    try {
      const newSchedule = {
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
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">เลือกคุณครู</label>
                <select value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(e.target.value)} className="w-full md:w-1/2 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">-- เลือกคุณครู --</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.displayName || t.thaiName} ({t.email})</option>)}
                </select>
              </div>
            )}

            {selectedTeacherId && (
              <>
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
                          {schedules.filter(s => s.dayOfWeek === day).sort((a, b) => PERIODS.indexOf(a.period) - PERIODS.indexOf(b.period)).map(schedule => (
                            <div key={schedule.id} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center bg-white hover:bg-slate-50 transition-colors">
                              <div className="w-full md:w-1/6 font-bold text-slate-700">{schedule.period}</div>
                              
                              <div className="w-full md:w-2/6">
                                <select value={schedule.subject} onChange={(e) => handleUpdateSchedule(schedule.id, 'subject', e.target.value)} disabled={isReadOnly} className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-100">
                                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                {schedule.subject === 'อื่นๆ' && (
                                  <input type="text" value={schedule.customSubject || ''} onChange={(e) => handleUpdateSchedule(schedule.id, 'customSubject', e.target.value)} disabled={isReadOnly} placeholder="ระบุวิชาอื่นๆ..." className="w-full mt-2 p-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-100" />
                                )}
                              </div>
                              
                              <div className="w-full md:w-2/6">
                                <select value={schedule.gradeLevel} onChange={(e) => handleUpdateSchedule(schedule.id, 'gradeLevel', e.target.value)} disabled={isReadOnly} className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-100">
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
                          ))}
                          
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
          <div className="overflow-x-auto">
             <table className="min-w-full bg-white border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                  <tr>
                    <th className="py-3 px-4 text-left font-bold">ชื่อ-นามสกุล</th>
                    <th className="py-3 px-4 text-center font-bold">จำนวนคาบสอนรวม (ต่อสัปดาห์)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.map(t => {
                    const tScheds = allSchedules.filter(s => s.teacherId === t.id);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-slate-800">{t.displayName || t.thaiName}</td>
                        <td className="py-3 px-4 text-center text-sm font-bold text-indigo-600">{tScheds.length} คาบ</td>
                      </tr>
                    )
                  })}
                </tbody>
             </table>
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
                                <span className="text-xs text-slate-500 whitespace-nowrap">{sched.teacherName}</span>
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
    </div>
  );
}