import React, { useState } from "react";
import { LessonPlan, SUBJECTS, GRADE_LEVELS, Teacher, LessonRecord } from "../types";
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Search,
  Scale,
  Columns,
  Filter,
  Trash2,
  Edit,
  Printer,
  FileText,
  ChevronRight,
  MessageSquareDashed,
  Paperclip,
  Link2,
  Download,
  User,
  ExternalLink,
  Lock,
  Copy,
  ClipboardCheck,
} from "lucide-react";

interface LessonPlanListProps {
  plans: LessonPlan[];
  records?: LessonRecord[]; // added for comparison
  teachers?: Teacher[];
  showTeacherFilter?: boolean;
  currentUserRole?: string;
  currentTeacherId?: string;
  systemAcademicYear?: string;
  systemSemester?: string;
  onEdit: (plan: LessonPlan) => void;
  onDelete: (id: string) => void;
  onPrintPreview: (plan: LessonPlan) => void;
  onEvaluate?: (plan: LessonPlan) => void;
}

export function LessonPlanList({
  plans,
  records = [],
  teachers,
  showTeacherFilter = false,
  currentUserRole,
  currentTeacherId,
  systemAcademicYear,
  systemSemester,
  onEdit,
  onDelete,
  onPrintPreview,
  onEvaluate,
}: LessonPlanListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("ทั้งหมด");
  const [selectedGrade, setSelectedGrade] = useState<string>("ทั้งหมด");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("ทั้งหมด");
  const [selectedStatus, setSelectedStatus] = useState<string>("ทั้งหมด");
  
  // Combine semester and academic year into one term filter
  const initialTerm = systemSemester && systemAcademicYear ? `${systemSemester}/${systemAcademicYear}` : "ทั้งหมด";
  const [localTerm, setLocalTerm] = useState<string>(initialTerm);
  
  const [planToDelete, setPlanToDelete] = useState<{id: string, title: string} | null>(null);
  
  const [comparingPlan, setComparingPlan] = useState<LessonPlan | null>(null);
  
  const getAssociatedRecords = (planId: string) => {
    return records.filter(r => r.lessonPlanId === planId);
  };

  const getNormalizedTerm = (plan: LessonPlan) => {
    let sem = plan.semester || systemSemester || "";
    let year = plan.academicYear || systemAcademicYear || "";
    
    if (sem.includes("ภาคเรียนที่")) {
      const match = sem.match(/ภาคเรียนที่\s*(\d)\/(\d{4})/);
      if (match) {
        sem = match[1];
        year = match[2];
      }
    } else if (sem.includes("/")) {
      const match = sem.match(/(\d)\/(\d{4})/);
      if (match) {
        sem = match[1];
        year = match[2];
      }
    }
    return `${sem}/${year}`;
  };

  const filteredPlans = plans.filter((plan) => {
    const textMatch = searchMatches(plan, searchTerm);
    const subjMatch =
      selectedSubject === "ทั้งหมด" || plan.subject === selectedSubject;
    const gradeMatch =
      selectedGrade === "ทั้งหมด" || plan.gradeLevel.includes(selectedGrade);
    const teacherMatch =
      !showTeacherFilter ||
      selectedTeacherId === "ทั้งหมด" ||
      plan.teacherId === selectedTeacherId ||
      (plan.coTeachers && plan.coTeachers.includes(selectedTeacherId));
    const statusMatch =
      selectedStatus === "ทั้งหมด" || plan.status === selectedStatus;
    
    // Check combined term
    let termMatch = true;
    if (localTerm !== "ทั้งหมด") {
      const planTerm = getNormalizedTerm(plan);
      termMatch = planTerm === localTerm;
    }

    return textMatch && subjMatch && gradeMatch && teacherMatch && statusMatch && termMatch;
  });

  const handleDuplicatePlan = async (plan: LessonPlan) => {
    try {
      if (!systemAcademicYear || !systemSemester) {
        window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'ไม่สามารถคัดลอกได้ เนื่องจากไม่พบปีการศึกษาปัจจุบัน', type: 'error' } }));
        return;
      }
      
      const { id, ...planData } = plan;
      const duplicatedPlan = {
        ...planData,
        academicYear: systemAcademicYear,
        semester: `ภาคเรียนที่ ${systemSemester === '1' || systemSemester === '2' ? systemSemester : '1'}/${systemAcademicYear}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "draft" // Reset status to draft for the new term
      };
      
      await addDoc(collection(db, 'lessonPlans'), duplicatedPlan);
      window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'คัดลอกแผนการสอนสำเร็จ', type: 'success' } }));
    } catch (error) {
      console.error("Error duplicating plan:", error);
      window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'เกิดข้อผิดพลาดในการคัดลอก', type: 'error' } }));
    }
  };

  function searchMatches(plan: LessonPlan, query: string) {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      plan.title.toLowerCase().includes(q) ||
      plan.objectives.toLowerCase().includes(q) ||
      plan.activities.toLowerCase().includes(q) ||
      plan.subject.toLowerCase().includes(q) ||
      (plan.customSubject && plan.customSubject.toLowerCase().includes(q))
    );
  }

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

  const getTeacherName = (tId: string) => {
    if (!teachers) return "คุณครู";
    const t = teachers.find((t) => t.id === tId);
    return t ? t.thaiName : "คุณครู";
  };

  const uniqueTerms = Array.from(new Set(
    plans.map(p => getNormalizedTerm(p))
  )).sort((a, b) => {
    const [aSem, aYear] = a.split("/");
    const [bSem, bYear] = b.split("/");
    if (aYear !== bYear) return bYear.localeCompare(aYear);
    return bSem.localeCompare(aSem);
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Main search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาแผนการสอน, ชื่อเรื่อง, ตัวชี้วัด..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs placeholder:text-slate-400"
            />
          </div>

          {/* Teacher Filter (Optional) */}
          {showTeacherFilter && teachers && (
            <div className="flex items-center gap-1.5 min-w-[200px]">
              <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white font-bold text-slate-700"
              >
                <option value="ทั้งหมด">คุณครูผู้สอน: ทั้งหมด</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.displayName} ({t.thaiName})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 min-w-[180px]">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
            >
              <option value="ทั้งหมด">หมวดวิชา: ทั้งหมด</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Grade Filter */}
          <div className="flex items-center gap-1.5 min-w-[180px]">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
            >
              <option value="ทั้งหมด">ชั้นเรียน: ทั้งหมด</option>
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-col lg:flex-row gap-3 pt-2 border-t border-slate-100">
          
          <div className="flex items-center gap-1.5 min-w-[180px]">
            <select
              value={localTerm}
              onChange={(e) => setLocalTerm(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold text-indigo-700 bg-indigo-50"
            >
              <option value="ทั้งหมด">ภาคเรียนทั้งหมด</option>
              {uniqueTerms.map((term) => (
                <option key={term} value={term}>
                  ภาคเรียนที่ {term}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 min-w-[180px]">
            <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white font-bold text-slate-700"
            >
              <option value="ทั้งหมด">สถานะ: ทุกสถานะ</option>
              <option value="draft">ฉบับร่าง (Draft) ⚪</option>
              <option value="submitted">รอประเมิน (Submitted) 🔵</option>
              <option value="approved">อนุมัติแล้ว (Approved) 🟢</option>
              <option value="rejected">ตีกลับให้แก้ (Rejected) 🔴</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats of filtered list */}
      <div className="flex justify-between items-center text-xs text-slate-500 font-medium px-1">
        <span>เจอทั้งหมด {filteredPlans.length} รายการ</span>
        {(searchTerm ||
          selectedSubject !== "ทั้งหมด" ||
          selectedGrade !== "ทั้งหมด" ||
          selectedTeacherId !== "ทั้งหมด" ||
          selectedStatus !== "ทั้งหมด" ||
          localTerm !== "ทั้งหมด") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedSubject("ทั้งหมด");
              setSelectedGrade("ทั้งหมด");
              setSelectedTeacherId("ทั้งหมด");
              setSelectedStatus("ทั้งหมด");
              setLocalTerm(initialTerm);
            }}
            className="text-blue-600 font-bold hover:underline"
          >
            รีเซ็ตการค้นหา
          </button>
        )}
      </div>

      <div className="space-y-4">
        {filteredPlans.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3 shadow-xs">
            <div className="p-4 bg-slate-50 text-slate-300 rounded-full">
              <MessageSquareDashed className="h-10 w-10" />
            </div>
            <div>
              <p className="font-bold text-slate-600 text-sm">ไม่พบแผนการสอน</p>
              <p className="text-xs mt-1 text-slate-400 max-w-sm">
                ลองพิมพ์ค้นหาคำอื่น หรือเปลี่ยนที่ตัวกรองวิชาและชั้นเรียนดูนะ
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => {
              const isOwner = plan.teacherId === currentTeacherId;
              const isCoTeacher = plan.coTeachers ? plan.coTeachers.includes(currentTeacherId || '') : false;
              const currentTeacher = teachers?.find(t => t.id === currentTeacherId);
                            const isApproved = plan.status === "approved";
              const isRejected = plan.status === "rejected";

              let canEdit = false;
              let canDelete = false;

              if (currentUserRole === "admin") {
                canEdit = true;
                canDelete = true;
              } else if (
                currentUserRole === "academic" ||
                currentUserRole === "deputy"
              ) {
                canEdit = true;
              } else {
                if ((isOwner || isCoTeacher) && !isApproved) {
                  canEdit = true;
                  canDelete = isOwner; // Only owner can delete
                }
              }

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden group"
                >
                  <div
                    className={`h-1.5 w-full ${isApproved ? "bg-emerald-500" : isRejected ? "bg-rose-500" : "bg-amber-400"}`}
                  />

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        {plan.subject === "อื่น ๆ"
                          ? plan.customSubject
                          : plan.subject}
                      </span>
                      {plan.isIntegrated && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200" title={`บูรณาการ: ${plan.integratedSubjects || 'อื่นๆ'}`}>
                          บูรณาการ
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                          isApproved
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isRejected
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : plan.status === 'submitted'
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {isApproved
                          ? "อนุมัติแล้ว"
                          : isRejected
                            ? "ตีกลับให้แก้"
                            : plan.status === 'submitted'
                              ? "รอประเมิน"
                              : "ฉบับร่าง"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 line-clamp-2">
                      {plan.title || "ไม่มีชื่อเรื่อง"}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg inline-flex w-fit">
                      <span className="font-medium text-slate-700">
                        {plan.gradeLevel}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4 flex-1">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1">
                          จุดประสงค์:
                        </p>
                        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                          {plan.objectives || "-"}
                        </p>
                      </div>
                    </div>

                    {plan.approverComment && (
                      <div className={`mt-auto mb-3 p-2.5 rounded-lg border text-xs ${isRejected ? 'bg-rose-50 border-rose-100 text-rose-700' : isApproved ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                        <p className="font-bold flex items-center gap-1 mb-1">
                          <MessageSquareDashed className="w-3.5 h-3.5" /> 
                          ความคิดเห็นจาก {plan.approverName || "ฝ่ายวิชาการ"}:
                        </p>
                        <p className="leading-relaxed line-clamp-2" title={plan.approverComment}>{plan.approverComment}</p>
                      </div>
                    )}

                    {showTeacherFilter && (
                      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                        <User className="h-3.5 w-3.5 flex-shrink-0" />
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="font-medium text-slate-700">{getTeacherName(plan.teacherId)}</span>
                          {plan.coTeachers && plan.coTeachers.length > 0 && (
                            <span className="text-slate-400 text-[10px]">
                              (+ ร่วมกับ {plan.coTeachers.map((id, index) => <span key={id}>{getTeacherName(id)}{index < plan.coTeachers!.length - 1 ? ', ' : ''}</span>)})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 border-t border-slate-100 p-3 flex justify-between items-center shrink-0">
                    <span className="text-xs text-slate-500 font-medium">
                      {thaiFormatDate(plan.date)}
                    </span>
                    <div className="flex gap-2">
                      {getNormalizedTerm(plan) !== `${systemSemester}/${systemAcademicYear}` && (
                        <button
                          type="button"
                          onClick={() => handleDuplicatePlan(plan)}
                          className="p-1.5 rounded-lg transition-colors text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                          title="นำไปใช้ในภาคเรียนปัจจุบัน (คัดลอก)"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setComparingPlan(plan)}
                        className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="เปรียบเทียบกับบันทึกหลังสอน"
                      >
                        <Columns className="h-4 w-4" />
                      </button>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => setPlanToDelete({ id: plan.id, title: plan.title })}
                          className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-red-500 hover:bg-red-50"
                          title="ลบ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}

                      {canEdit ? (
                        <button
                          onClick={() => onEdit(plan)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="แก้ไข / ตรวจ"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="p-1.5 text-slate-300 rounded-lg cursor-not-allowed"
                          title="ถูกล็อก หรือไม่มีสิทธิ์"
                        >
                          <Lock className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => onPrintPreview(plan)}
                        className="p-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 rounded-lg shadow-sm transition-all flex items-center gap-1.5 ml-1"
                        title="พิมพ์แผนการสอน"
                      >
                        <Printer className="h-4 w-4" />
                        <span className="text-xs font-semibold hidden sm:inline">
                          สั่งพิมพ์
                        </span>
                      </button>
                      
                      {onEvaluate && (
                        <button
                          onClick={() => onEvaluate(plan)}
                          className="p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 rounded-lg shadow-sm transition-all flex items-center gap-1.5 ml-1"
                          title="ประเมินผู้เรียน / บันทึกหลังสอน"
                        >
                          <ClipboardCheck className="h-4 w-4" />
                          <span className="text-xs font-bold hidden sm:inline">
                            ประเมินผล
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {planToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="font-black text-slate-800 text-lg mb-2">
              ยืนยันการลบแผนการสอน
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              คุณต้องการลบแผนการสอนเรื่อง "{planToDelete.title}" ใช่หรือไม่?<br/>การดำเนินการนี้ไม่สามารถกู้คืนได้
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPlanToDelete(null)}
                className="flex-1 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  onDelete(planToDelete.id);
                  setPlanToDelete(null);
                }}
                className="flex-1 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                ลบข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {comparingPlan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Columns className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">เปรียบเทียบ: แผนการสอน vs บันทึกหลังสอน</h3>
                  <p className="text-xs text-slate-500 font-medium">เรื่อง: {comparingPlan.title}</p>
                </div>
              </div>
              <button
                onClick={() => setComparingPlan(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <Trash2 className="h-0 w-0 hidden" /> {/* To load icon if not used else */}
                <span className="font-bold">ปิดหน้าต่าง</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
              {(() => {
                const associatedRecords = getAssociatedRecords(comparingPlan.id);
                if (associatedRecords.length === 0) {
                  return (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                        <MessageSquareDashed className="h-10 w-10 text-slate-400" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-700">ไม่พบบันทึกหลังสอนที่เกี่ยวข้อง</h4>
                      <p className="text-sm text-slate-500 max-w-sm mt-2">
                        แผนการสอนนี้ยังไม่ถูกนำไปใช้อ้างอิงในการเขียนบันทึกหลังสอน
                      </p>
                    </div>
                  );
                }
                
                // Show side by side for each record (usually 1)
                return (
                  <div className="space-y-8">
                    {associatedRecords.map((record, idx) => (
                      <div key={record.id} className="flex flex-col lg:flex-row gap-6">
                        {/* Left Side: Lesson Plan */}
                        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                          <h4 className="text-sm font-black text-indigo-600 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <FileText className="w-4 h-4" /> แผนการสอน
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">จุดประสงค์การเรียนรู้</p>
                              <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {comparingPlan.objectives || '-'}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">กิจกรรมการเรียนรู้</p>
                              <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {comparingPlan.activities || '-'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right Side: Lesson Record */}
                        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                          <h4 className="text-sm font-black text-emerald-600 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <MessageSquareDashed className="w-4 h-4" /> บันทึกหลังสอน {associatedRecords.length > 1 ? `(ครั้งที่ ${idx + 1})` : ''}
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ผลการจัดกิจกรรม / สาระ</p>
                              <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {record.content || '-'}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ปัญหา / อุปสรรค</p>
                              <div className="text-sm text-rose-700 whitespace-pre-wrap leading-relaxed bg-rose-50 p-3 rounded-lg border border-rose-100">
                                {record.limitations || '-'}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ข้อเสนอแนะ / แนวทางแก้ไข</p>
                              <div className="text-sm text-amber-700 whitespace-pre-wrap leading-relaxed bg-amber-50 p-3 rounded-lg border border-amber-100">
                                {record.suggestions || '-'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
