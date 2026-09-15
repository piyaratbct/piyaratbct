import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Student, SubjectScore, SUBJECTS, CurriculumSubject, sortSubjects } from "../types";
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
  const [schoolSubjects, setSchoolSubjects] = useState<CurriculumSubject[]>([]);

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
    
    const fetchSchoolSubjects = async () => {
      try {
        const baseGrade = gradeLevel.split('/')[0].trim();
        const sq = query(collection(db, "curriculums"), where("gradeLevel", "==", baseGrade));
        const ssnap = await getDocs(sq);
        if (!ssnap.empty) {
          setSchoolSubjects(ssnap.docs.map(d => ({ id: d.id, ...d.data() } as CurriculumSubject)));
        }
      } catch (e) {
        console.error("Error fetching curriculums", e);
      }
    };

    if (gradeLevel) {
      fetchHomeroomTeacher();
      fetchSchoolSubjects();
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
        let studentScores: any[] = [];
        
        if (schoolSubjects.length > 0) {
           const isKinder = gradeLevel.includes('อนุบาล');
           const isPrim = gradeLevel.includes('ประถม');
           
           const parentsAndStandalone = schoolSubjects.filter(s => {
              if (isPrim && (s.subjectName.includes('ปฐมวัย') || s.subjectName.includes('การศึกษาปฐมวัย'))) return false;
              if (isKinder && !s.subjectName.includes('ปฐมวัย')) return false;
              return s.isParent || (!s.isParent && !s.parentId);
           }).sort(sortSubjects);
           studentScores = parentsAndStandalone.map(subjectDef => {
             if (subjectDef.isParent) {
                const children = schoolSubjects.filter(s => s.parentId === subjectDef.id);
                let totalScore = 0;
                let hasAnyScore = false;
                
                children.forEach(child => {
                  const key = `${student.id}_${academicYear}_${semester}_${child.subjectName}`;
                  const scoreObj = scores[key];
                  if (scoreObj && scoreObj.totalScore !== undefined && scoreObj.totalScore !== null) {
                     totalScore += scoreObj.totalScore * ((child.weightPercentage || 0) / 100);
                     hasAnyScore = true;
                  }
                });
                
                const parentKey = `${student.id}_${academicYear}_${semester}_${subjectDef.subjectName}`;
                const parentScoreObj = scores[parentKey];
                
                if (children.length === 0 && parentScoreObj) {
                  totalScore = parentScoreObj.totalScore || 0;
                  hasAnyScore = true;
                } else if (children.length > 0 && parentScoreObj && !hasAnyScore) {
                  totalScore = parentScoreObj.totalScore || 0;
                  hasAnyScore = true;
                }
                
                totalScore = Math.round(totalScore);
                let grade = "-";
                if (hasAnyScore) {
                  if (totalScore >= 80) grade = "4";
                  else if (totalScore >= 75) grade = "3.5";
                  else if (totalScore >= 70) grade = "3";
                  else if (totalScore >= 65) grade = "2.5";
                  else if (totalScore >= 60) grade = "2";
                  else if (totalScore >= 55) grade = "1.5";
                  else if (totalScore >= 50) grade = "1";
                  else if (totalScore > 0) grade = "0";
                }

                return {
                   subjectCode: subjectDef.subjectCode || "-",
                   subjectName: subjectDef.subjectName,
                   subject: subjectDef.subjectName,
                   totalScore: hasAnyScore ? totalScore : "-",
                   grade: hasAnyScore ? grade : "-",
                   isScout: subjectDef.subjectName.includes("ลูกเสือ")
                };
             } else {
                const key = `${student.id}_${academicYear}_${semester}_${subjectDef.subjectName}`;
                const score = scores[key];
                return {
                  subjectCode: subjectDef.subjectCode || "-",
                  subjectName: subjectDef.subjectName,
                  subject: subjectDef.subjectName,
                  totalScore: score?.totalScore ?? "-",
                  grade: score?.grade || "-",
                  isScout: subjectDef.subjectName.includes("ลูกเสือ")
                };
             }
           });
        } else {
          // Fallback to default subjects
          const filteredSubjects = SUBJECTS.filter(subject => {
            if (subject === 'อื่นๆ') return false;
            
            const isKindergarten = gradeLevel.includes('อนุบาล');
            const isPrimary = gradeLevel.includes('ประถม');
            const isPrimaryUpper = isPrimary && (gradeLevel.includes('4') || gradeLevel.includes('5') || gradeLevel.includes('6'));
            const isPrimaryLower = isPrimary && (gradeLevel.includes('1') || gradeLevel.includes('2') || gradeLevel.includes('3'));
  
            if (isKindergarten && !subject.includes('ปฐมวัย')) {
               return false;
            }
            if (isPrimary && subject.includes('ปฐมวัย')) {
               return false;
            }

            if (subject === 'จินตคณิต' && isPrimaryUpper) {
              return false;
            }
            if (subject === 'ภาษาอังกฤษเพื่อการสื่อสาร' && isPrimaryLower) {
              return false;
            }
            
            return true;
          });
  
          studentScores = filteredSubjects.map((subject) => {
            const key = `${student.id}_${academicYear}_${semester}_${subject}`;
            const score = scores[key];
            return {
              subjectCode: "-",
              subjectName: subject,
              subject,
              totalScore: score?.totalScore || "-",
              grade: score?.grade || "-",
              isScout: subject.includes('ลูกเสือ')
            };
          });
        }

        studentScores.sort(sortSubjects);
        const standardScores = studentScores.filter(s => !s.isScout);
        const totalEarnedScore = standardScores.reduce((acc, curr) => acc + (typeof curr.totalScore === 'number' ? curr.totalScore : 0), 0);
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
                    <th className="border border-slate-900 px-4 py-3 text-center w-24">รหัสวิชา</th>
                    <th className="border border-slate-900 px-4 py-3 text-left">รายวิชา</th>
                    <th className="border border-slate-900 px-4 py-3 text-center w-24">คะแนนรวม<br/>(100)</th>
                    <th className="border border-slate-900 px-4 py-3 text-center w-24">ระดับผลการเรียน<br/>(เกรด)</th>
                  </tr>
                </thead>
                <tbody>
                  {studentScores.map((score, index) => (
                    <tr key={index}>
                      <td className="border border-slate-900 px-4 py-1.5 text-center">{score.subjectCode}</td>
                      <td className="border border-slate-900 px-4 py-1.5 text-left">{score.subjectName}</td>
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
