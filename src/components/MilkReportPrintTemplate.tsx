import React, { useState, useEffect } from 'react';
import { Student, AttendanceSession } from '../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2 } from 'lucide-react';

interface MilkReportPrintTemplateProps {
  schoolName?: string;
  schoolSubDistrict?: string;
  schoolDistrict?: string;
  schoolProvince?: string;
  students: Student[];
  gradeLevel: string;
  semester: string;
  academicYear: string;
  teacherName: string;
  monthName: string;
  daysInMonth: number;
  currentDate?: string;
}

export const MilkReportPrintTemplate: React.FC<MilkReportPrintTemplateProps> = ({
  students,
  gradeLevel,
  semester,
  academicYear,
  teacherName,
  monthName,
  daysInMonth,
  schoolName = '',
  schoolSubDistrict = '',
  schoolDistrict = '',
  schoolProvince = '',
  currentDate,
}) => {
  const [attendanceMonthData, setAttendanceMonthData] = useState<Record<string, Record<number, 'present' | 'absent'>>>({});
  const [assessmentData, setAssessmentData] = useState<Record<string, {weight: number, height: number}>>({});
  const [prevAssessmentData, setPrevAssessmentData] = useState<Record<string, {weight: number, height: number}>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentDate) {
        setLoading(false);
        return;
      }
      try {
        const [year, month] = currentDate.split('-');
        const prefix = `${year}-${month}-`;
        const assessmentMonth = `${year}-${month}`; // YYYY-MM format from input type="month"
        
        let y = parseInt(year, 10);
        let m = parseInt(month, 10) - 1;
        if (m === 0) {
          m = 12;
          y -= 1;
        }
        const prevAssessmentMonth = `${y}-${m.toString().padStart(2, '0')}`;
        
        // Fetch Attendance
        const qAttendance = query(
          collection(db, 'attendanceSessions'),
          where('gradeLevel', '==', gradeLevel),
          where('semester', '==', semester),
          where('academicYear', '==', academicYear)
        );
        const attendanceSnapshot = await getDocs(qAttendance);
        
        const attData: Record<string, Record<number, 'present' | 'absent'>> = {}; 
        
        attendanceSnapshot.forEach(doc => {
          const session = doc.data() as AttendanceSession;
          // นับทุกคาบเรียนในเดือนนี้
          if (session.date.startsWith(prefix)) { 
            const day = parseInt(session.date.split('-')[2], 10);
            
            Object.entries(session.attendanceData).forEach(([studentId, status]) => {
              if (!attData[studentId]) attData[studentId] = {};
              
              // ถ้าสถานะเป็น 'present' หรือ 'late' ถือว่ามาเรียน -> ได้ดื่มนม
              if (status === 'present' || status === 'late') {
                attData[studentId][day] = 'present';
              } else if (status === 'absent' || status === 'sick' || status === 'leave') {
                // ถ้าขาด/ลา/ป่วย และยังไม่ได้ถูกมาร์คว่ามาเรียนในคาบอื่นของวันเดียวกัน
                if (attData[studentId][day] !== 'present') {
                  attData[studentId][day] = 'absent';
                }
              }
            });
          }
        });
        
        setAttendanceMonthData(attData);

        // Fetch Assessments for weight and height (supports both primary and kindergarten collections)
        const qAssessments = query(
          collection(db, 'assessments'),
          where('gradeLevel', '==', gradeLevel),
          where('semester', '==', semester),
          where('academicYear', '==', academicYear)
        );
        const assessmentSnapshot = await getDocs(qAssessments);
        const assessData: Record<string, {weight: number, height: number}> = {};
        const prevData: Record<string, {weight: number, height: number}> = {};
        
        assessmentSnapshot.forEach(doc => {
          const assessment = doc.data();
          if (assessment.month === assessmentMonth && assessment.weight && assessment.height) {
            assessData[assessment.studentId] = {
              weight: assessment.weight,
              height: assessment.height
            };
          }
          if (assessment.month === prevAssessmentMonth && assessment.weight && assessment.height) {
            prevData[assessment.studentId] = {
              weight: assessment.weight,
              height: assessment.height
            };
          }
        });

        // Also fetch from kindergartenAssessments
        const qKAssessments = query(
          collection(db, 'kindergartenAssessments'),
          where('gradeLevel', '==', gradeLevel),
          where('semester', '==', semester),
          where('academicYear', '==', academicYear)
        );
        const kAssessmentSnapshot = await getDocs(qKAssessments);
        
        kAssessmentSnapshot.forEach(doc => {
          const assessment = doc.data();
          if (assessment.month === assessmentMonth && assessment.weight && assessment.height) {
            assessData[assessment.studentId] = {
              weight: assessment.weight,
              height: assessment.height
            };
          }
          if (assessment.month === prevAssessmentMonth && assessment.weight && assessment.height) {
            prevData[assessment.studentId] = {
              weight: assessment.weight,
              height: assessment.height
            };
          }
        });

        setAssessmentData(assessData);
        setPrevAssessmentData(prevData);

      } catch (error) {
        console.error("Error fetching data for milk report:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentDate, gradeLevel, semester, academicYear]);

  // ฟอร์มต้นฉบับมี 31 วันเสมอ
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const PAGE_SIZE = 20;
  
  // กรองนักเรียนที่งดดื่มนมออก
  const validStudents = students.filter(s => !s.noSchoolMilk);
  
  // แบ่งนักเรียนออกเป็นหน้า หน้าละ 20 คน
  const studentPages = [];
  for (let i = 0; i < Math.max(validStudents.length, 1); i += PAGE_SIZE) {
    studentPages.push(validStudents.slice(i, i + PAGE_SIZE));
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-500/90 backdrop-blur-sm flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-white animate-spin mb-4" />
        <p className="text-white font-bold text-xl">กำลังดึงข้อมูลการมาเรียนเพื่อลง ✓ อัตโนมัติ...</p>
      </div>
    );
  }

  return (
    <div className="print-root-wrap fixed inset-0 z-[200] bg-slate-500/90 backdrop-blur-sm overflow-y-auto cursor-default print:p-0 print:absolute print:inset-0 print:bg-white print:backdrop-blur-none font-sarabun">
      <div className="min-h-screen py-8 print:py-0 flex flex-col items-center gap-8 print:block">
        {studentPages.map((pageStudents, pageIndex) => (
          <div key={pageIndex} className="bg-white shadow-2xl print:shadow-none print:w-full print:max-w-none print:m-0" style={{ width: '297mm', minHeight: '210mm', padding: '12mm 15mm', margin: '0 auto', pageBreakAfter: pageIndex < studentPages.length - 1 ? 'always' : 'auto' }}>
            
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold text-black mb-1">แบบบันทึกการแจกนมให้นักเรียนดื่ม</h1>
              <h2 className="text-lg font-bold text-black mb-6">สำนักงานคณะกรรมการส่งเสริมการศึกษาเอกชน</h2>
              <div className="text-[13px] font-medium text-black flex justify-between items-end gap-2 px-2">
                <div className="flex-1 text-left whitespace-nowrap">โรงเรียน {schoolName || '..................................................................'}</div>
                <div className="flex-1 text-left whitespace-nowrap">แขวง/ตำบล {schoolSubDistrict || '..............................................'}</div>
                <div className="flex-1 text-left whitespace-nowrap">เขต/อำเภอ {schoolDistrict || '..............................................'}</div>
                <div className="flex-1 text-left whitespace-nowrap">จังหวัด {schoolProvince || '..............................................'}</div>
              </div>
            </div>

            {/* Table */}
            <table className="w-full border-collapse border border-slate-400 text-[10px] text-black">
              <thead>
                <tr>
                  <th rowSpan={2} className="border border-slate-400 px-1 py-1 w-6 text-center font-normal">ที่</th>
                  <th rowSpan={2} className="border border-slate-400 px-2 py-1 w-[140px] text-center font-normal">ชื่อ - สกุล</th>
                  <th colSpan={2} className="border border-slate-400 px-1 py-1 text-center font-normal">ต้นเดือน</th>
                  <th colSpan={31} className="border border-slate-400 px-1 py-1 text-center font-normal relative">
                    <span className="inline-flex relative z-10 bg-white px-2 items-center gap-2">
                      เดือน <span className="font-bold underline underline-offset-4 decoration-dotted">{monthName}</span> ได้รับนมบริโภค (กาเครื่องหมาย ✓ วันที่ได้รับนม)
                    </span>
                  </th>
                  <th rowSpan={2} className="border border-slate-400 px-1 py-1 w-8 text-center font-normal leading-tight">รวม<br/>วัน</th>
                  <th colSpan={2} className="border border-slate-400 px-1 py-1 text-center font-normal">ปลายเดือน</th>
                  <th rowSpan={2} className="border border-slate-400 px-1 py-1 w-14 text-center font-normal">หมายเหตุ</th>
                </tr>
                <tr>
                  <th className="border border-slate-400 px-0 py-1 w-8 text-center font-normal leading-tight text-[9px]">น้ำหนัก</th>
                  <th className="border border-slate-400 px-0 py-1 w-8 text-center font-normal leading-tight text-[9px]">ส่วนสูง</th>
                  {days.map(day => (
                    <th key={day} className="border border-slate-400 p-0 w-[18px] text-center font-normal">
                      {day}
                    </th>
                  ))}
                  <th className="border border-slate-400 px-0 py-1 w-8 text-center font-normal leading-tight text-[9px]">น้ำหนัก</th>
                  <th className="border border-slate-400 px-0 py-1 w-8 text-center font-normal leading-tight text-[9px]">ส่วนสูง</th>
                </tr>
              </thead>
              <tbody>
                {pageStudents.map((student, idx) => {
                  const absoluteIndex = (pageIndex * PAGE_SIZE) + idx + 1;
                  const studentAttendance = attendanceMonthData[student.id] || {};
                  const totalDays = Object.values(studentAttendance).filter(v => v === 'present').length;
                  const assessment = assessmentData[student.id];
                  const prevAssessment = prevAssessmentData[student.id];
                  
                  return (
                    <tr key={student.id}>
                      <td className="border border-slate-400 px-1 py-1 text-center h-6">{absoluteIndex}</td>
                      <td className="border border-slate-400 px-2 py-1 truncate max-w-[140px] text-[11px]">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="border border-slate-400 px-1 py-1 text-center text-[10px]">{prevAssessment?.weight || student.weight || ''}</td>
                      <td className="border border-slate-400 px-1 py-1 text-center text-[10px]">{prevAssessment?.height || student.height || ''}</td>
                      {days.map(day => {
                        const isInvalidDay = day > daysInMonth;
                        const status = studentAttendance[day];
                        return (
                          <td key={day} className={`border border-slate-400 p-0 text-center text-[10px] font-bold ${isInvalidDay ? 'bg-slate-100 print:bg-slate-100' : ''}`}>
                            {!isInvalidDay && status === 'present' ? '✓' : (!isInvalidDay && status === 'absent' ? '✗' : '')}
                          </td>
                        )
                      })}
                      <td className="border border-slate-400 px-1 py-1 text-center font-bold">
                        {totalDays > 0 ? totalDays : ''}
                      </td>
                      <td className="border border-slate-400 px-1 py-1 text-center text-[10px]">
                        {assessment?.weight || ''}
                      </td>
                      <td className="border border-slate-400 px-1 py-1 text-center text-[10px]">
                        {assessment?.height || ''}
                      </td>
                      <td className="border border-slate-400 px-1 py-1 text-center text-[9px] truncate max-w-[60px]">
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer Notes & Signature */}
            <div className="mt-6 flex justify-between text-[13px] text-black pr-12">
              <div className="flex-1 mt-6">
                <div className="flex gap-4 mb-1">
                  <span className="font-bold">หมายเหตุ</span>
                  <span>1. แบบบันทึกนี้ให้ครูประจำชั้นจัดทำทุกเดือน</span>
                </div>
                <div className="ml-[4.5rem]">
                  <span>2. เก็บไว้ที่โรงเรียนเพื่อตรวจสอบ</span>
                </div>
              </div>
              <div className="text-center w-80">
                <div className="mb-2">ลงชื่อ.......................................................................................</div>
                <div className="mb-2">({teacherName ? teacherName : '.......................................................................................'})</div>
                <div className="mt-1">ครูประจำชั้น</div>
              </div>
            </div>

            {studentPages.length > 1 && (
               <div className="mt-2 text-right text-[10px] text-slate-500">
                 หน้า {pageIndex + 1} / {studentPages.length}
               </div>
            )}
          </div>
        ))}
          
        {/* Action Bar (Not Printed) */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-4 rounded-full shadow-2xl border border-slate-200 flex items-center gap-4 z-50 print:hidden animate-in slide-in-from-bottom-8">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('close-milk-report'))}
            className="px-6 py-2 rounded-full font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            ปิด
          </button>
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => {
                const isIframe = window !== window.top;
                if (isIframe) {
                  alert("ไม่สามารถเปิดระบบพิมพ์เอกสารได้เนื่องจากข้อจำกัดความปลอดภัยของเบราว์เซอร์ในโหมดพรีวิว กรุณากดเปิดแท็บใหม่ (Open in new tab) ด้วยปุ่มมุมขวาบน เพื่อพิมพ์");
                } else {
                  window.print();
                }
              }}
              className="px-6 py-2 rounded-full font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
            >
              พิมพ์รายงาน (A4 แนวนอน)
            </button>
            <span className="text-[10px] text-slate-500 font-medium">หากปุ่มพิมพ์ไม่ทำงาน กรุณาเปิดแอปในแท็บใหม่ (Open in new tab)</span>
          </div>
        </div>
      </div>
      
      {/* Print Instructions */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          * {
             -webkit-print-color-adjust: exact !important;
             print-color-adjust: exact !important;
          }
        }
      `}} />
    </div>
  );
};
