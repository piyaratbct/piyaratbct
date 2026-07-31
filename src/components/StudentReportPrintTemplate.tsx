import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Student, SubjectScore, SUBJECTS } from "../types";
import {
  PDFPrintHelper,
  PrintPageContainer,
  PrintHeader,
  PrintSignatureBox,
} from "./PDFPrintHelper";

interface StudentReportPrintTemplateProps {
  students: Student[];
  scores: Record<string, SubjectScore>;
  gradeLevel: string;
  academicYear: string;
  semester: string;
  onClose: () => void;
}

export const StudentReportPrintTemplate: React.FC<StudentReportPrintTemplateProps> = ({
  students,
  scores,
  gradeLevel,
  academicYear,
  semester,
  onClose,
}) => {
  const [isCompact, setIsCompact] = useState(false);

  const [homeroomTeacherName, setHomeroomTeacherName] = useState<string>("");

  useEffect(() => {
    const fetchHomeroomTeacher = async () => {
      try {
        const q = query(
          collection(db, "teachers"),
          where("homeroomClass", "==", gradeLevel)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          setHomeroomTeacherName(data.thaiName || data.displayName || "");
        }
      } catch (error) {
        console.error("Error fetching homeroom teacher:", error);
      }
    };
    if (gradeLevel) {
      fetchHomeroomTeacher();
    }
  }, [gradeLevel]);


  const displayedStudents = students
    .filter((s) => s.gradeLevel === gradeLevel)
    .sort((a, b) => Number(a.number || "0") - Number(b.number || "0"));

  return (
    <PDFPrintHelper
      onClose={onClose}
      documentTitle={`สมุดพก_${gradeLevel}`}
      isCompact={isCompact}
      onToggleCompact={() => setIsCompact(!isCompact)}
    >
      {displayedStudents.map((student) => {
        // Filter subjects based on grade level
        const filteredSubjects = SUBJECTS.filter(subject => {
          if (subject === 'อื่นๆ') return false;
          
          const isPrimary = gradeLevel.includes('ประถม');
          const isPrimaryUpper = isPrimary && (gradeLevel.includes('4') || gradeLevel.includes('5') || gradeLevel.includes('6'));
          const isPrimaryLower = isPrimary && (gradeLevel.includes('1') || gradeLevel.includes('2') || gradeLevel.includes('3'));

          if (subject === 'จินตคณิต' && isPrimaryUpper) {
            return false;
          }
          if (subject === 'ภาษาอังกฤษเพื่อการสื่อสาร' && isPrimaryLower) {
            return false;
          }
          
          return true;
        });

        // Collect scores for this student for all subjects
        const studentScores = filteredSubjects.map((subject) => {
          const key = `${student.id}_${academicYear}_${semester}_${subject}`;
          const score = scores[key];
          return {
            subject,
            totalScore: score?.totalScore || 0,
            grade: score?.grade || "-",
          };
        });

        const standardScores = studentScores.filter(s => s.subject !== 'กิจกรรมลูกเสือ');
        const totalEarnedScore = standardScores.reduce((acc, curr) => acc + curr.totalScore, 0);
        const validGrades = standardScores.filter(s => s.grade !== '-' && !isNaN(Number(s.grade))).map(s => Number(s.grade));
        const gpa = validGrades.length > 0 
          ? (validGrades.reduce((acc, curr) => acc + curr, 0) / validGrades.length).toFixed(2)
          : "-";

        return (
          <PrintPageContainer key={student.id}>
            <PrintHeader
              title="สมุดพก / ใบแจ้งผลการเรียน (ปพ.6)"
              subtitle={
                <div className="flex flex-col gap-1 mt-4 text-sm text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <p><strong>ชื่อ-นามสกุล:</strong> {student.firstName} {student.lastName}</p>
                    <p><strong>รหัสประจำตัว:</strong> {student.studentId}</p>
                    <p><strong>ระดับชั้น:</strong> {gradeLevel}</p>
                    <p><strong>เลขที่:</strong> {student.number || "-"}</p>
                    <p><strong>ภาคเรียนที่:</strong> {semester}</p>
                    <p><strong>ปีการศึกษา:</strong> {academicYear}</p>
                  </div>
                </div>
              }
            />

            <div className="mt-8 mb-8 min-h-[300px]">
              <table className="w-full text-sm border-collapse border border-slate-900">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-900 px-4 py-3 text-center w-16">ลำดับ</th>
                    <th className="border border-slate-900 px-4 py-3 text-left">รายวิชา</th>
                    <th className="border border-slate-900 px-4 py-3 text-center w-24">คะแนนรวม<br/>(100)</th>
                    <th className="border border-slate-900 px-4 py-3 text-center w-24">ระดับผลการเรียน<br/>(เกรด)</th>
                  </tr>
                </thead>
                <tbody>
                  {studentScores.map((score, index) => (
                    <tr key={index}>
                      <td className="border border-slate-900 px-4 py-1.5 text-center">{index + 1}</td>
                      <td className="border border-slate-900 px-4 py-1.5 text-left">{score.subject}</td>
                      <td className="border border-slate-900 px-4 py-1.5 text-center">{score.totalScore}</td>
                      <td className="border border-slate-900 px-4 py-1.5 text-center font-bold text-lg">{score.grade}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={2} className="border border-slate-900 px-4 py-3 text-right">สรุปผลการเรียน</td>
                    <td className="border border-slate-900 px-4 py-3 text-center text-indigo-600">{totalEarnedScore}</td>
                    <td className="border border-slate-900 px-4 py-3 text-center text-emerald-600 text-xl">GPA: {gpa}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 mt-12 page-break-inside-avoid">
              <PrintSignatureBox
                role="ครูประจำชั้น"
                name={homeroomTeacherName}
                label="(ลงชื่อ) ....................................................... "
              />
              <PrintSignatureBox
                role="ผู้อำนวยการโรงเรียน"
                label="(ลงชื่อ) ....................................................... "
              />
            </div>
          </PrintPageContainer>
        );
      })}
    </PDFPrintHelper>
  );
};
