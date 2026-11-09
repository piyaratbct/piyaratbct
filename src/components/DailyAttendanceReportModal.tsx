import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Student, Teacher, AttendanceSession, GRADE_LEVELS } from '../types';
import { Printer, X, Calendar, Users, UserCheck, UserX, AlertCircle, Phone, RefreshCw, LayoutTemplate } from 'lucide-react';
import { PDFPrintHelper, PrintPageContainer, PrintHeader, PrintSignatureBox } from './PDFPrintHelper';
import { SchoolLogo } from './PrintTemplate';

interface DailyAttendanceReportModalProps {
  initialDate?: string;
  semester?: string;
  academicYear?: string;
  students: Student[];
  teachers?: Teacher[];
  currentTeacher?: Teacher;
  onClose: () => void;
}

interface GradeAttendanceStat {
  gradeLevel: string;
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  
  presentTotal: number;
  presentMale: number;
  presentFemale: number;
  
  absentTotal: number;
  absentMale: number;
  absentFemale: number;
  
  sickTotal: number;
  sickMale: number;
  sickFemale: number;
  
  leaveTotal: number;
  leaveMale: number;
  leaveFemale: number;
  
  lateTotal: number;
  lateMale: number;
  lateFemale: number;
  
  unattendedTotal: number; // absent + sick + leave
  attendanceRate: number;  // (presentTotal / totalStudents) * 100
  
  homeroomTeacherName?: string;
  hasRecord: boolean;
}

interface AbsentStudentDetail {
  id: string;
  studentId: string;
  number?: number;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  gradeLevel: string;
  status: 'absent' | 'sick' | 'leave' | 'late';
  parentPhone?: string;
  note?: string;
}

