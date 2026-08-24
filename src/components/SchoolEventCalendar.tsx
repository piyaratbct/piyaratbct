import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, BookOpen, Plus, Trash2, CheckCircle2, Users, Bell, AlertCircle, Edit2, LayoutGrid, List, Sparkles, X, Check } from 'lucide-react';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Teacher, Student, GRADE_LEVELS } from '../types';
import { CheckSquare, Square } from 'lucide-react';
import { EventAttendanceModal } from './EventAttendanceModal';

const MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const MONTH_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

const TRAITS = [
  { id: 't1', label: '1. รักชาติ ศาสน์ กษัตริย์', short: 'รักชาติฯ' },
  { id: 't2', label: '2. ซื่อสัตย์สุจริต', short: 'ซื่อสัตย์' },
  { id: 't3', label: '3. มีวินัย', short: 'มีวินัย' },
  { id: 't4', label: '4. ใฝ่เรียนรู้', short: 'ใฝ่เรียนรู้' },
  { id: 't5', label: '5. อยู่อย่างพอเพียง', short: 'พอเพียง' },
  { id: 't6', label: '6. มุ่งมั่นในการทำงาน', short: 'มุ่งมั่น' },
  { id: 't7', label: '7. รักความเป็นไทย', short: 'รักความเป็นไทย' },
  { id: 't8', label: '8. มีจิตสาธารณะ', short: 'จิตสาธารณะ' }
];

interface SchoolEvent {
  id: string;
  date: string;
  endDate?: string;
  title: string;
  type: string;
  timeRange: string;
  responsibleTeachers?: string[];
  evaluatedTraits?: string[];
  attendeeIds?: string[];
  targetGrades?: string[];
}

interface SchoolEventCalendarProps {
  students?: Student[];
  currentTeacher?: Teacher;
}

