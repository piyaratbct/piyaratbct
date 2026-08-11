import React, { useState, useEffect } from 'react';
import { LessonRecord, SUBJECTS, GRADE_LEVELS, SubjectType, Attachment, SEMESTERS, LessonPlan, PERIOD_OPTIONS } from "../types";

import { Save, BookOpen,  Target,  RefreshCw, ChevronDown, Sparkles, BookCheck, ClipboardList, AlertTriangle, MessageSquareCode, CalendarDays, Paperclip, Link2, FileImage, FileText, Video as VideoIcon, Plus, X, Globe, Eye } from 'lucide-react';
import { AttachmentManager } from './AttachmentManager';
import { Star } from 'lucide-react';
import { formatThaiDate } from '../lib/dateUtils';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

const EVALUATION_CRITERIA = {
  planning: [
    { id: 'p1', label: 'จัดทำแผนการสอนตามมาตรฐานการเรียนรู้ ตัวชี้วัด และหลักสูตรสถานศึกษา (ม.3.1)' },
    { id: 'p2', label: 'จุดประสงค์การเรียนรู้มีความชัดเจน สามารถวัดและประเมินผลได้จริง' },
    { id: 'p3', label: 'การจัดกิจกรรมการเรียนการสอน เป็นไปตามแผนการสอน (ม.3.1)' },
    { id: 'p4', label: 'รูปแบบการจัดกิจกรรมการเรียนการสอนส่งเสริมการลงมือปฏิบัติจริง และกระตุ้นให้ผู้เรียนเกิดการคิดวิเคราะห์' },
    { id: 'p5', label: 'เครื่องมือวัดและประเมินผลสอดคล้องกับจุดประสงค์การเรียนรู้' },
  ],
  time: [
    { id: 'tm1', label: 'ระยะเวลาในการจัดกิจกรรมการเรียนการสอนเพียงพอเหมาะสมกับเนื้อหา' },
    { id: 'tm2', label: 'ใช้เวลาช่วงต้นคาบในการทบทวนความรู้เดิมหรือแจ้งจุดประสงค์การเรียนรู้ได้อย่างกระชับ (ไม่เกิน 5-10 นาที)' },
    { id: 'tm3', label: 'สามารถปรับลด/เพิ่มกิจกรรม หรือเนื้อหาให้สอดคล้องกับเวลาจริงที่เหลืออยู่' },
    { id: 'tm4', label: 'จัดการปัญหาความล่าช้าในชั้นเรียนได้อย่างเป็นระบบโดยไม่กระทบเป้าหมายหลัก' },
    { id: 'tm5', label: 'จัดเตรียมสื่อ อุปกรณ์ และเอกสารการสอนไว้ล่วงหน้า ทำให้ไม่เสียเวลาในการเริ่มคาบ' },
  ],
  media: [
    { id: 'm1', label: 'สื่อการเรียนรู้มีเนื้อหาถูกต้อง ปลอดภัย และเหมาะสมกับวัยของผู้เรียน' },
    { id: 'm2', label: 'สื่อการเรียนรู้มีสีสัน ขนาด รูปแบบ หรือเทคโนโลยีที่กระตุ้นความสนใจได้ดี' },
    { id: 'm3', label: 'สื่อการเรียนรู้เป็นตัวช่วยให้ผู้เรียนเข้าใจเนื้อหาที่ยากหรือเป็นนามธรรมได้ง่ายขึ้น' },
    { id: 'm4', label: 'การจัดวางและการใช้สื่อการเรียนรู้มีความคล่องตัว ไม่ติดขัดระหว่างสอน' },
    { id: 'm5', label: 'ผู้เรียนสามารถมองเห็น เข้าถึง หรือมีโอกาสใช้งานสื่อการเรียนรู้ได้ทั่วถึง' },
  ],
  teacher: [
    { id: 'th1', label: 'ใช้เทคนิคการสอนที่หลากหลายและเหมาะสมกับเนื้อหา' },
    { id: 'th2', label: 'กระตุ้นความสนใจของเด็กได้น่าสนใจและเชื่อมโยงเข้าสู่เนื้อหาได้ดี' },
    { id: 'th3', label: 'วัดและประเมินผลผู้เรียนอย่างเป็นระบบด้วยวิธีที่หลากหลาย และตรงตามสภาพจริง (ม.3.4)' },
    { id: 'th4', label: 'นำผลการประเมินไปใช้ในการซ่อมเสริมและพัฒนาผู้เรียนได้อย่างเป็นรูปธรรม (ม.3.5)' },
    { id: 'th5', label: 'มีการจัดบรรยากาศที่ส่งเสริมการเรียนรู้ และดูแลช่วยเหลือนักเรียนอย่างทั่วถึง (ม.3.2/3.3)' },
  ],
  learner: [
    { id: 'l1', label: 'ผู้เรียนมีความกระตือรือร้นและมีส่วนร่วมในกิจกรรม (Active Learning)' },
    { id: 'l2', label: 'ผู้เรียนเข้าใจเนื้อหาและสามารถตอบคำถามหรือทำใบงานได้ตามเป้าหมาย' },
    { id: 'l3', label: 'ผู้เรียนมีการทำงานร่วมกัน แลกเปลี่ยนความคิดเห็น และช่วยเหลือก่อนหลัง (ม.3.1)' },
    { id: 'l4', label: 'ผู้เรียนปฏิบัติตามข้อตกลงในชั้นเรียนและมีความสุขในการเรียน' },
    { id: 'l5', label: 'ผู้เรียนสามารถสะท้อนความรู้หรือสร้างสรรค์ชิ้นงานจากสิ่งที่เรียนได้ (ม.3.1)' },
  ]
};

