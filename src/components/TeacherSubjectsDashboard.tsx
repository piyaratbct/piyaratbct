import React, { useState, useEffect } from 'react';
import { Teacher, TeacherSchedule } from '../types';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Calculator, BookOpen, Users, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { sortSubjects } from '../types';

interface TeacherSubjectsDashboardProps {
  currentTeacher: Teacher;
  systemSemester: string;
  systemAcademicYear: string;
  onNavigateToSubject?: (subjectName: string, gradeLevel: string) => void;
  onAction?: (action: 'gradebook' | 'plans' | 'logs' | 'attendance', subjectName: string, gradeLevel: string) => void;
}

interface SubjectGroup {
  subjectName: string;
  gradeLevel: string;
  periods: number;
  days: number[];
}

export const TeacherSubjectsDashboard: React.FC<TeacherSubjectsDashboardProps> = ({
  currentTeacher,
  systemSemester,
  systemAcademicYear,
  onNavigateToSubject,
  onAction
}) => {
  const [schedules, setSchedules] = useState<TeacherSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentTeacher || !currentTeacher.id) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'schedules'),
      where('teacherId', '==', currentTeacher.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: TeacherSchedule[] = [];
      snapshot.forEach(doc => {
        const data = doc.data() as TeacherSchedule;
        if (data.semester === systemSemester && data.academicYear === systemAcademicYear) {
          fetched.push({ id: doc.id, ...data });
        }
      });
      setSchedules(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching schedules:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentTeacher.id, systemSemester, systemAcademicYear]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Group schedules
  const groups: Record<string, SubjectGroup> = {};
  
  schedules.forEach(s => {
    const subName = s.subject === 'อื่นๆ' ? (s.customSubject || 'อื่นๆ') : s.subject;
    const key = `${subName}_${s.gradeLevel}`;
    
    if (!groups[key]) {
      groups[key] = {
        subjectName: subName,
        gradeLevel: s.gradeLevel,
        periods: 0,
        days: []
      };
    }
    groups[key].periods += 1;
    if (!groups[key].days.includes(s.dayOfWeek)) {
      groups[key].days.push(s.dayOfWeek);
    }
  });

  const subjectCards = Object.values(groups).sort((a, b) => {
    const currA = { subjectName: a.subjectName };
    const currB = { subjectName: b.subjectName };
    const subSort = sortSubjects(currA, currB);
    if (subSort !== 0) return subSort;
    return a.gradeLevel.localeCompare(b.gradeLevel);
  });

  if (subjectCards.length === 0) {
    return (
      <div className="bg-white/60 p-6 rounded-3xl border border-dashed border-slate-300 shadow-sm mb-6 relative overflow-hidden backdrop-blur-sm flex flex-col items-center justify-center text-center py-12">
        <div className="h-16 w-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-slate-700 mb-2">รายวิชาที่ฉันสอน (My Subjects)</h2>
        <p className="text-sm font-medium text-slate-500 max-w-md mx-auto">
          ไม่พบข้อมูลรายวิชาที่คุณรับผิดชอบในภาคเรียนที่ {systemSemester}/{systemAcademicYear} 
          <br/>(ระบบจะแสดงการ์ดรายวิชาที่นี่อัตโนมัติ เมื่อฝ่ายวิชาการจัดตารางสอนให้คุณแล้ว)
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm mb-6 relative overflow-hidden backdrop-blur-sm">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100 to-transparent rounded-full -mr-32 -mt-32 opacity-50 pointer-events-none"></div>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800">รายวิชาที่ฉันสอน (My Subjects)</h2>
          <p className="text-sm font-medium text-slate-500">ภาคเรียนที่ {systemSemester}/{systemAcademicYear}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10">
        {subjectCards.map((card, idx) => (
          <div 
            key={idx}
            className="group relative bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 overflow-hidden flex flex-col h-full"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            
            <div className="mb-4 relative z-10">
              <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-100 mb-3">
                {card.gradeLevel}
              </span>
              <h3 className="font-black text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                {card.subjectName}
              </h3>
              <div className="flex items-center text-xs font-medium text-slate-500 mt-2">
                <Clock className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                สอน {card.periods} คาบ/สัปดาห์
              </div>
            </div>
            
            <div className="mt-auto space-y-2 pt-4 border-t border-slate-100 relative z-10">
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => onAction && onAction('gradebook', card.subjectName, card.gradeLevel)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors border border-emerald-100"
                >
                  <Calculator className="h-3.5 w-3.5" />
                  สมุดบันทึกคะแนน
                </button>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => onAction && onAction('attendance', card.subjectName, card.gradeLevel)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg text-xs font-bold transition-colors border border-pink-100"
                  >
                    <Users className="h-3.5 w-3.5" />
                    เช็คชื่อ
                  </button>
                  <button 
                    onClick={() => onAction && onAction('plans', card.subjectName, card.gradeLevel)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors border border-blue-100"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    แผน
                  </button>
                  <button 
                    onClick={() => onAction && onAction('logs', card.subjectName, card.gradeLevel)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold transition-colors border border-purple-100"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    บันทึกสอน
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