export function SchoolEventCalendar({ currentTeacher, students = [] }: SchoolEventCalendarProps) {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<{date: string, endDate: string, title: string, timeRange: string, type: string, responsibleTeachers: string[], evaluatedTraits: string[], targetGrades: string[]}>({ date: '', endDate: '', title: '', timeRange: '08:00 - 16:00', type: 'activity', responsibleTeachers: [], evaluatedTraits: [], targetGrades: [] });
  const [attendanceEvent, setAttendanceEvent] = useState<SchoolEvent | null>(null);
  const [currentAttendees, setCurrentAttendees] = useState<string[]>([]);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  const canManageEvents = currentTeacher?.role === 'admin' || currentTeacher?.role === 'academic';

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [eventsSnap, teachersSnap] = await Promise.all([
        getDocs(query(collection(db, 'schoolEvents'), orderBy('date', 'asc'))),
        getDocs(collection(db, 'teachers'))
      ]);

      const fetchedEvents = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolEvent));
      const fetchedTeachers = teachersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));

      setEvents(fetchedEvents);
      setTeachers(fetchedTeachers);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.date || !newEvent.title) return;

    try {
      if (editingEventId) {
        await updateDoc(doc(db, 'schoolEvents', editingEventId), newEvent);
        window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'แก้ไขกิจกรรมเรียบร้อยแล้ว', type: 'success' }}));
      } else {
        await addDoc(collection(db, 'schoolEvents'), newEvent);
        window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'เพิ่มกิจกรรมเรียบร้อยแล้ว', type: 'success' }}));
      }
      setNewEvent({ date: '', endDate: '', title: '', timeRange: '08:00 - 16:00', type: 'activity', responsibleTeachers: [], evaluatedTraits: [], targetGrades: [] });
      setIsAdding(false);
      setEditingEventId(null);
      fetchData();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };
  
  const handleEdit = (event: SchoolEvent) => {
    setNewEvent({ date: event.date, endDate: event.endDate || '', title: event.title, timeRange: event.timeRange || '08:00 - 16:00', type: event.type || 'activity', responsibleTeachers: event.responsibleTeachers || [], evaluatedTraits: event.evaluatedTraits || [], targetGrades: event.targetGrades || [] });
    setEditingEventId(event.id);
    setIsAdding(true);
  };
  
  const handleCancelForm = () => {
    setNewEvent({ date: '', endDate: '', title: '', timeRange: '08:00 - 16:00', type: 'activity', responsibleTeachers: [], evaluatedTraits: [], targetGrades: [] });
    setIsAdding(false);
    setEditingEventId(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(null);
    try {
      await deleteDoc(doc(db, 'schoolEvents', id));
      fetchData();
      window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'ลบกิจกรรมเรียบร้อยแล้ว', type: 'success' }}));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const getColorByType = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'exam': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'scout_camp': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-pink-50 text-pink-700 border-pink-200';
    }
  };

  const getUpcomingMyEvents = () => {
    if (!currentTeacher) return [];
    const today = new Date();
    today.setHours(0,0,0,0);
    const inThreeDays = new Date(today);
    inThreeDays.setDate(today.getDate() + 3);
    
    return events.filter(e => {
      if (!e.responsibleTeachers || !e.responsibleTeachers.includes(currentTeacher.id)) return false;
      const d = new Date(e.date);
      return d >= today && d <= inThreeDays;
    });
  };
  
  const upcomingMyEvents = getUpcomingMyEvents();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">ปฏิทินวิชาการโรงเรียน</h3>
            <p className="text-sm font-medium text-slate-500">จัดการและติดตามกิจกรรมสำคัญตลอดปีการศึกษา</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="แบบกริด"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${viewMode === 'timeline' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="แบบไทม์ไลน์"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          {canManageEvents && !isAdding && (
            <button 
              onClick={() => {
                setNewEvent({ date: '', endDate: '', title: '', timeRange: '08:00 - 16:00', type: 'activity', responsibleTeachers: [], evaluatedTraits: [], targetGrades: [] });
                setEditingEventId(null);
                setIsAdding(true);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> เพิ่มกิจกรรม
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        {upcomingMyEvents.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <div className="mt-0.5 p-1.5 bg-amber-100 text-amber-600 rounded-lg">
              <Bell className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold text-amber-800">แจ้งเตือนกิจกรรมที่ต้องรับผิดชอบ!</h4>
              <p className="text-sm text-amber-700 mt-1">คุณมีกิจกรรมที่ใกล้จะถึงในอีก 3 วัน ({upcomingMyEvents.length} รายการ)</p>
              <ul className="mt-2 space-y-1">
                {upcomingMyEvents.map(e => (
                  <li key={e.id} className="text-sm font-medium text-amber-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    {new Date(e.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}: {e.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {isAdding && (
          <form onSubmit={handleAddEvent} className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <h4 className="font-bold text-slate-700">{editingEventId ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">วันที่เริ่ม</label>
                <input required type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">วันที่สิ้นสุด (ไม่บังคับ)</label>
                <input type="date" value={newEvent.endDate || ''} min={newEvent.date} onChange={e => setNewEvent({...newEvent, endDate: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">ชื่อกิจกรรม</label>
                <input required type="text" placeholder="เช่น สอบกลางภาค" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">เวลา (เช่น 08:00 - 16:00)</label>
                <input required type="text" value={newEvent.timeRange} onChange={e => setNewEvent({...newEvent, timeRange: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">ประเภท</label>
                <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg">
                  <option value="activity">กิจกรรมทั่วไป</option>
                  <option value="meeting">ประชุม</option>
                  <option value="exam">สอบวัดผล</option>
                  <option value="scout_camp">กิจกรรมเข้าค่ายพักแรม</option>
                </select>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-medium text-slate-600">ครูผู้รับผิดชอบ (เลือกได้หลายคน)</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setNewEvent({...newEvent, responsibleTeachers: teachers.map(t => t.id)})} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold hover:bg-indigo-100">เลือกทั้งหมด</button>
                  <button type="button" onClick={() => setNewEvent({...newEvent, responsibleTeachers: []})} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold hover:bg-slate-200">ล้างทั้งหมด</button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-white">
                {teachers.map(teacher => (
                  <label key={teacher.id} className="flex items-center gap-2 text-sm cursor-pointer p-1 hover:bg-slate-50 rounded">
                    <input 
                      type="checkbox" 
                      checked={newEvent.responsibleTeachers.includes(teacher.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewEvent({...newEvent, responsibleTeachers: [...newEvent.responsibleTeachers, teacher.id]});
                        } else {
                          setNewEvent({...newEvent, responsibleTeachers: newEvent.responsibleTeachers.filter(id => id !== teacher.id)});
                        }
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="truncate">{teacher.thaiName || teacher.displayName}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-bold text-slate-700">ระดับชั้นที่เข้าร่วม</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setNewEvent({...newEvent, targetGrades: GRADE_LEVELS})} className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded font-bold hover:bg-emerald-100">เลือกทั้งหมด</button>
                  <button type="button" onClick={() => setNewEvent({...newEvent, targetGrades: []})} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold hover:bg-slate-200">ล้างทั้งหมด</button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 p-2 border border-slate-200 rounded-lg bg-white">
                {GRADE_LEVELS.map(grade => (
                  <label key={grade} className="flex items-center gap-2 text-xs cursor-pointer p-1.5 hover:bg-slate-50 rounded">
                    <input 
                      type="checkbox" 
                      checked={newEvent.targetGrades?.includes(grade)}
                      onChange={(e) => {
                        const current = newEvent.targetGrades || [];
                        if (e.target.checked) {
                          setNewEvent({...newEvent, targetGrades: [...current, grade]});
                        } else {
                          setNewEvent({...newEvent, targetGrades: current.filter(g => g !== grade)});
                        }
                      }}
                      className="rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="truncate">{grade}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-bold text-slate-700">การประเมินคุณลักษณะอันพึงประสงค์ (เฉพาะกิจกรรมที่เข้าร่วม)</label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 p-2 border border-slate-200 rounded-lg bg-white">
                {TRAITS.map(trait => (
                  <label key={trait.id} className="flex items-center gap-2 text-xs cursor-pointer p-1.5 hover:bg-slate-50 rounded">
                    <input 
                      type="checkbox" 
                      checked={newEvent.evaluatedTraits?.includes(trait.id)}
                      onChange={(e) => {
                        const current = newEvent.evaluatedTraits || [];
                        if (e.target.checked) {
                          setNewEvent({...newEvent, evaluatedTraits: [...current, trait.id]});
                        } else {
                          setNewEvent({...newEvent, evaluatedTraits: current.filter(id => id !== trait.id)});
                        }
                      }}
                      className="rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span className="truncate">{trait.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                * หากเลือกไว้ เมื่อมีการเช็คชื่อผู้เข้าร่วม ระบบจะนำไปใช้แนะนำคะแนนคุณลักษณะฯ ของนักเรียนคนนั้นโดยอัตโนมัติ
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={handleCancelForm} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50">ยกเลิก</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">บันทึก</button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-slate-500 text-sm">กำลังโหลดข้อมูล...</div>
        ) : events.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">ยังไม่มีข้อมูลกิจกรรมวิชาการในขณะนี้</div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "relative border-l-2 border-indigo-100 ml-4 md:ml-6 space-y-8 pb-8 mt-4"}>
            {events.map((event) => {
              const d = new Date(event.date);
              const today = new Date();
              today.setHours(0,0,0,0);
              const isPast = d < today;
              const diffTime = d.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const isUrgent = diffDays >= 0 && diffDays <= 7;
              
              if (viewMode === 'timeline') {
                return (
                  <div key={event.id} className="relative pl-6 md:pl-8">
                    <div className={`absolute -left-[9px] top-6 h-4 w-4 rounded-full border-4 border-white ${isPast ? 'bg-slate-300' : isUrgent ? 'bg-rose-500 animate-pulse shadow-[0_0_0_4px_rgba(244,63,94,0.1)]' : 'bg-indigo-500'}`}></div>
                    <div className={`p-5 rounded-2xl border ${isPast ? 'bg-slate-50 border-slate-200 opacity-60 grayscale' : getColorByType(event.type)} transition-all hover:shadow-md flex flex-col sm:flex-row justify-between gap-4 relative overflow-hidden`}>
                      {isPast && (
                        <div className="absolute top-0 right-0 bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> ผ่านไปแล้ว
                        </div>
                      )}
                      {currentTeacher && !isPast && event.responsibleTeachers?.includes(currentTeacher.id) && (
                        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1 shadow-sm animate-pulse">
                          <Bell className="h-3 w-3" /> ของคุณ
                        </div>
                      )}
                      {isUrgent && !isPast && (
                        <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1 shadow-sm animate-pulse">
                          <AlertCircle className="h-3 w-3" /> ใกล้ถึงแล้ว
                        </div>
                      )}
                      
                      <div className="flex gap-4 items-start w-full">
                        <div className={`flex flex-col items-center justify-center ${isPast ? 'bg-slate-100/80 text-slate-500' : 'bg-white/80'} rounded-xl p-3 min-w-[4rem] backdrop-blur-sm shadow-sm`}>
                          {event.endDate && event.endDate !== event.date ? (
                            <>
                              <span className="text-[10px] font-bold uppercase opacity-80 leading-tight text-center pb-0.5 border-b border-black/10 w-full">{d.getDate()} {MONTH_ABBR[d.getMonth()]}</span>
                              <span className="text-[10px] font-bold uppercase opacity-80 leading-tight text-center pt-0.5 w-full">{new Date(event.endDate).getDate()} {MONTH_ABBR[new Date(event.endDate).getMonth()]}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-xs font-bold uppercase opacity-80">{MONTH_ABBR[d.getMonth()]}</span>
                              <span className="text-2xl font-black leading-none mt-1">{d.getDate()}</span>
                            </>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <h4 className={`font-bold text-base leading-tight ${isPast ? 'text-slate-600 line-through' : ''}`}>{event.title}</h4>
                            <div className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-[10px] font-bold ${isPast ? 'bg-slate-200 text-slate-500' : getColorByType(event.type)}`}>
                              {event.type === 'exam' ? 'สอบวัดผล' : event.type === 'meeting' ? 'ประชุม' : event.type === 'scout_camp' ? 'เข้าค่ายพักแรม' : 'กิจกรรม'}
                            </div>
                          </div>
                          
                          <p className={`text-sm font-medium flex items-center gap-1.5 ${isPast ? 'text-slate-400' : 'opacity-80'}`}>
                            <Clock className="h-3.5 w-3.5" /> {event.timeRange} น.
                          </p>
                          {event.responsibleTeachers && event.responsibleTeachers.length > 0 && (
                            <div className="mt-2 flex items-start gap-1.5">
                              <Users className="h-3.5 w-3.5 mt-0.5 opacity-70" />
                              <div className="flex flex-wrap gap-1">
                                {event.responsibleTeachers.map(tid => {
                                  const t = teachers.find(x => x.id === tid);
                                  if (!t) return null;
                                  return (
                                    <span key={tid} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isPast ? 'bg-slate-200 text-slate-500' : 'bg-white/60 text-slate-700'}`}>
                                      {t.thaiName || t.displayName}
                                    </span>
                                  )
                                })}
                              </div>
                            </div>


                          )}

                          {event.targetGrades && event.targetGrades.length > 0 && (
                            <div className="mt-2 flex items-start gap-1.5">
                              <Users className="h-3.5 w-3.5 mt-0.5 text-emerald-500" />
                              <div className="flex flex-wrap gap-1">
                                {event.targetGrades.map(grade => (
                                  <span key={grade} className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${isPast ? 'bg-emerald-50/50 text-emerald-400 border-emerald-100/50' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                    {grade.replace('ระดับ', '').replace('ประถมศึกษาปีที่ ', 'ป.').replace('มัธยมศึกษาปีที่ ', 'ม.')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {event.targetGrades && event.targetGrades.length > 0 && (
                            <div className="mt-2 flex items-start gap-1.5">
                              <Users className="h-3.5 w-3.5 mt-0.5 text-emerald-500" />
                              <div className="flex flex-wrap gap-1">
                                {event.targetGrades.map(grade => (
                                  <span key={grade} className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${isPast ? 'bg-emerald-50/50 text-emerald-400 border-emerald-100/50' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                    {grade.replace('ระดับ', '').replace('ประถมศึกษาปีที่ ', 'ป.').replace('มัธยมศึกษาปีที่ ', 'ม.')}
                                  </span>
                                ))}
                              </div>
                            </div>                          )}

                          {event.evaluatedTraits && event.evaluatedTraits.length > 0 && (
                            <div className="mt-2 flex items-start gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 mt-0.5 text-amber-500" />
                              <div className="flex flex-wrap gap-1">
                                {event.evaluatedTraits.map(tid => {
                                  const t = TRAITS.find(x => x.id === tid);
                                  if (!t) return null;
                                  return (
                                    <span key={tid} className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${isPast ? 'bg-amber-50/50 text-amber-500 border-amber-200/50' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                      {t.short}
                                    </span>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-1 ml-2">
                          <button 
                            onClick={() => {
                              setAttendanceEvent(event);
                              setCurrentAttendees(event.attendeeIds || []);
                            }} 
                            className={`p-1.5 rounded-lg shadow-sm border transition-colors flex items-center justify-center gap-1 ${event.attendeeIds !== undefined ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600' : 'bg-white text-emerald-600 hover:bg-emerald-50 border-emerald-100'}`} 
                            title={event.attendeeIds !== undefined ? 'เช็คชื่อแล้ว' : 'เช็คชื่อผู้เข้าร่วม'}
                          >
                            <CheckSquare className="h-3.5 w-3.5" />
                          </button>

                          {canManageEvents && (
                            <>
                              <button onClick={() => handleEdit(event)} className="p-1.5 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg shadow-sm border border-indigo-100 transition-colors" title="แก้ไข">
                              <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              {deletingId === event.id ? (
                                <div className="flex gap-1 items-center bg-rose-50 rounded-lg p-1 border border-rose-100">
                                  <span className="text-[10px] font-bold text-rose-600 px-1">ลบ?</span>
                                  <button onClick={() => handleDelete(event.id)} className="p-1 bg-rose-500 text-white rounded hover:bg-rose-600"><Check className="h-3 w-3" /></button>
                                  <button onClick={() => setDeletingId(null)} className="p-1 bg-white text-slate-500 border border-slate-200 rounded hover:bg-slate-100"><X className="h-3 w-3" /></button>
                                </div>
                              ) : (
                                <button onClick={() => setDeletingId(event.id)} className="p-1.5 bg-white text-rose-600 hover:bg-rose-50 rounded-lg shadow-sm border border-rose-100 transition-colors" title="ลบ">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              
              return (
                <div key={event.id} className={`p-5 rounded-2xl border ${isPast ? 'bg-slate-50 border-slate-200 opacity-60 grayscale' : getColorByType(event.type)} transition-all hover:scale-[1.02] cursor-default flex flex-col justify-between relative overflow-hidden ${event.attendeeIds !== undefined ? 'border-l-[8px] border-l-emerald-500' : ''}`}>
                  {isPast && (
                    <div className="absolute top-0 right-0 bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> ผ่านไปแล้ว
                    </div>
                  )}
                  {currentTeacher && !isPast && event.responsibleTeachers?.includes(currentTeacher.id) && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1 shadow-sm animate-pulse">
                      <Bell className="h-3 w-3" /> ของคุณ
                    </div>
                  )}
                  {isUrgent && !isPast && (
                    <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1 shadow-sm animate-pulse">
                      <AlertCircle className="h-3 w-3" /> ใกล้ถึงแล้ว
                    </div>
                  )}
                  <div className="flex gap-4 items-start">
                    <div className={`flex flex-col items-center justify-center ${isPast ? 'bg-slate-100/80 text-slate-500' : 'bg-white/80'} rounded-xl p-3 min-w-[4rem] backdrop-blur-sm shadow-sm`}>
                      {event.endDate && event.endDate !== event.date ? (
                        <>
                          <span className="text-[10px] font-bold uppercase opacity-80 leading-tight text-center pb-0.5 border-b border-black/10 w-full">{d.getDate()} {MONTH_ABBR[d.getMonth()]}</span>
                          <span className="text-[10px] font-bold uppercase opacity-80 leading-tight text-center pt-0.5 w-full">{new Date(event.endDate).getDate()} {MONTH_ABBR[new Date(event.endDate).getMonth()]}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-bold uppercase opacity-80">{MONTH_ABBR[d.getMonth()]}</span>
                          <span className="text-2xl font-black leading-none mt-1">{d.getDate()}</span>
                        </>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold text-base leading-tight mb-2 ${isPast ? 'text-slate-600 line-through' : ''}`}>{event.title}</h4>
                      <p className={`text-sm font-medium flex items-center gap-1.5 ${isPast ? 'text-slate-400' : 'opacity-80'}`}>
                        <Clock className="h-3.5 w-3.5" /> {event.timeRange} น.
                      </p>
                      {event.responsibleTeachers && event.responsibleTeachers.length > 0 && (
                        <div className="mt-2 flex items-start gap-1.5">
                          <Users className="h-3.5 w-3.5 mt-0.5 opacity-70" />
                          <div className="flex flex-wrap gap-1">
                            {event.responsibleTeachers.map(tid => {
                              const t = teachers.find(x => x.id === tid);
                              if (!t) return null;
                              return (
                                <span key={tid} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isPast ? 'bg-slate-200 text-slate-500' : 'bg-white/60 text-slate-700'}`}>
                                  {t.thaiName || t.displayName}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {event.targetGrades && event.targetGrades.length > 0 && (
                        <div className="mt-2 flex items-start gap-1.5">
                          <Users className="h-3.5 w-3.5 mt-0.5 text-emerald-500" />
                          <div className="flex flex-wrap gap-1">
                            {event.targetGrades.map(grade => (
                              <span key={grade} className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${isPast ? 'bg-emerald-50/50 text-emerald-400 border-emerald-100/50' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                {grade.replace('ระดับ', '').replace('ประถมศึกษาปีที่ ', 'ป.').replace('มัธยมศึกษาปีที่ ', 'ม.')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {event.evaluatedTraits && event.evaluatedTraits.length > 0 && (
                        <div className="mt-2 flex items-start gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 mt-0.5 text-amber-500" />
                          <div className="flex flex-wrap gap-1">
                            {event.evaluatedTraits.map(tid => {
                              const t = TRAITS.find(x => x.id === tid);
                              if (!t) return null;
                              return (
                                <span key={tid} className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${isPast ? 'bg-amber-50/50 text-amber-500 border-amber-200/50' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                  {t.short}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 ml-2">
                      <button 
                            onClick={() => {
                              setAttendanceEvent(event);
                              setCurrentAttendees(event.attendeeIds || []);
                            }} 
                            className={`p-1.5 rounded-lg shadow-sm border transition-colors flex items-center justify-center gap-1 ${event.attendeeIds !== undefined ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600' : 'bg-white text-emerald-600 hover:bg-emerald-50 border-emerald-100'}`} 
                            title={event.attendeeIds !== undefined ? 'เช็คชื่อแล้ว' : 'เช็คชื่อผู้เข้าร่วม'}
                          >
                            <CheckSquare className="h-3.5 w-3.5" />
                          </button>

                          {canManageEvents && (
                            <>
                              <button onClick={() => handleEdit(event)} className="p-1.5 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg shadow-sm border border-indigo-100 transition-colors" title="แก้ไข">
                          <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              {deletingId === event.id ? (
                                <div className="flex gap-1 items-center bg-rose-50 rounded-lg p-1 border border-rose-100">
                                  <span className="text-[10px] font-bold text-rose-600 px-1">ลบ?</span>
                                  <button onClick={() => handleDelete(event.id)} className="p-1 bg-rose-500 text-white rounded hover:bg-rose-600"><Check className="h-3 w-3" /></button>
                                  <button onClick={() => setDeletingId(null)} className="p-1 bg-white text-slate-500 border border-slate-200 rounded hover:bg-slate-100"><X className="h-3 w-3" /></button>
                                </div>
                              ) : (
                                <button onClick={() => setDeletingId(event.id)} className="p-1.5 bg-white text-rose-600 hover:bg-rose-50 rounded-lg shadow-sm border border-rose-100 transition-colors" title="ลบ">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      

      {/* Attendance Modal */}
      {attendanceEvent && (
        <EventAttendanceModal
          attendanceEvent={attendanceEvent}
          setAttendanceEvent={setAttendanceEvent}
          students={students || []}
          onSuccess={fetchData}
        />
      )}

      </div>
    </div>
  );
}
