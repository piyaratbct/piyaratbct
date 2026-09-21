import React, { useState } from "react";
import { LessonPlan, Teacher } from "../types";
import { Printer, X, Edit3, Save, XCircle } from "lucide-react";
import { SignaturePadModal } from "./PrintTemplate";
import {
  PDFPrintHelper,
  PrintPageContainer,
  PrintHeader,
  PrintSignatureBox,
} from "./PDFPrintHelper";

interface LessonPlanPrintTemplateProps {
  plan: LessonPlan;
  teacher: Teacher;
  academicHead?: Teacher | null;
  currentUser?: Teacher | null;
  allTeachers?: Teacher[];
  onUpdatePlan?: (plan: LessonPlan) => void;
  onClose: () => void;
  onNavigateToGradebook?: (subject: string, gradeLevel: string) => void;
}

export function LessonPlanPrintTemplate({
  plan,
  teacher,
  academicHead,
  currentUser,
  onUpdatePlan,
  onClose,
  allTeachers = [],
  onNavigateToGradebook,
}: LessonPlanPrintTemplateProps) {
  const [signingRole, setSigningRole] = useState<"teacher" | "deptHead" | null>(
    null,
  );
  const [isCompact, setIsCompact] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState("");

  const subjectName = plan.subject.replace(/[\/\\:*?"<>|\s]/g, "_");
  const teacherIdentifier = (
    teacher.employeeId ||
    teacher.thaiName ||
    "ครูผู้สอน"
  ).replace(/[\/\\:*?"<>|\s]/g, "_");
  const planDate = (plan.date || "").replace(/[\/\\:*?"<>|\s]/g, "_");
  const documentTitle = `แผนการสอน_${teacherIdentifier}_${subjectName}_${planDate}`;

  const handleSaveSignature = (name: string, signatureBase64: string) => {
    if (!onUpdatePlan) return;

    let updatedPlan = { ...plan };
    const todayStr = new Date().toISOString().slice(0, 10);

    if (signingRole === "deptHead") {
      updatedPlan.status = "approved";
      updatedPlan.approverName = name;
      updatedPlan.approverSignature = signatureBase64;
      updatedPlan.approverDate = todayStr;
    } else if (signingRole === "teacher") {
      updatedPlan.teacherSignedOn = todayStr;
      updatedPlan.teacherSignature = signatureBase64;
    }

    onUpdatePlan(updatedPlan);
    setSigningRole(null);
  };

  const handleResetSignature = (role: "teacher" | "deptHead") => {
    if (!onUpdatePlan) return;
    let updatedPlan = { ...plan };

    if (role === "deptHead") {
      updatedPlan.status = "draft";
      delete updatedPlan.approverName;
      delete updatedPlan.approverSignature;
      delete updatedPlan.approverDate;
    } else if (role === "teacher") {
      delete updatedPlan.teacherSignedOn;
      delete updatedPlan.teacherSignature;
    }

    onUpdatePlan(updatedPlan);
  };


  const thaiFormatDate = (dateString: string) => {
    const months = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0]) + 543;
      const month = months[parseInt(parts[1]) - 1];
      const day = parseInt(parts[2]);
      return `${day} ${month} พ.ศ. ${year}`;
    }
    return dateString;
  };


  const showIndicators = !plan.isKindergarten && (plan.coreIndicators || plan.targetIndicators);
  const showCompetencies = Boolean(plan.competencies);

  let currentStep = 2;
  const indicatorsStep = showIndicators ? currentStep++ : null;
  const competenciesStep = showCompetencies ? currentStep++ : null;
  const objectivesStep = currentStep++;
  const activitiesStep = currentStep++;
  const materialsStep = currentStep++;
  const evaluationStep = currentStep++;

  return (
    <PDFPrintHelper
      onClose={onClose}
      documentTitle={documentTitle}
      hideControls
      isCompact={isCompact}
      onToggleCompact={() => setIsCompact(!isCompact)}
    >
      {/* Custom Controls Header for Lesson Plan */}
      <div className="sticky top-0 w-full bg-white border-b border-slate-200 p-4 flex flex-wrap gap-4 justify-between items-center shadow-sm print:hidden z-10 max-w-[210mm] mx-auto rounded-b-xl mb-4">
        <div className="flex flex-col">
          <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Printer className="h-5 w-5 text-indigo-600" />
            ตัวอย่างก่อนพิมพ์: แผนการจัดการเรียนรู้
          </h2>
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            หากปุ่มพิมพ์ไม่ทำงาน กรุณาเปิดแอปในแท็บใหม่ (Open in new tab)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Action buttons based on Role */}
          {currentUser &&
            currentUser.id === teacher.id &&
            !plan.teacherSignature &&
            onUpdatePlan &&
            plan.status !== "approved" && (
              <button
                onClick={() => setSigningRole("teacher")}
                className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 font-medium hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" /> ลงนามผู้เขียน
              </button>
            )}

          {currentUser &&
            currentUser.id === teacher.id &&
            plan.teacherSignature &&
            onUpdatePlan &&
            plan.status !== "approved" && (
              <button
                onClick={() => handleResetSignature("teacher")}
                className="px-4 py-2 bg-slate-50 text-slate-700 border border-slate-200 font-medium hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" /> ล้างลายมือชื่อ
              </button>
            )}

          {currentUser &&
            (currentUser.role === "admin" ||
              currentUser.role === "academic" ||
              currentUser.role === "deputy") &&
            onUpdatePlan && (
              <>
                {plan.status !== "approved" ? (
                  <>
                    <button
                      onClick={() => setRejectModalOpen(true)}
                      className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 font-medium hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" /> ตีกลับให้แก้ (Reject)
                    </button>
                    <button
                      onClick={() => setSigningRole("deptHead")}
                      className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" /> เซ็นอนุมัติ (Approve)
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleResetSignature("deptHead")}
                    className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 font-medium hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" /> ยกเลิกการอนุมัติ
                  </button>
                )}
              </>
            )}

          <button
            onClick={() => setIsCompact(!isCompact)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all duration-200 cursor-pointer ${
              isCompact
                ? "bg-amber-600 text-white hover:bg-amber-500 shadow-sm border border-amber-550"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
            }`}
            title="บีบอัดช่องว่างและขนาดตัวอักษรเพื่อจัดให้รายงานรูปเล่มยาวทั้งหมดจบสวยในกระดาษ A4 แผ่นเดียว"
          >
            <span>
              {isCompact ? "📋 พอดีหน้าเดียว: เปิด" : "📋 พอดีหน้าเดียว: ปิด"}
            </span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <X className="h-4 w-4" /> ปิดหน้าต่าง
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            <Printer className="h-4 w-4" /> พิมพ์ / บันทึก PDF
          </button>
        </div>
      </div>

      <PrintPageContainer
        className={
          isCompact
            ? "!p-[0.7cm] !mb-0 !mt-0 !rounded-none !rounded-b-xl !shadow-md"
            : ""
        }
      >
        <PrintHeader
          title="แผนการจัดการเรียนรู้"
          className={isCompact ? "mb-4" : "mb-8"}
          subtitle={
            <div className="flex flex-col items-center gap-1.5">
              <p className={`${isCompact ? "text-sm" : "text-base"} text-sky-800 bg-sky-50 inline-block px-4 py-1 rounded-full border border-sky-100`}>
                กลุ่มสาระการเรียนรู้{" "}
                {(plan.subject === "อื่นๆ" || plan.subject === "อื่น ๆ" || plan.subject === "บูรณาการ (PBL)") && plan.customSubject ? plan.customSubject : plan.subject}{" "}
                ระดับชั้น {plan.gradeLevel.replace(/\s*\(.*?\)/g, "")}
              </p>
              {plan.isIntegrated && plan.integratedSubjects && (
                <p className={`${isCompact ? "text-xs" : "text-sm"} text-emerald-700 bg-emerald-50 inline-block px-4 py-1 rounded-full border border-emerald-100`}>
                  บูรณาการรายวิชา: {plan.integratedSubjects}
                </p>
              )}
            </div>
          }
        />

        <div className={`text-center ${isCompact ? "mb-3" : "mb-6"}`}>
          <p className={`${isCompact ? "text-xs" : "text-sm"} text-slate-600`}>
            {(() => {
              const s = plan.semester || "";
              const parts = s.replace("ภาคเรียนที่ ", "").split("/");
              if (parts.length === 2) {
                return `ภาคเรียนที่ ${parts[0]} ปีการศึกษา ${parts[1]}`;
              }
              return s;
            })()}
          </p>
        </div>

        {/* Info Grid */}
        <div
          className={`grid grid-cols-2 ${isCompact ? "gap-3 mb-4" : "gap-4 mb-6"}`}
        >
          <div
            className={`bg-sky-50/50 rounded-xl border border-sky-200 ${isCompact ? "p-3" : "p-4"}`}
          >
            <p
              className={`font-bold text-sky-800 ${isCompact ? "text-[11px] mb-0.5" : "text-xs mb-1"}`}
            >
              คาบที่
            </p>
            <p
              className={`font-medium text-slate-900 ${isCompact ? "text-sm" : "text-base"}`}
            >
              {thaiFormatDate(plan.date)}
            </p>
          </div>
          <div
            className={`bg-pink-50/40 rounded-xl border border-pink-200 ${isCompact ? "p-3" : "p-4"}`}
          >
            <p
              className={`font-bold text-pink-800 ${isCompact ? "text-[11px] mb-0.5" : "text-xs mb-1"}`}
            >
              ผู้สอน (Teacher)
            </p>
            <p
              className={`font-medium text-slate-900 ${isCompact ? "text-sm" : "text-base"}`}
            >
              {teacher.thaiName || teacher.displayName}
            </p>
            {((plan.coTeacherNames && plan.coTeacherNames.length > 0) || (plan.coTeachers && plan.coTeachers.length > 0)) && (
              <p className={`text-slate-600 mt-1 leading-snug ${isCompact ? "text-[10px]" : "text-xs"}`}>
                <span className="font-bold text-pink-700">ร่วมสอน:</span> {
                  (plan.coTeacherNames && plan.coTeacherNames.length > 0) 
                    ? plan.coTeacherNames.join(", ")
                    : plan.coTeachers?.map(id => {
                        const t = allTeachers.find(t => t.id === id);
                        return t ? (t.thaiName || t.displayName) : id;
                      }).join(", ")
                }
              </p>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className={isCompact ? "space-y-4" : "space-y-6"}>
          <div>
            <h3
              className={`font-bold text-slate-800 border-b border-slate-200 ${isCompact ? "text-base pb-1 mb-2" : "text-lg pb-2 mb-3"}`}
            >
              {plan.isKindergarten ? "1. ชื่อหน่วยการจัดประสบการณ์ / เรื่อง (Theme/Unit)" : "1. ชื่อหน่วยการเรียนรู้ / เรื่อง (Topic)"}
            </h3>
            <p
              className={`text-slate-700 font-medium pl-4 ${isCompact ? "text-sm" : "text-base"}`}
            >
              {plan.title}
            </p>
          </div>

          {showIndicators && (
            <div>
              <h3
                className={`font-bold text-slate-800 border-b border-slate-200 ${isCompact ? "text-base pb-1 mb-2" : "text-lg pb-2 mb-3"}`}
              >
                {indicatorsStep}. มาตรฐานการเรียนรู้และตัวชี้วัด (Indicators)
              </h3>
              <div className={`pl-4 space-y-3 bg-white ${isCompact ? "text-sm" : "text-base"}`}>
                {plan.coreIndicators && (
                  <div>
                    <span className="font-bold text-emerald-700 block mb-1">ตัวชี้วัดต้องรู้ (ต้นทาง):</span>
                    <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">{plan.coreIndicators}</div>
                  </div>
                )}
                {plan.targetIndicators && (
                  <div>
                    <span className="font-bold text-amber-700 block mb-1">ตัวชี้วัดควรรู้ (ปลายทาง):</span>
                    <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">{plan.targetIndicators}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {plan.competencies && (
            <div>
              <h3
                className={`font-bold text-slate-800 border-b border-slate-200 ${isCompact ? "text-base pb-1 mb-2" : "text-lg pb-2 mb-3"}`}
              >
                {competenciesStep}. สมรรถนะสำคัญของผู้เรียน (Competencies)
              </h3>
              <div
                className={`pl-4 whitespace-pre-wrap text-slate-700 leading-relaxed bg-white ${isCompact ? "text-sm" : "text-base"}`}
              >
                {plan.competencies}
              </div>
            </div>
          )}

          <div>
            <h3
              className={`font-bold text-slate-800 border-b border-slate-200 ${isCompact ? "text-base pb-1 mb-2" : "text-lg pb-2 mb-3"}`}
            >
              {objectivesStep}. {plan.isKindergarten ? "จุดประสงค์การจัดประสบการณ์" : "จุดประสงค์การเรียนรู้ (Objectives)"}
            </h3>
            <div
              className={`pl-4 whitespace-pre-wrap text-slate-700 leading-relaxed bg-white ${isCompact ? "text-sm" : "text-base"}`}
            >
              {plan.objectives}
            </div>
          </div>

          {plan.isKindergarten ? (
            <div className="space-y-4">
              <h3 className={`font-bold text-slate-800 border-b border-slate-200 ${isCompact ? "text-base pb-1 mb-2" : "text-lg pb-2 mb-3"}`}>
                {activitiesStep}. การจัดประสบการณ์ 6 กิจกรรมหลัก
              </h3>
              <div className={`pl-4 grid grid-cols-1 md:grid-cols-2 gap-4 ${isCompact ? "text-sm" : "text-base"}`}>
                <div><strong className="text-pink-600 block mb-1">กิจกรรมเคลื่อนไหวและจังหวะ:</strong> <p className="whitespace-pre-wrap text-slate-700">{plan.kgMovementActivity || "-"}</p></div>
                <div><strong className="text-pink-600 block mb-1">กิจกรรมเสริมประสบการณ์:</strong> <p className="whitespace-pre-wrap text-slate-700">{plan.kgCircleActivity || "-"}</p></div>
                <div><strong className="text-pink-600 block mb-1">กิจกรรมศิลปะสร้างสรรค์:</strong> <p className="whitespace-pre-wrap text-slate-700">{plan.kgArtActivity || "-"}</p></div>
                <div><strong className="text-pink-600 block mb-1">กิจกรรมเล่นตามมุม:</strong> <p className="whitespace-pre-wrap text-slate-700">{plan.kgFreePlayActivity || "-"}</p></div>
                <div><strong className="text-pink-600 block mb-1">กิจกรรมกลางแจ้ง:</strong> <p className="whitespace-pre-wrap text-slate-700">{plan.kgOutdoorActivity || "-"}</p></div>
                <div><strong className="text-pink-600 block mb-1">เกมการศึกษา:</strong> <p className="whitespace-pre-wrap text-slate-700">{plan.kgEducationalGame || "-"}</p></div>
              </div>
            </div>
          ) : (
            <div>
            <h3
              className={`font-bold text-slate-800 border-b border-slate-200 ${isCompact ? "text-base pb-1 mb-2" : "text-lg pb-2 mb-3"}`}
            >
              {activitiesStep}. {plan.isPBL ? "กระบวนการสืบเสาะและกิจกรรม (PBL)" : "กิจกรรมการเรียนรู้ (Learning Activities)"}
            </h3>
            
            {plan.isPBL && (
              <div className="pl-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <strong className="text-emerald-600 block mb-1">ปัญหาหลัก (Driving Question):</strong>
                  <p className="whitespace-pre-wrap text-slate-700 p-3 bg-emerald-50 rounded-lg border border-emerald-100">{plan.pblDrivingQuestion || "-"}</p>
                </div>
                <div>
                  <strong className="text-emerald-600 block mb-1">ขั้นตอนการสืบเสาะ (Investigation Steps):</strong>
                  <p className="whitespace-pre-wrap text-slate-700 p-3 bg-emerald-50 rounded-lg border border-emerald-100">{plan.pblInvestigationSteps || "-"}</p>
                </div>
                <div>
                  <strong className="text-emerald-600 block mb-1">การนำเสนอผลงาน (Presentation):</strong>
                  <p className="whitespace-pre-wrap text-slate-700 p-3 bg-emerald-50 rounded-lg border border-emerald-100">{plan.pblPresentation || "-"}</p>
                </div>
              </div>
            )}
            
            <div
              className={`pl-4 whitespace-pre-wrap text-slate-700 leading-relaxed bg-white ${isCompact ? "text-sm min-h-[80px]" : "text-base min-h-[120px]"}`}
            >
              {plan.activities}
            </div>
          </div>
          )}

          <div>
            <h3
              className={`font-bold text-slate-800 border-b border-slate-200 ${isCompact ? "text-base pb-1 mb-2" : "text-lg pb-2 mb-3"}`}
            >{materialsStep}. {plan.isKindergarten ? "สื่อการจัดประสบการณ์ (Materials)" : "สื่อการเรียนรู้ / แหล่งเรียนรู้ (Materials)"}</h3>
            <div
              className={`pl-4 whitespace-pre-wrap text-slate-700 leading-relaxed bg-white ${isCompact ? "text-sm" : "text-base"}`}
            >
              {plan.materials || "-"}
            </div>
          </div>

          <div>
            <h3
              className={`font-bold text-slate-800 border-b border-slate-200 ${isCompact ? "text-base pb-1 mb-2" : "text-lg pb-2 mb-3"}`}
            >
              {plan.isKindergarten ? (
                <>
                  {evaluationStep}. การสังเกตและประเมินพัฒนาการ 4 ด้าน (หลักสูตรปฐมวัย พ.ศ. 2568)
                </>
              ) : (
                <>
                  {evaluationStep}. วัดและประเมินผล (Evaluation)
                </>
              )}
            </h3>
            <div
              className={`pl-4 whitespace-pre-wrap text-slate-700 leading-relaxed bg-white ${isCompact ? "text-sm" : "text-base"}`}
            >
              {plan.isKindergarten ? (
                <div className={`flex flex-wrap gap-2.5 ${isCompact ? "text-xs" : "text-sm"}`}>
                  {plan.kgPhysicalDev && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-semibold border border-emerald-200">
                      ✓ 1. ด้านสุขภาวะทางกาย
                    </span>
                  )}
                  {(plan.kgEmotionalSocialDev || (!plan.kgEmotionalSocialDev && (plan.kgEmotionalDev || plan.kgSocialDev))) && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-semibold border border-emerald-200">
                      ✓ 2. ด้านอารมณ์ จิตใจ และสังคม
                    </span>
                  )}
                  {plan.kgCitizenshipDev && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-semibold border border-emerald-200">
                      ✓ 3. ด้านความเป็นพลเมืองและความเป็นไทย
                    </span>
                  )}
                  {(plan.kgIntellectualDev || (!plan.kgIntellectualDev && plan.kgCognitiveDev)) && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-semibold border border-emerald-200">
                      ✓ 4. ด้านสติปัญญาและการเรียนรู้
                    </span>
                  )}
                  {!plan.kgPhysicalDev &&
                    !plan.kgEmotionalSocialDev &&
                    !plan.kgCitizenshipDev &&
                    !plan.kgIntellectualDev &&
                    !plan.kgEmotionalDev &&
                    !plan.kgSocialDev &&
                    !plan.kgCognitiveDev && (
                      <span className="text-slate-500 italic">ไม่ได้ระบุด้านที่ประเมิน</span>
                    )}
                </div>
              ) : (
                <div className="space-y-4">
                  {plan.structuredEvaluations && plan.structuredEvaluations.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {plan.structuredEvaluations.map((evalItem, index) => (
                        <div key={`${evalItem.id}-${index}`} className="flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-2">
                              {evalItem.name} 
                              <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">{evalItem.method}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              คะแนนเต็ม {evalItem.maxScore} คะแนน • วัดด้าน {evalItem.kpa.join(', ')}
                            </div>
                          </div>
                          {evalItem.autoGenerateColumn && (
                            <button 
                              type="button"
                              className="print:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors shadow-sm"
                              onClick={() => {
                                // Normally this would navigate to the gradebook module and select the column
                                if (onNavigateToGradebook) {
                                  onNavigateToGradebook(plan.subject, plan.gradeLevel);
                                }
                              }}
                            >
                              📝 ไปกรอกคะแนน
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {plan.evaluation && <div>{plan.evaluation}</div>}
                  {!plan.evaluation && (!plan.structuredEvaluations || plan.structuredEvaluations.length === 0) && "-"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Signatures Section */}
        <div
          className={`border-t border-slate-200 grid grid-cols-2 font-serif ${isCompact ? "mt-8 pt-4 gap-6" : "mt-16 pt-8 gap-12"}`}
        >
          <PrintSignatureBox
            role="ผู้สอน (Teacher)"
            name={teacher.thaiName || teacher.displayName}
            date={
              plan.teacherSignedOn
                ? thaiFormatDate(plan.teacherSignedOn)
                : undefined
            }
            signature={plan.teacherSignature}
            label="ลงชื่อ"
          />

          <div className="flex flex-col items-center justify-end h-full">
            <p className="text-sm text-slate-600 mb-2">ลงชื่อ</p>
            <div className="w-40 border-b border-slate-400 mb-2 flex items-center justify-center min-h-[40px] relative">
              {plan.status === "approved" && plan.approverSignature && (
                <img
                  src={plan.approverSignature}
                  alt={`ลายเซ็น${plan.approverName || ""}`}
                  className="h-10 object-contain absolute bottom-0"
                  crossOrigin="anonymous"
                />
              )}
            </div>
            <p className="text-sm font-medium text-slate-900">
              {plan.approverName
                ? `(${plan.approverName})`
                : "(............................................)"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              หัวหน้าฝ่ายวิชาการ / ผู้ตรวจสอบ
            </p>
            <div className="mt-2 inline-flex">
              <span
                className={`text-[10px] px-2 py-0.5 border rounded ${plan.status === "approved" ? "border-emerald-600 text-emerald-700 font-bold" : "border-slate-300 text-slate-400 text-opacity-0 bg-slate-50"}`}
              >
                {plan.status === "approved"
                  ? "✔ อนุมัติแผนการจัดการเรียนรู้"
                  : "อนุมัติแผนการจัดการเรียนรู้"}
              </span>
            </div>
          </div>
        </div>
      </PrintPageContainer>

      {rejectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center gap-3">
              <div className="bg-rose-100 text-rose-600 p-2 rounded-full">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">ตีกลับให้แก้ไข</h3>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600 mb-3">ต้องการตีกลับให้แก้ไขแผนการสอนนี้ใช่หรือไม่? โปรดระบุข้อเสนอแนะ:</p>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="ระบุข้อเสนอแนะ / ความคิดเห็นเพิ่มเติมสำหรับผู้ตรวจ (ถ้ามี)"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 h-24 text-sm"
              />
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectComment("");
                }}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (onUpdatePlan) {
                    onUpdatePlan({ 
                      ...plan, 
                      status: "rejected",
                      approverComment: rejectComment || ""
                    });
                  }
                  setRejectModalOpen(false);
                  setRejectComment("");
                }}
                className="px-4 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                ยืนยันตีกลับ
              </button>
            </div>
          </div>
        </div>
      )}

      {signingRole && onUpdatePlan && (
        <SignaturePadModal
          role={signingRole}
          defaultName={
            signingRole === "teacher"
              ? teacher.thaiName || teacher.displayName
              : currentUser?.thaiName ||
                currentUser?.displayName ||
                academicHead?.thaiName ||
                academicHead?.displayName ||
                ""
          }
          onSave={handleSaveSignature}
          onClose={() => setSigningRole(null)}
        />
      )}
    </PDFPrintHelper>
  );
}
