import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LessonRecord, SUBJECTS, Teacher, TeacherSchedule, PERIODS } from '../types';
import { BookOpen, GraduationCap, Calendar, Clock, BarChart3, Presentation, Bell, CalendarDays } from 'lucide-react';

interface DashboardStatsProps {
  records: LessonRecord[];
  currentTeacher?: Teacher | null;
  teachers?: Teacher[];
  systemSemester?: string;
  systemAcademicYear?: string;
}

export function DashboardStats({ records, currentTeacher, teachers, systemSemester = 'ภาคเรียนที่ 1/2567', systemAcademicYear = '2567' }: DashboardStatsProps) {
  const [schedules, setSchedules] = useState<TeacherSchedule[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

  const totalLogs = records.length;
  const uniqueGrades = new Set(records.map(r => r.gradeLevel)).size;

  const subjectCounts: Record<string, number> = {};
  records.forEach(r => {
    const subj = r.subject === 'อื่นๆ' && r.customSubject ? r.customSubject : r.subject;
    subjectCounts[subj] = (subjectCounts[subj] || 0) + 1;
  });

  let topSubject = 'ยังไม่มีข้อมูล';
  let topCount = 0;
  Object.entries(subjectCounts).forEach(([subj, count]) => {
    if (count > topCount) {
      topSubject = subj;
      topCount = count;
    }
  });

  const lastLogDate = records.length > 0
    ? [...records].sort((a,b) => b.date.localeCompare(a.date))[0].date
    : null;

  const formatThaiDate = (dateString: string | null) => {
    if (!dateString) return 'ไม่มีข้อมูล';
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0]) + 543;
      const month = months[parseInt(parts[1]) - 1];
      const day = parseInt(parts[2]);
      return `${day} ${month} ${year}`;
    }
    return dateString;
  };

  const WEEKS_PER_SEMESTER = 20; // จำนวนสัปดาห์ใน 1 ภาคเรียน (โดยประมาณ)
  const allSubjectGrades = new Set([
    ...records.map(r => {
      const subj = r.subject === 'อื่นๆ' && r.customSubject ? r.customSubject : r.subject;
      const grade = r.gradeLevel || 'ไม่ระบุชั้น';
      return `${subj}|${grade}`;
    }),
    ...schedules.map(s => {
      const subj = s.subject;
      const grade = s.gradeLevel || 'ไม่ระบุชั้น';
      return `${subj}|${grade}`;
    })
  ]);

  const subjectDistribution = Array.from(allSubjectGrades).map(key => {
    const [subj, grade] = key.split('|');
    const logs = records.filter(p => 
      ((p.subject === 'อื่นๆ' && p.customSubject === subj) || p.subject === subj) && 
      (p.gradeLevel === grade || (!p.gradeLevel && grade === 'ไม่ระบุชั้น'))
    );
    const scheduledPeriodsPerWeek = schedules.filter(s => s.subject === subj && (s.gradeLevel === grade || (!s.gradeLevel && grade === 'ไม่ระบุชั้น'))).length;
    const expectedTotalPeriods = scheduledPeriodsPerWeek * WEEKS_PER_SEMESTER;
    
    const hasSchedule = expectedTotalPeriods > 0;
    const percentage = hasSchedule 
      ? Math.min((logs.length / expectedTotalPeriods) * 100, 100) 
      : (totalLogs > 0 ? (logs.length / totalLogs) * 100 : 0);

    return {
      key: key,
      name: subj,
      grade: grade,
      count: logs.length,
      expected: expectedTotalPeriods,
      percentage: percentage,
      hasSchedule: hasSchedule
    };
  }).sort((a, b) => {
    if (a.grade !== b.grade) return a.grade.localeCompare(b.grade);
    return a.name.localeCompare(b.name);
  });

  const pendingApprovals = records.filter(r => r.teacherSigned && !r.deptHeadApproved);
  
  const pendingCount = pendingApprovals.length;
  const isAcademic = currentTeacher?.role && currentTeacher.role !== 'teacher';

  const pendingTeachers = Array.from(
    new Set(
      pendingApprovals
        .map(r => teachers?.find(t => t.id === r.teacherId)?.displayName)
        .filter((name): name is string => !!name)
    )
  );

  useEffect(() => {
    if (currentTeacher?.id) {
      fetchSchedules();
    }
  }, [currentTeacher?.id, systemSemester, systemAcademicYear]);

  const fetchSchedules = async () => {
    setIsLoadingSchedules(true);
    try {
      const q = query(
        collection(db, 'schedules'), 
        where('teacherId', '==', currentTeacher?.id),
        where('semester', '==', systemSemester),
        where('academicYear', '==', systemAcademicYear)
      );
      const snapshot = await getDocs(q);
      const scheduleList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherSchedule));
      setSchedules(scheduleList);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  const todayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const todaySchedules = schedules.filter(s => s.dayOfWeek === todayIndex);
  
  // Sort by period roughly
  const periodsOrder = PERIODS;
  todaySchedules.sort((a, b) => periodsOrder.indexOf(a.period) - periodsOrder.indexOf(b.period));

  return (
    <div className="space-y-6">

      {isAcademic && pendingCount > 0 && (
        <div id="academic-pending-alert" className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-3xs animate-pulse-once">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl mt-0.5 sm:mt-0 flex-shrink-0">
              <Bell className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-950 flex items-center gap-1.5 font-sans leading-none sm:leading-normal">
                แจ้งเตือนสำหรับฝ่ายวิชาการ
              </h4>
              <p className="text-xs text-amber-850 font-medium mt-1">
                มีบันทึกหลังสอนสะสมจำนวน <span className="font-extrabold text-amber-900 text-sm underline decoration-amber-450 decoration-2">{pendingCount} ชิ้นงาน</span> ที่คุณครูส่งตรวจแล้ว และ<strong>รอการลงชื่ออนุมัติ / ตรวจรับรองผลการจัดการเรียนการสอน</strong>
              </p>
              {pendingTeachers.length > 0 && (
                <p className="text-[10px] text-amber-700 font-semibold mt-1.5 flex items-center gap-1">
                  <span className="bg-amber-200/60 px-1.5 py-0.5 rounded text-amber-800 text-[9px]">รายชื่อคุณครู:</span> {pendingTeachers.join(', ')}
                </p>
              )}
            </div>
          </div>
          <div className="w-full sm:w-auto flex-shrink-0">
            <div className="text-[10px] font-bold text-amber-800 bg-white/80 border border-amber-200 px-3 py-1.5 rounded-xl block text-center sm:text-left shadow-2xs">
              👈 เลื่อนลงไปดูประวัติเพื่อลงชื่ออนุมัติ
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition duration-200">
          <div className="p-3 bg-blue-55 rounded-xl bg-blue-50 text-blue-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-600">บันทึกทั้งหมด</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalLogs} <span className="text-xs font-bold text-slate-500">รายการ</span></p>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition duration-200">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-600">ห้องเรียนที่สอน</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{uniqueGrades} <span className="text-xs font-bold text-slate-500">ชั้นเรียน</span></p>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition duration-200">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Presentation className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-600">วิชาที่สอนบ่อยที่สุด</p>
            <p className="text-base font-black text-slate-900 mt-1 truncate max-w-[130px] sm:max-w-none">{topSubject}</p>
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition duration-200">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-600">บันทึกล่าสุดเมื่อ</p>
            <p className="text-sm font-black text-slate-900 mt-1.5">{formatThaiDate(lastLogDate)}</p>
          </div>
        </div>
      </div>

      {/* Visual Chart Bento Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-slate-500" />
          สรุปภาพรวมแยกตามวิชา
        </h3>
        
        {totalLogs === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            เขียนบันทึกวิชาแรกของคุณเพื่อดูสถิติได้ที่นี่
          </div>
        ) : (
          <div className="max-w-3xl space-y-4">
            <div className="space-y-3.5">
              {subjectDistribution.map((item, index) => {
                const colors = [
                  'bg-blue-500', 
                  'bg-indigo-500', 
                  'bg-emerald-500', 
                  'bg-amber-500', 
                  'bg-rose-500',
                  'bg-sky-500'
                ];
                const barColor = colors[index % colors.length];

                return (
                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-slate-600">
                        {item.name} <span className="text-indigo-600 font-bold ml-1">({item.grade})</span>
                        {item.hasSchedule && <span className="text-xs text-slate-400 font-normal ml-1">(ตามตารางสอน)</span>}
                      </span>
                      <span className="text-slate-900 font-bold">
                        {item.count} {item.hasSchedule ? `/ ${item.expected}` : ''} คาบ ({Math.round(item.percentage)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${item.percentage || 1}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
