import React, { useState } from "react";
import { Student, AttendanceSession } from "../types";
import {
  PDFPrintHelper,
  PrintPageContainer,
  PrintHeader,
  PrintSignatureBox,
} from "./PDFPrintHelper";

interface AttendancePrintTemplateProps {
  students: Student[];
  sessions: AttendanceSession[];
  subject: string;
  gradeLevel: string;
  academicYear: string;
  semester: string;
  teacherName?: string;
  onClose: () => void;
}

export const AttendancePrintTemplate: React.FC<AttendancePrintTemplateProps> = ({
  students,
  sessions,
  subject,
  gradeLevel,
  academicYear,
  semester,
  teacherName = ".......................................................",
  onClose,
}) => {
  const [isCompact, setIsCompact] = useState(false);
  const totalPeriods = sessions.length;

  return (
    <PDFPrintHelper
      onClose={onClose}
      documentTitle={`รายงานเวลาเรียน_${gradeLevel}_${subject}`}
      isCompact={isCompact}
      onToggleCompact={() => setIsCompact(!isCompact)}
    >
      <PrintPageContainer>
        <PrintHeader
          title="รายงานสรุปเวลาเรียน"
          subtitle={
            <div className="flex flex-col gap-1 mt-2 text-sm text-slate-600">
              <p>
                <strong>วิชา:</strong> {subject} &nbsp;|&nbsp;
                <strong>ระดับชั้น:</strong> {gradeLevel}
              </p>
              <p>
                <strong>ภาคเรียนที่:</strong> {semester} &nbsp;|&nbsp;
                <strong>ปีการศึกษา:</strong> {academicYear}
              </p>
              <p>
                <strong>สอนไปแล้วทั้งหมด:</strong> {totalPeriods} คาบ
              </p>
            </div>
          }
        />

        <div className="mt-6 mb-8 overflow-x-auto">
          <table className="w-full text-sm border-collapse border border-slate-900">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-900 px-2 py-2 w-16 text-center">ลำดับ</th>
                <th className="border border-slate-900 px-2 py-2 w-24 text-center">เลขประจำตัว</th>
                <th className="border border-slate-900 px-4 py-2 text-left">ชื่อ - นามสกุล</th>
                <th className="border border-slate-900 px-2 py-2 w-16 text-center">มา</th>
                <th className="border border-slate-900 px-2 py-2 w-16 text-center">สาย</th>
                <th className="border border-slate-900 px-2 py-2 w-16 text-center">ลา</th>
                <th className="border border-slate-900 px-2 py-2 w-16 text-center">ป่วย</th>
                <th className="border border-slate-900 px-2 py-2 w-16 text-center">ขาด</th>
                <th className="border border-slate-900 px-2 py-2 w-24 text-center">ร้อยละเวลาเรียน</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st, index) => {
                let present = 0;
                let late = 0;
                let leave = 0;
                let sick = 0;
                let absent = 0;

                sessions.forEach((session) => {
                  const status = session.attendanceData?.[st.id] || "absent";
                  if (status === "present") present++;
                  else if (status === "late") late++;
                  else if (status === "leave") leave++;
                  else if (status === "sick") sick++;
                  else if (status === "absent") absent++;
                });

                const attended = present + late;
                const percentage =
                  totalPeriods > 0 ? Math.round((attended / totalPeriods) * 100) : 0;

                return (
                  <tr key={st.id}>
                    <td className="border border-slate-900 px-2 py-1 text-center">{index + 1}</td>
                    <td className="border border-slate-900 px-2 py-1 text-center">{st.studentId}</td>
                    <td className="border border-slate-900 px-4 py-1 text-left">
                      {st.firstName} {st.lastName}
                    </td>
                    <td className="border border-slate-900 px-2 py-1 text-center">{present}</td>
                    <td className="border border-slate-900 px-2 py-1 text-center">{late}</td>
                    <td className="border border-slate-900 px-2 py-1 text-center">{leave}</td>
                    <td className="border border-slate-900 px-2 py-1 text-center">{sick}</td>
                    <td className="border border-slate-900 px-2 py-1 text-center">{absent}</td>
                    <td className="border border-slate-900 px-2 py-1 text-center font-bold">
                      {percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-16 page-break-inside-avoid">
          <PrintSignatureBox
            role="ผู้สอน"
            name={teacherName !== "......................................................." ? teacherName : undefined}
            label="(ลงชื่อ) ....................................................... ผู้สอน"
          />
          <PrintSignatureBox
            role="หัวหน้าฝ่ายวิชาการ/ผู้ตรวจ"
            label="(ลงชื่อ) ....................................................... ผู้ตรวจ"
          />
        </div>
      </PrintPageContainer>
    </PDFPrintHelper>
  );
};
