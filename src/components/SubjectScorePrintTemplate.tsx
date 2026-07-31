import React, { useState } from "react";
import { Student, SubjectScore, SubjectSettings } from "../types";
import {
  PDFPrintHelper,
  PrintPageContainer,
  PrintHeader,
  PrintSignatureBox,
} from "./PDFPrintHelper";

interface SubjectScorePrintTemplateProps {
  students: Student[];
  scores: Record<string, SubjectScore>;
  subject: string;
  gradeLevel: string;
  academicYear: string;
  semester: string;
  teacherName?: string;
  settings?: SubjectSettings | null;
  onClose: () => void;
}

export const SubjectScorePrintTemplate: React.FC<SubjectScorePrintTemplateProps> = ({
  students,
  scores,
  subject,
  gradeLevel,
  academicYear,
  semester,
  teacherName = ".......................................................",
  settings,
  onClose,
}) => {
  const [isCompact, setIsCompact] = useState(false);

  const displayedStudents = students
    .filter((s) => s.gradeLevel === gradeLevel)
    .sort((a, b) => Number(a.number || "0") - Number(b.number || "0"));

  // Chunk students into pages of 20
  const ITEMS_PER_PAGE = isCompact ? 30 : 20;
  const pages = [];
  for (let i = 0; i < displayedStudents.length; i += ITEMS_PER_PAGE) {
    pages.push(displayedStudents.slice(i, i + ITEMS_PER_PAGE));
  }
  
  if (pages.length === 0) pages.push([]);

  return (
    <PDFPrintHelper
      onClose={onClose}
      documentTitle={`รายงานผลการเรียน_${gradeLevel}_${subject}`}
      isCompact={isCompact}
      onToggleCompact={() => setIsCompact(!isCompact)}
      layout="landscape"
    >
      {pages.map((pageStudents, pageIndex) => (
        <PrintPageContainer key={pageIndex} layout="landscape">
          <PrintHeader
            title="รายงานผลการเรียน (ปพ.5)"
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

          <div className="mt-6 mb-8">
            {subject !== 'กิจกรรมลูกเสือ' ? (
            <table className="w-full text-sm border-collapse border border-slate-900">
              <thead>
                <tr className="bg-slate-100">
                  <th rowSpan={2} className="border border-slate-900 px-2 py-2 text-center w-12">เลขที่</th>
                  <th rowSpan={2} className="border border-slate-900 px-2 py-2 text-center w-24">รหัสประจำตัว</th>
                  <th rowSpan={2} className="border border-slate-900 px-4 py-2 text-left whitespace-nowrap">ชื่อ-นามสกุล</th>
                  <th colSpan={4} className="border border-slate-900 px-2 py-2 text-center">คะแนนระหว่างเรียน (60)</th>
                  <th colSpan={2} className="border border-slate-900 px-2 py-2 text-center">คะแนนสอบ (40)</th>
                  <th rowSpan={2} className="border border-slate-900 px-2 py-2 text-center w-16">รวม<br/>(100)</th>
                  <th rowSpan={2} className="border border-slate-900 px-2 py-2 text-center w-16">เกรด</th>
                </tr>
                <tr className="bg-slate-100">
                  <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs w-16">ความรู้<br/>ก่อนกลางภาค<br/>(20)</th>
                  <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs w-16">จิตพิสัย<br/>ก่อนกลางภาค<br/>(10)</th>
                  <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs w-16">ความรู้<br/>หลังกลางภาค<br/>(20)</th>
                  <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs w-16">จิตพิสัย<br/>หลังกลางภาค<br/>(10)</th>
                  <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs w-16">กลางภาค<br/>(20)</th>
                  <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs w-16">ปลายภาค<br/>(20)</th>
                </tr>
              </thead>
              <tbody>
                {pageStudents.map((st) => {
                  const key = `${st.id}_${academicYear}_${semester}_${subject}`;
                  const score = scores[key] || {
                    beforeMidKnowledgeScore: 0,
                    beforeMidSoftSkillScore: 0,
                    afterMidKnowledgeScore: 0,
                    afterMidSoftSkillScore: 0,
                    midtermScore: 0,
                    finalScore: 0,
                    totalScore: 0,
                    grade: "",
                  };

                  return (
                    <tr key={st.id}>
                      <td className="border border-slate-900 px-2 py-1 text-center">{st.number || "-"}</td>
                      <td className="border border-slate-900 px-2 py-1 text-center">{st.studentId}</td>
                      <td className="border border-slate-900 px-4 py-1 text-left whitespace-nowrap">
                        {st.firstName} {st.lastName}
                      </td>
                      <td className="border border-slate-900 px-2 py-1 text-center">{score.beforeMidKnowledgeScore || 0}</td>
                      <td className="border border-slate-900 px-2 py-1 text-center">{score.beforeMidSoftSkillScore || 0}</td>
                      <td className="border border-slate-900 px-2 py-1 text-center">{score.afterMidKnowledgeScore || 0}</td>
                      <td className="border border-slate-900 px-2 py-1 text-center">{score.afterMidSoftSkillScore || 0}</td>
                      <td className="border border-slate-900 px-2 py-1 text-center bg-slate-50">{score.midtermScore || 0}</td>
                      <td className="border border-slate-900 px-2 py-1 text-center bg-slate-50">{score.finalScore || 0}</td>
                      <td className="border border-slate-900 px-2 py-1 text-center font-bold bg-indigo-50/50">{score.totalScore || 0}</td>
                      <td className="border border-slate-900 px-2 py-1 text-center font-bold text-lg">{score.grade || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            ) : (
            <table className="w-full text-sm border-collapse border border-slate-900 max-w-4xl mx-auto">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-900 px-4 py-3 text-center w-16">เลขที่</th>
                  <th className="border border-slate-900 px-4 py-3 text-center w-32">รหัสประจำตัว</th>
                  <th className="border border-slate-900 px-4 py-3 text-left whitespace-nowrap">ชื่อ-นามสกุล</th>
                  <th className="border border-slate-900 px-4 py-3 text-center w-32">เวลาเรียน<br/><span className="font-normal">(ร้อยละ)</span></th>
                  <th className="border border-slate-900 px-4 py-3 text-center w-32">ผลการประเมิน<br/><span className="font-normal">(ผ/มผ)</span></th>
                </tr>
              </thead>
              <tbody>
                {pageStudents.map((st) => {
                  const key = `${st.id}_${academicYear}_${semester}_${subject}`;
                  const score = scores[key] || {
                    totalScore: 0,
                    grade: "-",
                  };

                  return (
                    <tr key={st.id}>
                      <td className="border border-slate-900 px-4 py-2 text-center">{st.number || "-"}</td>
                      <td className="border border-slate-900 px-4 py-2 text-center">{st.studentId}</td>
                      <td className="border border-slate-900 px-4 py-2 text-left whitespace-nowrap">
                        {st.firstName} {st.lastName}
                      </td>
                      <td className="border border-slate-900 px-4 py-2 text-center bg-slate-50">{score.totalScore || 0}</td>
                      <td className="border border-slate-900 px-4 py-2 text-center font-bold text-lg">{score.grade || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            )}
          </div>

          {/* Signatures on last page */}
          {pageIndex === pages.length - 1 && (
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
          )}
        </PrintPageContainer>
      ))}
    </PDFPrintHelper>
  );
};
