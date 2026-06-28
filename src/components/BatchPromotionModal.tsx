import React, { useState } from "react";
import { Student, GRADE_LEVELS } from "../types";
import { db } from "../lib/firebase";
import { writeBatch, doc } from "firebase/firestore";
import { Users, AlertTriangle, ArrowRight } from "lucide-react";

interface BatchPromotionModalProps {
  students: Student[];
  currentGrade: string;
  systemAcademicYear: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const BatchPromotionModal: React.FC<BatchPromotionModalProps> = ({
  students,
  currentGrade,
  systemAcademicYear,
  onClose,
  onSuccess,
}) => {
  const [newGradeLevel, setNewGradeLevel] = useState<string>(
    GRADE_LEVELS[GRADE_LEVELS.indexOf(currentGrade) + 1] || GRADE_LEVELS[GRADE_LEVELS.length - 1]
  );
  // Default to system year + 1 for promotion
  const [newAcademicYear, setNewAcademicYear] = useState<string>(
    (parseInt(systemAcademicYear) + 1).toString()
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePromote = async () => {
    if (!students || students.length === 0) return;
    setIsProcessing(true);

    try {
      const batch = writeBatch(db);
      
      students.forEach((student) => {
        const studentRef = doc(db, "students", student.id);
        batch.update(studentRef, {
          gradeLevel: newGradeLevel,
          academicYear: newAcademicYear,
        });
      });

      await batch.commit();
      onSuccess();
    } catch (error) {
      console.error("Error promoting students:", error);
      alert("เกิดข้อผิดพลาดในการเลื่อนชั้น");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
            <Users className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-lg">
              เลื่อนชั้นแบบกลุ่ม (Batch Promotion)
            </h3>
            <p className="text-slate-500 text-sm">
              อัปเดตระดับชั้นและปีการศึกษาของนักเรียนทั้งหมดในห้อง
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
             <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 mb-1">ชั้นเรียนปัจจุบัน</p>
                <p className="font-bold text-slate-800">{currentGrade}</p>
                <p className="text-xs text-slate-500">ปีการศึกษา {systemAcademicYear}</p>
             </div>
             <ArrowRight className="h-5 w-5 text-slate-300" />
             <div className="flex-1 text-right">
                <p className="text-xs font-bold text-slate-400 mb-1">จำนวนนักเรียน</p>
                <p className="font-black text-2xl text-blue-600">{students.length} <span className="text-sm font-medium text-slate-500">คน</span></p>
             </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              เลื่อนไปยังระดับชั้น
            </label>
            <select
              value={newGradeLevel}
              onChange={(e) => setNewGradeLevel(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-amber-500 bg-white"
            >
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
              <option value="จบการศึกษา">จบการศึกษา (ย้ายออก/สำเร็จการศึกษา)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              ปีการศึกษาใหม่
            </label>
            <input
              type="text"
              value={newAcademicYear}
              onChange={(e) => setNewAcademicYear(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-amber-500 bg-white"
            />
          </div>

          <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-xs font-medium flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>การดำเนินการนี้จะเปลี่ยนข้อมูลของนักเรียนจำนวน {students.length} คน พร้อมกัน และไม่สามารถย้อนกลับได้ โปรดตรวจสอบความถูกต้อง</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handlePromote}
            disabled={isProcessing || students.length === 0}
            className="flex-1 px-4 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? "กำลังดำเนินการ..." : "ยืนยันการเลื่อนชั้น"}
          </button>
        </div>
      </div>
    </div>
  );
};
