import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Teacher, TeacherSchedule } from '../types';

const WEEKDAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const MONTH_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
import { PERIODS } from '../types';
const periodsOrder = PERIODS;

interface OverviewCalendarProps {
  currentTeacher: Teacher;
  systemSemester: string;
  systemAcademicYear: string;
  onNavigateToCalendar?: () => void;
}

export function OverviewCalendar({ currentTeacher, systemSemester, systemAcademicYear, onNavigateToCalendar }: OverviewCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };
  
  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  const [todaySchedules, setTodaySchedules] = useState<TeacherSchedule[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getDayName = (date: Date) => WEEKDAYS[date.getDay()];
  const getMonthName = (date: Date) => MONTHS[date.getMonth()];
  const formattedDate = `${getDayName(currentDate)}ที่ ${currentDate.getDate()} ${getMonthName(currentDate)} ${(currentDate.getFullYear() + 543)}`;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch Today's Schedules
        if (currentTeacher?.id) {
          const targetDayOfWeek = currentDate.getDay();
          const qSched = query(
            collection(db, 'schedules'),
            where('teacherId', '==', currentTeacher.id),
            where('semester', '==', systemSemester),
            where('academicYear', '==', systemAcademicYear)
          );
          const schedSnap = await getDocs(qSched);
          const schedList = schedSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as TeacherSchedule))
            .filter(s => s.dayOfWeek === targetDayOfWeek)
            .sort((a, b) => periodsOrder.indexOf(a.period) - periodsOrder.indexOf(b.period));
          setTodaySchedules(schedList);
        }

        // Fetch Upcoming Events
        // Since we want upcoming, we can filter by date >= today. But for now, we just fetch all and filter in memory to avoid missing indexes
        const qEvents = query(collection(db, 'schoolEvents'), orderBy('date', 'asc'));
        const eventSnap = await getDocs(qEvents);
        const todayStr = currentDate.toISOString().split('T')[0];
        const eventList = eventSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as any))
          .filter(e => e.date >= todayStr)
          .slice(0, 5); // Take up to 5 upcoming
        setUpcomingEvents(eventList);

      } catch (err) {
        console.error('Error fetching calendar data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentTeacher, systemSemester, systemAcademicYear, currentDate]);

  const getColorByType = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'exam': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-pink-50 text-pink-700 border-pink-200';
    }
  };

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
              <h3 className="text-lg font-black text-slate-800">ตารางสอน</h3>
              <p className="text-sm font-medium text-slate-500">{formattedDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrevDay} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={handleToday} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold">
              วันนี้
            </button>
            <button onClick={handleNextDay} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 flex-1">
          {isLoading ? (
             <div className="text-center text-slate-500 text-sm py-12">กำลังโหลดข้อมูล...</div>
          ) : todaySchedules.length === 0 ? (
             <div className="text-center text-slate-500 text-sm py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
               ไม่มีคาบสอนในวันนี้ พักผ่อนได้เลย! 🎉
             </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
              {todaySchedules.map((session) => (
                <div key={session.id} className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-white bg-indigo-500 shadow-sm"></div>
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <span className="text-indigo-600 font-bold text-sm bg-indigo-50 px-2 py-1 rounded-md w-fit">
                        {session.period}
                      </span>
                    </div>
                    <h4 className="font-black text-slate-800 text-lg mb-1 group-hover:text-indigo-600 transition-colors">{session.subject}</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium mt-3">
                      <BookOpen className="h-4 w-4 text-slate-400" />
                      ชั้น {session.gradeLevel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            <p className="text-sm font-medium text-slate-500">ที่กำลังจะมาถึง</p>
          </div>
        </div>
        
        <div className="p-6 flex-1 flex flex-col">
          {isLoading ? (
            <div className="text-center text-slate-500 text-sm py-12">กำลังโหลดข้อมูล...</div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex-1">
              ยังไม่มีกิจกรรมในเร็วๆ นี้
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map(event => {
                const d = new Date(event.date);
                return (
                  <div key={event.id} className={`p-4 rounded-xl border ${getColorByType(event.type)} transition-all hover:scale-[1.02] cursor-pointer`}>
                    <div className="flex gap-4 items-center">
                      <div className="flex flex-col items-center justify-center bg-white/60 rounded-lg p-2 min-w-[3.5rem] backdrop-blur-sm">
                        <span className="text-xs font-bold uppercase opacity-80">{MONTH_ABBR[d.getMonth()]}</span>
                        <span className="text-2xl font-black leading-none mt-1">{d.getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-base leading-tight mb-1">{event.title}</h4>
                        <p className="text-sm font-medium opacity-80 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {event.timeRange} น.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {onNavigateToCalendar && (
            <button 
              onClick={onNavigateToCalendar}
              className="w-full mt-6 py-3 border border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-slate-50 hover:text-indigo-600 transition-colors text-sm"
            >
              ไปที่ปฏิทินวิชาการ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
