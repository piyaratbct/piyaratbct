import React, { useState, useEffect } from "react";
import { LessonPlan, SUBJECTS, GRADE_LEVELS, SubjectType, Attachment, SEMESTERS, PERIOD_OPTIONS, CurriculumSubject } from "../types";

import { User, 
  Save,
  AlertCircle,
  Link2,
  Trash2,
  BookOpen,
  Edit3,
  XCircle,
  Paperclip,
  Plus,
  FileImage,
  FileText,
  Video as VideoIcon,
  BookType,
  Target,
  Sparkles,
  Lightbulb,
  CheckCircle,
  CalendarDays,
 } from 'lucide-react';
import { SignaturePadModal } from "./PrintTemplate";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

import { AttachmentManager } from './AttachmentManager';
import { formatThaiDate } from '../lib/dateUtils';



export function PBLLessonPlanForm({
  teacherId,
  onSave,
  initialPlan,
  onCancel,
  currentUserRole,
  currentUserName,
  systemAcademicYear,
  systemSemester,
  teachers = [],
}: {
  teacherId: string;
  onSave: (plan: Omit<LessonPlan, "id" | "createdAt" | "updatedAt">) => void;
  initialPlan?: LessonPlan | null;
  onCancel?: () => void;
  currentUserRole?: string;
  currentUserName?: string;
  systemAcademicYear: string;
  systemSemester: string;
  teachers?: any[];
}) {
  const [selectedGrades, setSelectedGrades] = useState<string[]>(
    initialPlan?.gradeLevel 
      ? initialPlan.gradeLevel.split(',').map(s => s.trim()).filter(Boolean)
      : [GRADE_LEVELS[0]]
  );
  const defaultSemester = `ภาคเรียนที่ ${systemSemester === '1' || systemSemester === '2' ? systemSemester : '1'}/${systemAcademicYear || '2567'}`;
  const [semester, setSemester] = useState(initialPlan?.semester || defaultSemester);
  const subject = "บูรณาการ (PBL)";
    const [date, setDate] = useState(initialPlan?.date || "");
  const [title, setTitle] = useState(initialPlan?.title || "");
  const [coTeachers, setCoTeachers] = useState<string[]>(initialPlan?.coTeachers || []);
    const [showCoTeacherDropdown, setShowCoTeacherDropdown] = useState(false);
  const [pblDrivingQuestion, setPblDrivingQuestion] = useState(initialPlan?.pblDrivingQuestion || "");
  const [pblInvestigationSteps, setPblInvestigationSteps] = useState(initialPlan?.pblInvestigationSteps || "");
  const [pblPresentation, setPblPresentation] = useState(initialPlan?.pblPresentation || "");
  const [integratedSubjects, setIntegratedSubjects] = useState(initialPlan?.integratedSubjects || "");
  const [coreIndicators, setCoreIndicators] = useState(initialPlan?.coreIndicators || "");
  const [targetIndicators, setTargetIndicators] = useState(initialPlan?.targetIndicators || "");
  const [objectives, setObjectives] = useState(initialPlan?.objectives || "");
  const [competencies, setCompetencies] = useState(initialPlan?.competencies || "");
  
  // New states for curriculum integration
  const [curriculums, setCurriculums] = useState<any[]>([]);
  const [showSubjectsDropdown, setShowSubjectsDropdown] = useState(false);
  const [usedIndicators, setUsedIndicators] = useState<Set<string>>(new Set());
  const [isLoadingIndicators, setIsLoadingIndicators] = useState(false);
  
  const [tableGradeFilter, setTableGradeFilter] = useState<string>('all');
  
  // Calculate remaining indicators
  let totalRemaining = 0;
  curriculums.forEach(curr => {
    curr.standards.forEach((std: any) => {
      std.indicators.forEach((ind: any) => {
        if (!usedIndicators.has(ind.code)) {
          totalRemaining++;
        }
      });
    });
  });

  
  const isKindergarten = selectedGrades.some(g => g.includes('อนุบาล'));
  
  const [kgMovementActivity, setKgMovementActivity] = useState(initialPlan?.kgMovementActivity || "");
  const [kgCircleActivity, setKgCircleActivity] = useState(initialPlan?.kgCircleActivity || "");
  const [kgArtActivity, setKgArtActivity] = useState(initialPlan?.kgArtActivity || "");
  const [kgFreePlayActivity, setKgFreePlayActivity] = useState(initialPlan?.kgFreePlayActivity || "");
  const [kgOutdoorActivity, setKgOutdoorActivity] = useState(initialPlan?.kgOutdoorActivity || "");
  const [kgEducationalGame, setKgEducationalGame] = useState(initialPlan?.kgEducationalGame || "");
  
  const [kgPhysicalDev, setKgPhysicalDev] = useState(initialPlan?.kgPhysicalDev || false);
  const [kgEmotionalDev, setKgEmotionalDev] = useState(initialPlan?.kgEmotionalDev || false);
  const [kgSocialDev, setKgSocialDev] = useState(initialPlan?.kgSocialDev || false);
  const [kgCognitiveDev, setKgCognitiveDev] = useState(initialPlan?.kgCognitiveDev || false);

  const [activities, setActivities] = useState(initialPlan?.activities || "");
  const [materials, setMaterials] = useState(initialPlan?.materials || "");
  const [evaluation, setEvaluation] = useState(initialPlan?.evaluation || "");
  const [status, setStatus] = useState<LessonPlan['status']>(initialPlan?.status || "draft");
  const [approverComment, setApproverComment] = useState(initialPlan?.approverComment || "");

  const [attachments, setAttachments] = useState<Attachment[]>(initialPlan?.attachments || []);
  const [errorMsg, setErrorMsg] = useState("");
  const [signingRole, setSigningRole] = useState<"teacher" | "deptHead" | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState("");

  const getTodayString = () => new Date().toISOString().slice(0, 10);
  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  useEffect(() => {
    const fetchCurriculumData = async () => {
      if (!subject || selectedGrades.length === 0) {
        setCurriculums([]);
        return;
      }
      setIsLoadingIndicators(true);
      try {
        // Modified to support fuzzy matching based on integratedSubjects
        const qCurriculums = query(collection(db, 'curriculums'));
        const snapshotCurriculums = await getDocs(qCurriculums);
        let fetchedCurriculums = snapshotCurriculums.docs.map(doc => doc.data() as CurriculumSubject);
        
        if (integratedSubjects) {
          const subjectsArray = integratedSubjects.split(',').map(s => s.trim()).filter(Boolean);
          fetchedCurriculums = fetchedCurriculums.filter(c => {
            const cName = c.subjectName || '';
            return subjectsArray.some(s => cName === s || cName.includes(s) || s.includes(cName));
          });
        } else {
          fetchedCurriculums = [];
        }
        
        // Filter by selected grades (exact match, or if grade is "ป.1/1" but curriculum is "ป.1" we might want to be smart, but let's stick to exact match first. Actually, standard practice in Thai schools is curriculum per grade level (e.g. "ประถมศึกษาปีที่ 1"). The selectedGrades might have sub-rooms. Let's normalize).
        const normalizedSelectedGrades = selectedGrades.map(g => g.split('/')[0].trim());
        const matchedCurriculums = fetchedCurriculums.filter(c => normalizedSelectedGrades.includes(c.gradeLevel.split('/')[0].trim()));
        setCurriculums(matchedCurriculums);

        // Fetch existing lesson plans for the same teacher, subject, semester, and grade
        // To find used indicators
        const qPlans = query(collection(db, 'lessonPlans'), 
          where('teacherId', '==', teacherId),
          where('subject', '==', subject),
          where('semester', '==', semester)
        );
        const snapshotPlans = await getDocs(qPlans);
        const used = new Set<string>();
        snapshotPlans.docs.forEach(doc => {
          const plan = doc.data() as LessonPlan;
          if (plan.id === initialPlan?.id) return; // exclude current plan
          
          // Check if plan has overlapping grades
          const planGrades = plan.gradeLevel.split(',').map(s => s.trim());
          const hasOverlap = planGrades.some(g => selectedGrades.includes(g));
          if (hasOverlap) {
             if (plan.coreIndicators) {
               plan.coreIndicators.split(',').forEach(i => used.add(i.trim()));
             }
             if (plan.targetIndicators) {
               plan.targetIndicators.split(',').forEach(i => used.add(i.trim()));
             }
          }
        });
        setUsedIndicators(used);

      } catch (error) {
        console.error("Error fetching curriculum data", error);
      } finally {
        setIsLoadingIndicators(false);
      }
    };
    fetchCurriculumData();
  }, [integratedSubjects, selectedGrades, semester, teacherId, initialPlan]);

  useEffect(() => {
    if (initialPlan) {
      

      if (initialPlan.gradeLevel) {
        const levels = initialPlan.gradeLevel
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        setSelectedGrades(levels.length > 0 ? levels : [GRADE_LEVELS[0]]);
      }

      setSemester(initialPlan.semester || defaultSemester);
      setDate(initialPlan.date);
      setTitle(initialPlan.title);
      setPblDrivingQuestion(initialPlan.pblDrivingQuestion || "");
      setPblInvestigationSteps(initialPlan.pblInvestigationSteps || "");
      setPblPresentation(initialPlan.pblPresentation || "");
      setIntegratedSubjects(initialPlan.integratedSubjects || "");
      setCoreIndicators(initialPlan.coreIndicators || "");
      setTargetIndicators(initialPlan.targetIndicators || "");
      setObjectives(initialPlan.objectives);
      setActivities(initialPlan.activities);
      setMaterials(initialPlan.materials);
      setEvaluation(initialPlan.evaluation);
      setAttachments(initialPlan.attachments || []);
    } else {
      resetForm();
    }
  }, [initialPlan, defaultSemester]);

  const resetForm = () => {
    setSelectedGrades([GRADE_LEVELS[0]]);
    setSemester(defaultSemester);
    setDate("");
    setTitle("");
    setPblDrivingQuestion("");
    setPblInvestigationSteps("");
    setPblPresentation("");
    setIntegratedSubjects("");
    setCoreIndicators("");
    setTargetIndicators("");
    setObjectives("");
    setActivities("");
    setMaterials("");
    setEvaluation("");
    setAttachments([]);
    setErrorMsg("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGrades.length === 0) {
      setErrorMsg("กรุณาเลือกระดับชั้นอย่างน้อย 1 ระดับ");
      return;
    }
    if (!title.trim() || !objectives.trim() || (!isKindergarten && !activities.trim()) || (!pblDrivingQuestion.trim() || !pblInvestigationSteps.trim() || !pblPresentation.trim())) {
      setErrorMsg("กรุณากรอกข้อมูลให้ครบถ้วนในช่องที่มีเครื่องหมายดอกจัน (*)");
      return;
    }

    const isApproverSave = (currentUserRole === "academic" || currentUserRole === "admin" || currentUserRole === "deputy") && initialPlan;
    
    // Determine the status. If a teacher edits a rejected plan, automatically resubmit it.
    let currentStatus = isApproverSave ? status : (initialPlan ? initialPlan.status : "draft");
    if (!isApproverSave && initialPlan && initialPlan.status === "rejected") {
      currentStatus = "submitted"; // Reset to submitted when teacher updates
    }
    
    const plan: LessonPlan = {
      ...(initialPlan || {}),
      id: initialPlan ? initialPlan.id : Date.now().toString(),
      teacherId: initialPlan ? initialPlan.teacherId : teacherId,
      subject: 'บูรณาการ (PBL)',
      gradeLevel: selectedGrades.join(", "),
      title,
      isIntegrated: true,
      integratedSubjects,
      isPBL: true,
      pblDrivingQuestion,
      pblInvestigationSteps,
      pblPresentation,
      coreIndicators,
      targetIndicators,
      competencies,
      objectives,
      activities,
      materials,
      evaluation,
      
      isKindergarten,
      kgMovementActivity,
      kgCircleActivity,
      kgArtActivity,
      kgFreePlayActivity,
      kgOutdoorActivity,
      kgEducationalGame,
      kgPhysicalDev,
      kgEmotionalDev,
      kgSocialDev,
      kgCognitiveDev,

      date,
      semester,
      attachments,
      coTeachers,
      status: currentStatus,
      approverComment: isApproverSave ? approverComment : (initialPlan?.status === "rejected" ? "" : (initialPlan?.approverComment || "")),
      approverId: (isApproverSave && (status === "approved" || status === "rejected")) ? (teacherId) : initialPlan?.approverId, // NOTE: wait, we only have teacherId passed from App as current user? NO, we just passed currentTeacherId in App.tsx?
      // Actually we didn't pass currentTeacherId directly, wait...
      createdAt: initialPlan ? initialPlan.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // For approver saving, we should set approver Name and Date
    if (isApproverSave && (status === 'approved' || status === 'rejected' || approverComment)) {
        // use teacherId as reviewer id since it's passed from App as currentTeacher.id initially
        // BUT wait, we fixed teacherId in App.tsx? NO! In App.tsx teacherId={currentTeacher.id}. 
        // So teacherId prop IS the current user!
        plan.approverId = teacherId;
        plan.approverName = currentUserName || "ผู้ประเมิน";
        plan.approverDate = new Date().toISOString();
    }

    onSave(plan);
    if (!initialPlan) resetForm();
  };

  const handleGradeToggle = (grade: string) => {
    setSelectedGrades((prev) =>
      prev.includes(grade)
        ? prev.filter((g) => g !== grade)
        : [...prev, grade].sort(),
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-sky-400 via-sky-500 to-pink-400 px-6 py-4 flex justify-between items-center text-white shadow-xs">
        <div>
          <h3 className="font-extrabold text-base flex items-center gap-2">
            <BookOpen className="h-5 w-5 animate-pulse text-white" />
            {initialPlan
              ? "แก้ไขแผนการสอน (Edit Lesson Plan)"
              : "เขียนแผนการสอน (New Lesson Plan)"}
          </h3>
          <p className="text-[11px] text-white/95 mt-0.5">
            บันทึกโครงร่างแผนการจัดการเรียนรู้ล่วงหน้าอย่างเป็นระบบ
          </p>
        </div>
        {initialPlan && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold px-3 py-1 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-colors"
          >
            ยกเลิกแก้ไข
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-xs font-semibold">{errorMsg}</p>
          </div>
        )}

        {initialPlan && initialPlan.status === "rejected" && initialPlan.approverComment && (
          <div className="bg-rose-50 text-rose-800 p-4 rounded-xl flex items-start gap-3 border border-rose-200 shadow-sm animate-in fade-in duration-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-rose-900 mb-1">แผนการสอนนี้ถูกตีกลับให้แก้ไข</p>
              <p className="text-sm text-rose-700 whitespace-pre-wrap">{initialPlan.approverComment}</p>
            </div>
          </div>
        )}

        {/* 1. Basic Metadata Grid (subject, semester, date) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className={`col-span-1 md:col-span-full p-4 rounded-xl border border-slate-200`}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">รายวิชา / สาระการเรียนรู้ที่บูรณาการ (เลือกได้มากกว่า 1)</label>
              <div className="relative">
                  <div 
                    className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-200 bg-white cursor-pointer flex justify-between items-center"
                    onClick={() => setShowSubjectsDropdown(!showSubjectsDropdown)}
                  >
                    <span className={integratedSubjects ? "text-slate-800" : "text-slate-400"}>
                      {integratedSubjects || "คลิกเพื่อเลือกรายวิชาที่บูรณาการ..."}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                  
                  {showSubjectsDropdown && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {SUBJECTS.filter(s => s !== 'อื่นๆ' && s !== 'อื่น ๆ').map((subj) => {
                        const isSelected = integratedSubjects.includes(subj);
                        return (
                          <label key={subj} className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-slate-100 text-slate-700 font-medium' : 'hover:bg-slate-50 text-slate-700'}`}>
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => {
                                let arr = integratedSubjects.split(',').map(s => s.trim()).filter(Boolean);
                                if (arr.includes(subj)) {
                                  arr = arr.filter(s => s !== subj);
                                } else {
                                  arr.push(subj);
                                }
                                setIntegratedSubjects(arr.join(', '));
                              }}
                              className="rounded text-slate-800 focus:ring-blue-500 w-3.5 h-3.5"
                            />
                            <span className="text-xs">{subj}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
          </div>
          <div className="col-span-1 md:col-span-full bg-white p-6 rounded-2xl border-2 border-emerald-500/20 shadow-sm mt-4">
            <div className="flex items-center gap-3 mb-4 border-b border-slate-200/50 pb-3">
              <div className="h-10 w-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-slate-700">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">หน่วยการเรียนรู้ Problem-Based Learning</h4>
                <p className="text-xs text-slate-500">กำหนดปัญหาหลักและกระบวนการสืบเสาะ</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ปัญหาหลัก (Driving Question) <span className="text-red-500">*</span></label>
                <textarea 
                  value={pblDrivingQuestion} 
                  onChange={(e) => setPblDrivingQuestion(e.target.value)} 
                  placeholder="ตั้งคำถามเพื่อกระตุ้นการเรียนรู้และการแก้ปัญหา..." 
                  className="w-full px-4 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[80px]" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ขั้นตอนการสืบเสาะ (Investigation Steps) <span className="text-red-500">*</span></label>
                  <textarea 
                    value={pblInvestigationSteps} 
                    onChange={(e) => setPblInvestigationSteps(e.target.value)} 
                    placeholder="ระบุกระบวนการหรือขั้นตอนที่นักเรียนจะใช้ค้นหาคำตอบ..." 
                    className="w-full px-4 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[100px]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">การนำเสนอผลงาน (Presentation) <span className="text-red-500">*</span></label>
                  <textarea 
                    value={pblPresentation} 
                    onChange={(e) => setPblPresentation(e.target.value)} 
                    placeholder="วิธีการที่นักเรียนจะนำเสนอแนวทางแก้ไขหรือผลลัพธ์..." 
                    className="w-full px-4 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[100px]" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ภาคเรียนพร้อมปีการศึกษา
            </label>
            <select
              required
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="" disabled>เลือกภาคเรียน</option>
              {SEMESTERS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              คาบที่ (ระบุเป็นครั้ง)
            </label>
            <select
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              title="คาบที่ (ระบุเป็นครั้ง)"
            >
              <option value="" disabled>เลือกคาบที่</option>
              {PERIOD_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 1.5 Multi-grade level selection grid */}
        <div className="bg-transparent p-5 rounded-2xl border border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-3 flex items-center justify-between">
            <span>
              ระดับชั้น (Grade Level) <span className="text-red-500">*</span>
            </span>
            <span className="text-[10.5px] text-slate-600 font-bold bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200">
              {selectedGrades.length === 0
                ? "ยังไม่ได้เลือก"
                : `เลือกแล้ว ${selectedGrades.length} ระดับชั้น`}
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {GRADE_LEVELS.map((grade) => (
              <label
                key={grade}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border sm:cursor-pointer transition-all duration-200 ${
                  selectedGrades.includes(grade)
                    ? "bg-slate-50/80 border-blue-300 text-blue-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedGrades.includes(grade)}
                  onChange={() => handleGradeToggle(grade)}
                  className="rounded text-slate-600 focus:ring-blue-500 border-slate-300 h-4 w-4"
                />
                <span className="text-xs font-semibold">{grade}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 my-2"></div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <BookType className="h-4 w-4 text-blue-500" />
              {isKindergarten ? "1. ชื่อหน่วยการจัดประสบการณ์ / เรื่อง (Theme/Unit)" : "1. ชื่อหน่วยการเรียนรู้ / เรื่อง (Topic/Title)"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <p className="text-[10px] text-slate-400 mb-2">
              {isKindergarten ? "ระบุชื่อหน่วยการจัดประสบการณ์ หรือเรื่องที่จะใช้สอน" : "ระบุชื่อหน่วย หรือเรื่องที่จะใช้สอน"}
            </p>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder:text-slate-400"
              placeholder="ตัวอย่าง: สิ่งมีชีวิตและสิ่งแวดล้อม"
            />
          
          </div>
          
          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-emerald-500" />
                ครูผู้ร่วมสอน (Co-teachers)
              </span>
              <span className="text-[10px] text-slate-500 font-normal">เลือกได้มากกว่า 1 ท่าน (ไม่บังคับ)</span>
            </label>
            <div 
              className="w-full p-3 min-h-[44px] text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white cursor-pointer flex flex-wrap gap-2 items-center"
              onClick={() => setShowCoTeacherDropdown(!showCoTeacherDropdown)}
            >
              {coTeachers.length === 0 ? (
                <span className="text-slate-400">คลิกเพื่อเลือกครูผู้ร่วมสอน...</span>
              ) : (
                coTeachers.map(id => {
                  const t = teachers.find(t => t.id === id);
                  return (
                    <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-medium border border-emerald-100">
                      {t ? (t.thaiName || t.displayName) : id}
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setCoTeachers(prev => prev.filter(tid => tid !== id));
                        }}
                        className="hover:text-emerald-900 focus:outline-none"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })
              )}
            </div>
            
            {showCoTeacherDropdown && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2 flex flex-col gap-1">
                {teachers.filter(t => t.id !== teacherId && ['teacher', 'academic', 'deputy', 'admin'].includes(t.role || '')).length === 0 ? (
                  <p className="text-[10px] text-center text-slate-500 p-2">ไม่มีครูท่านอื่นในระบบ</p>
                ) : (
                  teachers
                    .filter(t => t.id !== teacherId && ['teacher', 'academic', 'deputy', 'admin'].includes(t.role || ''))
                    .map(t => {
                      const isSelected = coTeachers.includes(t.id);
                      return (
                        <label key={t.id} className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}>
                          <input 
                            type="checkbox" 
                            className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 transition-all cursor-pointer"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCoTeachers(prev => [...prev, t.id]);
                              } else {
                                setCoTeachers(prev => prev.filter(id => id !== t.id));
                              }
                            }}
                          />
                          <span className="text-xs truncate">{t.thaiName || t.displayName}</span>
                        </label>
                      );
                    })
                )}
              </div>
            )}
          </div>

          
          {!isKindergarten && (
            <>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 mb-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-800">การจัดการตัวชี้วัด (Indicators)</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {curriculums.length === 0 
                      ? 'ไม่พบข้อมูลหลักสูตรสำหรับวิชาและชั้นเรียนที่เลือก'
                      : totalRemaining === 0 
                        ? 'คุณได้นำตัวชี้วัดทั้งหมดไปใช้ในแผนการสอนครบถ้วนแล้ว เยี่ยมมาก!'
                        : `คุณมีตัวชี้วัดที่ยังไม่ได้ระบุในแผนการสอนใดเลย จำนวน ${totalRemaining} ตัวชี้วัด`}
                  </p>
                </div>
              </div>
              {curriculums.length > 0 && (
                <div className="flex flex-col gap-1 items-end">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">กรองระดับชั้น</label>
                  <select 
                    value={tableGradeFilter}
                    onChange={(e) => setTableGradeFilter(e.target.value)}
                    className="text-xs p-1.5 rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                  >
                    <option value="all">ทุกระดับชั้น</option>
                    {Array.from(new Set(curriculums.map(c => c.gradeLevel))).sort().map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {curriculums.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-800">ไม่สามารถเลือกตัวชี้วัดได้</p>
                  <p className="text-[10px] text-amber-700 mt-0.5">
                    กรุณาไปที่ <strong>โมดูลวิชาการ &gt; จัดการหลักสูตร</strong> เพื่อเพิ่มข้อมูลหลักสูตรและตัวชี้วัดให้ครบถ้วนก่อน
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="max-h-80 overflow-y-auto custom-scrollbar p-3 space-y-4">
                  {curriculums
                    .filter(c => tableGradeFilter === 'all' || c.gradeLevel === tableGradeFilter)
                    .map((curr, cIdx) => (
                    <div key={cIdx}>
                      <div className="text-[11px] font-black text-slate-700 bg-slate-100 px-2 py-1 rounded mb-2 border border-slate-200 inline-block">
                        {curr.gradeLevel}
                      </div>
                      {curr.standards.map((std: any, sIdx: number) => {
                        if (!std.indicators || std.indicators.length === 0) return null;
                        
                        return (
                          <div key={sIdx} className="mb-3 ml-2">
                            <div className="font-bold text-slate-700 text-[11px] mb-2 bg-slate-100 px-2 py-1.5 rounded border border-slate-200">
                              {std.title}
                            </div>
                            <div className="space-y-1.5 pl-2">
                              {std.indicators.map((ind: any, iIdx: number) => {
                                const used = usedIndicators.has(ind.code);
                                
                                // Check if selected in current form textareas
                                const isSelectedCore = coreIndicators.split('\n').some(l => l.trim().startsWith(ind.code));
                                const isSelectedTarget = targetIndicators.split('\n').some(l => l.trim().startsWith(ind.code));
                                const selected = isSelectedCore || isSelectedTarget;
                                
                                const toggleCombinedIndicator = () => {
                                  const itemStr = `${ind.code} ${ind.description}`;
                                  if (ind.type === 'core') {
                                    let currentLines = coreIndicators.split('\n').map(l => l.trim()).filter(Boolean);
                                    const existingIndex = currentLines.findIndex(l => l.startsWith(ind.code));
                                    if (existingIndex >= 0) currentLines.splice(existingIndex, 1);
                                    else currentLines.push(itemStr);
                                    setCoreIndicators(currentLines.join('\n'));
                                  } else {
                                    let currentLines = targetIndicators.split('\n').map(l => l.trim()).filter(Boolean);
                                    const existingIndex = currentLines.findIndex(l => l.startsWith(ind.code));
                                    if (existingIndex >= 0) currentLines.splice(existingIndex, 1);
                                    else currentLines.push(itemStr);
                                    setTargetIndicators(currentLines.join('\n'));
                                  }
                                };
                                
                                return (
                                  <label 
                                    key={iIdx} 
                                    className={`flex items-start gap-2 p-2.5 rounded-xl border sm:cursor-pointer transition-colors ${selected ? 'bg-slate-100 border-slate-300 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                  >
                                    <div className="mt-0.5">
                                      <input 
                                        type="checkbox"
                                        checked={selected}
                                        onChange={toggleCombinedIndicator}
                                        className="rounded text-slate-800 focus:ring-blue-500 border-slate-300 h-4 w-4 transition-all"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-800">
                                        <span>{ind.code}</span>
                                        <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold ${ind.type === 'core' ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                                          {ind.type === 'core' ? 'ต้นทาง' : 'ปลายทาง'}
                                        </span>
                                        {used ? (
                                          <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200" title="ถูกใช้งานแล้วในแผนการสอนอื่น">
                                            <Check className="h-3 w-3" /> ถูกใช้แล้ว
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-100" title="ยังไม่เคยถูกนำไปใช้ในแผนการสอนใดเลย">
                                            <AlertCircle className="h-3 w-3" /> คงเหลือ
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                                        {ind.description}
                                      </div>
                                    </div>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-slate-700" />
              ตัวชี้วัดต้องรู้ (ต้นทาง) ที่เลือกไว้
            </label>
            <p className="text-[10px] text-slate-400 mb-2">
              (สามารถแก้ไขข้อความด้านล่างเพิ่มเติมได้ หากจำเป็น)
            </p>
            <textarea
              value={coreIndicators}
              onChange={(e) => setCoreIndicators(e.target.value)}
              rows={2}
              className="w-full p-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
              placeholder="คลิกเลือกจากรายการด้านบน หรือพิมพ์เพิ่ม..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-amber-500" />
              ตัวชี้วัดควรรู้ (ปลายทาง) ที่เลือกไว้
            </label>
            <p className="text-[10px] text-slate-400 mb-2">
              (สามารถแก้ไขข้อความด้านล่างเพิ่มเติมได้ หากจำเป็น)
            </p>
            <textarea
              value={targetIndicators}
              onChange={(e) => setTargetIndicators(e.target.value)}
              rows={2}
              className="w-full p-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
              placeholder="คลิกเลือกจากรายการด้านบน หรือพิมพ์เพิ่ม..."
            />
          </div>
            </>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-amber-500" />
              {isKindergarten ? "2. จุดประสงค์การจัดประสบการณ์" : "2. จุดประสงค์การเรียนรู้ (Objectives)"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <p className="text-[10px] text-slate-400 mb-2">
              {isKindergarten ? "จุดประสงค์ / สภาพที่พึงประสงค์ (สอดคล้องกับพัฒนาการ 4 ด้าน)" : "จุดประสงค์ที่จะให้นักเรียนบรรลุในคาบนี้ (K P A)"}
            </p>
            <textarea
              required
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              rows={3}
              className="w-full p-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
              placeholder="1. อธิบาย...&#10;2. วิเคราะห์..."
            />
          </div>

          {isKindergarten ? (
            <>
              {/* Kindergarten 6 Activities */}
              <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 space-y-4">
                <label className="block text-sm font-bold text-pink-700 mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-pink-500" />
                  3. การจัดประสบการณ์ 6 กิจกรรมหลัก (Kindergarten Activities)
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">3.1 กิจกรรมเคลื่อนไหวและจังหวะ</label>
                    <textarea value={kgMovementActivity} onChange={e => setKgMovementActivity(e.target.value)} rows={3} className="w-full p-3 text-xs rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-500 bg-white" placeholder="การเคลื่อนไหวร่างกายประกอบจังหวะ..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">3.2 กิจกรรมเสริมประสบการณ์</label>
                    <textarea value={kgCircleActivity} onChange={e => setKgCircleActivity(e.target.value)} rows={3} className="w-full p-3 text-xs rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-500 bg-white" placeholder="การเรียนรู้เรื่องราวผ่านการสนทนา นิทาน สื่อ..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">3.3 กิจกรรมศิลปะสร้างสรรค์</label>
                    <textarea value={kgArtActivity} onChange={e => setKgArtActivity(e.target.value)} rows={3} className="w-full p-3 text-xs rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-500 bg-white" placeholder="การวาดภาพ ปั้น ฉีกปะ..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">3.4 กิจกรรมเล่นตามมุม</label>
                    <textarea value={kgFreePlayActivity} onChange={e => setKgFreePlayActivity(e.target.value)} rows={3} className="w-full p-3 text-xs rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-500 bg-white" placeholder="การเล่นมุมบล็อก มุมบทบาทสมมติ มุมหนังสือ..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">3.5 กิจกรรมกลางแจ้ง</label>
                    <textarea value={kgOutdoorActivity} onChange={e => setKgOutdoorActivity(e.target.value)} rows={3} className="w-full p-3 text-xs rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-500 bg-white" placeholder="การเล่นเครื่องเล่นสนาม เกมการละเล่น..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">3.6 เกมการศึกษา</label>
                    <textarea value={kgEducationalGame} onChange={e => setKgEducationalGame(e.target.value)} rows={3} className="w-full p-3 text-xs rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-500 bg-white" placeholder="เกมจับคู่ แยกประเภท เรียงลำดับ..." />
                  </div>
                </div>
              </div>

              {/* Kindergarten Materials */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4 text-emerald-500" />
                  4. สื่อการจัดประสบการณ์ (Materials)
                </label>
                <textarea
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  rows={2}
                  className="w-full p-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
                  placeholder="เช่น นิทาน, บล็อกไม้, สีเทียน..."
                />
              </div>

              {/* Kindergarten Evaluation Domains */}
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-3">
                <label className="block text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  5. การสังเกตและประเมินพัฒนาการ 4 ด้าน
                </label>
                <p className="text-[10px] text-emerald-600 mb-3">เลือกด้านพัฒนาการที่จะประเมินตามสภาพจริงในแผนนี้</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label className={`flex items-center gap-2 px-3 py-3 rounded-xl border sm:cursor-pointer transition-all duration-200 ${kgPhysicalDev ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    <input type="checkbox" checked={kgPhysicalDev} onChange={e => setKgPhysicalDev(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-4 h-4" />
                    <span className="text-xs font-semibold">ด้านร่างกาย</span>
                  </label>
                  <label className={`flex items-center gap-2 px-3 py-3 rounded-xl border sm:cursor-pointer transition-all duration-200 ${kgEmotionalDev ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    <input type="checkbox" checked={kgEmotionalDev} onChange={e => setKgEmotionalDev(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-4 h-4" />
                    <span className="text-xs font-semibold">ด้านอารมณ์/จิตใจ</span>
                  </label>
                  <label className={`flex items-center gap-2 px-3 py-3 rounded-xl border sm:cursor-pointer transition-all duration-200 ${kgSocialDev ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    <input type="checkbox" checked={kgSocialDev} onChange={e => setKgSocialDev(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-4 h-4" />
                    <span className="text-xs font-semibold">ด้านสังคม</span>
                  </label>
                  <label className={`flex items-center gap-2 px-3 py-3 rounded-xl border sm:cursor-pointer transition-all duration-200 ${kgCognitiveDev ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    <input type="checkbox" checked={kgCognitiveDev} onChange={e => setKgCognitiveDev(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-4 h-4" />
                    <span className="text-xs font-semibold">ด้านสติปัญญา</span>
                  </label>
                </div>
              </div>
            </>
          ) : (
            <>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              3. กิจกรรมการเรียนรู้ (Learning Activities){" "}
              <span className="text-red-500">*</span>
            </label>
            <p className="text-[10px] text-slate-400 mb-2">
              กระบวนการจัดการเรียนการสอน
            </p>
            <textarea
              required
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
              rows={5}
              className="w-full p-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
              placeholder="ขั้นตอนนำเข้าสู่บทเรียน / ขั้นสอน / ขั้นสรุป..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-emerald-500" />
              4. สื่อการเรียนรู้ / แหล่งเรียนรู้ (Materials)
            </label>
            <p className="text-[10px] text-slate-400 mb-2">
              อุปกรณ์หรือสื่อที่จะใช้ในคาบเรียน
            </p>
            <textarea
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              rows={2}
              className="w-full p-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
              placeholder="เช่น หนังสือเรียน, สไลด์ Powerpoint, ใบงาน..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-rose-500" />
              5. วัดและประเมินผล (Evaluation)
            </label>
            <p className="text-[10px] text-slate-400 mb-2">
              เกณฑ์และวิธีการประเมินความรู้และความเข้าใจ
            </p>
            <textarea
              value={evaluation}
              onChange={(e) => setEvaluation(e.target.value)}
              rows={3}
              className="w-full p-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
              placeholder="เช่น วิธีการวัด / เครื่องมือที่ใช้ / เกณฑ์การผ่าน..."
            />
          </div>
            </>
          )}
        </div>

        {/* ๖. แนบรูป/สื่อประกอบ */}
        <AttachmentManager 
          attachments={attachments}
          onAddAttachment={(att) => setAttachments(prev => [...prev, att])}
          onRemoveAttachment={removeAttachment}
        />

        <div className="flex justify-between items-center gap-3 pt-4 border-t border-slate-100 flex-wrap">
          <div>
            {(currentUserRole === "admin" ||
              currentUserRole === "academic" ||
              currentUserRole === "deputy") &&
              initialPlan && (
                <div className="flex items-center gap-3">
                  {initialPlan.status !== "approved" ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setSigningRole("deptHead");
                      }}
                      className="px-4 py-2 text-sm font-bold bg-emerald-50 text-slate-700 border border-slate-200 hover:bg-emerald-100 rounded-2xl flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" /> อนุมัติและเซ็นชื่อ
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (
                          confirm("ต้องการยกเลิกการอนุมัติแผนการสอนนี้หรือไม่?")
                        ) {
                          const updatedPlan = {
                            ...initialPlan,
                            status: "draft",
                            approverName: undefined,
                            approverSignature: undefined,
                            approverDate: undefined,
                            deptHeadApproved: undefined,
                            deptHeadName: undefined,
                            deptHeadSignature: undefined,
                            deptHeadDate: undefined,
                          };
                          onSave(updatedPlan as any);
                        }
                      }}
                      className="px-4 py-2 text-sm font-bold bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" /> ยกเลิกการอนุมัติแผน
                    </button>
                  )}

                  {initialPlan.status !== "approved" &&
                    initialPlan.status !== "rejected" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setRejectModalOpen(true);
                        }}
                        className="px-4 py-2 text-sm font-bold rounded-xl border bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" /> ตีกลับให้แก้
                      </button>
                    )}
                </div>
              )}
          </div>
          {/* Approval Section for Academic Head / Admin */}
          {(currentUserRole === "academic" || currentUserRole === "admin" || currentUserRole === "deputy") && initialPlan && (
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200">
              <h3 className="text-sm font-black text-slate-700 flex items-center gap-2 mb-4">
                <Check className="h-4 w-4" />
                การตรวจประเมินและอนุมัติ (สำหรับหัวหน้าวิชาการ)
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">สถานะการอนุมัติ</label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setStatus("draft")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${status === "draft" ? "bg-amber-100 text-amber-700 border-amber-300" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                    >
                      รอการพิจารณา (Draft)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("submitted")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${status === "submitted" ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                    >
                      ขอรับการประเมิน (Submitted)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("approved")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${status === "approved" ? "bg-slate-100 text-slate-700 border-emerald-300" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                    >
                      อนุมัติ / ผ่าน (Approved)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("rejected")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${status === "rejected" ? "bg-rose-100 text-rose-700 border-rose-300" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                    >
                      ส่งกลับแก้ไข (Rejected)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">ข้อเสนอแนะ / ความคิดเห็นเพิ่มเติม (ถ้ามี)</label>
                  <textarea
                    value={approverComment}
                    onChange={(e) => setApproverComment(e.target.value)}
                    placeholder="พิมพ์ความคิดเห็น หรือสิ่งที่ต้องแก้ไขเพิ่มเติม..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[100px] resize-y text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                ยกเลิก
              </button>
            )}
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-8 py-2.5 rounded-2xl hover:from-sky-600 hover:to-sky-700 transition-all font-bold shadow-md hover:shadow-lg"
            >
              <Save className="h-5 w-5" />
              {initialPlan ? "ปรับปรุงแผนการสอน" : "บันทึกแผนการสอน"}
            </button>
          </div>
        </div>
      </form>

      {signingRole && initialPlan && (
        <SignaturePadModal
          role={signingRole}
          defaultName=""
          onSave={(name, sig) => {
            const todayStr = new Date().toISOString().slice(0, 10);
            const updatedPlan = {
              ...initialPlan,
              status: "approved",
              approverName: name,
              approverSignature: sig,
              approverDate: todayStr,
              deptHeadApproved: true,
              deptHeadName: name,
              deptHeadSignature: sig,
              deptHeadDate: todayStr,
            };
            onSave(updatedPlan as any);
            setSigningRole(null);
          }}
          onClose={() => setSigningRole(null)}
        />
      )}
    </div>
  );
}