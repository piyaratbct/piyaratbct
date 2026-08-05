import React, { useState, useEffect } from "react";
import {
  LessonPlan,
  SUBJECTS,
  GRADE_LEVELS,
  SubjectType,
  Attachment,
  SEMESTERS,
} from "../types";
import {
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
} from "lucide-react";
import { SignaturePadModal } from "./PrintTemplate";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CurriculumSubject } from '../types';
import { AttachmentManager } from './AttachmentManager';
import { formatThaiDate } from '../lib/dateUtils';



export function LessonPlanForm({
  teacherId,
  onSave,
  initialPlan,
  onCancel,
  currentUserRole,
  currentUserName,
  systemAcademicYear,
  systemSemester,
}: {
  teacherId: string;
  onSave: (plan: Omit<LessonPlan, "id" | "createdAt" | "updatedAt">) => void;
  initialPlan?: LessonPlan | null;
  onCancel?: () => void;
  currentUserRole?: string;
  currentUserName?: string;
  systemAcademicYear: string;
  systemSemester: string;
}) {
  const [subject, setSubject] = useState<string>(initialPlan?.subject || SUBJECTS[0]);
  const [customSubject, setCustomSubject] = useState(initialPlan?.customSubject || "");
  const [selectedGrades, setSelectedGrades] = useState<string[]>(
    initialPlan?.gradeLevel 
      ? initialPlan.gradeLevel.split(',').map(s => s.trim()).filter(Boolean)
      : [GRADE_LEVELS[0]]
  );
  const defaultSemester = systemSemester === '1' || systemSemester === '2' ? `${systemSemester}/${systemAcademicYear}` : `1/${systemAcademicYear}`;
  const [semester, setSemester] = useState(initialPlan?.semester || defaultSemester);
  const [date, setDate] = useState(initialPlan?.date || new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState(initialPlan?.title || "");
  const [coreIndicators, setCoreIndicators] = useState(initialPlan?.coreIndicators || "");
  const [targetIndicators, setTargetIndicators] = useState(initialPlan?.targetIndicators || "");
  const [objectives, setObjectives] = useState(initialPlan?.objectives || "");
  const [competencies, setCompetencies] = useState(initialPlan?.competencies || "");
  
  // New states for curriculum integration
  const [curriculums, setCurriculums] = useState<any[]>([]);
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
        // Fetch curriculums for the selected subject
        const qCurriculums = query(collection(db, 'curriculums'), where('subjectName', '==', subject));
        const snapshotCurriculums = await getDocs(qCurriculums);
        const fetchedCurriculums = snapshotCurriculums.docs.map(doc => doc.data() as CurriculumSubject);
        
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
  }, [subject, selectedGrades, semester, teacherId, initialPlan]);

  useEffect(() => {
    if (initialPlan) {
      setSubject(initialPlan.subject === 'อื่นๆ' && initialPlan.customSubject ? initialPlan.customSubject : (initialPlan.subject as string));

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
    setSubject("ภาษาไทย");
    setSelectedGrades([GRADE_LEVELS[0]]);
    setSemester(defaultSemester);
    setDate(getTodayString());
    setTitle("");
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
    if (!title.trim() || !objectives.trim() || !activities.trim()) {
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
      subject,
      customSubject: undefined, // Handled implicitly via subject string
      gradeLevel: selectedGrades.join(", "),
      title,
      coreIndicators,
      targetIndicators,
      competencies,
      objectives,
      activities,
      materials,
      evaluation,
      date,
      semester,
      attachments,
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
            className="text-xs font-semibold px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            ยกเลิกแก้ไข
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{errorMsg}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              วิชา (Subject)
            </label>
            <input
              type="text"
              list="plan-subject-list"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="เลือกหรือพิมพ์รายวิชา..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
            <datalist id="plan-subject-list">
              {SUBJECTS.filter(s => s !== 'อื่นๆ' && s !== 'อื่น ๆ').map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ภาคเรียน (Semester)
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-sans"
            >
              {[
                `ภาคเรียนที่ 1/${systemAcademicYear}`,
                `ภาคเรียนที่ 2/${systemAcademicYear}`,
                `ภาคเรียนที่ 1/${parseInt(systemAcademicYear) - 1}`,
                `ภาคเรียนที่ 2/${parseInt(systemAcademicYear) - 1}`,
                `ภาคเรียนที่ 1/${parseInt(systemAcademicYear) - 2}`,
                `ภาคเรียนที่ 2/${parseInt(systemAcademicYear) - 2}`
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              สัปดาห์/วันที่สอน (Date)
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              title="วันที่สอน"
            />
          </div>
        </div>

        {/* 1.5 Multi-grade level selection grid */}
        <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-3 flex items-center justify-between">
            <span>
              ระดับชั้น (Grade Level) <span className="text-red-500">*</span>
            </span>
            <span className="text-[10.5px] text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100/50">
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
                    ? "bg-blue-50/80 border-blue-300 text-blue-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedGrades.includes(grade)}
                  onChange={() => handleGradeToggle(grade)}
                  className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 h-4 w-4"
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
              1. ชื่อหน่วยการเรียนรู้ / เรื่อง (Topic/Title){" "}
              <span className="text-red-500">*</span>
            </label>
            <p className="text-[10px] text-slate-400 mb-2">
              ระบุชื่อหน่วย หรือเรื่องที่จะใช้สอน
            </p>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder:text-slate-400"
              placeholder="ตัวอย่าง: สิ่งมีชีวิตและสิ่งแวดล้อม"
            />
          </div>

          
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
                    className="text-xs p-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[120px]"
                  >
                    <option value="all">ทุกระดับชั้น</option>
                    {curriculums.map(c => (
                      <option key={c.gradeLevel} value={c.gradeLevel}>{c.gradeLevel}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {curriculums.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-800">ไม่สามารถเลือกตัวชี้วัดได้</p>
                  <p className="text-[10px] text-amber-700 mt-0.5">
                    กรุณาไปที่ <strong>โมดูลวิชาการ &gt; จัดการหลักสูตร</strong> เพื่อเพิ่มข้อมูลหลักสูตรและตัวชี้วัดให้ครบถ้วนก่อน
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="max-h-80 overflow-y-auto custom-scrollbar p-3 space-y-4">
                  {curriculums
                    .filter(c => tableGradeFilter === 'all' || c.gradeLevel === tableGradeFilter)
                    .map((curr, cIdx) => (
                    <div key={cIdx}>
                      <div className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-2 py-1 rounded mb-2 border border-indigo-100 inline-block">
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
                                    className={`flex items-start gap-2 p-2.5 rounded-lg border sm:cursor-pointer transition-colors ${selected ? 'bg-indigo-50 border-indigo-300 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                  >
                                    <div className="mt-0.5">
                                      <input 
                                        type="checkbox"
                                        checked={selected}
                                        onChange={toggleCombinedIndicator}
                                        className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 h-4 w-4 transition-all"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-800">
                                        <span>{ind.code}</span>
                                        <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold ${ind.type === 'core' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
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
              <Target className="h-4 w-4 text-emerald-600" />
              ตัวชี้วัดต้องรู้ (ต้นทาง) ที่เลือกไว้
            </label>
            <p className="text-[10px] text-slate-400 mb-2">
              (สามารถแก้ไขข้อความด้านล่างเพิ่มเติมได้ หากจำเป็น)
            </p>
            <textarea
              value={coreIndicators}
              onChange={(e) => setCoreIndicators(e.target.value)}
              rows={2}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
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
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
              placeholder="คลิกเลือกจากรายการด้านบน หรือพิมพ์เพิ่ม..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-amber-500" />
              2. จุดประสงค์การเรียนรู้ (Objectives){" "}
              <span className="text-red-500">*</span>
            </label>
            <p className="text-[10px] text-slate-400 mb-2">
              จุดประสงค์ที่จะให้นักเรียนบรรลุในคาบนี้ (K P A)
            </p>
            <textarea
              required
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              rows={3}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
              placeholder="1. อธิบาย...&#10;2. วิเคราะห์..."
            />
          </div>

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
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
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
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
              placeholder="เช่น หนังสือเรียน, สไลด์ Powerpoint, ใบงาน..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-rose-500" />
              5. การวัดและประเมินผล (Evaluation)
            </label>
            <p className="text-[10px] text-slate-400 mb-2">
              เกณฑ์และวิธีการประเมินความรู้และความเข้าใจ
            </p>
            <textarea
              value={evaluation}
              onChange={(e) => setEvaluation(e.target.value)}
              rows={3}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
              placeholder="เช่น วิธีการวัด / เครื่องมือที่ใช้ / เกณฑ์การผ่าน..."
            />
          </div>
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
                      className="px-4 py-2 text-sm font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 rounded-lg flex items-center gap-2"
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
                      className="px-4 py-2 text-sm font-bold bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-lg flex items-center gap-2"
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
                        className="px-4 py-2 text-sm font-bold rounded-lg border bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" /> ตีกลับให้แก้
                      </button>
                    )}
                </div>
              )}
          </div>
          {/* Approval Section for Academic Head / Admin */}
          {(currentUserRole === "academic" || currentUserRole === "admin" || currentUserRole === "deputy") && initialPlan && (
            <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100">
              <h3 className="text-sm font-black text-indigo-700 flex items-center gap-2 mb-4">
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
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${status === "approved" ? "bg-emerald-100 text-emerald-700 border-emerald-300" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white min-h-[100px] resize-y text-sm"
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
              className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-8 py-2.5 rounded-xl hover:from-sky-600 hover:to-sky-700 transition-all font-semibold shadow-sm hover:shadow"
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
