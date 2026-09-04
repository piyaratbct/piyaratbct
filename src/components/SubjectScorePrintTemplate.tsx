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

  const calculateGrade = (total: number, subjectName: string, activities?: any, isScoutAttended?: boolean): string => {
    if (subjectName === 'กิจกรรมลูกเสือ') {
      const campAttended = isScoutAttended || activities?.scoutCamp === 1;

  return (total >= 80 && campAttended) ? "ผ" : "มผ";
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

  // Chunk students into pages of 20
  const ITEMS_PER_PAGE = isCompact ? 30 : 20;
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
      <PrintPageContainer layout="landscape">
        <div className="w-full h-[90%] min-h-[600px] border-[6px] border-double border-slate-800 p-8 flex flex-col justify-between items-center bg-white relative m-auto">
          
          {/* Header */}
          <div className="text-center space-y-6 w-full mt-12">
            <div className="w-24 h-24 mx-auto border-2 border-slate-900 rounded-full flex items-center justify-center mb-4">
              <SchoolLogo className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-wide">แบบบันทึกผลการพัฒนาคุณภาพผู้เรียน (ปพ.5)</h1>
            <h2 className="text-2xl font-medium text-slate-700">ปีการศึกษา {academicYear}</h2>
          </div>

          {/* Core Info */}
          <div className="w-2/3 max-w-3xl border-2 border-slate-300 rounded-2xl p-10 bg-slate-50 shadow-sm my-8">
            <div className="flex flex-col items-center space-y-6 text-lg w-full">
              <div className="text-center pb-4 border-b-2 border-slate-200 w-full">
                <span className="font-bold text-slate-500 text-xl mr-4">รายวิชา</span>
                <span className="text-indigo-700 font-bold text-2xl">{subject}</span>
              </div>
              
              <div className="flex justify-center gap-16 w-full">
                <div className="flex justify-center gap-6 border-b border-slate-200 pb-2 min-w-[200px]">
                  <span className="font-semibold text-slate-600">ระดับชั้น</span>
                  <span className="text-indigo-700 font-medium">{gradeLevel}</span>
                </div>
                
                <div className="flex justify-center gap-6 border-b border-slate-200 pb-2 min-w-[200px]">
                  <span className="font-semibold text-slate-600">ภาคเรียนที่</span>
                  <span className="text-indigo-700 font-medium">{semester}</span>
                </div>
              </div>
              
              <div className="flex justify-center gap-6 border-b border-slate-200 pb-2 min-w-[400px]">
                <span className="font-semibold text-slate-600">ครูผู้สอน</span>
                <span className="text-indigo-700 font-medium">{teacherName || "_________________________"}</span>
              </div>
              
              <div className="flex justify-center gap-6 border-b border-slate-200 pb-2 min-w-[400px]">
                <span className="font-semibold text-slate-600">สถานศึกษา</span>
                <span className="text-indigo-700 font-medium">โรงเรียนศิริมงคลศึกษา บางบัวทอง</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="w-full flex flex-col items-center mt-auto mb-8 px-12 gap-10">
            <div className="w-full grid grid-cols-2 gap-8">
              <div className="flex flex-col items-center justify-end">
                <div className="h-10"></div>
                <div className="w-56 border-b border-slate-400 mb-2"></div>
                <div className="text-sm text-slate-600">({teacherName || "................................................"})</div>
                <div className="text-sm font-medium text-slate-700 mt-1">ครูผู้สอน</div>
              </div>
              <div className="flex flex-col items-center justify-end">
                <div className="h-10"></div>
                <div className="w-56 border-b border-slate-400 mb-2"></div>
                <div className="text-sm text-slate-600">({academicHead})</div>
                <div className="text-sm font-medium text-slate-700 mt-1">หัวหน้าฝ่ายวิชาการ</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-end">
              <div className="h-10"></div>
              <div className="w-56 border-b border-slate-400 mb-2"></div>
              <div className="text-sm text-slate-600">(................................................)</div>
              <div className="text-sm font-medium text-slate-700 mt-1">ผู้อำนวยการสถานศึกษา</div>
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
                      <th className="border border-slate-900 px-4 py-2 text-left whitespace-nowrap" rowSpan={2}>ชื่อ-นามสกุล</th>
                      <th className="border border-slate-900 px-2 py-2 text-center" colSpan={5}>ตัวชี้วัด (3, 2, 1, 0)</th>
                      <th className="border border-slate-900 px-2 py-2 text-center w-32" rowSpan={2}>สรุปผลประเมิน</th>
                    </tr>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs w-16">การอ่าน</th>
                      <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs w-16">จับประเด็น</th>
                      <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs w-16">วิเคราะห์</th>
                      <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs w-16">ประเมินค่า</th>
                      <th className="border border-slate-900 px-1 py-1 text-center font-normal text-xs w-16">การเขียน</th>
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
                      const score = scores[key] || { totalScore: 0, grade: "-" };
                      return (
                        <tr key={st.id}>
                          <td className="border border-slate-900 px-4 py-2 text-center">{st.number || "-"}</td>
                          <td className="border border-slate-900 px-4 py-2 text-center">{st.studentId}</td>
                          <td className="border border-slate-900 px-4 py-2 text-left whitespace-nowrap">
                            {st.firstName} {st.lastName}
                          </td>
                          <td className="border border-slate-900 px-4 py-2 text-center bg-slate-50">{score.totalScore || 0}</td>
                          <td className="border border-slate-900 px-4 py-2 text-center font-bold text-lg">{calculateGrade(score.totalScore || 0, subject, score.activities) || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            {pageIndex === pages.length - 1 && (
              <div className="grid grid-cols-2 gap-8 mt-16 page-break-inside-avoid">
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
            <PrintPageContainer key={`bm-${pageIndex}`} layout="landscape">
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
              <div className="mt-6 mb-8">
                <table className="w-full text-xs sm:text-sm border-collapse border border-slate-900">
                  <thead>
                    <tr className="bg-slate-100">
                      <th rowSpan={2} className="border border-slate-900 px-1 py-2 text-center w-10">เลขที่</th>
                      <th rowSpan={2} className="border border-slate-900 px-2 py-2 text-center w-20">รหัส</th>
                      <th rowSpan={2} className="border border-slate-900 px-2 py-2 text-left whitespace-nowrap">ชื่อ-นามสกุล</th>
                      {bmk.length > 0 && <th colSpan={bmk.length} className="border border-slate-900 px-1 py-1 text-center">ความรู้ก่อนกลางภาค ({bmkTotal})</th>}
                      {bms.length > 0 && <th colSpan={bms.length} className="border border-slate-900 px-1 py-1 text-center">จิตพิสัยก่อนกลางภาค ({bmsTotal})</th>}
                      <th rowSpan={2} className="border border-slate-900 px-1 py-2 text-center bg-indigo-50 w-16">รวมก่อน<br/>กลางภาค<br/>({bmkTotal + bmsTotal})</th>
                      <th rowSpan={2} className="border border-slate-900 px-1 py-2 text-center bg-amber-50 w-16">สอบกลางภาค<br/>(20)</th>
                    </tr>
                    <tr className="bg-slate-100">
                      {bmk.map(act => (
                        <th key={act.id} className="border border-slate-900 px-1 py-1 text-center font-normal text-[10px] w-12">{formatColumnHeader(act.name, act.maxScore)}</th>
                      ))}
                      {bms.map(act => (
                        <th key={act.id} className="border border-slate-900 px-1 py-1 text-center font-normal text-[10px] w-12">{formatColumnHeader(act.name, act.maxScore)}</th>
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
                          <td className="border border-slate-900 px-2 py-1 text-left whitespace-nowrap">{st.firstName} {st.lastName}</td>
                          
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
            <PrintPageContainer key={`am-${pageIndex}`} layout="landscape">
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
              <div className="mt-6 mb-8">
                <table className="w-full text-xs sm:text-sm border-collapse border border-slate-900">
                  <thead>
                    <tr className="bg-slate-100">
                      <th rowSpan={2} className="border border-slate-900 px-1 py-2 text-center w-10">เลขที่</th>
                      <th rowSpan={2} className="border border-slate-900 px-2 py-2 text-center w-20">รหัส</th>
                      <th rowSpan={2} className="border border-slate-900 px-2 py-2 text-left whitespace-nowrap">ชื่อ-นามสกุล</th>
                      {amk.length > 0 && <th colSpan={amk.length} className="border border-slate-900 px-1 py-1 text-center">ความรู้หลังกลางภาค ({amkTotal})</th>}
                      {ams.length > 0 && <th colSpan={ams.length} className="border border-slate-900 px-1 py-1 text-center">จิตพิสัยหลังกลางภาค ({amsTotal})</th>}
                      <th rowSpan={2} className="border border-slate-900 px-1 py-2 text-center bg-indigo-50 w-16">รวมหลัง<br/>กลางภาค<br/>({amkTotal + amsTotal})</th>
                      <th rowSpan={2} className="border border-slate-900 px-1 py-2 text-center bg-amber-50 w-16">สอบปลายภาค<br/>(20)</th>
                    </tr>
                    <tr className="bg-slate-100">
                      {amk.map(act => (
                        <th key={act.id} className="border border-slate-900 px-1 py-1 text-center font-normal text-[10px] w-12">{formatColumnHeader(act.name, act.maxScore)}</th>
                      ))}
                      {ams.map(act => (
                        <th key={act.id} className="border border-slate-900 px-1 py-1 text-center font-normal text-[10px] w-12">{formatColumnHeader(act.name, act.maxScore)}</th>
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
                          <td className="border border-slate-900 px-2 py-1 text-left whitespace-nowrap">{st.firstName} {st.lastName}</td>
                          
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
            <PrintPageContainer key={`sum-${pageIndex}`} layout="landscape">
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
              <div className="mt-6 mb-8">
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
                          <td className="border border-slate-900 px-2 py-1 text-center font-bold text-lg">{calculateGrade(score.totalScore || 0, subject, score.activities) || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {pageIndex === pages.length - 1 && (
                <div className="grid grid-cols-2 gap-8 mt-16 page-break-inside-avoid">
                  <PrintSignatureBox role="ผู้สอน" name={teacherName} />
                  <PrintSignatureBox role="หัวหน้าฝ่ายวิชาการ/ผู้ตรวจ" />
                </div>
              )}
            </PrintPageContainer>
          ))}
        </>
      )}
    </PDFPrintHelper>
  );
};
