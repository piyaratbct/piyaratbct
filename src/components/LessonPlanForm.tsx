import React, { useState, useEffect } from "react";
import {
  LessonPlan,
  SUBJECTS,
  GRADE_LEVELS,
  SubjectType,
  Attachment,
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
} from "lucide-react";
import { SignaturePadModal } from "./PrintTemplate";

interface LessonPlanFormProps {
  initialPlan: LessonPlan | null;
  teacherId: string;
  onSave: (plan: LessonPlan) => void;
  onCancel?: () => void;
  currentUserRole?: string;
}

const SEMESTERS = [
  "ภาคเรียนที่ 1/2567",
  "ภาคเรียนที่ 2/2567",
  "ภาคเรียนที่ 1/2568",
  "ภาคเรียนที่ 2/2568",
];

export function LessonPlanForm({
  initialPlan,
  teacherId,
  onSave,
  onCancel,
  currentUserRole,
}: LessonPlanFormProps) {
  const [subject, setSubject] = useState<SubjectType>("ภาษาไทย");
  const [customSubject, setCustomSubject] = useState("");
  const [selectedGrades, setSelectedGrades] = useState<string[]>([
    GRADE_LEVELS[0],
  ]);
  const [semester, setSemester] = useState(SEMESTERS[0]);

  const [signingRole, setSigningRole] = useState<"deptHead" | null>(null);

  const getTodayString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - offset * 60 * 1000);
    return localToday.toISOString().split("T")[0];
  };

  const [date, setDate] = useState(getTodayString());
  const [title, setTitle] = useState("");
  const [objectives, setObjectives] = useState("");
  const [activities, setActivities] = useState("");
  const [materials, setMaterials] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;
    let url = newLinkUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    const newAttachment: Attachment = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: "link",
      name: newLinkName.trim() || "สื่อการสอน / แหล่งเรียนรู้",
      url,
    };
    setAttachments((prev) => [...prev, newAttachment]);
    setNewLinkName("");
    setNewLinkUrl("");
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  useEffect(() => {
    if (initialPlan) {
      setSubject(initialPlan.subject as SubjectType);
      setCustomSubject(initialPlan.customSubject || "");

      if (initialPlan.gradeLevel) {
        const levels = initialPlan.gradeLevel
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        setSelectedGrades(levels.length > 0 ? levels : [GRADE_LEVELS[0]]);
      }

      setSemester(initialPlan.semester || SEMESTERS[0]);
      setDate(initialPlan.date);
      setTitle(initialPlan.title);
      setObjectives(initialPlan.objectives);
      setActivities(initialPlan.activities);
      setMaterials(initialPlan.materials);
      setEvaluation(initialPlan.evaluation);
      setAttachments(initialPlan.attachments || []);
    } else {
      resetForm();
    }
  }, [initialPlan]);

  const resetForm = () => {
    setSubject("ภาษาไทย");
    setCustomSubject("");
    setSelectedGrades([GRADE_LEVELS[0]]);
    setDate(getTodayString());
    setTitle("");
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

    const plan: LessonPlan = {
      id: initialPlan ? initialPlan.id : Date.now().toString(),
      teacherId,
      subject,
      customSubject: subject === "อื่น ๆ" ? customSubject : undefined,
      gradeLevel: selectedGrades.join(", "),
      title,
      objectives,
      activities,
      materials,
      evaluation,
      date,
      semester,
      attachments,
      status: initialPlan ? initialPlan.status : "draft",
      createdAt: initialPlan ? initialPlan.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

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

        {/* 1. Basic Metadata Grid (subject, semester, date) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              วิชา (Subject)
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as SubjectType)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
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
              {SEMESTERS.map((s) => (
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
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        {subject === "อื่น ๆ" && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ระบุวิชา (Custom Subject) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="เช่น วิทยาการคำนวณ"
            />
          </div>
        )}

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
        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100/80 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Paperclip className="h-4 w-4 text-blue-600" />
              6. แนบสื่อการจัดการเรียนการสอน (ลิงก์เว็บ หรือคลาวด์ภายนอก)
            </label>
            <p className="text-[10px] text-slate-400 mt-0.5">
              แนบลิงก์แหล่งการเรียนรู้ แผนการสอนดิจิทัล หรือใบงาน PDF ที่นี่
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-indigo-50/40 to-sky-50/30 p-4 rounded-xl border border-sky-100/60 flex flex-col justify-between space-y-2">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded-md border border-blue-200">
                  💡 คำแนะนำในการเก็บไฟล์รูปภาพ/วิดีโอ/PDF
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                  เนื่องจากระบบใช้พลังงานประมวลผลบนคลาวด์ร่วมกัน
                  เพื่อประสิทธิภาพและความรวดเร็วในการจัดทำเอกสาร
                  <span className="text-slate-800 font-bold">
                    {" "}
                    แนะนำให้คุณครูบันทึกไฟล์แผนการสอนฉบับเต็ม PDF หรือสื่อการสอน
                    ไว้ทาง Google Drive ส่วนตัวหรือสถาบันของตนเอง
                  </span>
                  แล้วคัดลอก "ลิงก์แชร์ที่ทุกคนมีสิทธิ์อ่าน"
                  นำมาวางในช่องแชร์ลิงก์ทางด้านขวามือเพื่อความสะดวกรวดเร็วครับ/ค่ะ
                </p>
              </div>
              <div className="pt-2 border-t border-sky-100/80 flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400">
                  ตัวอย่าง: https://drive.google.com/drive/...
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-150 flex flex-col justify-center space-y-3">
              <span className="block text-[11px] font-bold text-slate-700">
                ใส่ลิงก์แหล่งข้อมูลเสริม
              </span>
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500">
                    1. ชื่อเรียกลิงก์ / คำอธิบายสื่อ
                  </span>
                  <input
                    type="text"
                    placeholder="เช่น สไลด์วิชา AI, แผนการสอนฉบับเต็ม PDF"
                    value={newLinkName}
                    onChange={(e) => setNewLinkName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white placeholder:text-slate-400 text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500">
                    2. ที่อยู่ลิงก์เว็บ (URL)
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      placeholder="https://drive.google.com/... หรือแชร์ลิงก์อื่นๆ"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-[11px] rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white placeholder:text-slate-400 text-slate-800 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddLink}
                      disabled={!newLinkUrl.trim()}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-bold rounded-lg transition text-[11px] flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>เพิ่มลิงก์</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="block text-[10px] font-semibold text-slate-500 mb-1.5">
                ไฟล์แนบทั้งหมด ({attachments.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attachments.map((att) => {
                  let Icon = Link2;
                  let colorClass = "text-blue-500 bg-blue-50";
                  if (att.type === "image") {
                    Icon = FileImage;
                    colorClass = "text-emerald-500 bg-emerald-50";
                  } else if (att.type === "video") {
                    Icon = VideoIcon;
                    colorClass = "text-purple-500 bg-purple-50";
                  } else if (att.type === "pdf") {
                    Icon = FileText;
                    colorClass = "text-rose-500 bg-rose-50";
                  }

                  return (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-white shadow-xs group"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${colorClass}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 pr-2">
                          <p className="text-[11px] font-bold text-slate-700 truncate">
                            {att.name}
                          </p>
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] text-blue-500 hover:underline truncate block"
                          >
                            {att.url}
                          </a>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 md:opacity-0 group-hover:opacity-100"
                        title="ลบสื่อนี้"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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
                          if (
                            confirm(
                              "ต้องการตีกลับให้แก้ไขแผนการสอนนี้ใช่หรือไม่?",
                            )
                          ) {
                            const updatedPlan = {
                              ...initialPlan,
                              status: "rejected",
                            };
                            onSave(updatedPlan as any);
                          }
                        }}
                        className="px-4 py-2 text-sm font-bold rounded-lg border bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" /> ตีกลับให้แก้
                      </button>
                    )}
                </div>
              )}
          </div>
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
