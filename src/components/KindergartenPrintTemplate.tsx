import React, { useState } from "react";
import { Student, KindergartenAssessment, Teacher } from "../types";
import { formatThaiMonthYear } from '../lib/dateUtils';
import {
  PDFPrintHelper,
  PrintPageContainer,
  PrintHeader,
  PrintSignatureBox,
} from "./PDFPrintHelper";

interface KindergartenPrintTemplateProps {
  students: Student[];
  assessments: Record<string, KindergartenAssessment>;
  teacher: Teacher;
  academicYear: string;
  semester: string;
  onClose: () => void;
}

export const KindergartenPrintTemplate: React.FC<KindergartenPrintTemplateProps> = ({
  students,
  assessments,
  teacher,
  academicYear,
  semester,
  onClose,
}) => {
  const teacherIdentifier = (
    teacher.employeeId ||
    teacher.thaiName ||
    "ครูผู้สอน"
  ).replace(/[\/\\:*?"<>|\s]/g, "_");

  const gradeLevel = students.length > 0 ? students[0].gradeLevel : "ไม่ระบุ";
  
  // Try to find the assessment month from the first available assessment
  const sampleAssessment = Object.values(assessments).find(a => (a as any).studentId) as any;
  const assessmentMonth = sampleAssessment?.month;

  const getScoreText = (score: number) => {
    if (score === 3) return "ดี";
    if (score === 2) return "พอใช้";
    if (score === 1) return "ควรส่งเสริม";
    return "-";
  };

  return (
    <PDFPrintHelper
      title="พิมพ์แบบประเมินพัฒนาการเด็กปฐมวัย"
      documentTitle={`Kindergarten_Assessment_${gradeLevel}_${teacherIdentifier}`}
      onClose={onClose}
    >
      <PrintPageContainer>
        <PrintHeader
          title="แบบประเมินพัฒนาการเด็กปฐมวัย"
          subtitle={`ชั้น${gradeLevel} ภาคเรียนที่ ${semester} ปีการศึกษา ${academicYear}`}
        />
        
        {assessmentMonth && (
          <div className="text-center mb-6 font-bold">
            ประจำเดือน: {formatThaiMonthYear(assessmentMonth)}
          </div>
        )}

        {students.map((student, idx) => {
          const assessment = assessments[student.id];
          if (!assessment) return null;

          return (
            <div key={student.id} className="mb-12 page-break-inside-avoid border border-slate-200 rounded-lg p-6">
              <div className="flex justify-between items-end mb-4 pb-2 border-b-2 border-slate-800">
                <div>
                  <h3 className="font-bold text-lg">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm">
                    เลขที่: {student.number} | รหัสประจำตัว: {student.studentId}
                  </p>
                </div>
                <div className="text-right text-sm">
                  {assessmentMonth && <p>ประจำเดือน: {formatThaiMonthYear(assessmentMonth)}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <h4 className="font-bold mb-2">ด้านร่างกาย</h4>
                  <table className="w-full text-sm border-collapse mb-4">
                    <tbody>
                      <tr>
                        <td className="border p-2">มาตรฐานที่ 1 ร่างกายเจริญเติบโตตามวัยฯ</td>
                        <td className="border p-2 text-center w-24">{getScoreText(assessment.standard1)}</td>
                      </tr>
                      <tr>
                        <td className="border p-2">มาตรฐานที่ 2 กล้ามเนื้อแข็งแรงคล่องแคล่วฯ</td>
                        <td className="border p-2 text-center w-24">{getScoreText(assessment.standard2)}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <h4 className="font-bold mb-2">ด้านอารมณ์ จิตใจ</h4>
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      <tr>
                        <td className="border p-2">มาตรฐานที่ 3 มีสุขภาพจิตดีและมีความสุข</td>
                        <td className="border p-2 text-center w-24">{getScoreText(assessment.standard3)}</td>
                      </tr>
                      <tr>
                        <td className="border p-2">มาตรฐานที่ 4 ชื่นชมศิลปะ ดนตรี การเคลื่อนไหว</td>
                        <td className="border p-2 text-center w-24">{getScoreText(assessment.standard4)}</td>
                      </tr>
                      <tr>
                        <td className="border p-2">มาตรฐานที่ 5 มีคุณธรรม จริยธรรมฯ</td>
                        <td className="border p-2 text-center w-24">{getScoreText(assessment.standard5)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="font-bold mb-2">ด้านสังคม</h4>
                  <table className="w-full text-sm border-collapse mb-4">
                    <tbody>
                      <tr>
                        <td className="border p-2">มาตรฐานที่ 6 มีทักษะชีวิตและหลักเศรษฐกิจพอเพียง</td>
                        <td className="border p-2 text-center w-24">{getScoreText(assessment.standard6)}</td>
                      </tr>
                      <tr>
                        <td className="border p-2">มาตรฐานที่ 7 รักธรรมชาติ สิ่งแวดล้อม วัฒนธรรมฯ</td>
                        <td className="border p-2 text-center w-24">{getScoreText(assessment.standard7)}</td>
                      </tr>
                      <tr>
                        <td className="border p-2">มาตรฐานที่ 8 อยู่ร่วมกับผู้อื่นอย่างมีความสุข</td>
                        <td className="border p-2 text-center w-24">{getScoreText(assessment.standard8)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <h4 className="font-bold mb-2">ด้านสติปัญญา</h4>
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      <tr>
                        <td className="border p-2">มาตรฐานที่ 9 ใช้ภาษาสื่อสารได้เหมาะสมกับวัย</td>
                        <td className="border p-2 text-center w-24">{getScoreText(assessment.standard9)}</td>
                      </tr>
                      <tr>
                        <td className="border p-2">มาตรฐานที่ 10 มีความสามารถในการคิดพื้นฐานฯ</td>
                        <td className="border p-2 text-center w-24">{getScoreText(assessment.standard10)}</td>
                      </tr>
                      <tr>
                        <td className="border p-2">มาตรฐานที่ 11 มีจินตนาการและความคิดสร้างสรรค์</td>
                        <td className="border p-2 text-center w-24">{getScoreText(assessment.standard11)}</td>
                      </tr>
                      <tr>
                        <td className="border p-2">มาตรฐานที่ 12 มีเจตคติที่ดีต่อการเรียนรู้ฯ</td>
                        <td className="border p-2 text-center w-24">{getScoreText(assessment.standard12)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {assessment.teacherNotes && (
                <div className="mb-6 border p-4 bg-slate-50 text-sm">
                  <span className="font-bold">ข้อเสนอแนะเพิ่มเติม: </span>
                  {assessment.teacherNotes}
                </div>
              )}

              <div className="flex justify-end mt-8">
                <PrintSignatureBox
                  role="ผู้ประเมิน"
                  name={teacher.thaiName}
                  label="ครูประจำชั้น"
                />
              </div>
            </div>
          );
        })}
      </PrintPageContainer>
    </PDFPrintHelper>
  );
};