export const DailyAttendanceReportModal: React.FC<DailyAttendanceReportModalProps> = ({
  initialDate,
  semester = '1',
  academicYear = '2567',
  students,
  teachers = [],
  currentTeacher,
  onClose,
}) => {
  // Format today's date in YYYY-MM-DD
  const defaultDate = initialDate || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [viewSemester, setViewSemester] = useState<string>(semester);
  const [viewAcademicYear, setViewAcademicYear] = useState<string>(academicYear);
  const [layout, setLayout] = useState<'portrait' | 'landscape'>('portrait');
  const [showAbsentList, setShowAbsentList] = useState<boolean>(true);
  const [showSignatures, setShowSignatures] = useState<boolean>(true);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<{
    name: string;
    subDistrict: string;
    district: string;
    province: string;
    affiliation: string;
  }>({
    name: 'โรงเรียนศิริมงคลศึกษา บางบัวทอง',
    subDistrict: 'บางบัวทอง',
    district: 'บางบัวทอง',
    province: 'นนทบุรี',
    affiliation: 'สำนักงานคณะกรรมการส่งเสริมการศึกษาเอกชน'
  });

  // Helper to ensure school name has 'โรงเรียน' prefix
  const formatSchoolName = (name?: string) => {
    if (!name) return 'โรงเรียนศิริมงคลศึกษา บางบัวทอง';
    const trimmed = name.trim();
    if (trimmed.startsWith('โรงเรียน')) return trimmed;
    return `โรงเรียน${trimmed}`;
  };

  // Load school info
  useEffect(() => {
    const fetchSchoolConfig = async () => {
      try {
        const snap = await getDoc(doc(db, 'config', 'school'));
        if (snap.exists()) {
          const d = snap.data();
          setSchoolInfo({
            name: formatSchoolName(d.schoolName),
            subDistrict: d.schoolSubDistrict || 'บางบัวทอง',
            district: d.schoolDistrict || 'บางบัวทอง',
            province: d.schoolProvince || 'นนทบุรี',
            affiliation: d.schoolAffiliation || 'สำนักงานคณะกรรมการส่งเสริมการศึกษาเอกชน'
          });
        }
      } catch (err) {
        console.error('Error fetching school config:', err);
      }
    };
    fetchSchoolConfig();
  }, []);

  // Fetch attendance sessions for selected date
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'attendanceSessions'),
        where('date', '==', selectedDate)
      );
      const snapshot = await getDocs(q);
      const fetched: AttendanceSession[] = [];
      snapshot.forEach(docSnap => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as AttendanceSession);
      });
      setSessions(fetched);
    } catch (err) {
      console.error('Error fetching attendance for daily report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [selectedDate]);

  // Helper to get helper gender
  const getGender = (s: Student): 'male' | 'female' => {
    if (s.gender === 'male' || s.gender === 'female') return s.gender;
    if (s.firstName.startsWith('เด็กชาย') || s.firstName.startsWith('นาย') || s.firstName.startsWith('ด.ช.')) return 'male';
    return 'female';
  };

  // Only active students (strictly exclude transferred or resigned students)
  const activeStudents = useMemo(() => {
    return students.filter(s => s.status !== 'inactive' && s.status !== 'graduated');
  }, [students]);

  // Determine all grades to display
  const allGrades = useMemo(() => {
    const studentGrades = new Set(activeStudents.map(s => s.gradeLevel));
    const hideIfEmpty = ['ประถมศึกษาปีที่ 1', 'ประถมศึกษาปีที่ 2'];
    const standardGrades = GRADE_LEVELS.filter(g => !hideIfEmpty.includes(g) || studentGrades.has(g));
    const extraGrades = Array.from(studentGrades).filter(g => typeof g === 'string' && !GRADE_LEVELS.includes(g) && g !== 'จบการศึกษา') as string[];
    extraGrades.sort();
    return [...standardGrades, ...extraGrades];
  }, [activeStudents]);

  // Map of authoritative attendance session per grade
  const gradeSessionMap = useMemo(() => {
    const map = new Map<string, AttendanceSession>();
    sessions.forEach(session => {
      const existing = map.get(session.gradeLevel);
      if (!existing) {
        map.set(session.gradeLevel, session);
      } else {
        // Priority 1: Homeroom session
        const isHomeroom = session.period && session.period.includes('โฮมรูม');
        const isExistingHomeroom = existing.period && existing.period.includes('โฮมรูม');
        if (isHomeroom && !isExistingHomeroom) {
          map.set(session.gradeLevel, session);
        } else if (isHomeroom === isExistingHomeroom) {
          // Priority 2: Latest updated
          if (new Date(session.updatedAt || session.createdAt) > new Date(existing.updatedAt || existing.createdAt)) {
            map.set(session.gradeLevel, session);
          }
        }
      }
    });
    return map;
  }, [sessions]);

  // Compute stats per grade
  const gradeStats = useMemo(() => {
    const stats: GradeAttendanceStat[] = [];
    
    allGrades.forEach(grade => {
      const gradeStudents = activeStudents.filter(s => s.gradeLevel === grade);
      const session = gradeSessionMap.get(grade);
      const attendanceData = session?.attendanceData || {};
      const hasRecord = !!session;

      // Find teacher
      const homeroomTeacher = teachers.find(t => t.homeroomClass === grade || t.coHomeroomClass === grade);
      const teacherName = session?.teacherName || homeroomTeacher?.thaiName || homeroomTeacher?.displayName || '-';

      let maleCount = 0;
      let femaleCount = 0;
      let presentMale = 0, presentFemale = 0;
      let absentMale = 0, absentFemale = 0;
      let sickMale = 0, sickFemale = 0;
      let leaveMale = 0, leaveFemale = 0;
      let lateMale = 0, lateFemale = 0;

      gradeStudents.forEach(st => {
        const isM = getGender(st) === 'male';
        if (isM) maleCount++;
        else femaleCount++;

        const stStatus = attendanceData[st.id];

        if (stStatus === 'present') {
          if (isM) presentMale++;
          else presentFemale++;
        } else if (stStatus === 'late') {
          if (isM) {
            lateMale++;
            presentMale++; // late counts towards attendance
          } else {
            lateFemale++;
            presentFemale++;
          }
        } else if (stStatus === 'absent') {
          if (isM) absentMale++;
          else absentFemale++;
        } else if (stStatus === 'sick') {
          if (isM) sickMale++;
          else sickFemale++;
        } else if (stStatus === 'leave') {
          if (isM) leaveMale++;
          else leaveFemale++;
        } else if (hasRecord) {
          // If session exists but student not marked, consider as absent or unmarked
          // Usually teachers check all or mark present, keep as absent if session recorded
        }
      });

      const totalCount = gradeStudents.length;
      const presentTotal = presentMale + presentFemale;
      const absentTotal = absentMale + absentFemale;
      const sickTotal = sickMale + sickFemale;
      const leaveTotal = leaveMale + leaveFemale;
      const lateTotal = lateMale + lateFemale;
      const unattendedTotal = absentTotal + sickTotal + leaveTotal;
      const attendanceRate = totalCount > 0 ? (presentTotal / totalCount) * 100 : 0;

      stats.push({
        gradeLevel: grade,
        totalStudents: totalCount,
        maleStudents: maleCount,
        femaleStudents: femaleCount,
        presentTotal,
        presentMale,
        presentFemale,
        absentTotal,
        absentMale,
        absentFemale,
        sickTotal,
        sickMale,
        sickFemale,
        leaveTotal,
        leaveMale,
        leaveFemale,
        lateTotal,
        lateMale,
        lateFemale,
        unattendedTotal,
        attendanceRate,
        homeroomTeacherName: teacherName,
        hasRecord,
      });
    });

    return stats;
  }, [allGrades, activeStudents, gradeSessionMap, teachers]);

  // Absent & Leave students list for follow-up
  const absentStudentsList = useMemo(() => {
    const list: AbsentStudentDetail[] = [];
    allGrades.forEach(grade => {
      const session = gradeSessionMap.get(grade);
      if (!session || !session.attendanceData) return;
      const gradeStudents = activeStudents.filter(s => s.gradeLevel === grade);
      
      gradeStudents.forEach(st => {
        const stStatus = session.attendanceData[st.id];
        if (stStatus === 'absent' || stStatus === 'sick' || stStatus === 'leave' || stStatus === 'late') {
          list.push({
            id: st.id,
            studentId: st.studentId,
            number: st.number,
            firstName: st.firstName,
            lastName: st.lastName,
            gender: getGender(st),
            gradeLevel: st.gradeLevel,
            status: stStatus,
            parentPhone: st.parentPhone || st.fatherPhone || st.motherPhone,
            note: st.additionalNotes,
          });
        }
      });
    });

    // Sort by gradeLevel then number
    return list.sort((a, b) => {
      if (a.gradeLevel !== b.gradeLevel) return a.gradeLevel.localeCompare(b.gradeLevel);
      return (a.number || 0) - (b.number || 0);
    });
  }, [allGrades, gradeSessionMap, activeStudents]);

  // Overall totals
  const totals = useMemo(() => {
    let totalAll = 0, maleAll = 0, femaleAll = 0;
    let presentAll = 0, presentM = 0, presentF = 0;
    let absentAll = 0, absentM = 0, absentF = 0;
    let sickAll = 0, sickM = 0, sickF = 0;
    let leaveAll = 0, leaveM = 0, leaveF = 0;
    let lateAll = 0, lateM = 0, lateF = 0;

    // Sub-totals for Kindergarten & Primary
    let kgTotal = 0, kgPresent = 0, kgAbsent = 0;
    let prTotal = 0, prPresent = 0, prAbsent = 0;

    gradeStats.forEach(st => {
      totalAll += st.totalStudents;
      maleAll += st.maleStudents;
      femaleAll += st.femaleStudents;

      presentAll += st.presentTotal;
      presentM += st.presentMale;
      presentF += st.presentFemale;

      absentAll += st.absentTotal;
      absentM += st.absentMale;
      absentF += st.absentFemale;

      sickAll += st.sickTotal;
      sickM += st.sickMale;
      sickF += st.sickFemale;

      leaveAll += st.leaveTotal;
      leaveM += st.leaveMale;
      leaveF += st.leaveFemale;

      lateAll += st.lateTotal;
      lateM += st.lateMale;
      lateF += st.lateFemale;

      if (st.gradeLevel.includes('อนุบาล')) {
        kgTotal += st.totalStudents;
        kgPresent += st.presentTotal;
        kgAbsent += st.unattendedTotal;
      } else {
        prTotal += st.totalStudents;
        prPresent += st.presentTotal;
        prAbsent += st.unattendedTotal;
      }
    });

    const unattendedAll = absentAll + sickAll + leaveAll;
    const rateAll = totalAll > 0 ? (presentAll / totalAll) * 100 : 0;
    const kgRate = kgTotal > 0 ? (kgPresent / kgTotal) * 100 : 0;
    const prRate = prTotal > 0 ? (prPresent / prTotal) * 100 : 0;

    return {
      totalAll, maleAll, femaleAll,
      presentAll, presentM, presentF,
      absentAll, absentM, absentF,
      sickAll, sickM, sickF,
      leaveAll, leaveM, leaveF,
      lateAll, lateM, lateF,
      unattendedAll,
      rateAll,
      kgTotal, kgPresent, kgAbsent, kgRate,
      prTotal, prPresent, prAbsent, prRate,
    };
  }, [gradeStats]);

  // Format Thai Date string
  const formatThaiDateFull = (dStr: string) => {
    if (!dStr) return '';
    try {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('th-TH', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'Asia/Bangkok'
        });
      }
    } catch {
      // fallback
    }
    return dStr;
  };

  const statusLabel = (st: 'absent' | 'sick' | 'leave' | 'late') => {
    switch (st) {
      case 'absent': return { text: 'ขาดเรียน', color: 'text-rose-700 bg-rose-50 border-rose-200' };
      case 'sick': return { text: 'ลาป่วย', color: 'text-purple-700 bg-purple-50 border-purple-200' };
      case 'leave': return { text: 'ลากิจ', color: 'text-sky-700 bg-sky-50 border-sky-200' };
      case 'late': return { text: 'มาสาย', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    }
  };

  return (
    <PDFPrintHelper
      layout={layout}
      onClose={onClose}
      documentTitle={`รายงานสถิตินักเรียนประจำวัน_${selectedDate}`}
      extraControls={
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-600">ประจำวันที่:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={() => setSelectedDate(defaultDate)}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline ml-1"
            >
              วันนี้
            </button>
          </div>

          {/* Layout switch */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setLayout('portrait')}
              className={`px-2.5 py-1 rounded transition-colors ${layout === 'portrait' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`}
            >
              แนวตั้ง
            </button>
            <button
              onClick={() => setLayout('landscape')}
              className={`px-2.5 py-1 rounded transition-colors ${layout === 'landscape' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`}
            >
              แนวนอน
            </button>
          </div>

          {/* Toggle Absent List */}
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 select-none">
            <input
              type="checkbox"
              checked={showAbsentList}
              onChange={(e) => setShowAbsentList(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>แสดงรายชื่อนักเรียนไม่มาเรียน</span>
          </label>

          {/* Toggle Signatures */}
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 select-none">
            <input
              type="checkbox"
              checked={showSignatures}
              onChange={(e) => setShowSignatures(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>แสดงช่องลงนาม</span>
          </label>
        </div>
      }
    >
      <PrintPageContainer>
        {/* Document Header */}
        <div className="text-center relative mb-4 border-b border-slate-900/40 pb-3">
          <div className="absolute top-0 left-0 hidden sm:block print:block">
            <SchoolLogo className="h-16 w-16 text-[#e54a93] drop-shadow-sm" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
            แบบรายงานสถิตินักเรียนและการมาเรียนประจำวัน
          </h1>
          <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
            {formatSchoolName(schoolInfo.name)}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {schoolInfo.affiliation} ต.{schoolInfo.subDistrict} อ.{schoolInfo.district} จ.{schoolInfo.province}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-2 text-xs sm:text-sm font-bold text-slate-800">
            <span className="bg-slate-100 px-3 py-1 rounded border border-slate-200 print:border-none print:bg-transparent">
              {formatThaiDateFull(selectedDate)}
            </span>
            <span>ภาคเรียนที่: {viewSemester}</span>
            <span>ปีการศึกษา: {viewAcademicYear}</span>
          </div>
        </div>

        {/* Highlight Summary Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4 text-center text-xs">
          <div className="border border-slate-900 rounded p-2 bg-slate-50 print:bg-transparent">
            <span className="block text-slate-600 font-medium">นักเรียนทั้งหมด</span>
            <span className="text-lg font-black text-slate-900">{totals.totalAll} คน</span>
            <span className="block text-[10px] text-slate-500">(ช {totals.maleAll} / ญ {totals.femaleAll})</span>
          </div>
          <div className="border border-slate-900 rounded p-2 bg-emerald-50/50 print:bg-transparent">
            <span className="block text-emerald-800 font-medium">มาเรียน</span>
            <span className="text-lg font-black text-emerald-700">{totals.presentAll} คน</span>
            <span className="block text-[10px] font-bold text-emerald-800">คิดเป็น {totals.rateAll.toFixed(1)}%</span>
          </div>
          <div className="border border-slate-900 rounded p-2 bg-rose-50/50 print:bg-transparent">
            <span className="block text-rose-800 font-medium">ไม่มาเรียน (ขาด/ลา)</span>
            <span className="text-lg font-black text-rose-700">{totals.unattendedAll} คน</span>
            <span className="block text-[10px] text-slate-600">ขาด {totals.absentAll} | ป่วย {totals.sickAll} | กิจ {totals.leaveAll}</span>
          </div>
          <div className="border border-slate-900 rounded p-2 bg-amber-50/50 print:bg-transparent">
            <span className="block text-amber-800 font-medium">มาสาย</span>
            <span className="text-lg font-black text-amber-700">{totals.lateAll} คน</span>
            <span className="block text-[10px] text-slate-500">(บันทึกเวลาเรียนแล้ว)</span>
          </div>
        </div>

        {/* Main Attendance Table by Grade */}
        <div className="mb-4">
          <table className="w-full text-xs border-collapse border border-slate-900 mx-auto">
            <thead>
              <tr className="bg-slate-100 print:bg-slate-200">
                <th className="border border-slate-900 px-2 py-1.5 text-center w-8" rowSpan={2}>ที่</th>
                <th className="border border-slate-900 px-3 py-1.5 text-left w-32" rowSpan={2}>ระดับชั้น</th>
                <th className="border border-slate-900 px-2 py-1 text-center" colSpan={3}>จำนวนทั้งหมด</th>
                <th className="border border-slate-900 px-2 py-1 text-center bg-emerald-50 print:bg-slate-100" colSpan={3}>มาเรียน</th>
                <th className="border border-slate-900 px-2 py-1 text-center bg-rose-50 print:bg-slate-100" colSpan={4}>ไม่มาเรียน (คน)</th>
                <th className="border border-slate-900 px-2 py-1.5 text-center w-14" rowSpan={2}>รวมไม่มา<br/><span className="text-[10px] font-normal">(คน)</span></th>
                <th className="border border-slate-900 px-2 py-1.5 text-center w-14" rowSpan={2}>ร้อยละ<br/><span className="text-[10px] font-normal">(%)</span></th>
                <th className="border border-slate-900 px-2 py-1.5 text-center w-32" rowSpan={2}>ครูประจำชั้น / ผู้บันทึก</th>
              </tr>
              <tr className="bg-slate-50 print:bg-slate-100 text-[11px]">
                <th className="border border-slate-900 px-1 py-1 text-center w-8 font-normal">ช</th>
                <th className="border border-slate-900 px-1 py-1 text-center w-8 font-normal">ญ</th>
                <th className="border border-slate-900 px-1 py-1 text-center w-10 font-bold">รวม</th>
                <th className="border border-slate-900 px-1 py-1 text-center w-8 font-normal text-emerald-800">ช</th>
                <th className="border border-slate-900 px-1 py-1 text-center w-8 font-normal text-emerald-800">ญ</th>
                <th className="border border-slate-900 px-1 py-1 text-center w-10 font-bold text-emerald-800">รวม</th>
                <th className="border border-slate-900 px-1 py-1 text-center w-8 font-normal text-rose-700">ขาด</th>
                <th className="border border-slate-900 px-1 py-1 text-center w-8 font-normal text-purple-700">ป่วย</th>
                <th className="border border-slate-900 px-1 py-1 text-center w-8 font-normal text-sky-700">กิจ</th>
                <th className="border border-slate-900 px-1 py-1 text-center w-8 font-normal text-amber-700">สาย</th>
              </tr>
            </thead>
            <tbody>
              {gradeStats.map((st, idx) => {
                const isKg = st.gradeLevel.includes('อนุบาล');
                return (
                  <tr 
                    key={st.gradeLevel} 
                    className={`${idx % 2 === 1 ? 'bg-slate-50/50 print:bg-white' : 'bg-white'} hover:bg-indigo-50/20`}
                  >
                    <td className="border border-slate-900 px-1 py-1 text-center font-medium">{idx + 1}</td>
                    <td className="border border-slate-900 px-2 py-1 font-bold whitespace-nowrap text-slate-800">
                      {st.gradeLevel}
                      {!st.hasRecord && (
                        <span className="ml-1 text-[9px] text-amber-600 font-normal print:hidden">(ยังไม่เช็ก)</span>
                      )}
                    </td>
                    <td className="border border-slate-900 px-1 py-1 text-center">{st.maleStudents}</td>
                    <td className="border border-slate-900 px-1 py-1 text-center">{st.femaleStudents}</td>
                    <td className="border border-slate-900 px-1 py-1 text-center font-bold bg-slate-50 print:bg-transparent">{st.totalStudents}</td>
                    <td className="border border-slate-900 px-1 py-1 text-center text-emerald-800">{st.presentMale}</td>
                    <td className="border border-slate-900 px-1 py-1 text-center text-emerald-800">{st.presentFemale}</td>
                    <td className="border border-slate-900 px-1 py-1 text-center font-bold text-emerald-800 bg-emerald-50/30 print:bg-transparent">{st.presentTotal}</td>
                    <td className={`border border-slate-900 px-1 py-1 text-center ${st.absentTotal > 0 ? 'font-bold text-rose-700 bg-rose-50/40 print:bg-transparent' : 'text-slate-400'}`}>
                      {st.absentTotal || '-'}
                    </td>
                    <td className={`border border-slate-900 px-1 py-1 text-center ${st.sickTotal > 0 ? 'text-purple-700' : 'text-slate-400'}`}>
                      {st.sickTotal || '-'}
                    </td>
                    <td className={`border border-slate-900 px-1 py-1 text-center ${st.leaveTotal > 0 ? 'text-sky-700' : 'text-slate-400'}`}>
                      {st.leaveTotal || '-'}
                    </td>
                    <td className={`border border-slate-900 px-1 py-1 text-center ${st.lateTotal > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                      {st.lateTotal || '-'}
                    </td>
                    <td className={`border border-slate-900 px-1 py-1 text-center font-bold ${st.unattendedTotal > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                      {st.unattendedTotal || '0'}
                    </td>
                    <td className={`border border-slate-900 px-1 py-1 text-center font-bold ${st.attendanceRate < 80 ? 'text-rose-600 bg-rose-50/50 print:bg-transparent' : 'text-slate-800'}`}>
                      {st.totalStudents > 0 ? `${st.attendanceRate.toFixed(1)}%` : '-'}
                    </td>
                    <td className="border border-slate-900 px-2 py-1 text-slate-700 text-[11px] truncate max-w-[120px]">
                      {st.homeroomTeacherName || '-'}
                    </td>
                  </tr>
                );
              })}

              {/* Subtotal Kindergarten */}
              {totals.kgTotal > 0 && (
                <tr className="bg-pink-50/60 print:bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-900">
                  <td className="border border-slate-900 px-1 py-1.5 text-center" colSpan={2}>รวมระดับปฐมวัย (อนุบาล 1-3)</td>
                  <td className="border border-slate-900 px-1 py-1 text-center" colSpan={2}>-</td>
                  <td className="border border-slate-900 px-1 py-1 text-center">{totals.kgTotal}</td>
                  <td className="border border-slate-900 px-1 py-1 text-center" colSpan={2}>-</td>
                  <td className="border border-slate-900 px-1 py-1 text-center text-emerald-800">{totals.kgPresent}</td>
                  <td className="border border-slate-900 px-1 py-1 text-center" colSpan={4}>-</td>
                  <td className="border border-slate-900 px-1 py-1 text-center text-rose-700">{totals.kgAbsent}</td>
                  <td className="border border-slate-900 px-1 py-1 text-center text-emerald-900">{totals.kgRate.toFixed(1)}%</td>
                  <td className="border border-slate-900 px-1 py-1 text-center text-[10px] text-slate-500">-</td>
                </tr>
              )}

              {/* Subtotal Primary */}
              {totals.prTotal > 0 && (
                <tr className="bg-sky-50/60 print:bg-slate-100 font-bold text-slate-900">
                  <td className="border border-slate-900 px-1 py-1.5 text-center" colSpan={2}>รวมระดับประถมศึกษา (ป.1 - ป.6)</td>
                  <td className="border border-slate-900 px-1 py-1 text-center" colSpan={2}>-</td>
                  <td className="border border-slate-900 px-1 py-1 text-center">{totals.prTotal}</td>
                  <td className="border border-slate-900 px-1 py-1 text-center" colSpan={2}>-</td>
                  <td className="border border-slate-900 px-1 py-1 text-center text-emerald-800">{totals.prPresent}</td>
                  <td className="border border-slate-900 px-1 py-1 text-center" colSpan={4}>-</td>
                  <td className="border border-slate-900 px-1 py-1 text-center text-rose-700">{totals.prAbsent}</td>
                  <td className="border border-slate-900 px-1 py-1 text-center text-emerald-900">{totals.prRate.toFixed(1)}%</td>
                  <td className="border border-slate-900 px-1 py-1 text-center text-[10px] text-slate-500">-</td>
                </tr>
              )}

              {/* Grand Total */}
              <tr className="bg-slate-200 print:bg-slate-300 font-black text-slate-900 border-t-2 border-b-2 border-slate-900">
                <td className="border border-slate-900 px-2 py-2 text-center" colSpan={2}>ยอดรวมทั้งโรงเรียน</td>
                <td className="border border-slate-900 px-1 py-2 text-center">{totals.maleAll}</td>
                <td className="border border-slate-900 px-1 py-2 text-center">{totals.femaleAll}</td>
                <td className="border border-slate-900 px-1 py-2 text-center text-sm">{totals.totalAll}</td>
                <td className="border border-slate-900 px-1 py-2 text-center text-emerald-900">{totals.presentM}</td>
                <td className="border border-slate-900 px-1 py-2 text-center text-emerald-900">{totals.presentF}</td>
                <td className="border border-slate-900 px-1 py-2 text-center text-sm text-emerald-900">{totals.presentAll}</td>
                <td className="border border-slate-900 px-1 py-2 text-center text-rose-900">{totals.absentAll}</td>
                <td className="border border-slate-900 px-1 py-2 text-center text-purple-900">{totals.sickAll}</td>
                <td className="border border-slate-900 px-1 py-2 text-center text-sky-900">{totals.leaveAll}</td>
                <td className="border border-slate-900 px-1 py-2 text-center text-amber-900">{totals.lateAll}</td>
                <td className="border border-slate-900 px-1 py-2 text-center text-sm text-rose-900">{totals.unattendedAll}</td>
                <td className="border border-slate-900 px-1 py-2 text-center text-sm text-indigo-900">{totals.rateAll.toFixed(1)}%</td>
                <td className="border border-slate-900 px-1 py-2 text-center text-[10px] text-slate-700">สรุปยอดประจำวัน</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Absent/Leave Students Table (Optional / Included) */}
        {showAbsentList && (
          <div className="mt-4 print-break-avoid">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>บัญชีรายชื่อนักเรียนที่ไม่มาเรียน / มาสาย ประจำวัน</span>
                <span className="text-[11px] font-normal text-slate-500">
                  ({absentStudentsList.length} คน)
                </span>
              </h3>
            </div>

            {absentStudentsList.length === 0 ? (
              <div className="border border-dashed border-emerald-300 rounded p-3 text-center text-xs font-bold text-emerald-700 bg-emerald-50/40 print:bg-transparent">
                ✓ ไม่มีนักเรียนขาดหรือลาเรียนในวันนี้ (มาเรียนครบ 100%)
              </div>
            ) : (
              <table className="w-full text-xs border-collapse border border-slate-900 mx-auto">
                <thead>
                  <tr className="bg-slate-100 print:bg-slate-200">
                    <th className="border border-slate-900 px-2 py-1 text-center w-8">ที่</th>
                    <th className="border border-slate-900 px-2 py-1 text-center w-24">ระดับชั้น</th>
                    <th className="border border-slate-900 px-2 py-1 text-center w-12">เลขที่</th>
                    <th className="border border-slate-900 px-2 py-1 text-center w-20">รหัสนักเรียน</th>
                    <th className="border border-slate-900 px-3 py-1 text-left">ชื่อ - นามสกุล</th>
                    <th className="border border-slate-900 px-2 py-1 text-center w-10">เพศ</th>
                    <th className="border border-slate-900 px-2 py-1 text-center w-20">สถานะ</th>
                    <th className="border border-slate-900 px-2 py-1 text-center w-28">เบอร์โทรผู้ปกครอง</th>
                    <th className="border border-slate-900 px-3 py-1 text-left w-40">หมายเหตุ / การติดตาม</th>
                  </tr>
                </thead>
                <tbody>
                  {absentStudentsList.map((st, i) => {
                    const stBadge = statusLabel(st.status);
                    return (
                      <tr key={`${st.id}-${i}`} className="bg-white">
                        <td className="border border-slate-900 px-1 py-1 text-center">{i + 1}</td>
                        <td className="border border-slate-900 px-2 py-1 text-center font-medium whitespace-nowrap">{st.gradeLevel}</td>
                        <td className="border border-slate-900 px-1 py-1 text-center">{st.number || '-'}</td>
                        <td className="border border-slate-900 px-1 py-1 text-center font-mono">{st.studentId}</td>
                        <td className="border border-slate-900 px-3 py-1 font-bold whitespace-nowrap">
                          {st.firstName} {st.lastName}
                        </td>
                        <td className="border border-slate-900 px-1 py-1 text-center">
                          {st.gender === 'male' ? 'ช' : 'ญ'}
                        </td>
                        <td className="border border-slate-900 px-1 py-1 text-center font-bold">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${stBadge.color} print:border-none print:text-black`}>
                            {stBadge.text}
                          </span>
                        </td>
                        <td className="border border-slate-900 px-2 py-1 text-center font-mono text-[11px]">
                          {st.parentPhone || '-'}
                        </td>
                        <td className="border border-slate-900 px-2 py-1 text-slate-600 text-[10px]">
                          {st.note || '...................................................'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Signatures & Directive Box */}
        {showSignatures && (
          <div className="mt-6 pt-4 border-t border-slate-300 print-break-avoid">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto text-xs text-slate-800">
              
              {/* Box 1: Duty Teacher */}
              <div className="flex flex-col items-center text-center">
                <p className="font-bold text-slate-900 mb-6">ผู้รายงาน / ครูเวรประจำวัน</p>
                <p className="mb-1">ลงชื่อ ................................................................</p>
                <p className="text-[11px] text-slate-600 mb-1">
                  ({currentTeacher ? currentTeacher.thaiName : '................................................................'})
                </p>
                <p className="text-[11px]">ครูเวรประจำวัน</p>
                <p className="text-[10px] text-slate-500 mt-1">วันที่ ........ / ........ / ................</p>
              </div>

              {/* Box 2: Academic / Discipline Head */}
              <div className="flex flex-col items-center text-center">
                <p className="font-bold text-slate-900 mb-6">ผู้ตรวจสอบข้อมูล</p>
                <p className="mb-1">ลงชื่อ ................................................................</p>
                <p className="text-[11px] text-slate-600 mb-1">(................................................................)</p>
                <p className="text-[11px]">หัวหน้างานกิจการนักเรียน / วิชาการ</p>
                <p className="text-[10px] text-slate-500 mt-1">วันที่ ........ / ........ / ................</p>
              </div>

            </div>
          </div>
        )}
      </PrintPageContainer>
    </PDFPrintHelper>
  );
};
