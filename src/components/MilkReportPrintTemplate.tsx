import React from 'react';
import { Student } from '../types';

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
}) => {
  // ฟอร์มต้นฉบับมี 31 วันเสมอ
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const PAGE_SIZE = 20;
  
  // แบ่งนักเรียนออกเป็นหน้า หน้าละ 20 คน
  const studentPages = [];
  for (let i = 0; i < Math.max(students.length, 1); i += PAGE_SIZE) {
    studentPages.push(students.slice(i, i + PAGE_SIZE));
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
                  const noMilk = student.noSchoolMilk;
                  const absoluteIndex = (pageIndex * PAGE_SIZE) + idx + 1;
                  return (
                    <tr key={student.id}>
                      <td className="border border-slate-400 px-1 py-1 text-center h-6">{absoluteIndex}</td>
                      <td className="border border-slate-400 px-2 py-1 truncate max-w-[140px] text-[11px]">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="border border-slate-400 px-1 py-1"></td>
                      <td className="border border-slate-400 px-1 py-1"></td>
                      {days.map(day => {
                        const isInvalidDay = day > daysInMonth;
                        return (
                          <td key={day} className={`border border-slate-400 p-0 text-center ${isInvalidDay ? 'bg-slate-100 print:bg-slate-100' : ''}`}>
                            {!isInvalidDay && noMilk ? '-' : ''}
                          </td>
                        )
                      })}
                      <td className="border border-slate-400 px-1 py-1 text-center">
                        {noMilk ? '0' : ''}
                      </td>
                      <td className="border border-slate-400 px-1 py-1"></td>
                      <td className="border border-slate-400 px-1 py-1"></td>
                      <td className="border border-slate-400 px-1 py-1 text-center text-[9px] truncate max-w-[60px]">
                        {noMilk ? 'แพ้นม/งด' : ''}
                      </td>
                    </tr>
                  );
                })}
                {/* Fill empty rows for the last page to keep form height consistent */}
                {Array.from({ length: Math.max(0, PAGE_SIZE - pageStudents.length) }).map((_, i) => (
                  <tr key={`blank-${i}`}>
                    <td className="border border-slate-400 px-1 py-1 text-center h-6"></td>
                    <td className="border border-slate-400 px-1 py-1"></td>
                    <td className="border border-slate-400 px-1 py-1"></td>
                    <td className="border border-slate-400 px-1 py-1"></td>
                    {days.map(day => (
                        <td key={`blank-${i}-${day}`} className={`border border-slate-400 p-0 ${day > daysInMonth ? 'bg-slate-100 print:bg-slate-100' : ''}`}></td>
                    ))}
                    <td className="border border-slate-400 px-1 py-1"></td>
                    <td className="border border-slate-400 px-1 py-1"></td>
                    <td className="border border-slate-400 px-1 py-1"></td>
                    <td className="border border-slate-400 px-1 py-1"></td>
                  </tr>
                ))}
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
          <button
            onClick={() => window.print()}
            className="px-6 py-2 rounded-full font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
          >
            พิมพ์รายงาน (A4 แนวนอน)
          </button>
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
