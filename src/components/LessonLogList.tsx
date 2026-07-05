import React, { useState } from "react";
import { LessonRecord, SUBJECTS, GRADE_LEVELS, Teacher } from "../types";
import {
  Search,
  Filter,
  Trash2,
  Edit,
  Printer,
  FileText,
  ChevronRight,
  MessageSquareDashed,
  Paperclip,
  Link2,
  FileImage,
  Video as VideoIcon,
  Download,
  ExternalLink,
  User,
  History,
  Clock,
  Lock,
} from "lucide-react";

interface LessonLogListProps {
  records: LessonRecord[];
  teachers?: Teacher[];
  showTeacherFilter?: boolean;
  currentUserRole?: string;
  currentTeacherId?: string;
  onEdit: (record: LessonRecord) => void;
  onDelete: (id: string) => void;
  onPrintPreview: (record: LessonRecord) => void;
}

export function LessonLogList({
  records,
  teachers,
  showTeacherFilter = false,
  currentUserRole,
  currentTeacherId,
  onEdit,
  onDelete,
  onPrintPreview,
}: LessonLogListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("ทั้งหมด");
  const [selectedGrade, setSelectedGrade] = useState<string>("ทั้งหมด");
  const [selectedMonth, setSelectedMonth] = useState<string>("ทั้งหมด");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("ทั้งหมด");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("ทั้งหมด");
  const [selectedApproval, setSelectedApproval] = useState<string>("ทั้งหมด");
  const [expandedHistory, setExpandedHistory] = useState<
    Record<string, boolean>
  >({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleHistory = (recordId: string) => {
    setExpandedHistory((prev) => ({
      ...prev,
      [recordId]: !prev[recordId],
    }));
  };

  // Filter records based on criteria
  const filteredRecords = records.filter((record) => {
    // 1. Text Search matches keywords in content, activities, or tags
    const contentMatch = record.content
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const activityMatch = record.activities
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const subjectMatchText =
      record.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.customSubject &&
        record.customSubject.toLowerCase().includes(searchTerm.toLowerCase()));

    const textMatch = searchMatches(record, searchTerm);

    // 2. Subject filter
    const subjMatch =
      selectedSubject === "ทั้งหมด" || record.subject === selectedSubject;

    // 3. Grade filter
    const gradeMatch =
      selectedGrade === "ทั้งหมด" || record.gradeLevel.includes(selectedGrade);

    // Month filter
    const recordMonth = record.date ? record.date.substring(0, 7) : "";
    const monthMatch =
      selectedMonth === "ทั้งหมด" || recordMonth === selectedMonth;
      
    // Academic Year filter
    const yearMatch =
      selectedAcademicYear === "ทั้งหมด" || record.academicYear === selectedAcademicYear;

    // 4. Teacher filter
    const teacherMatch =
      !showTeacherFilter ||
      selectedTeacherId === "ทั้งหมด" ||
      record.teacherId === selectedTeacherId;

    // 5. Approval filter
    let approvalMatch = true;
    if (selectedApproval === "อนุมัติแล้ว") {
      approvalMatch = !!record.deptHeadApproved;
    } else if (selectedApproval === "รอการอนุมัติ") {
      approvalMatch = !!record.teacherSigned && !record.deptHeadApproved;
    } else if (selectedApproval === "ยังไม่อนุมัติ") {
      approvalMatch = !record.deptHeadApproved;
    }

    return (
      textMatch && subjMatch && gradeMatch && monthMatch && yearMatch && teacherMatch && approvalMatch
    );
  });

  function searchMatches(rec: LessonRecord, query: string) {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      rec.content.toLowerCase().includes(q) ||
      rec.activities.toLowerCase().includes(q) ||
      rec.limitations.toLowerCase().includes(q) ||
      rec.suggestions.toLowerCase().includes(q) ||
      rec.subject.toLowerCase().includes(q) ||
      (rec.customSubject && rec.customSubject.toLowerCase().includes(q)) ||
      rec.gradeLevel.toLowerCase().includes(q)
    );
  }

  // Format date readable
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

  const thaiFormatDateTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const dateObj = new Date(isoString);
      const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };
      return dateObj.toLocaleDateString("th-TH", options) + " น.";
    } catch {
      return isoString || "";
    }
  };

  const getSubjectColor = (subj: string) => {
    switch (subj) {
      case "ภาษาไทย":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "คณิตศาสตร์":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "วิทยาศาสตร์และเทคโนโลยี":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "สังคมศึกษา ศาสนา และวัฒนธรรม":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "สุขศึกษาและพลศึกษา":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "ศิลปะ":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "การงานอาชีพ":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "ภาษาต่างประเทศ (ภาษาอังกฤษ)":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-3">
          {/* Main search Input */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อวิชา, ระดับชั้น, กิจกรรม, ข้อเสนอแนะ..."
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
              <option value="ทั้งหมด">วิชา: ทั้งหมด</option>
              {SUBJECTS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
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
              {GRADE_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-1.5 min-w-[180px]">
            <input
              type="month"
              value={selectedMonth !== "ทั้งหมด" ? selectedMonth : ""}
              onChange={(e) => setSelectedMonth(e.target.value || "ทั้งหมด")}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
              title="เดือนที่สอน"
            />
            {selectedMonth !== "ทั้งหมด" && (
              <button 
                onClick={() => setSelectedMonth("ทั้งหมด")}
                className="text-slate-400 hover:text-slate-600 text-xs"
                title="ล้างตัวกรองเดือน"
              >
                ✕
              </button>
            )}
          </div>

          {/* Academic Year Filter */}
          <div className="flex items-center gap-1.5 min-w-[180px]">
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
            >
              <option value="ทั้งหมด">ปีการศึกษา: ทั้งหมด</option>
              <option value="2567">2567</option>
              <option value="2568">2568</option>
              <option value="2569">2569</option>
            </select>
          </div>

          {/* Approval Filter */}
          <div className="flex items-center gap-1.5 min-w-[200px]">
            <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedApproval}
              onChange={(e) => setSelectedApproval(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white font-bold text-slate-700"
            >
              <option value="ทั้งหมด">สถานะอนุมัติ: ทั้งหมด</option>
              <option value="อนุมัติแล้ว">อนุมัติแล้ว 🟢</option>
              <option value="รอการอนุมัติ">
                รอการอนุมัติ 🟡 (ครูลงนามแล้ว)
              </option>
              <option value="ยังไม่อนุมัติ">ยังไม่ได้อนุมัติ ⚪</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats of filtered list */}
      <div className="flex justify-between items-center text-xs text-slate-500 font-medium px-1">
        <span>เจอทั้งหมด {filteredRecords.length} รายการ</span>
        {(searchTerm ||
          selectedSubject !== "ทั้งหมด" ||
          selectedGrade !== "ทั้งหมด" ||
          selectedTeacherId !== "ทั้งหมด" ||
          selectedApproval !== "ทั้งหมด") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedSubject("ทั้งหมด");
              setSelectedGrade("ทั้งหมด");
              setSelectedTeacherId("ทั้งหมด");
              setSelectedApproval("ทั้งหมด");
            }}
            className="text-blue-600 font-bold hover:underline"
          >
            รีเซ็ตการค้นหา
          </button>
        )}
      </div>

      {/* List Container */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3 shadow-xs">
          <div className="p-4 bg-slate-50 text-slate-300 rounded-full">
            <MessageSquareDashed className="h-10 w-10" />
          </div>
          <div>
            <p className="font-bold text-slate-600 text-sm">
              ไม่พบบันทึกการสอน
            </p>
            <p className="text-xs mt-1 text-slate-400 max-w-sm">
              ลองพิมพ์ค้นหาคำอื่น หรือเปลี่ยนที่ตัวกรองวิชาและชั้นเรียนดูนะ
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition duration-200 flex flex-col justify-between hover:border-blue-100"
            >
              {/* Header insidecard */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-dashed border-slate-150 gap-2">
                <div className="flex items-center space-x-2.5 flex-wrap gap-y-1.5">
                  <span
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${getSubjectColor(record.subject)}`}
                  >
                    {record.subject === "อื่นๆ" && record.customSubject
                      ? record.customSubject
                      : record.subject}
                  </span>

                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {record.gradeLevel}
                  </span>

                  {record.semester && (
                    <span className="text-[11px] font-bold text-pink-700 bg-pink-50 border border-pink-100/50 px-2 py-0.5 rounded font-sans">
                      {record.semester}
                    </span>
                  )}

                  {teachers &&
                    (() => {
                      const teacherObj = teachers.find(
                        (t) => t.id === record.teacherId,
                      );
                      return teacherObj ? (
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50/80 border border-indigo-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <User className="h-3 w-3 text-indigo-500 shrink-0" />
                          ครู: {teacherObj.displayName}
                        </span>
                      ) : null;
                    })()}

                  {record.deptHeadApproved ? (
                    <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded flex items-center gap-1">
                      <Lock className="h-3 w-3 text-emerald-600" />
                      อนุมัติและลงนามแล้ว (ล็อก)
                    </span>
                  ) : record.teacherSigned ? (
                    <span className="text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded flex items-center gap-1 animate-pulse">
                      <Clock className="h-3 w-3 text-amber-500 animate-spin" />
                      รอการอนุมัติ (ครูลงนามแล้ว)
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded flex items-center gap-1">
                      <FileText className="h-3 w-3 text-slate-400" />
                      ยังไม่ลงนาม (ฉบับร่าง)
                    </span>
                  )}
                </div>

                <span className="text-xs font-semibold text-slate-400">
                  {thaiFormatDate(record.date)}
                </span>
              </div>

              {/* Body Content Snippet */}
              <div className="py-4 space-y-3.5">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-blue-500" />
                    เนื้อหาที่เรียน
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {record.content}
                  </p>
                </div>

                {/* Staggered visual segments */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/40">
                    <span className="block text-[10px] font-bold text-indigo-500">
                      กิจกรรมหลัก
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed whitespace-pre-line">
                      {record.activities}
                    </p>
                  </div>
                  <div className="bg-rose-50/20 p-2.5 rounded-xl border border-rose-100/50">
                    <span className="block text-[10px] font-bold text-rose-500">
                      ข้อจำกัด
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {record.limitations}
                    </p>
                  </div>
                  <div className="bg-emerald-50/20 p-2.5 rounded-xl border border-emerald-100/50">
                    <span className="block text-[10px] font-bold text-emerald-500">
                      ข้อเสนอแนะ
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {record.suggestions}
                    </p>
                  </div>
                </div>

                {/* แนบไฟล์ / สื่อวิชาการ */}
                {record.attachments && record.attachments.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mb-2">
                      <Paperclip className="h-3 w-3" />
                      เอกสารแนบ ({record.attachments.length} รายการ)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {record.attachments.map((att) => {
                        let Icon = Link2;
                        let typeColor =
                          "bg-slate-50 text-slate-500 border-slate-150";
                        if (att.type === "image") {
                          Icon = FileImage;
                          typeColor =
                            "bg-emerald-50 text-emerald-600 border-emerald-100";
                        } else if (att.type === "video") {
                          Icon = VideoIcon;
                          typeColor =
                            "bg-purple-50 text-purple-600 border-purple-100";
                        } else if (att.type === "pdf") {
                          Icon = FileText;
                          typeColor =
                            "bg-rose-50 text-rose-600 border-rose-100";
                        }

                        const isUploadedFile = att.url.startsWith("data:");

                        return (
                          <div
                            key={att.id}
                            className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-150 hover:bg-slate-100/60 transition text-[11px]"
                          >
                            <div className="flex items-center gap-2 max-w-[70%]">
                              <div
                                className={`p-1.5 rounded-lg border shrink-0 ${typeColor}`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <span
                                className="font-medium text-slate-700 truncate"
                                title={att.name}
                              >
                                {att.name}
                              </span>
                            </div>
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              download={isUploadedFile ? att.name : undefined}
                              className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 hover:border-blue-200 rounded-lg text-[10px] flex items-center gap-1 transition-colors shrink-0 cursor-pointer shadow-2xs font-semibold"
                            >
                              {isUploadedFile ? (
                                <>
                                  <Download className="h-3 w-3" />
                                  <span>ดาวน์โหลด</span>
                                </>
                              ) : (
                                <>
                                  <ExternalLink className="h-3 w-3" />
                                  <span>เปิดลิงก์</span>
                                </>
                              )}
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Edit History Section */}
              {record.lastEditedBy && (
                <div className="mt-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/50 mb-2">
                  <div
                    className="flex items-center justify-between cursor-pointer select-none"
                    onClick={() => toggleHistory(record.id)}
                    title={
                      record.editHistory && record.editHistory.length > 1
                        ? "คลิกเพื่อดูกลุ่มประวัติทั้งหมด"
                        : undefined
                    }
                  >
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <History className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                      <span className="text-[10px] font-bold text-slate-600 truncate">
                        แก้ไขล่าสุดโดย:{" "}
                        <span className="font-extrabold text-slate-800">
                          {record.lastEditedBy}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-slate-400 shrink-0">
                      <span className="font-mono flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {thaiFormatDateTime(record.lastEditedAt)}
                      </span>
                      {record.editHistory && record.editHistory.length > 1 && (
                        <span className="text-sky-600 font-extrabold text-[9px] bg-sky-50 border border-sky-100 px-1 py-0.5 rounded-xs hover:bg-sky-100/70 transition-colors">
                          {expandedHistory[record.id]
                            ? "ซ่อน"
                            : `+ประวัติ (${record.editHistory.length})`}
                        </span>
                      )}
                    </div>
                  </div>

                  {expandedHistory[record.id] &&
                    record.editHistory &&
                    record.editHistory.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 max-h-32 overflow-y-auto space-y-1">
                        {record.editHistory
                          .slice()
                          .reverse()
                          .map((history, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center text-[10px] py-1 bg-white/50 px-2 rounded-lg border border-slate-50"
                            >
                              <span className="text-slate-600 font-medium">
                                แก้ไขครั้งที่ {record.editHistory!.length - idx}
                                :{" "}
                                <span className="font-bold text-slate-800">
                                  {history.editedBy}
                                </span>
                              </span>
                              <span className="text-slate-400 font-mono shrink-0 italic">
                                {thaiFormatDateTime(history.editedAt)}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
                {/* ID Tag */}
                <span className="text-[10px] text-slate-300 font-mono">
                  ID: {record.id}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onPrintPreview(record)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold transition cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>พิมพ์รายงาน / ส่งออก PDF</span>
                  </button>

                  {/* Edit action */}
                  {(currentUserRole === "admin" ||
                    (currentTeacherId &&
                      record.teacherId === currentTeacherId)) &&
                    (record.deptHeadApproved ? (
                      <button
                        disabled
                        className="flex items-center space-x-1 px-2.5 py-1.5 text-slate-400 bg-slate-100/60 border border-slate-200 rounded-lg cursor-not-allowed select-none text-[11px] font-bold"
                        title="เอกสารลงนามอนุมัติแล้ว ไม่สามารถแก้ไขได้"
                      >
                        <Lock className="h-3.5 w-3.5 text-slate-400" />
                        <span>แก้ไข (ล็อก)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onEdit(record)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>แก้ไข</span>
                      </button>
                    ))}

                  {/* Delete action with premium double confirmation */}
                  {(currentUserRole === "admin" ||
                    (currentTeacherId &&
                      record.teacherId === currentTeacherId)) &&
                    (record.deptHeadApproved ? (
                      <button
                        disabled
                        className="flex items-center space-x-1 px-2.5 py-1.5 text-slate-400 bg-slate-100/60 border border-slate-200 rounded-lg cursor-not-allowed select-none text-[11px] font-bold"
                        title="เอกสารลงนามอนุมัติแล้ว ไม่สามารถลบได้"
                      >
                        <Lock className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                    ) : deletingId === record.id ? (
                      <div className="flex items-center space-x-1.5 animate-in fade-in zoom-in duration-200">
                        <button
                          onClick={() => {
                            onDelete(record.id);
                            setDeletingId(null);
                          }}
                          className="flex items-center space-x-1 px-2.5 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition shadow-xs cursor-pointer"
                          title="ยืนยันการลบแบบถาวร"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>ยืนยันลบ?</span>
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-2 py-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(record.id)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg hover:border-rose-200 transition cursor-pointer"
                        title={
                          currentUserRole === "admin"
                            ? "ลบบันทึก (เฉพาะผู้ดูแลระบบ)"
                            : "ลบบันทึกการสอนของตนเอง"
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
