import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, BookOpen, Plus, Trash2, CheckCircle2, Users, Bell, AlertCircle, Edit2 } from 'lucide-react';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Teacher } from '../types';

const MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const MONTH_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

interface SchoolEvent {
  id: string;
  date: string;
  title: string;
  type: string;
  timeRange: string;
  responsibleTeachers?: string[];
}

interface SchoolEventCalendarProps {
  currentTeacher?: Teacher;
}

export function SchoolEventCalendar({ currentTeacher }: SchoolEventCalendarProps) {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<{date: string, title: string, timeRange: string, type: string, responsibleTeachers: string[]}>({ date: '', title: '', timeRange: '08:00 - 16:00', type: 'activity', responsibleTeachers: [] });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
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
      setNewEvent({ date: '', title: '', timeRange: '08:00 - 16:00', type: 'activity', responsibleTeachers: [] });
      setIsAdding(false);
      setEditingEventId(null);
      fetchData();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };
  
  const handleEdit = (event: SchoolEvent) => {
    setNewEvent({
      date: event.date,
      title: event.title,
      timeRange: event.timeRange || '08:00 - 16:00',
      type: event.type || 'activity',
      responsibleTeachers: event.responsibleTeachers || []
    });
    setEditingEventId(event.id);
    setIsAdding(true);
  };
  
  const handleCancelForm = () => {
    setNewEvent({ date: '', title: '', timeRange: '08:00 - 16:00', type: 'activity', responsibleTeachers: [] });
    setIsAdding(false);
    setEditingEventId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบกิจกรรมนี้?')) return;
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
        {canManageEvents && !isAdding && (
          <button 
            onClick={() => {
              setNewEvent({ date: '', title: '', timeRange: '08:00 - 16:00', type: 'activity', responsibleTeachers: [] });
              setEditingEventId(null);
              setIsAdding(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> เพิ่มกิจกรรม
          </button>
        )}
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
                <label className="block text-xs font-medium text-slate-600 mb-1">วันที่</label>
                <input required type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg" />
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
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">ครูผู้รับผิดชอบ (เลือกได้หลายคน)</label>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => {
              const d = new Date(event.date);
              const today = new Date();
              today.setHours(0,0,0,0);
              const isPast = d < today;
              
              return (
                <div key={event.id} className={`p-5 rounded-2xl border ${isPast ? 'bg-slate-50 border-slate-200 opacity-60 grayscale' : getColorByType(event.type)} transition-all hover:scale-[1.02] cursor-default flex flex-col justify-between relative overflow-hidden`}>
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
                  <div className="flex gap-4 items-start">
                    <div className={`flex flex-col items-center justify-center ${isPast ? 'bg-slate-100/80 text-slate-500' : 'bg-white/80'} rounded-xl p-3 min-w-[4rem] backdrop-blur-sm shadow-sm`}>
                      <span className="text-xs font-bold uppercase opacity-80">{MONTH_ABBR[d.getMonth()]}</span>
                      <span className="text-2xl font-black leading-none mt-1">{d.getDate()}</span>
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
                              const t = teachers.find(t => t.id === tid);
                              if (!t) return null;
                              return <span key={tid} className={`text-[10px] px-1.5 py-0.5 rounded-md ${isPast ? 'bg-slate-200 text-slate-500' : 'bg-black/5'}`}>{t.thaiName || t.displayName}</span>
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {canManageEvents && (
                    <div className="mt-4 pt-4 border-t border-black/5 flex justify-end gap-3 relative z-10">
                      <button onClick={() => handleEdit(event)} className="text-xs font-bold flex items-center gap-1 opacity-70 hover:opacity-100 hover:text-indigo-700 transition-colors">
                        <Edit2 className="h-3.5 w-3.5" /> แก้ไข
                      </button>
                      <button onClick={() => handleDelete(event.id)} className="text-xs font-bold flex items-center gap-1 opacity-70 hover:opacity-100 hover:text-red-700 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" /> ลบ
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
