import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { Settings, Save, AlertCircle } from "lucide-react";
import { Teacher } from "../types";

interface AcademicSettingsProps {
  currentTeacher: Teacher;
}

export const AcademicSettings: React.FC<AcademicSettingsProps> = ({ currentTeacher }) => {
  const [academicYear, setAcademicYear] = useState<string>("2567");
  const [semester, setSemester] = useState<string>("1");
  const [totalLearningDays, setTotalLearningDays] = useState<number>(100);
  const [termStartDate, setTermStartDate] = useState<string>("");
  const [termEndDate, setTermEndDate] = useState<string>("");
  const [passingGrade, setPassingGrade] = useState<number>(50);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const canEdit = currentTeacher.role === "admin" || currentTeacher.role === "academic";

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "school"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.systemAcademicYear) setAcademicYear(data.systemAcademicYear);
        if (data.systemSemester) setSemester(data.systemSemester);
        if (data.totalLearningDays) setTotalLearningDays(data.totalLearningDays);
        if (data.termStartDate) setTermStartDate(data.termStartDate);
        if (data.termEndDate) setTermEndDate(data.termEndDate);
        if (data.passingGrade) setPassingGrade(data.passingGrade);
      }
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (!canEdit) return;
    
    try {
      setIsProcessing(true);
      setMessage(null);
      
      await setDoc(doc(db, "config", "school"), {
        systemAcademicYear: academicYear,
        systemSemester: semester,
        totalLearningDays: totalLearningDays,
        termStartDate: termStartDate,
        termEndDate: termEndDate,
        passingGrade: passingGrade
      }, { merge: true });
      
      setMessage({ type: 'success', text: 'บันทึกการตั้งค่าระบบเรียบร้อยแล้ว' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error saving config:", error);
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-w-4xl mx-auto">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
        <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">ตั้งค่าระบบและวันเปิด-ปิดภาคเรียน</h2>
          <p className="text-sm text-slate-500 mt-1">กำหนดปีการศึกษา ภาคเรียน และเกณฑ์การประเมินผลกลางของโรงเรียน</p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="font-bold">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="h-6 w-1 bg-indigo-500 rounded-full"></span>
                ข้อมูลปีการศึกษาปัจจุบัน
              </h3>
              
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">ปีการศึกษา</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    disabled={!canEdit}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="เช่น 2567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">ภาคเรียนที่</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    disabled={!canEdit}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    <option value="1">ภาคเรียนที่ 1</option>
                    <option value="2">ภาคเรียนที่ 2</option>
                    <option value="3">ภาคเรียนฤดูร้อน</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="h-6 w-1 bg-sky-500 rounded-full"></span>
                กำหนดการเปิด-ปิดภาคเรียน
              </h3>
              
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">วันเปิดภาคเรียน</label>
                  <input
                    type="date"
                    value={termStartDate}
                    onChange={(e) => setTermStartDate(e.target.value)}
                    disabled={!canEdit}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">วันปิดภาคเรียน</label>
                  <input
                    type="date"
                    value={termEndDate}
                    onChange={(e) => setTermEndDate(e.target.value)}
                    disabled={!canEdit}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="h-6 w-1 bg-emerald-500 rounded-full"></span>
                เกณฑ์การประเมินและเวลาเรียน
              </h3>
              
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    จำนวนวันเรียนทั้งหมด (วัน)
                    <span className="text-xs text-slate-400 font-normal ml-2">ใช้คำนวณร้อยละการเข้าเรียน</span>
                  </label>
                  <input
                    type="number"
                    value={totalLearningDays}
                    onChange={(e) => setTotalLearningDays(parseInt(e.target.value) || 0)}
                    disabled={!canEdit}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="เช่น 100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    เกณฑ์คะแนนขั้นต่ำที่ผ่าน (%)
                  </label>
                  <input
                    type="number"
                    value={passingGrade}
                    onChange={(e) => setPassingGrade(parseInt(e.target.value) || 0)}
                    disabled={!canEdit}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="เช่น 50"
                  />
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
              <h4 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> ข้อควรระวัง
              </h4>
              <p className="text-sm text-amber-700 mb-2">
                การเปลี่ยนแปลงปีการศึกษาและภาคเรียน จะส่งผลกระทบต่อ:
              </p>
              <ul className="list-disc list-inside text-sm text-amber-700 space-y-1 ml-2">
                <li>การแสดงผลข้อมูลชั้นเรียนทั้งหมด</li>
                <li>การบันทึกแผนการสอนและการเช็คชื่อ</li>
                <li>การประเมินผลและการเลื่อนชั้น</li>
              </ul>
              <p className="text-sm text-amber-800 font-bold mt-3">
                ควรเปลี่ยนเมื่อสิ้นสุดภาคเรียนเท่านั้น
              </p>
            </div>
          </div>
        </div>

        {canEdit ? (
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isProcessing ? (
                <>กำลังบันทึก...</>
              ) : (
                <>
                  <Save className="h-4 w-4" /> บันทึกการตั้งค่า
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-sm text-rose-500 font-bold">คุณไม่มีสิทธิ์แก้ไขการตั้งค่าระบบ กรุณาติดต่อผู้ดูแลระบบ (Admin) หรือ ฝ่ายวิชาการ</p>
          </div>
        )}
      </div>
    </div>
  );
};
