import React, { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Student, SubjectScore, SUBJECTS, CurriculumSubject, sortSubjects } from "../types";
import {
  PDFPrintHelper,
  PrintPageContainer,
  PrintHeader,
  PrintSignatureBox,
} from "./PDFPrintHelper";
import { TrendingUp } from "lucide-react";

interface StudentReportPrintTemplateProps {
  students: Student[];
  scores: Record<string, SubjectScore>;
  gradeLevel: string;
  academicYear: string;
  semester: string;
  onClose: () => void;
}

interface ChartItem {
  subjectName: string;
  shortName: string;
  studentScore: number | null;
  gradeAverage: number | null;
}

const getShortSubjectName = (name: string): string => {
  if (name.includes('ภาษาไทย')) return 'ไทย';
  if (name.includes('คณิต')) return 'คณิต';
  if (name.includes('วิทยาศาสตร์')) return 'วิทย์';
  if (name.includes('สังคม')) return 'สังคม';
  if (name.includes('ประวัติ')) return 'ประวัติ';
  if (name.includes('สุขศึกษา') || name.includes('พลศึกษา')) return 'สุข/พละ';
  if (name.includes('ศิลปะ') || name.includes('ดนตรี') || name.includes('ทัศนศิลป์')) return 'ศิลปะ';
  if (name.includes('การงาน')) return 'การงาน';
  if (name.includes('ภาษาอังกฤษเพื่อการสื่อสาร')) return 'อ.สื่อสาร';
  if (name.includes('ภาษาอังกฤษ') || name.includes('ต่างประเทศ')) return 'อังกฤษ';
  if (name.includes('ป้องกันการทุจริต')) return 'ต้านทุจริต';
  if (name.includes('จินตคณิต')) return 'จินตคณิต';
  if (name.includes('คอมพิวเตอร์')) return 'คอม';
  return name.length > 7 ? name.slice(0, 6) + '..' : name;
};

