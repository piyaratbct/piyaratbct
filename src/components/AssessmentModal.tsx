import React, { useState } from "react";
import { CheckCircle, History, Clock } from "lucide-react";
import { Student, StudentAssessment } from "../types";

interface AssessmentModalProps {
  student: Student;
  existingAssessment: StudentAssessment;
  onClose: () => void;
  onSave: (assessment: StudentAssessment) => void;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  student,
  existingAssessment,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] =
    useState<StudentAssessment>(existingAssessment);
  const [expandedHistory, setExpandedHistory] = useState(false);

  // Helper for formatting date/time
  const thaiFormatDateTime = (isoString?: string) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4 print:hidden">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-black text-slate-800 text-lg">
              แบบประเมินพัฒนาการ
            </h3>
            <p className="text-sm text-slate-500">
              นักเรียน: {student.firstName} {student.lastName} (เลขที่{" "}
              {student.number})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          {/* Section 5: Narrative Log */}
          <section>
            <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
              บันทึกพัฒนาการรายบุคคล
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  การประเมินประจำเดือน
                </label>
                <input
                  type="month"
                  value={formData.month || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, month: e.target.value }))
                  }
                  className="w-full max-w-xs border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  พฤติกรรม/พัฒนาการที่พบ
                </label>
                <textarea
                  value={formData.content || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm min-h-[80px] outline-none focus:border-pink-500"
                  placeholder="ระบุพฤติกรรมหรือพัฒนาการที่สังเกตพบ..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  วิธีการส่งเสริม/แก้ไขปัญหา
                </label>
                <textarea
                  value={formData.activities || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      activities: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm min-h-[80px] outline-none focus:border-pink-500"
                  placeholder="ระบุวิธีการหรือกิจกรรมที่ใช้..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  ผลการพัฒนา/ข้อเสนอแนะ
                </label>
                <textarea
                  value={formData.suggestions || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      suggestions: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm min-h-[60px] outline-none focus:border-pink-500"
                  placeholder="ระบุผลที่ได้หรือข้อเสนอแนะเพิ่มเติม..."
                />
              </div>
            </div>
          </section>

          {/* Edit History Section */}
          {formData.lastEditedBy && (
            <div className="mt-6 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/50 mb-2">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setExpandedHistory(!expandedHistory)}
                title={
                  formData.editHistory && formData.editHistory.length > 1
                    ? "คลิกเพื่อดูกลุ่มประวัติทั้งหมด"
                    : undefined
                }
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <History className="h-4 w-4 text-sky-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-600 truncate">
                    แก้ไขล่าสุดโดย:{" "}
                    <span className="font-extrabold text-slate-800">
                      {formData.lastEditedBy}
                    </span>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 shrink-0">
                  <span className="font-mono flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {thaiFormatDateTime(formData.lastEditedAt)}
                  </span>
                  {formData.editHistory && formData.editHistory.length > 1 && (
                    <span className="text-sky-600 font-extrabold text-[10px] bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded hover:bg-sky-100/70 transition-colors">
                      {expandedHistory
                        ? "ซ่อน"
                        : `+ประวัติ (${formData.editHistory.length})`}
                    </span>
                  )}
                </div>
              </div>

              {expandedHistory &&
                formData.editHistory &&
                formData.editHistory.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 max-h-32 overflow-y-auto space-y-1.5">
                    {formData.editHistory
                      .slice()
                      .reverse()
                      .map((history, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-xs py-1.5 bg-white/50 px-3 rounded-lg border border-slate-50"
                        >
                          <span className="text-slate-600 font-medium">
                            แก้ไขครั้งที่ {formData.editHistory!.length - idx}:{" "}
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
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => onSave(formData)}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <CheckCircle className="h-4 w-4" /> บันทึกผลประเมิน
          </button>
        </div>
      </div>
    </div>
  );
};
