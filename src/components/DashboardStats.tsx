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
  const [localAcademicYear, setLocalAcademicYear] = useState<string>("ทั้งหมด");
  const [localSemester, setLocalSemester] = useState<string>("ทั้งหมด");


  const normalizeTerm = (term) => (term || '').replace(/^ภาคเรียนที่\s*/, '').trim();
  const normalizeYear = (year) => (year || '').replace(/^ปีการศึกษา\s*/, '').replace(/^ปี\s*/, '').trim();

  const uniqueYearsMap = new Map();
  records.forEach(r => {
    if (r.academicYear) uniqueYearsMap.set(normalizeYear(r.academicYear), normalizeYear(r.academicYear));
  });
  const uniqueYears = Array.from(uniqueYearsMap.values()).sort().reverse();

  const uniqueSemestersMap = new Map();
  records.forEach(r => {
    if (r.semester) uniqueSemestersMap.set(normalizeTerm(r.semester), normalizeTerm(r.semester));
  });
  const uniqueSemesters = Array.from(uniqueSemestersMap.values()).sort();


  const filteredRecords = records.filter(r => 
    (localAcademicYear === "ทั้งหมด" || normalizeYear(r.academicYear) === normalizeYear(localAcademicYear) || (!r.academicYear && normalizeYear(localAcademicYear) === normalizeYear(systemAcademicYear))) &&
    (localSemester === "ทั้งหมด" || normalizeTerm(r.semester) === normalizeTerm(localSemester) || (!r.semester && normalizeTerm(localSemester) === normalizeTerm(systemSemester)))
  );

  const totalLogs = filteredRecords.length;
  const uniqueGrades = new Set(filteredRecords.map(r => r.gradeLevel)).size;

  const subjectCounts: Record<string, number> = {};
  filteredRecords.forEach(r => {
    const subj = (r.subject === 'อื่นๆ' || r.subject === 'บูรณาการ (PBL)') && r.customSubject ? r.customSubject : r.subject;
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

  const lastLogDate = filteredRecords.length > 0
    ? [...filteredRecords].sort((a,b) => b.date.localeCompare(a.date))[0].date
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
    ...filteredRecords.map(r => {
      const subj = (r.subject === 'อื่นๆ' || r.subject === 'บูรณาการ (PBL)') && r.customSubject ? r.customSubject : r.subject;
      const grade = r.gradeLevel || 'ไม่ระบุชั้น';
      return `${subj}|${grade}`;
    }),
    ...schedules.map(s => {
      const subj = (s.subject === 'อื่นๆ' || s.subject === 'บูรณาการ (PBL)') && s.customSubject ? s.customSubject : s.subject;
      const grade = s.gradeLevel || 'ไม่ระบุชั้น';
      return `${subj}|${grade}`;
    })
  ]);

  const subjectDistribution = Array.from(allSubjectGrades).map(key => {
    const [subj, grade] = key.split('|');
    const logs = filteredRecords.filter(p => 
      (((p.subject === 'อื่นๆ' || p.subject === 'บูรณาการ (PBL)') && p.customSubject === subj) || p.subject === subj) && 
      (p.gradeLevel === grade || (!p.gradeLevel && grade === 'ไม่ระบุชั้น'))
    );
    const scheduledPeriodsPerWeek = schedules.filter(s => 
      ((s.subject === 'อื่นๆ' || s.subject === 'บูรณาการ (PBL)') && s.customSubject ? s.customSubject === subj : s.subject === subj) && 
      (s.gradeLevel === grade || (!s.gradeLevel && grade === 'ไม่ระบุชั้น'))
    ).length;
    const expectedTotalPeriods = scheduledPeriodsPerWeek * WEEKS_PER_SEMESTER;
    
    const hasSchedule = expectedTotalPeriods > 0;
    const percentage = hasSchedule ? Math.min((logs.length / expectedTotalPeriods) * 100, 100) : 0;

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
  const isAcademic = currentTeacher?.role && (currentTeacher.role === 'admin' || currentTeacher.role === 'academic' || currentTeacher.role === 'deputy');

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
  }, [currentTeacher?.id, localSemester, localAcademicYear, systemSemester, systemAcademicYear]);

  const fetchSchedules = async () => {
    setIsLoadingSchedules(true);
    try {
      let conditions = [where('teacherId', '==', currentTeacher?.id)];
      
      const targetSemester = localSemester === "ทั้งหมด" ? systemSemester : localSemester;
      const targetYear = localAcademicYear === "ทั้งหมด" ? systemAcademicYear : localAcademicYear;
      
      // Handle both formats (with or without prefix) for backward compatibility
      const semesterOptions = [targetSemester, `ภาคเรียนที่ ${targetSemester}`];
      const yearOptions = [targetYear, `ปีการศึกษา ${targetYear}`, `ปี ${targetYear}`];
      
      conditions.push(where('semester', 'in', semesterOptions));
      // Note: Firestore doesn't support multiple 'in' clauses easily in a single query
      // but we can filter academicYear client-side after fetching

      const q = query(collection(db, 'schedules'), ...conditions);
      const snapshot = await getDocs(q);
      const scheduleList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherSchedule))
        .filter(s => yearOptions.includes(s.academicYear) || !s.academicYear);
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
      
      {/* Local Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            สรุปข้อมูลสถิติ
          </h2>
          <p className="text-sm text-slate-500">ผลรวมการสอนและข้อมูลสถิติย้อนหลัง</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
          <select
            value={localSemester}
            onChange={(e) => setLocalSemester(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold bg-slate-50 flex-1 sm:flex-none min-w-0"
          >
            <option value="ทั้งหมด">ภาคเรียนทั้งหมด</option>
            {uniqueSemesters.map(term => (
              <option key={term as string} value={term as string}>{`ภาคเรียนที่ ${term}`}</option>
            ))}
          </select>
          <select
            value={localAcademicYear}
            onChange={(e) => setLocalAcademicYear(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold bg-slate-50 flex-1 sm:flex-none min-w-0"
          >
            <option value="ทั้งหมด">ปีการศึกษาทั้งหมด</option>
            {uniqueYears.map(year => (
              <option key={year as string} value={year as string}>{`ปีการศึกษา ${year}`}</option>
            ))}
          </select>
        </div>
      </div>

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric Card 1 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 hover:shadow-md transition duration-200">
          <div className="p-2.5 sm:p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-600">บันทึกทั้งหมด</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 sm:mt-1">{totalLogs} <span className="text-[10px] sm:text-xs font-bold text-slate-500">รายการ</span></p>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 hover:shadow-md transition duration-200">
          <div className="p-2.5 sm:p-3 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-600">ห้องเรียนที่สอน</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 sm:mt-1">{uniqueGrades} <span className="text-[10px] sm:text-xs font-bold text-slate-500">ชั้นเรียน</span></p>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 hover:shadow-md transition duration-200">
          <div className="p-2.5 sm:p-3 bg-amber-50 rounded-xl text-amber-600 shrink-0">
            <Presentation className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-600">วิชาที่สอนบ่อยที่สุด</p>
            <p className="text-sm sm:text-base font-black text-slate-900 mt-0.5 sm:mt-1 truncate max-w-[130px] sm:max-w-none">{topSubject}</p>
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 hover:shadow-md transition duration-200">
          <div className="p-2.5 sm:p-3 bg-rose-50 rounded-xl text-rose-600 shrink-0">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-600">บันทึกล่าสุดเมื่อ</p>
            <p className="text-xs sm:text-sm font-black text-slate-900 mt-1 sm:mt-1.5">{formatThaiDate(lastLogDate)}</p>
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
                        {item.count} {item.hasSchedule ? `/ ${item.expected} คาบ (${Math.round(item.percentage)}%)` : 'คาบ'}
                      </span>
                    </div>
                    {item.hasSchedule ? (
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${item.percentage || 0}%` }}
                        ></div>
                      </div>
                    ) : (
                      <div className="w-full bg-slate-100 flex items-center justify-center h-2.5 rounded-full overflow-hidden relative text-[8px] text-slate-400">
                         ไม่มีข้อมูลตารางสอน
                      </div>
                    )}
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
