import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Teacher } from '../types';

const WEEKDAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

// Mock teaching schedule for the day
const MOCK_SCHEDULE = [
  { id: 1, time: '08:30 - 09:30', subject: 'คณิตศาสตร์พื้นฐาน', grade: 'ป.4/1', room: 'ห้อง 401', period: 'คาบ 1' },
  { id: 2, time: '09:30 - 10:30', subject: 'วิทยาศาสตร์', grade: 'ป.4/1', room: 'ห้อง 401', period: 'คาบ 2' },
  { id: 3, time: '10:30 - 11:30', subject: 'ภาษาไทย', grade: 'ป.5/2', room: 'ห้อง 502', period: 'คาบ 3' },
  { id: 4, time: '13:00 - 14:00', subject: 'ลูกเสือ-เนตรนารี', grade: 'ป.4-6', room: 'ลานอเนกประสงค์', period: 'คาบ 5' },
];

// Mock school events
const MOCK_EVENTS = [
  { id: 1, date: new Date(Date.now() + 86400000 * 2), title: 'ประชุมผู้ปกครองภาคเรียนที่ 1', type: 'meeting', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 2, date: new Date(Date.now() + 86400000 * 5), title: 'กิจกรรมวันไหว้ครู', type: 'activity', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { id: 3, date: new Date(Date.now() + 86400000 * 12), title: 'สอบกลางภาคเรียนที่ 1', type: 'exam', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

interface SchoolEventCalendarProps {
  currentTeacher?: Teacher;
}

export function SchoolEventCalendar({ currentTeacher }: SchoolEventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDayName = (date: Date) => WEEKDAYS[date.getDay()];
  const getMonthName = (date: Date) => MONTHS[date.getMonth()];
  
  const formattedDate = `${getDayName(currentDate)}ที่ ${currentDate.getDate()} ${getMonthName(currentDate)} ${(currentDate.getFullYear() + 543)}`;

  const notifiedPeriods = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!currentTeacher) return;

    const checkAttendance = async () => {
      const now = new Date();
      
      for (const session of MOCK_SCHEDULE) {
        if (notifiedPeriods.current.has(session.id)) continue;

        // Parse end time (e.g. "09:30")
        const [, endTimeStr] = session.time.split(' - ');
        if (!endTimeStr) continue;

        const [endHour, endMinute] = endTimeStr.split(':').map(Number);
        const endTime = new Date(now);
        endTime.setHours(endHour, endMinute, 0, 0);

        // If current time is past the end time of the period
        if (now > endTime) {
          try {
            // Check if attendance was taken today for this gradeLevel and period
            const todayStr = now.toISOString().split('T')[0];
            const q = query(
              collection(db, 'attendanceSessions'),
              where('gradeLevel', '==', session.grade),
              where('date', '==', todayStr),
              where('period', '==', session.period)
            );
            
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
              // Not checked! Fire toast
              window.dispatchEvent(new CustomEvent('app-custom-toast', {
                detail: {
                  message: `คุณครูยังไม่ได้เช็คชื่อวิชา ${session.subject} (${session.period}) ที่หมดเวลาเรียนแล้ว!`,
                  type: 'warning',
                  title: 'แจ้งเตือนการเช็คชื่อ'
                }
              }));
            }
            
            // Mark as notified so we don't spam
            notifiedPeriods.current.add(session.id);
          } catch (err) {
            console.error('Error checking attendance reminder:', err);
          }
        }
      }
    };

    // Check immediately, then every 1 minute
    checkAttendance();
    const interval = setInterval(checkAttendance, 60 * 1000);
    return () => clearInterval(interval);
  }, [currentTeacher]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Teaching Schedule */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">ตารางสอนวันนี้</h3>
              <p className="text-sm font-medium text-slate-500">{formattedDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold">
              วันนี้
            </button>
            <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 flex-1">
          <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
            {MOCK_SCHEDULE.map((session) => (
              <div key={session.id} className="relative pl-6">
                <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-white bg-indigo-500 shadow-sm"></div>
                <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="text-indigo-600 font-bold text-sm bg-indigo-50 px-2 py-1 rounded-md w-fit">
                      {session.time}
                    </span>
                    <span className="text-slate-500 font-semibold text-sm flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {session.room}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-800 text-lg mb-1 group-hover:text-indigo-600 transition-colors">{session.subject}</h4>
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    ชั้น {session.grade}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-pink-50/50 flex items-center gap-3">
          <div className="h-10 w-10 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">กิจกรรมสำคัญ</h3>
            <p className="text-sm font-medium text-slate-500">ในเดือนนี้</p>
          </div>
        </div>
        
        <div className="p-6 flex-1">
          <div className="space-y-4">
            {MOCK_EVENTS.map(event => {
              const d = event.date;
              return (
                <div key={event.id} className={`p-4 rounded-xl border ${event.color} transition-all hover:scale-[1.02] cursor-pointer`}>
                  <div className="flex gap-4 items-center">
                    <div className="flex flex-col items-center justify-center bg-white/60 rounded-lg p-2 min-w-[3.5rem] backdrop-blur-sm">
                      <span className="text-xs font-bold uppercase opacity-80">{MONTHS[d.getMonth()].substring(0, 3)}</span>
                      <span className="text-2xl font-black">{d.getDate()}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base leading-tight mb-1">{event.title}</h4>
                      <p className="text-sm font-medium opacity-80 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> 08:00 - 16:00 น.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <button className="w-full mt-6 py-3 border border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-slate-50 hover:text-indigo-600 transition-colors text-sm">
            + ดูปฏิทินทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
}