const DEFAULT_EVALUATIONS = {
  planning: { p1: 5, p2: 5, p3: 5, p4: 5, p5: 5 },
  time: { tm1: 5, tm2: 5, tm3: 5, tm4: 5, tm5: 5 },
  media: { m1: 5, m2: 5, m3: 5, m4: 5, m5: 5 },
  teacher: { th1: 5, th2: 5, th3: 5, th4: 5, th5: 5 },
  learner: { l1: 5, l2: 5, l3: 5, l4: 5, l5: 5 },
};


interface PBLLessonLogFormProps {
  initialRecord: LessonRecord | null;
  teacherId: string;
  onSave: (record: LessonRecord) => void;
  onCancel?: () => void;
  currentUserRole?: string;
  currentUserName?: string;
  systemAcademicYear?: string;
  systemSemester?: string;
}

export function PBLLessonLogForm({ initialRecord, teacherId, onSave, onCancel, systemAcademicYear = '2567', systemSemester = '1' }: PBLLessonLogFormProps) {
  const subject = "บูรณาการ (PBL)";

  const [selectedGrades, setSelectedGrades] = useState<string[]>([GRADE_LEVELS[0]]);
  const defaultSemester = `ภาคเรียนที่ ${systemSemester}/${systemAcademicYear}`;
  const [semester, setSemester] = useState(defaultSemester);
  
  // Default date to today's local date (YYYY-MM-DD)
  const getTodayString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    return localToday.toISOString().split('T')[0];
  };

    const [date, setDate] = useState(initialRecord?.date || "");
  const [pblDrivingQuestion, setPblDrivingQuestion] = useState(initialRecord?.pblDrivingQuestion || "");
  const [pblInvestigationSteps, setPblInvestigationSteps] = useState(initialRecord?.pblInvestigationSteps || "");
  const [pblPresentation, setPblPresentation] = useState(initialRecord?.pblPresentation || "");
  const [integratedSubjects, setIntegratedSubjects] = useState(initialRecord?.integratedSubjects || "");
  const [content, setContent] = useState('');
  
  // Added for Lesson Plan Import
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<LessonPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [lessonPlanId, setLessonPlanId] = useState<string | undefined>(initialRecord?.lessonPlanId);
  const [showSubjectsDropdown, setShowSubjectsDropdown] = useState(false);

  const fetchPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const q = query(
        collection(db, 'lessonPlans'),
        where('teacherId', '==', teacherId)
      );
      const snapshot = await getDocs(q);
      const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LessonPlan));
      
      // Sort by date descending
      plans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setAvailablePlans(plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleOpenPlanModal = () => {
    setShowPlanModal(true);
    fetchPlans();
  };

  const handleImportPlan = (plan: LessonPlan) => {
    setSelectedGrades([plan.gradeLevel]);
    if (plan.semester) setSemester(plan.semester);
    // Merge plan info into content
    const planContent = `${plan.title}\n${plan.objectives ? 'จุดประสงค์:\n' + plan.objectives : ''}`;
    setContent(planContent.trim());
    setActivities(plan.activities || '');
    setIntegratedSubjects(plan.integratedSubjects || "");
    setPblDrivingQuestion(plan.pblDrivingQuestion || "");
    setPblInvestigationSteps(plan.pblInvestigationSteps || "");
    setPblPresentation(plan.pblPresentation || "");
    setLessonPlanId(plan.id);
    setShowPlanModal(false);
    
    // Toast notification
    window.dispatchEvent(new CustomEvent('app-custom-toast', {
      detail: {
        message: 'นำข้อมูลจากแผนการสอนมาเติมในฟอร์มเรียบร้อยแล้ว',
        type: 'success',
        title: 'นำเข้าสำเร็จ'
      }
    }));
  };
  const [activities, setActivities] = useState('');
  const [limitations, setLimitations] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [strengths, setStrengths] = useState('');
  const [evaluations, setEvaluations] = useState<{ planning: Record<string, number>; time: Record<string, number>; media: Record<string, number>; teacher: Record<string, number>; learner: Record<string, number>; }>(DEFAULT_EVALUATIONS);

  // Attachment states
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  // Load initial record for editing
  useEffect(() => {
    if (initialRecord) {
      
      if (initialRecord.gradeLevel) {
        const levels = initialRecord.gradeLevel.split(',').map(s => s.trim()).filter(Boolean);
        setSelectedGrades(levels.length > 0 ? levels : [GRADE_LEVELS[0]]);
      } else {
        setSelectedGrades([GRADE_LEVELS[0]]);
      }
      
      setSemester(initialRecord.semester || defaultSemester);
      setDate(initialRecord.date);
      setIntegratedSubjects(initialRecord.integratedSubjects || "");
      setContent(initialRecord.content);
      setActivities(initialRecord.activities);
      setLimitations(initialRecord.limitations);
      setSuggestions(initialRecord.suggestions);
      setStrengths(initialRecord.strengths || '');
      setAttachments(initialRecord.attachments || []);
      if (initialRecord.evaluations) {
        setEvaluations({
          planning: initialRecord.evaluations.planning || DEFAULT_EVALUATIONS.planning,
          time: initialRecord.evaluations.time || DEFAULT_EVALUATIONS.time,
          media: initialRecord.evaluations.media || DEFAULT_EVALUATIONS.media,
          teacher: initialRecord.evaluations.teacher || DEFAULT_EVALUATIONS.teacher,
          learner: initialRecord.evaluations.learner || DEFAULT_EVALUATIONS.learner,
        });
      } else {
        setEvaluations(DEFAULT_EVALUATIONS);
      }
    } else {
      resetForm();
    }
  }, [initialRecord, defaultSemester]);

  const resetForm = () => {
    setSelectedGrades([GRADE_LEVELS[0]]);
    setSemester(defaultSemester);
    setDate("");
    setPblDrivingQuestion("");
    setPblInvestigationSteps("");
    setPblPresentation("");
    setIntegratedSubjects("");
    setContent('');
    setActivities('');
    setLimitations('');
    setSuggestions('');
    setStrengths('');
    setEvaluations(DEFAULT_EVALUATIONS);
    setAttachments([]);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!subject.trim()) {
      setErrorMsg('กรุณาระบุกลุ่มสาระ/วิชาที่สอน');
      return;
    }

    if (selectedGrades.length === 0) {
      setErrorMsg('กรุณาเลือก ระดับชั้น อย่างน้อย 1 ระดับชั้น');
      return;
    }

    if (!content.trim() || !activities.trim() || !limitations.trim() || !suggestions.trim() || !strengths.trim() || (!pblDrivingQuestion.trim() || !pblInvestigationSteps.trim() || !pblPresentation.trim())) {
      setErrorMsg('กรุณากรอกข้อมูลให้ครบถ้วนทุกหัวข้อ');
      return;
    }

    const payload: LessonRecord = {
      ...(initialRecord || {}),
      id: initialRecord?.id || `rec-${Date.now()}`,
      teacherId,
      subject: "บูรณาการ (PBL)",
      customSubject: '', // We now save the actual subject directly into the `subject` field
      gradeLevel: selectedGrades.join(', '),
      academicYear: systemAcademicYear,
      semester,
      date,
      isIntegrated: true,
      integratedSubjects,
      isPBL: true,
      pblDrivingQuestion,
      pblInvestigationSteps,
      pblPresentation,
      lessonPlanId,
      content: content.trim(),
      activities: activities.trim(),
      limitations: limitations.trim(),
      suggestions: suggestions.trim(),
      strengths: strengths.trim(),
      evaluations,
      attachments,
      createdAt: initialRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(payload);
    if (!initialRecord) {
      resetForm();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-sky-400 via-sky-500 to-pink-400 px-6 py-4 flex justify-between items-center text-white shadow-xs">
        <div>
          <h3 className="font-extrabold text-base flex items-center gap-2">
            <BookCheck className="h-5 w-5 animate-pulse text-white" />
            {initialRecord ? 'แก้ไขบันทึกหลังสอน' : 'เขียนบันทึกหลังสอน'}
          </h3>
          <p className="text-[11px] text-white/95 mt-0.5">กรอกข้อมูลจากการสอนจริงรายคาบ</p>
        </div>
        {initialRecord && onCancel && (
          <button 
            onClick={onCancel}
            className="text-xs font-semibold px-3 py-1 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-colors"
          >
            ยกเลิกแก้ไข
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleOpenPlanModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors"
          >
            <BookCheck className="w-4 h-4" />
            นำเข้าจากแผนการสอน
          </button>
        </div>
        {errorMsg && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg text-xs text-rose-700">
            <span className="font-bold">ตรวจสอบข้อมูล:</span> {errorMsg}
          </div>
        )}

        {/* 1. Basic Metadata Grid (subject, semester, date) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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

          <div className="col-span-1 md:col-span-full p-4 rounded-xl border border-slate-200">
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
        </div>

        <div className="col-span-1 md:col-span-full bg-white p-6 rounded-2xl border-2 border-emerald-500/20 shadow-sm mt-4">
            <div className="flex items-center gap-3 mb-4 border-b border-slate-200/50 pb-3">
              <div className="h-10 w-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-slate-700">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">บันทึกผลตามกระบวนการ Problem-Based Learning</h4>
                <p className="text-xs text-slate-500">ทบทวนปัญหาและกระบวนการสืบเสาะของนักเรียน</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ปัญหาหลักที่ใช้ (Driving Question) <span className="text-red-500">*</span></label>
                <textarea 
                  value={pblDrivingQuestion} 
                  onChange={(e) => setPblDrivingQuestion(e.target.value)} 
                  placeholder="บันทึกคำถามหลักที่ใช้กระตุ้นการเรียนรู้ในครั้งนี้..." 
                  className="w-full px-4 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[80px]" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">กระบวนการสืบเสาะที่เกิดขึ้นจริง (Investigation Steps) <span className="text-red-500">*</span></label>
                  <textarea 
                    value={pblInvestigationSteps} 
                    onChange={(e) => setPblInvestigationSteps(e.target.value)} 
                    placeholder="บันทึกกระบวนการที่นักเรียนได้ลงมือปฏิบัติจริง ปัญหาที่พบระหว่างทาง..." 
                    className="w-full px-4 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[100px]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ผลลัพธ์และการนำเสนอ (Presentation) <span className="text-red-500">*</span></label>
                  <textarea 
                    value={pblPresentation} 
                    onChange={(e) => setPblPresentation(e.target.value)} 
                    placeholder="บันทึกผลลัพธ์ของนักเรียนและการนำเสนอชิ้นงาน/วิธีการแก้ปัญหา..." 
                    className="w-full px-4 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[100px]" 
                  />
                </div>
              </div>
            </div>
          </div>

        {/* 1.5 Multi-grade level selection grid */}
        <div className="bg-transparent p-4 rounded-xl border border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
            <span>ระดับชั้นที่เข้าสอน (เลือกได้มากกว่า 1 ระดับชั้น)</span>
            <span className="text-[10.5px] text-slate-600 font-bold bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200">
              {selectedGrades.length === 0 ? 'ยังไม่ได้เลือก' : `เลือกแล้ว ${selectedGrades.length} ระดับชั้น`}
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {GRADE_LEVELS.map((lvl) => {
              const isSelected = selectedGrades.includes(lvl);
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setSelectedGrades(prev => prev.filter(g => g !== lvl));
                    } else {
                      setSelectedGrades(prev => [...prev, lvl]);
                    }
                  }}
                  className={`px-4 py-2.5 text-xs sm:text-[13px] font-bold rounded-xl border text-left transition duration-150 flex items-center justify-between gap-2.5 cursor-pointer select-none h-full shadow-2xs ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/80'
                  }`}
                >
                  <span className="whitespace-normal leading-tight flex-1">{lvl}</span>
                  <span className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] shrink-0 font-bold ${
                    isSelected ? 'border-white bg-white text-slate-600' : 'border-slate-300'
                  }`}>
                    {isSelected ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-100 my-2"></div>

        {/* 2. Structured Text fields */}
        
        {/* สาระการจัดการเรียนรู้ */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4 text-blue-500" />
            1. เนื้อหา/สาระ
          </label>
          <p className="text-[10px] text-slate-400 mb-1">ระบุเนื้อหาหลักหรือแนวการสอนในคาบนี้</p>
          <textarea
            rows={3}
            placeholder="ระบุรายละเอียดสาระสำคัญหรือขอบเขตเนื้อหาเกณฑ์การสอน..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed placeholder:text-slate-400"
          ></textarea>
        </div>

        {/* กิจกรรมการเรียนการสอน */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            2. กิจกรรมการเรียนการสอน
          </label>
          <p className="text-[10px] text-slate-400 mb-1">เขียนกิจกรรมที่ทำในห้อง เช่น วิธีการสอน เกม หรือกิจกรรมกลุ่ม</p>
          <textarea
            rows={4}
            placeholder="ระบุกระบวนการและขั้นตอนกิจกรรมการเรียนการสอน..."
            value={activities}
            onChange={(e) => setActivities(e.target.value)}
            className="w-full p-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line"
          ></textarea>
        </div>



        {/* ข้อจำกัดในการจัดการเรียนการสอน */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            3. ข้อจำกัดและอุปสรรคที่พบ
          </label>
          <p className="text-[10px] text-slate-400 mb-1">ระบุสิ่งที่ติดขัด เช่น อุปกรณ์ไม่พอ ปัญหาเรื่องเสียง หรือเด็กไม่เข้าใจ</p>
          <textarea
            rows={3}
            placeholder="ระบุข้อจำกัดหรือปัญหาอุปสรรคที่พบระหว่างการเรียนการสอน..."
            value={limitations}
            onChange={(e) => setLimitations(e.target.value)}
            className="w-full p-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 leading-relaxed placeholder:text-slate-400"
          ></textarea>
        </div>

        {/* ข้อเสนอแนะ/ความคิดเห็นของผู้สอน */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <MessageSquareCode className="h-4 w-4 text-emerald-500" />
            4. ข้อเสนอแนะและแนวทางการพัฒนา
          </label>
          <p className="text-[10px] text-slate-400 mb-1">ระบุแนวทางการพัฒนาหรือการปรับใช้เพื่อแก้ไขในคาบถัดไป</p>
          <textarea
            rows={3}
            placeholder="ระบุข้อเสนอแนะหรือแนวทางการพัฒนาปรับปรุงเพิ่มเติม..."
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            className="w-full p-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed placeholder:text-slate-400"
          ></textarea>
        </div>

        {/* จุดเด่นในการสอนครั้งนี้ */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Star className="h-4 w-4 text-amber-500" />
            5. จุดเด่นในการสอนครั้งนี้
          </label>
          <p className="text-[10px] text-slate-400 mb-1">ระบุจุดเด่นหรือความสำเร็จที่เกิดขึ้นในการสอนคาบนี้</p>
          <textarea
            rows={3}
            placeholder="ระบุจุดเด่นในการสอนครั้งนี้..."
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            className="w-full p-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 leading-relaxed placeholder:text-slate-400"
          ></textarea>
        </div>

        {/* แบบประเมินการจัดการเรียนรู้ */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            6. แบบประเมินการจัดการเรียนรู้
          </label>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-800">เกณฑ์การประเมิน</span>
              <div className="flex gap-3 text-[10px] font-bold text-slate-800">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div>5 = ดีเยี่ยม</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div>4 = ดีมาก</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>3 = ดี</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div>2 = พอใช้</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div>1 = ปรับปรุง</span>
              </div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {/* ด้านการวางแผนการสอน */}
              <div className="p-4 bg-slate-50/30">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-violet-500 rounded-full"></div>
                  ด้านการวางแผนการสอน
                </h4>
                <div className="space-y-3">
                  {EVALUATION_CRITERIA.planning.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                      <span className="text-[11px] text-slate-700 flex-1 flex gap-2">
                        <span className="text-slate-400 font-medium">{index + 1}.</span> 
                        {item.label}
                      </span>
                      <div className="flex gap-1.5 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            type="button"
                            key={score}
                            onClick={() => setEvaluations(prev => ({ ...prev, planning: { ...prev.planning, [item.id]: score } }))}
                            className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                              evaluations.planning[item.id] === score
                                ? 'bg-violet-500 text-white shadow-md shadow-violet-200 scale-110'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* ด้านบริหารเวลาการจัดการเรียนการเรียนรู้ */}
              <div className="p-4 bg-slate-50/30">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-orange-500 rounded-full"></div>
                  ด้านบริหารเวลาการจัดการเรียนการเรียนรู้
                </h4>
                <div className="space-y-3">
                  {EVALUATION_CRITERIA.time.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                      <span className="text-[11px] text-slate-700 flex-1 flex gap-2">
                        <span className="text-slate-400 font-medium">{index + 1}.</span> 
                        {item.label}
                      </span>
                      <div className="flex gap-1.5 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            type="button"
                            key={score}
                            onClick={() => setEvaluations(prev => ({ ...prev, time: { ...prev.time, [item.id]: score } }))}
                            className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                              evaluations.time[item.id] === score
                                ? 'bg-orange-500 text-white shadow-md shadow-orange-200 scale-110'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* ด้านสื่อและแหล่งเรียนรู้ */}
              <div className="p-4 bg-slate-50/30">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                  ด้านสื่อและแหล่งเรียนรู้ (ม.3.2)
                </h4>
                <div className="space-y-3">
                  {EVALUATION_CRITERIA.media.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                      <span className="text-[11px] text-slate-700 flex-1 flex gap-2">
                        <span className="text-slate-400 font-medium">{index + 1}.</span> 
                        {item.label}
                      </span>
                      <div className="flex gap-1.5 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            type="button"
                            key={score}
                            onClick={() => setEvaluations(prev => ({ ...prev, media: { ...prev.media, [item.id]: score } }))}
                            className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                              evaluations.media[item.id] === score
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 scale-110'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-slate-700 hover:bg-emerald-50'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* ด้านผู้สอน */}
              <div className="p-4 bg-slate-50/30">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-pink-500 rounded-full"></div>
                  ด้านผู้สอน
                </h4>
                <div className="space-y-3">
                  {EVALUATION_CRITERIA.teacher.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                      <span className="text-[11px] text-slate-700 flex-1 flex gap-2">
                        <span className="text-slate-400 font-medium">{index + 1}.</span> 
                        {item.label}
                      </span>
                      <div className="flex gap-1.5 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            type="button"
                            key={score}
                            onClick={() => setEvaluations(prev => ({ ...prev, teacher: { ...prev.teacher, [item.id]: score } }))}
                            className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                              evaluations.teacher[item.id] === score
                                ? 'bg-pink-500 text-white shadow-md shadow-pink-200 scale-110'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* ด้านผู้เรียน */}
              <div className="p-4 bg-slate-50/30">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-sky-500 rounded-full"></div>
                  ด้านผู้เรียน
                </h4>
                <div className="space-y-3">
                  {EVALUATION_CRITERIA.learner.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                      <span className="text-[11px] text-slate-700 flex-1 flex gap-2">
                        <span className="text-slate-400 font-medium">{index + 1}.</span> 
                        {item.label}
                      </span>
                      <div className="flex gap-1.5 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            type="button"
                            key={score}
                            onClick={() => setEvaluations(prev => ({ ...prev, learner: { ...prev.learner, [item.id]: score } }))}
                            className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                              evaluations.learner[item.id] === score
                                ? 'bg-sky-500 text-white shadow-md shadow-sky-200 scale-110'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* 7. แนบไฟล์และลิงก์เว็บไซต์ประกอบ */}
        <AttachmentManager 
          attachments={attachments}
          onAddAttachment={(att) => setAttachments(prev => [...prev, att])}
          onRemoveAttachment={removeAttachment}
        />

        {/* Submission Panel */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-pink-50 hover:text-pink-600 border border-slate-200/80 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {initialRecord ? 'คืนค่า' : 'ล้างฟอร์ม'}
          </button>
          
          <button
            type="submit"
            className="px-6 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            {initialRecord ? 'บันทึกข้อมูลแก้ไข' : 'บันทึกข้อมูลเข้าระบบ'}
          </button>
        </div>
      </form>

      {/* Plan Import Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="p-5 flex justify-between items-center border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-800">เลือกแผนการสอน</h3>
                <p className="text-xs text-slate-500 font-medium">นำเข้าข้อมูลแผนการสอนมาใช้ในบันทึกหลังสอน</p>
              </div>
              <button 
                onClick={() => setShowPlanModal(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto bg-slate-50">
              {isLoadingPlans ? (
                <div className="text-center py-10">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-500">กำลังโหลดข้อมูลแผนการสอน...</p>
                </div>
              ) : availablePlans.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <BookCheck className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-500">ไม่พบข้อมูลแผนการสอน</p>
                  <p className="text-xs text-slate-400 mt-1">คุณสามารถสร้างแผนการสอนได้ที่เมนู "การจัดการผู้สอน"</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {availablePlans.map(plan => (
                    <div 
                      key={plan.id}
                      className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all flex items-start gap-4"
                      onClick={() => handleImportPlan(plan)}
                    >
                      <div className="w-10 h-10 bg-slate-100 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-slate-800 truncate text-sm">{plan.title || 'ไม่มีชื่อแผน'}</h4>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold shrink-0 ml-2">
                            {plan.date ? formatThaiDate(plan.date) : ''}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 bg-slate-50 text-blue-700 px-1.5 py-0.5 rounded-md">
                            <BookCheck className="w-3 h-3" />
                            {plan.subject}
                          </span>
                          <span className="flex items-center gap-1 bg-emerald-50 text-slate-700 px-1.5 py-0.5 rounded-md">
                            <Globe className="w-3 h-3" />
                            {plan.gradeLevel}
                          </span>
                        </div>
                        {plan.objectives && (
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                            <span className="font-semibold text-slate-600">จุดประสงค์:</span> {plan.objectives}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
