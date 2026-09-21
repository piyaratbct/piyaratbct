import React from 'react';
import { Student } from '../types';
import {
  PDFPrintHelper,
  PrintPageContainer,
  PrintHeader,
  PrintSignatureBox,
} from "./PDFPrintHelper";

interface AttendancePrintTemplateProps {
  students: Student[];
  attendanceStats: {
    totalTargetPeriods: number;
    studentStats: Record<string, { present: number; leave: number; sick: number; absent: number; late: number; }>;
  };
  subject: string;
  gradeLevel: string;
  academicYear: string;
  semester: string;
  teacherName?: string;
  onClose: () => void;
}

export const AttendancePrintTemplate: React.FC<AttendancePrintTemplateProps> = ({
  students,
  attendanceStats,
  subject,
  gradeLevel,
  academicYear,
  semester,
  teacherName = ".......................................................",
  onClose,
}) => {
  // Sort students by number
  const sortedStudents = [...students].sort((a, b) => (Number(a.number || '0') - Number(b.number || '0')));
  
  // Pagination
  const STUDENTS_PER_PAGE = 25;
  const pages = [];
  for (let i = 0; i < sortedStudents.length; i += STUDENTS_PER_PAGE) {
    pages.push(sortedStudents.slice(i, i + STUDENTS_PER_PAGE));
  }

  if (pages.length === 0) {
    pages.push([]);
  }

  return (
    <PDFPrintHelper onClose={onClose} documentTitle={`รายงานเวลาเรียน_${subject}_${gradeLevel}`}>
      {pages.map((pageStudents, pageIndex) => (
        <PrintPageContainer key={pageIndex}>
          <PrintHeader
            title="รายงานเวลาเรียน (ปพ.5)"
            subtitle={
              <div className="flex justify-center items-center gap-6 mt-2 text-sm text-slate-600">
                <p>
                  <strong>รายวิชา:</strong> {subject}
                </p>
                <p>
                  <strong>ระดับชั้น:</strong> {gradeLevel}
                </p>
                <p>
                  <strong>ภาคเรียนที่:</strong> {semester}
                </p>
                <p>
                  <strong>ปีการศึกษา:</strong> {academicYear}
                </p>
                <p className="text-xs text-slate-400 ml-4">หน้า {pageIndex + 1}/{pages.length}</p>
              </div>
            }
          />
          
          <div className="mt-6 flex-grow">
            <table className="w-full text-sm border-collapse border border-slate-900 mx-auto">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-900 px-2 py-2 text-center w-12" rowSpan={2}>เลขที่</th>
                  <th className="border border-slate-900 px-2 py-2 text-center w-24" rowSpan={2}>รหัสประจำตัว</th>
                  <th className="border border-slate-900 px-3 py-2 text-left whitespace-nowrap w-56" rowSpan={2}>ชื่อ-นามสกุล</th>
                  <th className="border border-slate-900 px-2 py-1 text-center" colSpan={5}>สรุปเวลาเรียน (ครั้ง)</th>
                  <th className="border border-slate-900 px-2 py-2 text-center w-16 whitespace-nowrap" rowSpan={2}>รวมมาเรียน<br/><span className="text-[10px] font-normal">(คาบ)</span></th>
                  <th className="border border-slate-900 px-2 py-2 text-center w-16 whitespace-nowrap" rowSpan={2}>เวลาเรียนเต็ม<br/><span className="text-[10px] font-normal">(คาบ)</span></th>
                  <th className="border border-slate-900 px-2 py-2 text-center w-20 whitespace-nowrap" rowSpan={2}>ร้อยละ<br/><span className="text-[10px] font-normal">(%)</span></th>
                </tr>
                <tr className="bg-slate-100">
                  <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs w-12 text-emerald-700">มา</th>
                  <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs w-12 text-amber-600">สาย</th>
                  <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs w-12 text-sky-600">ลากิจ</th>
                  <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs w-12 text-purple-600">ลาป่วย</th>
                  <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs w-12 text-rose-600">ขาด</th>
                </tr>
              </thead>
              <tbody>
                {pageStudents.map((st) => {
                  const stats = attendanceStats.studentStats[st.id] || { present: 0, leave: 0, sick: 0, absent: 0, late: 0 };
                  const totalAttended = stats.present + stats.late;
                  const totalRecords = stats.present + stats.late + stats.leave + stats.sick + stats.absent;
                  const baseTotal = attendanceStats.totalTargetPeriods > 0 ? attendanceStats.totalTargetPeriods : totalRecords;
                  const percentage = baseTotal > 0 ? (totalAttended / baseTotal) * 100 : 0;
                  const isAtRisk = baseTotal > 0 && percentage < 80;

                  return (
                    <tr key={st.id}>
                      <td className="border border-slate-900 px-2 py-1 text-center">{st.number || "-"}</td>
                      <td className="border border-slate-900 px-2 py-1 text-center">{st.studentId}</td>
                      <td className="border border-slate-900 px-3 py-1 text-left whitespace-nowrap w-56 truncate">
                        {st.firstName} {st.lastName}
                      </td>
                      <td className="border border-slate-900 px-1 py-1 text-center">{stats.present || "-"}</td>
                      <td className="border border-slate-900 px-1 py-1 text-center">{stats.late || "-"}</td>
                      <td className="border border-slate-900 px-1 py-1 text-center">{stats.leave || "-"}</td>
                      <td className="border border-slate-900 px-1 py-1 text-center">{stats.sick || "-"}</td>
                      <td className="border border-slate-900 px-1 py-1 text-center">{stats.absent || "-"}</td>
                      <td className="border border-slate-900 px-2 py-1 text-center font-medium">{totalAttended}</td>
                      <td className="border border-slate-900 px-2 py-1 text-center text-slate-600">{baseTotal}</td>
                      <td className={`border border-slate-900 px-2 py-1 text-center font-bold ${isAtRisk ? 'text-rose-600' : ''}`}>
                        {baseTotal > 0 ? percentage.toFixed(1) + (isAtRisk ? " (มส.)" : "") : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Signatures on last page */}
          {pageIndex === pages.length - 1 && (
            <div className="grid grid-cols-2 gap-8 mt-16 page-break-inside-avoid">
              <PrintSignatureBox
                role="ผู้สอน"
                name={teacherName}
              />
              <PrintSignatureBox
                role="หัวหน้าฝ่ายวิชาการ/ผู้ตรวจ"
                
              />
            </div>
          )}
        </PrintPageContainer>
      ))}
    </PDFPrintHelper>
  );
};
