import React, { useState } from "react";
import { Student, KindergartenAssessment, Teacher } from "../types";
import { PDFPrintHelper, PrintPageContainer, PrintHeader, PrintSignatureBox } from "./PDFPrintHelper";
import { formatThaiMonthYear } from "../lib/dateUtils";

import { StudentAssessment } from "../types";

interface KindergartenPrintTemplateProps {
  students: Student[];
  assessments: Record<string, KindergartenAssessment>;
  teacher: Teacher;
  academicYear: string;
  semester: string;
  allAssessments?: StudentAssessment[];
  selectedMonth?: string;
  onClose: () => void;
}

export const KindergartenPrintTemplate: React.FC<KindergartenPrintTemplateProps> = ({
  students,
  assessments,
  teacher,
  academicYear,
  semester,
  allAssessments = [],
  selectedMonth = '',
  onClose,
}) => {
  const getBmiLabel = (bmi: number | null | undefined) => {
    if (bmi === null || bmi === undefined) return '-';
    if (bmi < 18.5) return 'ผอม/น้ำหนักน้อย';
    if (bmi >= 18.5 && bmi < 23) return 'สมส่วน/ปกติ';
    if (bmi >= 23 && bmi < 25) return 'ท้วม/น้ำหนักเกิน';
    if (bmi >= 25 && bmi < 30) return 'อ้วน';
    if (bmi >= 30) return 'อ้วนมาก';
    return '-';
  };

  const [isCompact, setIsCompact] = useState(false);
  const teacherIdentifier = (
    teacher.employeeId ||
    teacher.thaiName ||
    "ครูผู้สอน"
  ).replace(/[\/\\:*?"<>|\s]/g, "_");
  const gradeLevel =
    students[0]?.gradeLevel.replace(/[\/\\:*?"<>|\s]/g, "_") || "ไม่ระบุชั้น";
  
  const documentTitle = `แบบประเมินพัฒนาการปฐมวัย_${gradeLevel}_${teacherIdentifier}_${academicYear}_${semester}`;

  return (
    <PDFPrintHelper 
      onClose={onClose} 
      documentTitle={documentTitle}
      isCompact={isCompact}
      onToggleCompact={() => setIsCompact(!isCompact)}
    >
      {students.map((student, index) => {
        const assessment = assessments[student.id];
        if (!assessment) return null;
        
        const assessmentMonth = assessment.month || `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`;

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
              title="รายงานผลการพัฒนาเด็กปฐมวัยรายบุคคล" 
              className={isCompact ? "mb-4" : "mb-8"}
              subtitle={
                <p
                  className={`${isCompact ? "text-xs px-3 py-1 mt-1" : "text-sm px-5 py-1.5"} font-semibold text-pink-700 bg-pink-50 rounded-full border border-pink-100`}
                >
                  ภาคเรียนที่ {semester} ปีการศึกษา{" "}
                  {academicYear} • ระดับชั้น{" "}
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
                  {student.studentId || student.id}
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
                {/* Removed weight/height from here since it's now in the table below */}
              </div>
            </div>

            {/* Assessment Data */}
            <div className={`text-sm ${isCompact ? "space-y-3" : "space-y-6"}`}>
              <div
                className={`border border-pink-200 bg-pink-50/40 rounded-xl ${isCompact ? "p-3 space-y-3" : "p-5 space-y-5"}`}
              >
                <h3
                  className={`font-bold text-pink-700 border-b border-pink-200 pb-1 flex items-center gap-2 ${isCompact ? "text-sm" : "text-lg pb-2"}`}
                >
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                  ผลการประเมินพัฒนาการ
                </h3>
                <div
                  className={`flex flex-wrap gap-x-8 gap-y-3 bg-white rounded-lg border border-pink-100 ${isCompact ? "text-xs p-2" : "text-sm p-3"}`}
                >
                  <div>
                    <span className="font-bold text-slate-700">
                      การประเมินประจำเดือน:
                    </span>{" "}{formatThaiMonthYear(assessmentMonth)}
                  </div>
                </div>

                <div className={isCompact ? "space-y-2" : "space-y-4"}>
                  <div>
                    <h4 className={`font-bold text-slate-800 ${isCompact ? "text-xs mb-0.5" : "text-sm mb-1"}`}>
                      1. ด้านสุขภาวะทางกาย
                    </h4>
                    <p className={`whitespace-pre-wrap text-slate-700 bg-white rounded border border-slate-100 ${isCompact ? "text-xs p-2" : "text-sm p-3"}`}>
                      {assessment.physicalDev || "-"}
                    </p>
                  </div>
                  <div>
                    <h4 className={`font-bold text-slate-800 ${isCompact ? "text-xs mb-0.5" : "text-sm mb-1"}`}>
                      2. ด้านอารมณ์ จิตใจ และสังคม
                    </h4>
                    <p className={`whitespace-pre-wrap text-slate-700 bg-white rounded border border-slate-100 ${isCompact ? "text-xs p-2" : "text-sm p-3"}`}>
                      {assessment.emotionalDev || "-"}
                    </p>
                  </div>
                  <div>
                    <h4 className={`font-bold text-slate-800 ${isCompact ? "text-xs mb-0.5" : "text-sm mb-1"}`}>
                      3. ด้านความเป็นพลเมืองและความเป็นไทย
                    </h4>
                    <p className={`whitespace-pre-wrap text-slate-700 bg-white rounded border border-slate-100 ${isCompact ? "text-xs p-2" : "text-sm p-3"}`}>
                      {assessment.citizenshipDev || "-"}
                    </p>
                  </div>
                  <div>
                    <h4 className={`font-bold text-slate-800 ${isCompact ? "text-xs mb-0.5" : "text-sm mb-1"}`}>
                      4. ด้านสติปัญญา
                    </h4>
                    <p className={`whitespace-pre-wrap text-slate-700 bg-white rounded border border-slate-100 ${isCompact ? "text-xs p-2" : "text-sm p-3"}`}>
                      {assessment.intellectualDev || "-"}
                    </p>
                  </div>
                  
                  {assessment.teacherNotes && (
                    <div>
                      <h4 className={`font-bold text-slate-800 ${isCompact ? "text-xs mb-0.5" : "text-sm mb-1"}`}>
                        ข้อเสนอแนะเพิ่มเติม:
                      </h4>
                      <p className={`whitespace-pre-wrap text-slate-700 bg-white rounded border border-slate-100 ${isCompact ? "text-xs p-2" : "text-sm p-3"}`}>
                        {assessment.teacherNotes}
                      </p>
                    </div>
                  )}

                  {assessment.hasAchievement && assessment.achievementContent && (
                    <div>
                      <h4 className={`font-bold text-slate-800 ${isCompact ? "text-xs mb-0.5" : "text-sm mb-1"}`}>
                        ผลงานและความภาคภูมิใจ:
                      </h4>
                      <p className={`whitespace-pre-wrap text-slate-700 bg-white rounded border border-slate-100 ${isCompact ? "text-xs p-2" : "text-sm p-3"}`}>
                        {assessment.achievementContent}
                      </p>
                    </div>
                  )}

                  {assessment.hasPastoralCare && assessment.pastoralCareContent && (
                    <div>
                      <h4 className={`font-bold text-slate-800 ${isCompact ? "text-xs mb-0.5" : "text-sm mb-1"}`}>
                        การดูแลช่วยเหลือนักเรียน:
                      </h4>
                      <p className={`whitespace-pre-wrap text-slate-700 bg-white rounded border border-slate-100 ${isCompact ? "text-xs p-2" : "text-sm p-3"}`}>
                        {assessment.pastoralCareContent}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Health Info Section */}
            {allAssessments && allAssessments.length > 0 && selectedMonth && (
              <div className={`${isCompact ? "mt-4" : "mt-8"}`}>
                <h3 className="font-bold text-sm mb-2 text-slate-800">ข้อมูลการเจริญเติบโตทางร่างกาย (ประจำเดือน {formatThaiMonthYear(selectedMonth)})</h3>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-300 py-2 px-4 text-center font-bold text-slate-700">เดือนที่ประเมิน</th>
                      <th className="border border-slate-300 py-2 px-4 text-center font-bold text-slate-700">น้ำหนัก (กก.)</th>
                      <th className="border border-slate-300 py-2 px-4 text-center font-bold text-slate-700">ส่วนสูง (ซม.)</th>
                      <th className="border border-slate-300 py-2 px-4 text-center font-bold text-slate-700">BMI</th>
                      <th className="border border-slate-300 py-2 px-4 text-center font-bold text-slate-700">ผลการประเมิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const healthData = allAssessments.find(a => a.studentId === student.id && a.month === selectedMonth);
                      if (healthData && healthData.weight && healthData.height) {
                        const w = healthData.weight;
                        const h = healthData.height / 100;
                        const bmi = w / (h * h);
                        return (
                          <tr>
                            <td className="border border-slate-300 py-2 px-4 text-center font-bold">{formatThaiMonthYear(selectedMonth)}</td>
                            <td className="border border-slate-300 py-2 px-4 text-center">{healthData.weight}</td>
                            <td className="border border-slate-300 py-2 px-4 text-center">{healthData.height}</td>
                            <td className="border border-slate-300 py-2 px-4 text-center">{bmi.toFixed(1)}</td>
                            <td className="border border-slate-300 py-2 px-4 text-center">{getBmiLabel(bmi)}</td>
                          </tr>
                        );
                      }
                      return (
                        <tr>
                          <td className="border border-slate-300 py-2 px-4 text-center font-bold">{formatThaiMonthYear(selectedMonth)}</td>
                          <td colSpan={4} className="border border-slate-300 py-2 px-4 text-center text-slate-500 italic">ไม่มีข้อมูลการวัดในเดือนนี้</td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            )}

            {/* Signatures */}
            <div
              className={`border-t border-slate-200 flex justify-end font-serif ${isCompact ? "mt-4 pt-4" : "mt-12 pt-6"}`}
            >
              <div className="w-64">
                <PrintSignatureBox
                  role="ครูประจำชั้น / ผู้ประเมิน"
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