const ComparisonLineChart: React.FC<{
  data: ChartItem[];
  isCompact?: boolean;
}> = ({ data, isCompact }) => {
  const width = 640;
  const height = isCompact ? 115 : 125;
  const padLeft = 32;
  const padRight = 20;
  const padTop = 18;
  const padBottom = 22;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const yForScore = (s: number) => padTop + plotHeight * (1 - Math.max(0, Math.min(100, s)) / 100);

  const N = data.length;
  if (N === 0) return null;

  const getX = (index: number) => padLeft + (index + 0.5) * (plotWidth / N);

  // Build points for average and student scores
  const avgPoints: { x: number; y: number; val: number }[] = [];
  const studentPoints: { x: number; y: number; val: number }[] = [];

  data.forEach((item, i) => {
    const x = getX(i);
    if (item.gradeAverage !== null && !isNaN(item.gradeAverage)) {
      avgPoints.push({ x, y: yForScore(item.gradeAverage), val: item.gradeAverage });
    }
    if (item.studentScore !== null && !isNaN(item.studentScore)) {
      studentPoints.push({ x, y: yForScore(item.studentScore), val: item.studentScore });
    }
  });

  const avgPointsStr = avgPoints.map(p => `${p.x},${p.y}`).join(' ');
  const studentPointsStr = studentPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto overflow-visible select-none"
      style={{ maxHeight: isCompact ? '115px' : '130px' }}
    >
      {/* Background horizontal grid lines */}
      {[0, 20, 40, 60, 80, 100].map(s => {
        const y = yForScore(s);
        return (
          <g key={s}>
            <line
              x1={padLeft}
              x2={padLeft + plotWidth}
              y1={y}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={s === 0 || s === 100 ? 'none' : '3 3'}
            />
            <text
              x={padLeft - 4}
              y={y + 3}
              fill="#64748b"
              fontSize="8"
              fontWeight="600"
              textAnchor="end"
            >
              {s}
            </text>
          </g>
        );
      })}


      {/* Grade Average Polyline & Points (dashed amber) */}
      {avgPoints.length > 1 && (
        <polyline
          points={avgPointsStr}
          fill="none"
          stroke="#d97706"
          strokeWidth="1.8"
          strokeDasharray="5 3"
        />
      )}
      {avgPoints.map((p, i) => (
        <g key={`avg-${i}`}>
          <rect
            x={p.x - 3}
            y={p.y - 3}
            width={6}
            height={6}
            fill="#d97706"
            rx="1"
          />
          <text
            x={p.x}
            y={p.y - 5}
            fill="#b45309"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
          >
            {p.val}
          </text>
        </g>
      ))}

      {/* Student Score Polyline & Points (solid blue) */}
      {studentPoints.length > 1 && (
        <polyline
          points={studentPointsStr}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2.4"
        />
      )}
      {studentPoints.map((p, i) => {
        // Prevent label clipping if score is near 100
        const isNearTop = p.y < padTop + 14;
        return (
          <g key={`std-${i}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <text
              x={p.x}
              y={isNearTop ? p.y + 12 : p.y - 6}
              fill="#1d4ed8"
              fontSize="9"
              fontWeight="900"
              textAnchor="middle"
            >
              {p.val}
            </text>
          </g>
        );
      })}

      {/* X-axis subject labels */}
      {data.map((item, i) => {
        const x = getX(i);
        return (
          <g key={`x-${i}`}>
            <line
              x1={x}
              x2={x}
              y1={padTop + plotHeight}
              y2={padTop + plotHeight + 3}
              stroke="#94a3b8"
              strokeWidth="1"
            />
            <text
              x={x}
              y={padTop + plotHeight + 14}
              fill="#1e293b"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              {item.shortName}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const StudentReportPrintTemplate: React.FC<StudentReportPrintTemplateProps> = ({
  students,
  scores,
  gradeLevel,
  academicYear,
  semester,
  onClose,
}) => {
  const [isCompact, setIsCompact] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [homeroomTeacherName, setHomeroomTeacherName] = useState<string>("");
  const [schoolSubjects, setSchoolSubjects] = useState<CurriculumSubject[]>([]);

  const baseGrade = gradeLevel.split('/')[0].trim();

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
  }, [gradeLevel, baseGrade]);

  const displayedStudents = useMemo(() => {
    return students
      .filter((s) => s.gradeLevel === gradeLevel)
      .sort((a, b) => Number(a.number || "0") - Number(b.number || "0"));
  }, [students, gradeLevel]);

  // All peers in the same base grade (e.g. all P.1 students across sections)
  const gradePeers = useMemo(() => {
    return students.filter(
      (s) => s.gradeLevel && s.gradeLevel.split('/')[0].trim() === baseGrade
    );
  }, [students, baseGrade]);

  // Map of children subjects by parentId
  const childrenMap = useMemo(() => {
    const map: Record<string, CurriculumSubject[]> = {};
    schoolSubjects.forEach(s => {
      if (s.parentId) {
        if (!map[s.parentId]) map[s.parentId] = [];
        map[s.parentId].push(s);
      }
    });
    return map;
  }, [schoolSubjects]);

  // Master list of relevant subjects for this grade
  const targetSubjects = useMemo(() => {
    if (schoolSubjects.length > 0) {
      const isKinder = gradeLevel.includes('อนุบาล');
      const isPrim = gradeLevel.includes('ประถม');
      return schoolSubjects
        .filter(s => {
          if (isPrim && (s.subjectName.includes('ปฐมวัย') || s.subjectName.includes('การศึกษาปฐมวัย'))) return false;
          if (isKinder && !s.subjectName.includes('ปฐมวัย')) return false;
          return s.isParent || (!s.isParent && !s.parentId);
        })
        .sort(sortSubjects);
    } else {
      const filtered = SUBJECTS.filter(subject => {
        if (subject === 'อื่นๆ') return false;
        const isKindergarten = gradeLevel.includes('อนุบาล');
        const isPrimary = gradeLevel.includes('ประถม');
        const isPrimaryUpper = isPrimary && (gradeLevel.includes('4') || gradeLevel.includes('5') || gradeLevel.includes('6'));
        const isPrimaryLower = isPrimary && (gradeLevel.includes('1') || gradeLevel.includes('2') || gradeLevel.includes('3'));

        if (isKindergarten && !subject.includes('ปฐมวัย')) return false;
        if (isPrimary && subject.includes('ปฐมวัย')) return false;
        if (subject === 'จินตคณิต' && isPrimaryUpper) return false;
        if (subject === 'ภาษาอังกฤษเพื่อการสื่อสาร' && isPrimaryLower) return false;
        return true;
      });
      return filtered.map(name => ({
        id: name,
        subjectName: name,
        subjectCode: '-',
        isParent: false
      } as CurriculumSubject));
    }
  }, [schoolSubjects, gradeLevel]);

  // Helper to compute numeric score for a specific student and subject
  const computeStudentSubjectScore = (studentId: string, subjectDef: CurriculumSubject): number | null => {
    if (subjectDef.isParent && subjectDef.id) {
      const children = childrenMap[subjectDef.id] || [];
      let totalScore = 0;
      let hasAnyScore = false;

      children.forEach(child => {
        const key = `${studentId}_${academicYear}_${semester}_${child.subjectName}`;
        const scoreObj = scores[key];
        if (scoreObj && scoreObj.totalScore !== undefined && scoreObj.totalScore !== null) {
          totalScore += scoreObj.totalScore * ((child.weightPercentage || 0) / 100);
          hasAnyScore = true;
        }
      });

      const parentKey = `${studentId}_${academicYear}_${semester}_${subjectDef.subjectName}`;
      const parentScoreObj = scores[parentKey];

      if (children.length === 0 && parentScoreObj && parentScoreObj.totalScore !== undefined) {
        return parentScoreObj.totalScore;
      } else if (children.length > 0 && parentScoreObj && !hasAnyScore && parentScoreObj.totalScore !== undefined) {
        return parentScoreObj.totalScore;
      }

      return hasAnyScore ? Math.round(totalScore) : null;
    } else {
      const key = `${studentId}_${academicYear}_${semester}_${subjectDef.subjectName}`;
      const scoreObj = scores[key];
      return (scoreObj && typeof scoreObj.totalScore === 'number') ? scoreObj.totalScore : null;
    }
  };

  // Grade-level averages across all peers
  const gradeAverages = useMemo(() => {
    const avgs: Record<string, number> = {};
    if (gradePeers.length === 0 || targetSubjects.length === 0) return avgs;

    targetSubjects.forEach(subj => {
      let sum = 0;
      let count = 0;
      gradePeers.forEach(peer => {
        const score = computeStudentSubjectScore(peer.id, subj);
        if (score !== null && !isNaN(score)) {
          sum += score;
          count++;
        }
      });
      if (count > 0) {
        avgs[subj.subjectName] = Math.round((sum / count) * 10) / 10;
      }
    });

    return avgs;
  }, [gradePeers, targetSubjects, scores, academicYear, semester, childrenMap]);

  // Check if class has many subjects (primary curriculum usually has 9-14 subjects)
  const isSubjectHeavy = targetSubjects.length > 8 || displayedStudents.length > 0;
  const effectiveCompact = isCompact || isSubjectHeavy;

  const extraControls = (
    <button
      onClick={() => setShowChart(!showChart)}
      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
        showChart
          ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs border border-indigo-500"
          : "bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600"
      }`}
      title="เปิดหรือปิดการแสดงกราฟเส้นเปรียบเทียบคะแนนกับค่าเฉลี่ยระดับชั้นในสมุดพก (ปพ.6)"
    >
      <TrendingUp className="w-3.5 h-3.5" />
      <span>{showChart ? "✓ กราฟเปรียบเทียบ: แสดง" : "📈 กราฟเปรียบเทียบ: ซ่อน"}</span>
    </button>
  );

  return (
    <PDFPrintHelper
      onClose={onClose}
      documentTitle={`สมุดพก_${gradeLevel}`}
      isCompact={effectiveCompact}
      onToggleCompact={() => setIsCompact(!isCompact)}
      extraControls={extraControls}
    >
      {displayedStudents.map((student) => {
        const studentScores = targetSubjects.map(subjectDef => {
          const numericScore = computeStudentSubjectScore(student.id, subjectDef);
          const hasScore = numericScore !== null;
          
          let grade = "-";
          if (hasScore && numericScore !== null) {
            if (numericScore >= 80) grade = "4";
            else if (numericScore >= 75) grade = "3.5";
            else if (numericScore >= 70) grade = "3";
            else if (numericScore >= 65) grade = "2.5";
            else if (numericScore >= 60) grade = "2";
            else if (numericScore >= 55) grade = "1.5";
            else if (numericScore >= 50) grade = "1";
            else if (numericScore > 0) grade = "0";
          }

          return {
            subjectCode: subjectDef.subjectCode || "-",
            subjectName: subjectDef.subjectName,
            subject: subjectDef.subjectName,
            totalScore: hasScore ? numericScore : "-",
            numericScore: hasScore ? numericScore : null,
            grade,
            isScout: subjectDef.subjectName.includes("ลูกเสือ")
          };
        });

        studentScores.sort(sortSubjects);
        const standardScores = studentScores.filter(s => !s.isScout);
        const totalEarnedScore = standardScores.reduce((acc, curr) => acc + (typeof curr.numericScore === 'number' ? curr.numericScore : 0), 0);
        const validGrades = standardScores.filter(s => s.grade !== '-' && !isNaN(Number(s.grade))).map(s => Number(s.grade));
        const gpa = validGrades.length > 0 
          ? (validGrades.reduce((acc, curr) => acc + curr, 0) / validGrades.length).toFixed(2)
          : "-";

        // Build comparison chart items for this student
        const chartData: ChartItem[] = standardScores.map(s => ({
          subjectName: s.subjectName,
          shortName: getShortSubjectName(s.subjectName),
          studentScore: s.numericScore,
          gradeAverage: gradeAverages[s.subjectName] ?? null
        })).filter(item => item.studentScore !== null || item.gradeAverage !== null);

        return (
          <PrintPageContainer key={student.id} isCompact={effectiveCompact}>
            <PrintHeader
              isCompact={effectiveCompact}
              title="สมุดพก / ใบแจ้งผลการเรียน (ปพ.6)"
              subtitle={
                <div className={`flex flex-col gap-1 ${effectiveCompact ? "mt-1.5 p-2 text-xs rounded-lg" : "mt-3 p-3.5 text-sm rounded-xl"} text-slate-800 bg-slate-50 border border-slate-200 text-left`}>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
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

            <div className={effectiveCompact ? "mt-2 mb-2" : "mt-3 mb-3"}>
              <table className={`w-full ${effectiveCompact ? "text-xs" : "text-sm"} border-collapse border border-slate-900`}>
                <thead>
                  <tr className="bg-slate-100">
                    <th className={`border border-slate-900 ${effectiveCompact ? "px-2 py-1" : "px-3 py-1.5"} text-center w-24 sm:w-28`}>รหัสวิชา</th>
                    <th className={`border border-slate-900 ${effectiveCompact ? "px-3 py-1" : "px-4 py-1.5"} text-left`}>รายวิชา</th>
                    <th className={`border border-slate-900 ${effectiveCompact ? "px-2 py-1" : "px-3 py-1.5"} text-center w-28 sm:w-32`}>คะแนนรวม<br/>(100)</th>
                    <th className={`border border-slate-900 ${effectiveCompact ? "px-2 py-1" : "px-3 py-1.5"} text-center w-28 sm:w-32`}>ระดับผลการเรียน<br/>(เกรด)</th>
                  </tr>
                </thead>
                <tbody>
                  {studentScores.map((score, index) => (
                    <tr key={index}>
                      <td className={`border border-slate-900 ${effectiveCompact ? "px-2 py-0.5" : "px-3 py-1"} text-center`}>{score.subjectCode}</td>
                      <td className={`border border-slate-900 ${effectiveCompact ? "px-2 py-0.5" : "px-3 py-1"} text-left`}>{score.subjectName}</td>
                      <td className={`border border-slate-900 ${effectiveCompact ? "px-2 py-0.5" : "px-3 py-1"} text-center`}>{score.totalScore}</td>
                      <td className={`border border-slate-900 ${effectiveCompact ? "px-2 py-0.5 font-bold text-sm" : "px-3 py-1 font-bold text-base"} text-center`}>{score.grade}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={2} className={`border border-slate-900 ${effectiveCompact ? "px-2 py-1" : "px-3 py-1.5"} text-right`}>สรุปผลการเรียน</td>
                    <td className={`border border-slate-900 ${effectiveCompact ? "px-2 py-1" : "px-3 py-1.5"} text-center text-indigo-600`}>{totalEarnedScore}</td>
                    <td className={`border border-slate-900 ${effectiveCompact ? "px-2 py-1 text-sm" : "px-3 py-1.5 text-base"} text-center text-emerald-600 font-bold`}>GPA: {gpa}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Comparison Line Chart */}
            {showChart && chartData.length > 0 && (
              <div className={`${effectiveCompact ? "mt-2 mb-2" : "mt-2.5 mb-2.5"} border border-slate-800 rounded-lg overflow-hidden bg-white print-break-avoid page-break-inside-avoid shadow-2xs`}>
                <div className="flex items-center justify-between px-2.5 py-1 bg-slate-100 border-b border-slate-300 text-slate-800 text-[11px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                    <span>แผนภูมิเปรียบเทียบคะแนนรายวิชากับคะแนนเฉลี่ยระดับชั้น ({baseGrade})</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-3.5 h-0.5 bg-blue-600"></span>
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block -ml-2.5 mr-0.5"></span>
                      <span className="font-bold text-blue-700">คะแนนนักเรียน</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-3.5 border-t-2 border-dashed border-amber-600"></span>
                      <span className="w-1.5 h-1.5 bg-amber-600 inline-block -ml-2.5 mr-0.5"></span>
                      <span className="font-bold text-amber-700">เฉลี่ยระดับชั้น</span>
                    </div>
                  </div>
                </div>
                <div className="p-1 sm:p-1.5">
                  <ComparisonLineChart
                    data={chartData}
                    isCompact={effectiveCompact}
                  />
                </div>
              </div>
            )}

            {/* Signatures */}
            <div className={`grid grid-cols-2 gap-4 ${effectiveCompact ? "mt-2" : "mt-4"} print-break-avoid page-break-inside-avoid`}>
              <PrintSignatureBox
                role="ครูประจำชั้น"
                name={homeroomTeacherName}
                label="(ลงชื่อ) ....................................................... "
                isCompact={effectiveCompact}
              />
              <PrintSignatureBox
                role="ผู้อำนวยการโรงเรียน"
                label="(ลงชื่อ) ....................................................... "
                isCompact={effectiveCompact}
              />
            </div>
          </PrintPageContainer>
        );
      })}
    </PDFPrintHelper>
  );
};
