import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { SchoolLogo } from "./PrintTemplate";
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
  attendanceStats?: any;
  onClose: () => void;
}

export const SubjectScorePrintTemplate: React.FC<SubjectScorePrintTemplateProps> = ({
  students,
  scores,
  subject,
  gradeLevel,
  academicYear,
  semester,
  teacherName,
  settings,
  attendanceStats,
  onClose,
}) => {
    const [academicHead, setAcademicHead] = useState<string>("................................................");

  useEffect(() => {
    

    const fetchAcademicHead = async () => {
      try {
        const q = query(collection(db, "teachers"), where("role", "==", "academic"));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const academicDoc = querySnapshot.docs[0].data();
          const fullName = `${academicDoc.firstName || ''} ${academicDoc.lastName || ''}`.trim();
          if (fullName) {
            setAcademicHead(fullName);
          }
        }
      } catch (err) {
        console.error("Error fetching academic head:", err);
      }
    };

    
    fetchAcademicHead();
  }, []);

  const calculateGrade = (total: number, subjectName: string, activities?: any, isScoutAttended?: boolean, attendancePercentage?: number): string => {
    if (subjectName === 'กิจกรรมลูกเสือ') {
      const campAttended = isScoutAttended || activities?.scoutCamp === 1;
      const attScore = (attendancePercentage !== undefined && attendancePercentage > 0) ? attendancePercentage : total;
      return (attScore >= 80 && campAttended) ? "ผ" : "มผ";
    }
    if (subjectName === 'กิจกรรมอ่าน-เขียน') {
      if (total >= 80) return "3 (ดีเยี่ยม)";
      if (total >= 65) return "2 (ดี)";
      if (total >= 50) return "1 (ผ่าน)";
      return "0 (ไม่ผ่าน)";
    }
    if (total >= 80) return "4";
    if (total >= 75) return "3.5";
    if (total >= 70) return "3";
    if (total >= 65) return "2.5";
    if (total >= 60) return "2";
    if (total >= 55) return "1.5";
    if (total >= 50) return "1";
    return "0";
  };

  const [isCompact, setIsCompact] = useState(false);

  const displayedStudents = students
    .filter((s) => s.gradeLevel === gradeLevel)
    .sort((a, b) => Number(a.number || "0") - Number(b.number || "0"));

  const gradeDistribution = React.useMemo(() => {
    const dist: Record<string, { male: number; female: number; total: number }> = {};
    let totalAssessed = 0;
    let maleCount = 0;
    let femaleCount = 0;
    
    const isActivity = subject.includes('กิจกรรม') || subject.includes('ลูกเสือ') || subject.includes('แนะแนว') || subject.includes('ชุมนุม');
    const isPrimary12 = gradeLevel === 'ประถมศึกษาปีที่ 1' || gradeLevel === 'ประถมศึกษาปีที่ 2';
    const isReading = subject === 'กิจกรรมอ่าน-เขียน';
    
    const initDist = () => ({ male: 0, female: 0, total: 0 });

    if (isReading) {
      dist['3 (ดีเยี่ยม)'] = initDist();
      dist['2 (ดี)'] = initDist();
      dist['1 (ผ่าน)'] = initDist();
      dist['0 (ไม่ผ่าน)'] = initDist();
    } else if (isActivity) {
      dist['ผ'] = initDist();
      dist['มผ'] = initDist();
    } else if (isPrimary12) {
      dist['ดีเยี่ยม'] = initDist();
      dist['ดี'] = initDist();
      dist['ผ่าน'] = initDist();
      dist['ไม่ผ่าน'] = initDist();
    } else {
      ['4', '3.5', '3', '2.5', '2', '1.5', '1', '0', 'ร', 'มส'].forEach(g => dist[g] = initDist());
    }

    displayedStudents.forEach(st => {
      const key = `${st.id}_${academicYear}_${semester}_${subject}`;
      const score = scores[key] || { totalScore: 0, activities: [] };
      
      let attScore = undefined;
      if (attendanceStats?.studentStats?.[st.id]) {
        const stats = attendanceStats.studentStats[st.id];
        const totalAttended = stats.present + stats.late;
        const totalRecords = stats.present + stats.late + stats.leave + stats.sick + stats.absent;
        const baseTotal = attendanceStats.totalTargetPeriods > 0 ? attendanceStats.totalTargetPeriods : totalRecords;
        attScore = baseTotal > 0 ? (totalAttended / baseTotal) * 100 : 0;
      }
      
      const g = calculateGrade(score.totalScore || 0, subject, score.activities, undefined, attScore);
      if (g && g !== '-') {
        if (dist[g] === undefined) dist[g] = initDist();
        dist[g].total++;
        if (st.gender === 'male' || (st.firstName && st.firstName.startsWith('เด็กชาย')) || (st.firstName && st.firstName.startsWith('นาย'))) {
          dist[g].male++;
          maleCount++;
        } else {
          dist[g].female++;
          femaleCount++;
        }
        totalAssessed++;
      }
    });

    return { dist, totalAssessed, maleCount, femaleCount };
  }, [displayedStudents, scores, academicYear, semester, subject, attendanceStats, gradeLevel]);

  const totalMaleInClass = React.useMemo(() => {
    return displayedStudents.filter(s => s.gender === 'male' || (s.firstName && (s.firstName.startsWith('เด็กชาย') || s.firstName.startsWith('นาย')))).length;
  }, [displayedStudents]);

  const totalFemaleInClass = React.useMemo(() => {
    return displayedStudents.filter(s => s.gender === 'female' || (s.firstName && (s.firstName.startsWith('เด็กหญิง') || s.firstName.startsWith('นางสาว') || s.firstName.startsWith('นาง')))).length;
  }, [displayedStudents]);

  const totalStudentsInClass = displayedStudents.length;

  const scoreStats = React.useMemo(() => {
    const validScores = displayedStudents
      .map(st => {
        const key = `${st.id}_${academicYear}_${semester}_${subject}`;
        return scores[key]?.totalScore;
      })
      .filter((sc): sc is number => typeof sc === 'number' && !isNaN(sc) && sc > 0);

    const avg = validScores.length > 0 
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)
      : '-';
    const max = validScores.length > 0 ? Math.max(...validScores) : '-';
    const min = validScores.length > 0 ? Math.min(...validScores) : '-';

    return { avg, max, min };
  }, [displayedStudents, scores, academicYear, semester, subject]);

  // ลำดับผลการเรียนเรียงจากมากไปน้อย และตัด "ร", "มส" ออก
  const gradesList = React.useMemo(() => {
    const isActivity = subject.includes('กิจกรรม') || subject.includes('แนะแนว') || subject.includes('ลูกเสือ') || subject.includes('ชุมนุม') || subject.includes('เพื่อสังคม');
    const isReading = subject.includes('อ่าน คิดวิเคราะห์') || subject.includes('คุณลักษณะ');
    const isPrimary12 = gradeLevel.includes('ป.1') || gradeLevel.includes('ป.2');

    if (isReading) {
      return ['3 (ดีเยี่ยม)', '2 (ดี)', '1 (ผ่าน)', '0 (ไม่ผ่าน)'];
    } else if (isActivity) {
      return ['ผ', 'มผ'];
    } else if (isPrimary12) {
      return ['ดีเยี่ยม', 'ดี', 'ผ่าน', 'ไม่ผ่าน'];
    } else {
      // เรียงจากมากไปน้อย 4 -> 0 และตัด "ร" กับ "มส" ออกตามที่ระบุ
      return ['4', '3.5', '3', '2.5', '2', '1.5', '1', '0'];
    }
  }, [subject, gradeLevel]);

  // สรุปยอดนักเรียนที่ผ่านและไม่ผ่าน
  const { passedCount, failedCount, passedPct, failedPct, totalEvaluated } = React.useMemo(() => {
    let pass = 0;
    let fail = 0;
    
    gradesList.forEach(grade => {
      const cnt = gradeDistribution.dist[grade]?.total || 0;
      if (grade === '0' || grade === 'ไม่ผ่าน' || grade === '0 (ไม่ผ่าน)' || grade === 'มผ') {
        fail += cnt;
      } else {
        pass += cnt;
      }
    });

    const total = pass + fail;
    const pPct = total > 0 ? ((pass / total) * 100).toFixed(2) : '0.00';
    const fPct = total > 0 ? ((fail / total) * 100).toFixed(2) : '0.00';

    return {
      passedCount: pass,
      failedCount: fail,
      passedPct: pPct,
      failedPct: fPct,
      totalEvaluated: total,
    };
  }, [gradesList, gradeDistribution]);

  // Chunk students into pages of 20
  const ITEMS_PER_PAGE = isCompact ? 25 : 15;
  const pages = [];
  for (let i = 0; i < displayedStudents.length; i += ITEMS_PER_PAGE) {
    pages.push(displayedStudents.slice(i, i + ITEMS_PER_PAGE));
  }
  
  if (pages.length === 0) pages.push([]);

  const formatColumnHeader = (name: string, maxScore: number) => {
    let namePart = name;
    let indicatorPart = null;
    const parenIndex = name.indexOf(' (');
    if (parenIndex !== -1 && name.endsWith(')')) {
      namePart = name.substring(0, parenIndex);
      indicatorPart = name.substring(parenIndex + 1, name.length - 1);
    }
    return (
      <div className="flex flex-col items-center justify-center leading-tight">
        <span className="mb-0.5">{namePart}</span>
        {indicatorPart && <span className="text-[9px] text-slate-500 font-normal leading-tight max-w-[80px] whitespace-normal break-words">({indicatorPart})</span>}
        <span className="text-slate-400 mt-0.5">({maxScore})</span>
      </div>
    );
  };

  const bmk = settings?.beforeMidKnowledge || [];
  const bms = settings?.beforeMidSoftSkill || [];
  const amk = settings?.afterMidKnowledge || [];
  const ams = settings?.afterMidSoftSkill || [];

  const bmkTotal = bmk.reduce((sum, act) => sum + act.maxScore, 0);
  const bmsTotal = bms.reduce((sum, act) => sum + act.maxScore, 0);
  const amkTotal = amk.reduce((sum, act) => sum + act.maxScore, 0);
  const amsTotal = ams.reduce((sum, act) => sum + act.maxScore, 0);

  const isSpecialSubject = ['กิจกรรมลูกเสือ', 'กิจกรรมอ่าน-เขียน'].includes(subject);

  return (
    <PDFPrintHelper
      onClose={onClose}
      documentTitle={`รายงานผลการเรียน_${gradeLevel}_${subject}`}
      isCompact={isCompact}
      onToggleCompact={() => setIsCompact(!isCompact)}
      layout="landscape"
    >
      {/* Cover Page */}
      <PrintPageContainer layout="landscape" className="flex flex-col justify-between" isCompact={isCompact}>
        <div className="w-full h-full border-[4px] border-double border-slate-800 p-6 flex flex-col justify-between items-center bg-white relative m-auto box-border">
          
          {/* Header */}
          <div className="text-center space-y-3 w-full mt-4">
            <div className="w-16 h-16 mx-auto border-2 border-slate-900 rounded-full flex items-center justify-center mb-2">
              <SchoolLogo className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-wide">แบบบันทึกผลการพัฒนาคุณภาพผู้เรียน (ปพ.5)</h1>
            <h2 className="text-lg font-medium text-slate-700">ปีการศึกษา {academicYear}</h2>
          </div>

          {/* Core Info */}
          <div className="w-full max-w-2xl border border-slate-300 rounded-xl p-5 bg-slate-50 shadow-sm my-3">
            <div className="flex flex-col items-center space-y-3 text-base w-full">
              <div className="text-center pb-2 border-b border-slate-200 w-full">
                <span className="font-bold text-slate-500 text-base mr-3">รายวิชา</span>
                <span className="text-indigo-700 font-bold text-xl">{subject}</span>
              </div>
              
              <div className="flex justify-center gap-12 w-full">
                <div className="flex justify-center gap-4 border-b border-slate-200 pb-1 min-w-[160px]">
                  <span className="font-semibold text-slate-600">ระดับชั้น</span>
                  <span className="text-indigo-700 font-medium">{gradeLevel}</span>
                </div>
                
                <div className="flex justify-center gap-4 border-b border-slate-200 pb-1 min-w-[160px]">
                  <span className="font-semibold text-slate-600">ภาคเรียนที่</span>
                  <span className="text-indigo-700 font-medium">{semester}</span>
                </div>
              </div>
              
              <div className="flex justify-center gap-4 border-b border-slate-200 pb-1 min-w-[320px]">
                <span className="font-semibold text-slate-600">ครูผู้สอน</span>
                <span className="text-indigo-700 font-medium">{teacherName || "_________________________"}</span>
              </div>
              
              <div className="flex justify-center gap-4 border-b border-slate-200 pb-1 min-w-[320px]">
                <span className="font-semibold text-slate-600">สถานศึกษา</span>
                <span className="text-indigo-700 font-medium">โรงเรียนศิริมงคลศึกษา บางบัวทอง</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="w-full flex flex-col items-center mt-auto mb-2 px-8 gap-4">
            <div className="w-full grid grid-cols-2 gap-6">
              <div className="flex flex-col items-center justify-end">
                <div className="h-6"></div>
                <div className="w-48 border-b border-slate-400 mb-1"></div>
                <div className="text-xs text-slate-600">({teacherName || "................................................"})</div>
                <div className="text-xs font-medium text-slate-700 mt-0.5">ครูผู้สอน</div>
              </div>
              <div className="flex flex-col items-center justify-end">
                <div className="h-6"></div>
                <div className="w-48 border-b border-slate-400 mb-1"></div>
                <div className="text-xs text-slate-600">({academicHead})</div>
                <div className="text-xs font-medium text-slate-700 mt-0.5">หัวหน้าฝ่ายวิชาการ</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-end">
              <div className="h-6"></div>
              <div className="w-48 border-b border-slate-400 mb-1"></div>
              <div className="text-xs text-slate-600">(................................................)</div>
              <div className="text-xs font-medium text-slate-700 mt-0.5">ผู้อำนวยการสถานศึกษา</div>
            </div>
          </div>
          
        </div>
      </PrintPageContainer>

      {isSpecialSubject ? (
        // For special subjects, we keep the original single-page format
        pages.map((pageStudents, pageIndex) => (
          <PrintPageContainer key={pageIndex} layout="landscape">
            <PrintHeader
              title="รายงานผลการเรียน (ปพ.5)"
              subtitle={
                <div className="flex justify-center items-center gap-6 mt-2 text-sm text-slate-600">
                  <p><strong>รายวิชา:</strong> {subject}</p>
                  <p><strong>ระดับชั้น:</strong> {gradeLevel}</p>
                  <p><strong>ภาคเรียนที่:</strong> {semester}</p>
                  <p><strong>ปีการศึกษา:</strong> {academicYear}</p>
                  <p className="text-xs text-slate-400 ml-4">หน้า {pageIndex + 1}/{pages.length}</p>
                </div>
              }
            />
            <div className="mt-6 mb-8">
              {subject === 'กิจกรรมอ่าน-เขียน' ? (
                <table className="w-full text-sm border-collapse border border-slate-900 mx-auto">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-900 px-2 py-2 text-center w-12" rowSpan={2}>เลขที่</th>
                      <th className="border border-slate-900 px-2 py-2 text-center w-24" rowSpan={2}>รหัสประจำตัว</th>
                      <th className="border border-slate-900 px-3 py-2 text-left whitespace-nowrap w-56" rowSpan={2}>ชื่อ-นามสกุล</th>
                      <th className="border border-slate-900 px-2 py-2 text-center" colSpan={5}>ตัวชี้วัด (3, 2, 1, 0)</th>
                      <th className="border border-slate-900 px-2 py-2 text-center w-28" rowSpan={2}>สรุปผลประเมิน</th>
                    </tr>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs min-w-[50px]">การอ่าน</th>
                      <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs min-w-[50px]">จับประเด็น</th>
                      <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs min-w-[50px]">วิเคราะห์</th>
                      <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs min-w-[50px]">ประเมินค่า</th>
                      <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs min-w-[50px]">การเขียน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageStudents.map((st) => {
                      const key = `${st.id}_${academicYear}_${semester}_${subject}`;
                      const score = scores[key] || { grade: "-", activities: {} };
                      return (
                        <tr key={st.id}>
                          <td className="border border-slate-900 px-2 py-1 text-center">{st.number || "-"}</td>
                          <td className="border border-slate-900 px-2 py-1 text-center">{st.studentId}</td>
                          <td className="border border-slate-900 px-4 py-1 text-left whitespace-nowrap">
                            {st.firstName} {st.lastName}
                          </td>
                          <td className="border border-slate-900 px-2 py-1 text-center">{score.activities?.rw1 ?? "-"}</td>
                          <td className="border border-slate-900 px-2 py-1 text-center">{score.activities?.rw2 ?? "-"}</td>
                          <td className="border border-slate-900 px-2 py-1 text-center">{score.activities?.rw3 ?? "-"}</td>
                          <td className="border border-slate-900 px-2 py-1 text-center">{score.activities?.rw4 ?? "-"}</td>
                          <td className="border border-slate-900 px-2 py-1 text-center">{score.activities?.rw5 ?? "-"}</td>
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
                      <th className="border border-slate-900 px-3 py-3 text-center w-16">เลขที่</th>
                      <th className="border border-slate-900 px-3 py-3 text-center w-28">รหัสประจำตัว</th>
                      <th className="border border-slate-900 px-4 py-3 text-left whitespace-nowrap w-64">ชื่อ-นามสกุล</th>
                      <th className="border border-slate-900 px-4 py-3 text-center w-36">เวลาเรียน<br/><span className="font-normal">(ร้อยละ)</span></th>
                      <th className="border border-slate-900 px-4 py-3 text-center w-36">ผลการประเมิน<br/><span className="font-normal">(ผ/มผ)</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageStudents.map((st) => {
                      const key = `${st.id}_${academicYear}_${semester}_${subject}`;
                      const score = scores[key] || { totalScore: 0, grade: "-" };
                      return (
                        <tr key={st.id}>
                          <td className="border border-slate-900 px-4 py-2 text-center">{st.number || "-"}</td>
                          <td className="border border-slate-900 px-4 py-2 text-center">{st.studentId}</td>
                          <td className="border border-slate-900 px-4 py-2 text-left whitespace-nowrap">
                            {st.firstName} {st.lastName}
                          </td>
                          
                          <td className="border border-slate-900 px-4 py-2 text-center bg-slate-50">{(() => {
                              if (attendanceStats?.studentStats?.[st.id] && subject === 'กิจกรรมลูกเสือ') {
                                  const stats = attendanceStats.studentStats[st.id];
                                  const totalAttended = stats.present + stats.late;
                                  const totalRecords = stats.present + stats.late + stats.leave + stats.sick + stats.absent;
                                  const baseTotal = attendanceStats.totalTargetPeriods > 0 ? attendanceStats.totalTargetPeriods : totalRecords;
                                  const attScore = baseTotal > 0 ? (totalAttended / baseTotal) * 100 : 0;
                                  if (attScore > 0) return attScore.toFixed(0);
                              }
                              return score.totalScore || 0;
                          })()}</td>
                          <td className="border border-slate-900 px-4 py-2 text-center font-bold text-lg">{(() => {
                              let attScore = undefined;
                              if (attendanceStats?.studentStats?.[st.id]) {
                                  const stats = attendanceStats.studentStats[st.id];
                                  const totalAttended = stats.present + stats.late;
                                  const totalRecords = stats.present + stats.late + stats.leave + stats.sick + stats.absent;
                                  const baseTotal = attendanceStats.totalTargetPeriods > 0 ? attendanceStats.totalTargetPeriods : totalRecords;
                                  attScore = baseTotal > 0 ? (totalAttended / baseTotal) * 100 : 0;
                              }
                              return calculateGrade(score.totalScore || 0, subject, score.activities, undefined, attScore);
                          })() || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            {pageIndex === pages.length - 1 && (
              <div className="grid grid-cols-2 gap-8 mt-8 pt-4 border-t border-slate-200 page-break-inside-avoid shrink-0">
                <PrintSignatureBox role="ผู้สอน" name={teacherName} />
                <PrintSignatureBox role="หัวหน้าฝ่ายวิชาการ/ผู้ตรวจ" />
              </div>
            )}
          </PrintPageContainer>
        ))
      ) : (
        <>
          {/* SECTION 1: ก่อนกลางภาค */}
          {pages.map((pageStudents, pageIndex) => (
            <PrintPageContainer key={`bm-${pageIndex}`} layout="landscape" className="flex flex-col justify-between">
              <PrintHeader
                title="รายงานผลการเรียน (คะแนนก่อนกลางภาค)"
                subtitle={
                  <div className="flex justify-center items-center gap-6 mt-2 text-sm text-slate-600">
                    <p><strong>รายวิชา:</strong> {subject}</p>
                    <p><strong>ระดับชั้น:</strong> {gradeLevel}</p>
                    <p><strong>ภาคเรียนที่:</strong> {semester}</p>
                    <p><strong>ปีการศึกษา:</strong> {academicYear}</p>
                    <p className="text-xs text-slate-400 ml-4">หน้า {pageIndex + 1}/{pages.length}</p>
                  </div>
                }
              />
              <div className="mt-6 mb-4 flex-grow">
                <table className="w-full text-xs sm:text-sm border-collapse border border-slate-900">
                  <thead>
                    <tr className="bg-slate-100">
                      <th rowSpan={2} className="border border-slate-900 px-1 py-2 text-center w-10">เลขที่</th>
                      <th rowSpan={2} className="border border-slate-900 px-2 py-2 text-center w-20">รหัส</th>
                      <th rowSpan={2} className="border border-slate-900 px-3 py-2 text-left whitespace-nowrap w-56">ชื่อ-นามสกุล</th>
                      {bmk.length > 0 && <th colSpan={bmk.length} className="border border-slate-900 px-2 py-1 text-center">ความรู้ก่อนกลางภาค ({bmkTotal})</th>}
                      {bms.length > 0 && <th colSpan={bms.length} className="border border-slate-900 px-2 py-1 text-center">จิตพิสัยก่อนกลางภาค ({bmsTotal})</th>}
                      <th rowSpan={2} className="border border-slate-900 px-1 py-2 text-center bg-indigo-50 w-24">รวมก่อน<br/>กลางภาค<br/>({bmkTotal + bmsTotal})</th>
                      <th rowSpan={2} className="border border-slate-900 px-1 py-2 text-center bg-amber-50 w-24">สอบกลางภาค<br/>(20)</th>
                    </tr>
                    <tr className="bg-slate-100">
                      {bmk.map(act => (
                        <th key={act.id} className="border border-slate-900 px-1 py-1 text-center font-normal text-[11px] min-w-[55px]">{formatColumnHeader(act.name, act.maxScore)}</th>
                      ))}
                      {bms.map(act => (
                        <th key={act.id} className="border border-slate-900 px-1 py-1 text-center font-normal text-[11px] min-w-[55px]">{formatColumnHeader(act.name, act.maxScore)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageStudents.map((st) => {
                      const key = `${st.id}_${academicYear}_${semester}_${subject}`;
                      const score = scores[key] || { beforeMidKnowledgeScore: 0, beforeMidSoftSkillScore: 0, midtermScore: 0, activities: {} };
                      const acts = score.activities || {};
                      
                      return (
                        <tr key={st.id}>
                          <td className="border border-slate-900 px-1 py-1 text-center">{st.number || "-"}</td>
                          <td className="border border-slate-900 px-2 py-1 text-center">{st.studentId}</td>
                          <td className="border border-slate-900 px-3 py-1 text-left whitespace-nowrap w-56 truncate">{st.firstName} {st.lastName}</td>
                          
                          {bmk.map(act => (
                            <td key={act.id} className="border border-slate-900 px-1 py-1 text-center">{acts[act.id] !== undefined && acts[act.id] !== "" ? acts[act.id] : "-"}</td>
                          ))}
                          
                          {bms.map(act => (
                            <td key={act.id} className="border border-slate-900 px-1 py-1 text-center">{acts[act.id] !== undefined && acts[act.id] !== "" ? acts[act.id] : "-"}</td>
                          ))}
                          
                          <td className="border border-slate-900 px-1 py-1 text-center font-bold bg-indigo-50/50">{(score.beforeMidKnowledgeScore || 0) + (score.beforeMidSoftSkillScore || 0)}</td>
                          <td className="border border-slate-900 px-1 py-1 text-center font-bold bg-amber-50/50">{score.midtermScore || 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </PrintPageContainer>
          ))}

          {/* SECTION 2: หลังกลางภาค */}
          {pages.map((pageStudents, pageIndex) => (
            <PrintPageContainer key={`am-${pageIndex}`} layout="landscape" className="flex flex-col justify-between">
              <PrintHeader
                title="รายงานผลการเรียน (คะแนนหลังกลางภาค)"
                subtitle={
                  <div className="flex justify-center items-center gap-6 mt-2 text-sm text-slate-600">
                    <p><strong>รายวิชา:</strong> {subject}</p>
                    <p><strong>ระดับชั้น:</strong> {gradeLevel}</p>
                    <p><strong>ภาคเรียนที่:</strong> {semester}</p>
                    <p><strong>ปีการศึกษา:</strong> {academicYear}</p>
                    <p className="text-xs text-slate-400 ml-4">หน้า {pageIndex + 1}/{pages.length}</p>
                  </div>
                }
              />
              <div className="mt-6 mb-4 flex-grow">
                <table className="w-full text-xs sm:text-sm border-collapse border border-slate-900">
                  <thead>
                    <tr className="bg-slate-100">
                      <th rowSpan={2} className="border border-slate-900 px-1 py-2 text-center w-10">เลขที่</th>
                      <th rowSpan={2} className="border border-slate-900 px-2 py-2 text-center w-20">รหัส</th>
                      <th rowSpan={2} className="border border-slate-900 px-3 py-2 text-left whitespace-nowrap w-56">ชื่อ-นามสกุล</th>
                      {amk.length > 0 && <th colSpan={amk.length} className="border border-slate-900 px-2 py-1 text-center">ความรู้หลังกลางภาค ({amkTotal})</th>}
                      {ams.length > 0 && <th colSpan={ams.length} className="border border-slate-900 px-2 py-1 text-center">จิตพิสัยหลังกลางภาค ({amsTotal})</th>}
                      <th rowSpan={2} className="border border-slate-900 px-1 py-2 text-center bg-indigo-50 w-24">รวมหลัง<br/>กลางภาค<br/>({amkTotal + amsTotal})</th>
                      <th rowSpan={2} className="border border-slate-900 px-1 py-2 text-center bg-amber-50 w-24">สอบปลายภาค<br/>(20)</th>
                    </tr>
                    <tr className="bg-slate-100">
                      {amk.map(act => (
                        <th key={act.id} className="border border-slate-900 px-1 py-1 text-center font-normal text-[11px] min-w-[55px]">{formatColumnHeader(act.name, act.maxScore)}</th>
                      ))}
                      {ams.map(act => (
                        <th key={act.id} className="border border-slate-900 px-1 py-1 text-center font-normal text-[11px] min-w-[55px]">{formatColumnHeader(act.name, act.maxScore)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageStudents.map((st) => {
                      const key = `${st.id}_${academicYear}_${semester}_${subject}`;
                      const score = scores[key] || { afterMidKnowledgeScore: 0, afterMidSoftSkillScore: 0, finalScore: 0, activities: {} };
                      const acts = score.activities || {};
                      
                      return (
                        <tr key={st.id}>
                          <td className="border border-slate-900 px-1 py-1 text-center">{st.number || "-"}</td>
                          <td className="border border-slate-900 px-2 py-1 text-center">{st.studentId}</td>
                          <td className="border border-slate-900 px-3 py-1 text-left whitespace-nowrap w-56 truncate">{st.firstName} {st.lastName}</td>
                          
                          {amk.map(act => (
                            <td key={act.id} className="border border-slate-900 px-1 py-1 text-center">{acts[act.id] !== undefined && acts[act.id] !== "" ? acts[act.id] : "-"}</td>
                          ))}
                          
                          {ams.map(act => (
                            <td key={act.id} className="border border-slate-900 px-1 py-1 text-center">{acts[act.id] !== undefined && acts[act.id] !== "" ? acts[act.id] : "-"}</td>
                          ))}
                          
                          <td className="border border-slate-900 px-1 py-1 text-center font-bold bg-indigo-50/50">{(score.afterMidKnowledgeScore || 0) + (score.afterMidSoftSkillScore || 0)}</td>
                          <td className="border border-slate-900 px-1 py-1 text-center font-bold bg-amber-50/50">{score.finalScore || 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </PrintPageContainer>
          ))}

          {/* SECTION 3: สรุปผลการเรียน */}
          {pages.map((pageStudents, pageIndex) => (
            <PrintPageContainer key={`sum-${pageIndex}`} layout="landscape" className="flex flex-col justify-between">
              <PrintHeader
                title="แบบบันทึกผลการพัฒนาคุณภาพผู้เรียน(ปพ.5)"
                subtitle={
                  <div className="flex justify-center items-center gap-6 mt-2 text-sm text-slate-600">
                    <p><strong>รายวิชา:</strong> {subject}</p>
                    <p><strong>ระดับชั้น:</strong> {gradeLevel}</p>
                    <p><strong>ภาคเรียนที่:</strong> {semester}</p>
                    <p><strong>ปีการศึกษา:</strong> {academicYear}</p>
                    <p className="text-xs text-slate-400 ml-4">หน้า {pageIndex + 1}/{pages.length}</p>
                  </div>
                }
              />
              <div className="mt-6 mb-4 flex-grow">
                <table className="w-full text-sm border-collapse border border-slate-900">
                  <thead>
                    <tr className="bg-slate-100">
                      <th rowSpan={2} className="border border-slate-900 px-2 py-2 text-center w-12">เลขที่</th>
                      <th rowSpan={2} className="border border-slate-900 px-2 py-2 text-center w-24">รหัสประจำตัว</th>
                      <th rowSpan={2} className="border border-slate-900 px-3 py-2 text-left whitespace-nowrap w-56">ชื่อ-นามสกุล</th>
                      <th colSpan={4} className="border border-slate-900 px-2 py-2 text-center">คะแนนระหว่างเรียน (60)</th>
                      <th colSpan={2} className="border border-slate-900 px-2 py-2 text-center">คะแนนสอบ (40)</th>
                      <th rowSpan={2} className="border border-slate-900 px-2 py-2 text-center w-16">รวม<br/>(100)</th>
                      <th rowSpan={2} className="border border-slate-900 px-2 py-2 text-center w-16">เกรด</th>
                    </tr>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs w-16">ความรู้<br/>ก่อนกลางภาค<br/>({bmkTotal || 20})</th>
                      <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs w-16">จิตพิสัย<br/>ก่อนกลางภาค<br/>({bmsTotal || 10})</th>
                      <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs w-16">ความรู้<br/>หลังกลางภาค<br/>({amkTotal || 20})</th>
                      <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs w-16">จิตพิสัย<br/>หลังกลางภาค<br/>({amsTotal || 10})</th>
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
                          <td className="border border-slate-900 px-3 py-1 text-left whitespace-nowrap w-56 truncate">
                            {st.firstName} {st.lastName}
                          </td>
                          <td className="border border-slate-900 px-2 py-1 text-center">{score.beforeMidKnowledgeScore || 0}</td>
                          <td className="border border-slate-900 px-2 py-1 text-center">{score.beforeMidSoftSkillScore || 0}</td>
                          <td className="border border-slate-900 px-2 py-1 text-center">{score.afterMidKnowledgeScore || 0}</td>
                          <td className="border border-slate-900 px-2 py-1 text-center">{score.afterMidSoftSkillScore || 0}</td>
                          <td className="border border-slate-900 px-2 py-1 text-center bg-slate-50">{score.midtermScore || 0}</td>
                          <td className="border border-slate-900 px-2 py-1 text-center bg-slate-50">{score.finalScore || 0}</td>
                          <td className="border border-slate-900 px-2 py-1 text-center font-bold bg-indigo-50/50">{(() => {
                              if (attendanceStats?.studentStats?.[st.id] && subject === 'กิจกรรมลูกเสือ') {
                                  const stats = attendanceStats.studentStats[st.id];
                                  const totalAttended = stats.present + stats.late;
                                  const totalRecords = stats.present + stats.late + stats.leave + stats.sick + stats.absent;
                                  const baseTotal = attendanceStats.totalTargetPeriods > 0 ? attendanceStats.totalTargetPeriods : totalRecords;
                                  const attScore = baseTotal > 0 ? (totalAttended / baseTotal) * 100 : 0;
                                  if (attScore > 0) return attScore.toFixed(0);
                              }
                              return score.totalScore || 0;
                          })()}</td>
                          <td className="border border-slate-900 px-2 py-1 text-center font-bold text-lg">{(() => {
                              let attScore = undefined;
                              if (attendanceStats?.studentStats?.[st.id]) {
                                  const stats = attendanceStats.studentStats[st.id];
                                  const totalAttended = stats.present + stats.late;
                                  const totalRecords = stats.present + stats.late + stats.leave + stats.sick + stats.absent;
                                  const baseTotal = attendanceStats.totalTargetPeriods > 0 ? attendanceStats.totalTargetPeriods : totalRecords;
                                  attScore = baseTotal > 0 ? (totalAttended / baseTotal) * 100 : 0;
                              }
                              return calculateGrade(score.totalScore || 0, subject, score.activities, undefined, attScore);
                          })() || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {pageIndex === pages.length - 1 && (
                <div className="grid grid-cols-2 gap-8 mt-8 pt-4 border-t border-slate-200 page-break-inside-avoid shrink-0">
                  <PrintSignatureBox role="ผู้สอน" name={teacherName} />
                  <PrintSignatureBox role="หัวหน้าฝ่ายวิชาการ/ผู้ตรวจ" />
                </div>
              )}
            </PrintPageContainer>
          ))}
          {/* SECTION 4: สรุปสถิติผลการเรียน */}
          <PrintPageContainer layout="landscape" className="flex flex-col justify-between" isCompact={isCompact}>
            <div>
              <PrintHeader
                title="แบบบันทึกผลการพัฒนาคุณภาพผู้เรียน (ปพ.5)"
                subtitle={
                  <div className="flex justify-center items-center gap-6 mt-2 text-sm text-slate-600">
                    <p><strong>รายวิชา:</strong> {subject}</p>
                    <p><strong>ระดับชั้น:</strong> {gradeLevel}</p>
                    <p><strong>ภาคเรียนที่:</strong> {semester}</p>
                    <p><strong>ปีการศึกษา:</strong> {academicYear}</p>
                  </div>
                }
              />
              
              <div className="mt-5">
                <h3 className="font-bold text-center text-base sm:text-lg mb-4 text-slate-900">สรุปสถิติผลการประเมิน</h3>
                
                <div className="space-y-6 max-w-5xl mx-auto">
                  {/* ส่วนบน: ตารางจำนวนนักเรียนแยกเพศ (ซ้าย) + สถิติคะแนน (ขวา) */}
                  <div className="grid grid-cols-12 gap-5 items-stretch">
                    {/* ตารางที่ 1: สรุปจำนวนนักเรียนในห้องเรียน แยก ชาย - หญิง */}
                    <div className="col-span-7 flex flex-col">
                      <div className="bg-slate-800 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-t border border-slate-900 text-center">
                        ๑. จำนวนนักเรียนในห้องเรียน (แยกเพศ)
                      </div>
                      <table className="w-full text-xs sm:text-sm border-collapse border border-slate-900 text-center flex-grow">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-900 px-3 py-1.5 text-center w-20">เพศ</th>
                            <th className="border border-slate-900 px-3 py-1.5 text-center">จำนวนในห้อง (คน)</th>
                            <th className="border border-slate-900 px-3 py-1.5 text-center">ร้อยละ (%)</th>
                            <th className="border border-slate-900 px-3 py-1.5 text-center">เข้าประเมิน (คน)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-slate-900 px-3 py-1.5 font-medium">ชาย</td>
                            <td className="border border-slate-900 px-3 py-1.5 font-semibold text-slate-800">{totalMaleInClass}</td>
                            <td className="border border-slate-900 px-3 py-1.5">
                              {totalStudentsInClass > 0 ? ((totalMaleInClass / totalStudentsInClass) * 100).toFixed(2) : '0.00'}
                            </td>
                            <td className="border border-slate-900 px-3 py-1.5 font-semibold text-indigo-700">{gradeDistribution.maleCount}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-900 px-3 py-1.5 font-medium">หญิง</td>
                            <td className="border border-slate-900 px-3 py-1.5 font-semibold text-slate-800">{totalFemaleInClass}</td>
                            <td className="border border-slate-900 px-3 py-1.5">
                              {totalStudentsInClass > 0 ? ((totalFemaleInClass / totalStudentsInClass) * 100).toFixed(2) : '0.00'}
                            </td>
                            <td className="border border-slate-900 px-3 py-1.5 font-semibold text-indigo-700">{gradeDistribution.femaleCount}</td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-100 font-bold">
                            <td className="border border-slate-900 px-3 py-1.5">รวมทั้งสิ้น</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-indigo-700 font-bold">{totalStudentsInClass}</td>
                            <td className="border border-slate-900 px-3 py-1.5">100.00</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-emerald-700 font-bold">{gradeDistribution.totalAssessed}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* สถิติคะแนนผลการเรียน */}
                    <div className="col-span-5 flex flex-col">
                      <div className="bg-slate-800 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-t border border-slate-900 text-center">
                        สถิติคะแนนรวม (เต็ม 100 คะแนน)
                      </div>
                      <div className="border border-slate-900 border-t-0 rounded-b p-3 bg-white flex flex-col justify-around flex-grow space-y-2">
                        <div className="grid grid-cols-3 divide-x divide-slate-300 text-center py-1">
                          <div className="px-1">
                            <div className="text-[11px] text-slate-500 font-medium">คะแนนเฉลี่ย</div>
                            <div className="text-base sm:text-lg font-bold text-slate-800">{scoreStats.avg}</div>
                          </div>
                          <div className="px-1">
                            <div className="text-[11px] text-slate-500 font-medium">คะแนนสูงสุด</div>
                            <div className="text-base sm:text-lg font-bold text-emerald-700">{scoreStats.max}</div>
                          </div>
                          <div className="px-1">
                            <div className="text-[11px] text-slate-500 font-medium">คะแนนต่ำสุด</div>
                            <div className="text-base sm:text-lg font-bold text-rose-700">{scoreStats.min}</div>
                          </div>
                        </div>
                        <div className="border-t border-slate-200 pt-2 text-xs text-slate-600 flex justify-between px-2">
                          <span>จำนวนนักเรียนที่ประเมินผ่าน:</span>
                          <span className="font-bold text-emerald-700">
                            {passedCount} คน ({passedPct}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ตารางที่ 2: สรุปผลการประเมินระดับผลการเรียน (แนวนอน: เรียงจากมากไปน้อย 4 -> 0, ไม่มี ร, มส, รวม) */}
                  <div className="w-full">
                    <div className="bg-slate-800 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-t border border-slate-900 text-center">
                      ๒. สรุปผลการประเมินระดับผลการเรียน
                    </div>
                    <table className="w-full text-xs sm:text-sm border-collapse border border-slate-900 text-center">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-900 px-3 py-2 text-left font-bold w-44 sm:w-52 bg-slate-200/50">
                            ระดับผลการเรียน
                          </th>
                          {gradesList.map(grade => (
                            <th key={grade} className="border border-slate-900 px-2 py-2 text-center font-bold">
                              {grade}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-900 px-3 py-2 text-left font-semibold text-slate-800 bg-slate-50">
                            จำนวน (คน)
                          </td>
                          {gradesList.map(grade => (
                            <td key={grade} className="border border-slate-900 px-2 py-2 text-center font-medium">
                              {gradeDistribution.dist[grade]?.total || 0}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-slate-900 px-3 py-2 text-left font-semibold text-slate-800 bg-slate-50">
                            ร้อยละ (%)
                          </td>
                          {gradesList.map(grade => {
                            const count = gradeDistribution.dist[grade]?.total || 0;
                            const pct = totalEvaluated > 0 
                              ? ((Number(count) / totalEvaluated) * 100).toFixed(2) 
                              : '0.00';
                            return (
                              <td key={grade} className="border border-slate-900 px-2 py-2 text-center">
                                {pct}
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-6 pt-3 border-t border-slate-200 shrink-0 page-break-inside-avoid">
              <PrintSignatureBox role="ผู้สอน" name={teacherName} />
              <PrintSignatureBox role="หัวหน้าฝ่ายวิชาการ/ผู้ตรวจ" />
            </div>
          </PrintPageContainer>
        </>
      )}
    </PDFPrintHelper>

  );
};
