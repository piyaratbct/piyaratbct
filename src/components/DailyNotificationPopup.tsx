import React, { useState, useEffect } from 'react';
import { Bell, X, Calendar as CalendarIcon, Clock, Users, ArrowRight } from 'lucide-react';
import { Teacher } from '../types';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

interface DailyNotificationPopupProps {
  currentTeacher: Teacher;
  systemAcademicYear: string;
  systemSemester: string;
  onNavigateToSchedule?: () => void;
  onNavigateToCalendar?: () => void;
}

const getSessionItem = (key: string) => {
  try {
    return getSessionItem(key);
  } catch (e) {
    return null;
  }
};

const setSessionItem = (key: string, value: string) => {
  try {
    setSessionItem(key, value);
  } catch (e) {}
};

export function DailyNotificationPopup({ 
  currentTeacher, 
  systemAcademicYear, 
  systemSemester,
  onNavigateToSchedule,
  onNavigateToCalendar
}: DailyNotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if we should show it (once per day or session, for now we can do once per session using sessionStorage)
    const hasShown = getSessionItem(`daily_popup_${currentTeacher.id}`);
    if (hasShown) {
      return;
    }
    
    const fetchTodayData = async () => {
      setIsLoading(true);
      try {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday...
        
        // Only fetch if it's a weekday
        if (dayOfWeek > 0 && dayOfWeek < 6) {
          
          // Fetch schedules for today
          const scheduleQ = query(
            collection(db, 'schedules'),
            where('teacherId', '==', currentTeacher.id),
            where('academicYear', '==', systemAcademicYear),
            where('semester', '==', systemSemester)
          );
          
          const scheduleSnap = await getDocs(scheduleQ);
          const schedules = scheduleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          
          // Filter for today and sort by period
          const todayClassSchedules = schedules
            .filter(s => s.dayOfWeek === dayOfWeek)
            .sort((a, b) => parseInt(a.period) - parseInt(b.period));
            
          setTodaySchedules(todayClassSchedules);
        }
        
        // Fetch upcoming events for this teacher
        today.setHours(0,0,0,0);
        const inThreeDays = new Date(today);
        inThreeDays.setDate(today.getDate() + 3);
        
        const eventQ = query(
          collection(db, 'schoolEvents')
        );
        
        const eventSnap = await getDocs(eventQ);
        const events = [];
        
        eventSnap.docs.forEach(doc => {
          const data = doc.data();
          const d = new Date(data.date);
          if (d >= today && d <= inThreeDays) {
            events.push({ id: doc.id, ...data });
          }
        });
        
        // Sort events by date
        events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setUpcomingEvents(events);
        
        // Only show if there's something to show
        if (todaySchedules.length > 0 || events.length > 0) {
          setIsVisible(true);
          setSessionItem(`daily_popup_${currentTeacher.id}`, 'true');
        }
      } catch (error) {
        console.error("Error fetching daily data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTodayData();
  }, [currentTeacher.id, systemAcademicYear, systemSemester]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
        >
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h3 className="font-bold text-lg">แจ้งเตือนกิจกรรมวันนี้</h3>
            </div>
            <button 
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-5 overflow-y-auto max-h-[60vh]">
            <div className="mb-2 pb-2 border-b border-slate-100 flex justify-between items-center">
              <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-500" />
                ตารางสอนวันนี้ ({todaySchedules.length} คาบ)
              </h4>
            </div>
            
            {todaySchedules.length > 0 ? (
              <div className="space-y-2 mb-6">
                {todaySchedules.map(schedule => (
                  <div key={schedule.id} className="flex items-center p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                    <div className="bg-indigo-100 text-indigo-700 font-black h-10 w-10 rounded-lg flex items-center justify-center shrink-0">
                      คาบ {schedule.period}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="font-bold text-slate-800 text-sm truncate">{schedule.subject}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <Users className="h-3 w-3" /> {schedule.gradeLevel}
                      </div>
                    </div>
                  </div>
                ))}
                {onNavigateToSchedule && (
                  <button 
                    onClick={() => {
                      setIsVisible(false);
                      onNavigateToSchedule();
                    }}
                    className="w-full mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 py-1"
                  >
                    ดูตารางสอนทั้งหมด <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-500 py-3 mb-6 bg-slate-50 rounded-xl text-center border border-slate-100">
                วันนี้ไม่มีตารางสอน
              </div>
            )}
            
            <div className="mb-2 pb-2 border-b border-slate-100 flex justify-between items-center">
              <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-amber-500" />
                กิจกรรมสำคัญของโรงเรียนใน 3 วันนี้
              </h4>
            </div>
            
            {upcomingEvents.length > 0 ? (
              <div className="space-y-2">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="font-bold text-slate-800 text-sm">{event.title}</div>
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                      <Clock className="h-3 w-3" /> {event.timeRange}
                      <span className="mx-1">•</span>
                      <span>{new Date(event.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                ))}
                {onNavigateToCalendar && (
                  <button 
                    onClick={() => {
                      setIsVisible(false);
                      onNavigateToCalendar();
                    }}
                    className="w-full mt-2 text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center justify-center gap-1 py-1"
                  >
                    ดูปฏิทินกิจกรรม <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-500 py-3 bg-slate-50 rounded-xl text-center border border-slate-100">
                ไม่มีกิจกรรมสำคัญของโรงเรียนใน 3 วันนี้
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button 
              onClick={() => setIsVisible(false)}
              className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-colors"
            >
              รับทราบ
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
