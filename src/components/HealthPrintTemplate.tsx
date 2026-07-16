import React, { useState } from "react";
import { Student, StudentAssessment, Teacher } from "../types";
import { formatThaiMonthYear } from "../lib/dateUtils";

import {
  PDFPrintHelper,
  PrintPageContainer,
  PrintHeader,
  PrintSignatureBox,
} from "./PDFPrintHelper";

interface HealthPrintTemplateProps {
  students: Student[];
  allAssessments: StudentAssessment[];
  teacher: Teacher;
  academicYear: string;
  semester: string;
  months: string[];
  onClose: () => void;
}

export const HealthPrintTemplate: React.FC<HealthPrintTemplateProps> = ({ 
  students, 
  allAssessments, 
  teacher, 
  academicYear, 
  semester, 
  months,
  onClose 
}) => {
  const [isCompact, setIsCompact] = useState(false);
  
  const teacherIdentifier = (
    teacher.employeeId ||
    teacher.thaiName ||
    "ครูผู้สอน"
  ).replace(/[\/\\:*?"<>|\s]/g, "_");
  const gradeLevel =
    students[0]?.gradeLevel.replace(/[\/\\:*?"<>|\s]/g, "_") || "ไม่ระบุชั้น";
    
  const documentTitle = `รายงานพัฒนาการร่างกาย_${gradeLevel}_${teacherIdentifier}_${academicYear}_${semester}`;

  return (
    <PDFPrintHelper
      onClose={onClose}
      documentTitle={documentTitle}
      isCompact={isCompact}
      onToggleCompact={() => setIsCompact(!isCompact)}
    >
      {students.map((student, index) => {
        // Calculate age
        let ageString = "-";
        if (student.dob) {
           const birthDate = new Date(student.dob);
           const now = new Date();
           let years = now.getFullYear() - birthDate.getFullYear();
           let monthDiff = now.getMonth() - birthDate.getMonth();
           if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
             years--;
             monthDiff += (monthDiff < 0 ? 12 : 11);
           }
           ageString = `${years} ปี ${monthDiff} เดือน`;
        }

        return (
          <PrintPageContainer
            key={student.id}
            className={
              isCompact
                ? "!p-[0.7cm] !mb-0 !mt-0 !rounded-none !rounded-b-xl !shadow-md"
                : ""
            }
          >
            {/* Report Header */}
            <PrintHeader 
              title="รายงานพัฒนาการทางร่างกายนักเรียน" 
              subtitle={`ภาคเรียนที่ ${semester} ปีการศึกษา ${academicYear}`} 
            />

            {/* Student Info */}
            <div className={`mb-6 grid grid-cols-2 gap-4 ${isCompact ? "mb-4" : ""}`}>
              <div>
                <span className="font-bold mr-2 text-sm">ชื่อ-นามสกุล:</span>
                <span className="text-sm border-b border-dotted border-gray-400 inline-block min-w-[200px]">
                  {student.prefix}{student.firstName} {student.lastName}
                </span>
              </div>
              <div>
                <span className="font-bold mr-2 text-sm">เลขประจำตัว:</span>
                <span className="text-sm border-b border-dotted border-gray-400 inline-block min-w-[100px]">
                  {student.studentId || "-"}
                </span>
              </div>
              <div>
                <span className="font-bold mr-2 text-sm">ชั้น:</span>
                <span className="text-sm border-b border-dotted border-gray-400 inline-block min-w-[150px]">
                  {student.gradeLevel || "-"}
                </span>
              </div>
              <div>
                <span className="font-bold mr-2 text-sm">อายุ:</span>
                <span className="text-sm border-b border-dotted border-gray-400 inline-block min-w-[150px]">
                  {ageString}
                </span>
              </div>
            </div>

            {/* Data Table */}
            <div className="border border-gray-800 rounded mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border-b border-r border-gray-800 p-2 w-32">เดือนที่ประเมิน</th>
                    <th className="border-b border-r border-gray-800 p-2">น้ำหนัก (กก.)</th>
                    <th className="border-b border-r border-gray-800 p-2">ส่วนสูง (ซม.)</th>
                    <th className="border-b border-r border-gray-800 p-2">BMI</th>
                    <th className="border-b border-gray-800 p-2">ผลการประเมิน</th>
                  </tr>
                </thead>
                <tbody>
                  {months.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">ไม่มีข้อมูลพัฒนาการร่างกาย</td>
                    </tr>
                  ) : (
                    months.map((m, i) => {
                      const assessmentForMonth = allAssessments.find(a => a.studentId === student.id && a.month === m);
                      const weight = assessmentForMonth?.weight;
                      const height = assessmentForMonth?.height;
                      
                      let bmiStr = "-";
                      let resultStr = "-";
                      
                      if (weight && height) {
                        const h = height / 100;
                        const bmi = weight / (h * h);
                        bmiStr = bmi.toFixed(1);
                        
                        let years = 7;
                        if (student.dob) {
                          const birthDate = new Date(student.dob);
                          const targetDate = new Date(`${m}-01`);
                          years = targetDate.getFullYear() - birthDate.getFullYear();
                          if (targetDate.getMonth() < birthDate.getMonth()) {
                            years--;
                          }
                        }
                        
                        const baseNormal = 14 + (years - 6) * 0.3;
                        const baseOverweight = 18 + (years - 6) * 0.5;
                        const baseObese1 = 20 + (years - 6) * 0.6;
                        const baseObese2 = 22 + (years - 6) * 0.7;
                        
                        if (bmi < baseNormal) resultStr = 'ผอม/น้ำหนักน้อย';
                        else if (bmi < baseOverweight) resultStr = 'สมส่วน';
                        else if (bmi < baseObese1) resultStr = 'ท้วม';
                        else if (bmi < baseObese2) resultStr = 'เริ่มอ้วน';
                        else resultStr = 'อ้วน';
                        
                        if (!student.dob) resultStr += ' (คาดคะเน)';
                      }
                      
                      return (
                        <tr key={m}>
                          <td className="border-b border-r border-gray-800 p-2 text-center font-bold">{formatThaiMonthYear(m)}</td>
                          <td className="border-b border-r border-gray-800 p-2 text-center">{weight || "-"}</td>
                          <td className="border-b border-r border-gray-800 p-2 text-center">{height || "-"}</td>
                          <td className="border-b border-r border-gray-800 p-2 text-center">{bmiStr}</td>
                          <td className="border-b border-gray-800 p-2 text-center">{resultStr}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8 text-xs text-gray-500 mb-8 space-y-1">
              <p>* การประเมินอ้างอิงตามเกณฑ์มาตรฐานการเจริญเติบโตของกรมอนามัย กระทรวงสาธารณสุข</p>
              <p>* สูตรคำนวณ BMI = น้ำหนัก (กิโลกรัม) / [ส่วนสูง (เมตร)]²</p>
              {!student.dob && <p className="text-red-500">* นักเรียนยังไม่ได้ระบุวันเกิดในระบบ การประเมินเกณฑ์จึงใช้ค่าคาดคะเนสำหรับอายุ 7 ปี</p>}
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-end mt-12 px-8">
              <div className="w-64">
                <PrintSignatureBox 
                  role="ผู้ปกครอง" 
                  name=" " 
                  label="ลงชื่อ"
                />
              </div>
              <div className="w-64">
                <PrintSignatureBox 
                  role="ครูประจำชั้น/ผู้ประเมิน" 
                  name={teacher.thaiName || teacher.displayName} 
                  label="ลงชื่อ"
                />
              </div>
            </div>
          </PrintPageContainer>
        );
      })}
    </PDFPrintHelper>
  );
};
