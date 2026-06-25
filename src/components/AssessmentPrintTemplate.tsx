import React, { useState } from "react";
import { Student, StudentAssessment, Teacher } from "../types";
import {
  PDFPrintHelper,
  PrintPageContainer,
  PrintHeader,
  PrintSignatureBox,
} from "./PDFPrintHelper";

interface AssessmentPrintTemplateProps {
  students: Student[];
  assessments: Record<string, StudentAssessment>;
  teacher: Teacher;
  academicYear: string;
  semester: string;
  onClose: () => void;
}

export const AssessmentPrintTemplate: React.FC<
  AssessmentPrintTemplateProps
> = ({ students, assessments, teacher, academicYear, semester, onClose }) => {
  const [isCompact, setIsCompact] = useState(false);

  const teacherIdentifier = (
    teacher.employeeId ||
    teacher.thaiName ||
    "ครูผู้สอน"
  ).replace(/[\/\\:*?"<>|\s]/g, "_");
  const gradeLevel =
    students[0]?.gradeLevel.replace(/[\/\\:*?"<>|\s]/g, "_") || "ไม่ระบุชั้น";
  const documentTitle = `ประเมินพัฒนาการ_${gradeLevel}_${teacherIdentifier}_${academicYear}_${semester}`;

  return (
    <PDFPrintHelper
      onClose={onClose}
      documentTitle={documentTitle}
      isCompact={isCompact}
      onToggleCompact={() => setIsCompact(!isCompact)}
    >
      {students.map((student, index) => {
        const assessment = assessments[student.id];
        if (!assessment) return null; // Skip if no assessment

        return (
          <PrintPageContainer
            key={student.id}
            className={
              isCompact
                ? "!p-[0.7cm] !mb-0 !mt-0 !rounded-none !rounded-b-xl !shadow-md"
                : ""
            }
          >
            <PrintHeader
              title="รายงานผลการพัฒนาผู้เรียนรายบุคคล"
              className={isCompact ? "mb-4" : "mb-8"}
              subtitle={
                <p
                  className={`${isCompact ? "text-xs px-3 py-1 mt-1" : "text-sm px-5 py-1.5"} font-semibold text-sky-700 bg-sky-50 rounded-full border border-sky-100`}
                >
                  ภาคเรียนที่ {assessment.semester} ปีการศึกษา{" "}
                  {assessment.academicYear} • ระดับชั้น{" "}
                  {student.gradeLevel.replace(/\s*\(.*?\)/g, "")}
                </p>
              }
            />

            {/* Student Info */}
            <div
              className={`border border-sky-200 bg-sky-50/50 rounded-xl text-slate-800 ${isCompact ? "p-3 mb-3 mt-1" : "p-5 mb-6 mt-2"}`}
            >
              <div
                className={`grid grid-cols-2 ${isCompact ? "gap-2 text-xs" : "gap-4 text-base"}`}
              >
                <div>
                  <span className="font-bold text-sky-900">
                    รหัสประจำตัวนักเรียน:
                  </span>{" "}
                  {student.studentId}
                </div>
                <div>
                  <span className="font-bold text-sky-900">เลขที่:</span>{" "}
                  {student.number}
                </div>
                <div className="col-span-2">
                  <span className="font-bold text-sky-900">ชื่อ-นามสกุล:</span>{" "}
                  {student.firstName} {student.lastName}{" "}
                  {student.nickname && (
                    <span className="text-slate-600">({student.nickname})</span>
                  )}
                </div>
              </div>
            </div>

            {/* Assessment Data */}
            <div className={`text-sm ${isCompact ? "space-y-3" : "space-y-6"}`}>
              {/* Narrative Log */}
              <div
                className={`border border-pink-200 bg-pink-50/40 rounded-xl ${isCompact ? "p-3 space-y-3" : "p-5 space-y-5"}`}
              >
                <h3
                  className={`font-bold text-pink-700 border-b border-pink-200 pb-1 flex items-center gap-2 ${isCompact ? "text-sm" : "text-lg pb-2"}`}
                >
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                  บันทึกพัฒนาการรายบุคคล
                </h3>

                <div
                  className={`flex flex-wrap gap-x-8 gap-y-3 bg-white rounded-lg border border-pink-100 ${isCompact ? "text-xs p-2" : "text-sm p-3"}`}
                >
                  <div>
                    <span className="font-bold text-slate-700">
                      การประเมินประจำเดือน:
                    </span>{" "}
                    {assessment.month
                      ? new Date(assessment.month).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                        })
                      : "-"}
                  </div>
                </div>

                <div className={isCompact ? "space-y-2" : "space-y-4"}>
                  <div>
                    <h4
                      className={`font-bold text-slate-800 ${isCompact ? "text-xs mb-0.5" : "text-sm mb-1"}`}
                    >
                      พฤติกรรม/พัฒนาการที่พบ:
                    </h4>
                    <p
                      className={`whitespace-pre-wrap text-slate-700 bg-white rounded border border-slate-100 ${isCompact ? "text-xs p-2" : "text-sm p-3"}`}
                    >
                      {assessment.content || "-"}
                    </p>
                  </div>

                  <div>
                    <h4
                      className={`font-bold text-slate-800 ${isCompact ? "text-xs mb-0.5" : "text-sm mb-1"}`}
                    >
                      วิธีการส่งเสริม/แก้ไขปัญหา:
                    </h4>
                    <p
                      className={`whitespace-pre-wrap text-slate-700 bg-white rounded border border-slate-100 ${isCompact ? "text-xs p-2" : "text-sm p-3"}`}
                    >
                      {assessment.activities || "-"}
                    </p>
                  </div>

                  <div>
                    <h4
                      className={`font-bold text-slate-800 ${isCompact ? "text-xs mb-0.5" : "text-sm mb-1"}`}
                    >
                      ปัญหาอุปสรรค:
                    </h4>
                    <p
                      className={`whitespace-pre-wrap text-slate-700 bg-white rounded border border-slate-100 ${isCompact ? "text-xs p-2" : "text-sm p-3"}`}
                    >
                      {assessment.limitations || "-"}
                    </p>
                  </div>

                  <div>
                    <h4
                      className={`font-bold text-slate-800 ${isCompact ? "text-xs mb-0.5" : "text-sm mb-1"}`}
                    >
                      ผลการพัฒนา/ข้อเสนอแนะ:
                    </h4>
                    <p
                      className={`whitespace-pre-wrap text-slate-700 bg-white rounded border border-slate-100 ${isCompact ? "text-xs p-2" : "text-sm p-3"}`}
                    >
                      {assessment.suggestions || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div
              className={`border-t border-slate-200 grid grid-cols-2 font-serif ${isCompact ? "mt-8 pt-4 gap-6" : "mt-16 pt-8 gap-12"}`}
            >
              <PrintSignatureBox
                role="ครูประจำชั้น / ผู้ประเมิน"
                name={teacher.thaiName || teacher.displayName}
                label="ลงชื่อ"
              />
              <PrintSignatureBox
                role="หัวหน้าฝ่ายวิชาการ / ผู้ตรวจสอบ"
                label="ลงชื่อ"
              />
            </div>
          </PrintPageContainer>
        );
      })}
    </PDFPrintHelper>
  );
};
