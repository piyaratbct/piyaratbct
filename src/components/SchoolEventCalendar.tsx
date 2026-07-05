import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, BookOpen, Plus, Trash2 } from 'lucide-react';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
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
}

interface SchoolEventCalendarProps {
  currentTeacher?: Teacher;
}

export function SchoolEventCalendar({ currentTeacher }: SchoolEventCalendarProps) {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState({ date: '', title: '', timeRange: '08:00 - 16:00', type: 'activity' });
  const canManageEvents = currentTeacher?.role === 'admin' || currentTeacher?.role === 'academic';

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'schoolEvents'), orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolEvent));
      setEvents(fetched);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.date || !newEvent.title) return;
    try {
      await addDoc(collection(db, 'schoolEvents'), newEvent);
      setNewEvent({ date: '', title: '', timeRange: '08:00 - 16:00', type: 'activity' });
      setIsAdding(false);
      fetchEvents();
      window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'เพิ่มกิจกรรมเรียบร้อยแล้ว', type: 'success' }}));
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบกิจกรรมนี้?')) return;
    try {
      await deleteDoc(doc(db, 'schoolEvents', id));
      fetchEvents();
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
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> เพิ่มกิจกรรม
          </button>
        )}
      </div>
      
      <div className="p-6">
        {isAdding && (
          <form onSubmit={handleAddEvent} className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <h4 className="font-bold text-slate-700">เพิ่มกิจกรรมใหม่</h4>
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
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50">ยกเลิก</button>
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
            {events.map(event => {
              const d = new Date(event.date);
              return (
                <div key={event.id} className={`p-5 rounded-2xl border ${getColorByType(event.type)} transition-all hover:scale-[1.02] cursor-default flex flex-col justify-between`}>
                  <div className="flex gap-4 items-start">
                    <div className="flex flex-col items-center justify-center bg-white/80 rounded-xl p-3 min-w-[4rem] backdrop-blur-sm shadow-sm">
                      <span className="text-xs font-bold uppercase opacity-80">{MONTH_ABBR[d.getMonth()]}</span>
                      <span className="text-2xl font-black leading-none mt-1">{d.getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-base leading-tight mb-2">{event.title}</h4>
                      <p className="text-sm font-medium opacity-80 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> {event.timeRange} น.
                      </p>
                    </div>
                  </div>
                  {canManageEvents && (
                    <div className="mt-4 pt-4 border-t border-black/5 flex justify-end">
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
