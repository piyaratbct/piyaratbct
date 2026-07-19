import React, { useState } from "react";
import { Student, GRADE_LEVELS } from "../types";
import { db } from "../lib/firebase";
import { writeBatch, doc } from "firebase/firestore";
import { X, Save, Users, ArrowRight } from "lucide-react";

interface AssignSectionModalProps {
  students: Student[];
  currentGrade: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignSectionModal: React.FC<AssignSectionModalProps> = ({
  students,
  currentGrade,
  onClose,
  onSuccess,
}) => {
  const targetSections = GRADE_LEVELS.filter((g) => g.startsWith(currentGrade + "/"));
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAssign = (studentId: string, section: string) => {
    setAssignments((prev) => ({
      ...prev,
      [studentId]: section,
    }));
  };

  const handleSave = async () => {
    if (Object.keys(assignments).length === 0) {
      onClose();
      return;
    }

    setIsProcessing(true);
    try {
      const batch = writeBatch(db);
      Object.entries(assignments).forEach(([studentId, newGrade]) => {
        if (newGrade) {
          const studentRef = doc(db, "students", studentId);
          batch.update(studentRef, { gradeLevel: newGrade });
        }
      });
      await batch.commit();
      onSuccess();
    } catch (error) {
      console.error("Error assigning sections:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Users className="h-6 w-6 text-indigo-500" />
              จัดห้องเรียนย่อย (ย้ายห้อง)
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              จัดนักเรียนชั้น {currentGrade} เข้าสู่ห้องเรียนย่อย
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {targetSections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-2">ไม่พบห้องเรียนย่อยสำหรับ {currentGrade}</p>
              <p className="text-sm text-slate-400">ระบบจะแสดงตัวเลือกเมื่อมีชั้นเรียนที่มีทับ เช่น {currentGrade}/1</p>
            </div>
          ) : (
            <div className="space-y-3">
              {students
                .sort((a, b) => (a.number || 0) - (b.number || 0))
                .map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                        {student.number}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">
                          {student.prefix} {student.firstName} {student.lastName}
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          {student.studentId}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ArrowRight className="h-4 w-4 text-slate-300" />
                      <select
                        value={assignments[student.id] || ""}
                        onChange={(e) => handleAssign(student.id, e.target.value)}
                        className={`border rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors ${
                          assignments[student.id]
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 text-slate-600 bg-slate-50"
                        }`}
                      >
                        <option value="">เลือกห้องเรียน</option>
                        {targetSections.map((section) => (
                          <option key={section} value={section}>
                            {section}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing || targetSections.length === 0}
            className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {isProcessing ? (
              <>กำลังบันทึก...</>
            ) : (
              <>
                <Save className="h-4 w-4" /> บันทึกการย้ายห้อง
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
