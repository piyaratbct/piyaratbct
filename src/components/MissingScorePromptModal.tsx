import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, X, Sparkles, ArrowRight, HelpCircle, FileQuestion, Search } from 'lucide-react';

export interface MissingScoreItem {
  studentId: string;
  studentNumber: string;
  studentName: string;
  fieldId: string;
  fieldName: string;
  categoryName: string;
  maxScore: number;
  targetTab: 'part1' | 'part2';
}

interface MissingScorePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingItems: MissingScoreItem[];
  onConfirmSaveAsIs: () => void;
  onFillZerosAndSave: () => void;
  onReviewMissing: (firstMissingTab: 'part1' | 'part2') => void;
  subjectName: string;
  gradeLevel: string;
}

export const MissingScorePromptModal: React.FC<MissingScorePromptModalProps> = ({
  isOpen,
  onClose,
  missingItems,
  onConfirmSaveAsIs,
  onFillZerosAndSave,
  onReviewMissing,
  subjectName,
  gradeLevel
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const studentsCount = new Set(missingItems.map(m => m.studentId)).size;

  const filteredItems = missingItems.filter(item => 
    item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.studentNumber.includes(searchTerm) ||
    item.fieldName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const firstTab = missingItems[0]?.targetTab || 'part1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 print:hidden">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-amber-200 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner text-white">
              <FileQuestion className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">แจ้งเตือน: พบช่องคะแนนที่ยังไม่ได้กรอก</h3>
                <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">
                  ว่าง {missingItems.length} ช่อง
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                วิชา: {subjectName} • ชั้น: {gradeLevel} • มีนักเรียน {studentsCount} คนที่คะแนนยังไม่ครบ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-bold text-amber-950 text-sm">
                มีคะแนนตกหล่นหรือยังไม่ได้ระบุจำนวน {missingItems.length} ช่อง จากนักเรียน {studentsCount} คน
              </p>
              <p className="text-slate-600 leading-relaxed">
                ระบบตรวจพบว่ามีบางช่องคะแนนถูกเว้นว่างไว้ คุณครูสามารถเลือกบันทึกโดยคงช่องว่างไว้ (กรณีรอนักเรียนสอบซ่อมหรือส่งงานภายหลัง) หรือให้ระบบเติม 0 ในช่องที่ว่างทั้งหมดอัตโนมัติได้ครับ
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อ, เลขที่ หรือชื่อกิจกรรม..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
          </div>

          {/* Missing items list */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200 z-10">
                  <tr>
                    <th className="px-3 py-2.5 text-center w-14">เลขที่</th>
                    <th className="px-4 py-2.5 w-48">ชื่อ - นามสกุล</th>
                    <th className="px-3 py-2.5">หมวดหมู่ / กิจกรรมที่ยังว่าง</th>
                    <th className="px-3 py-2.5 text-center w-24">คะแนนเต็ม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-amber-50/40 transition-colors">
                        <td className="px-3 py-2 text-center font-bold text-slate-500">
                          {item.studentNumber}
                        </td>
                        <td className="px-4 py-2 font-semibold text-slate-800">
                          {item.studentName}
                        </td>
                        <td className="px-3 py-2">
                          <span className="font-bold text-slate-700">{item.fieldName}</span>
                          <span className="text-[10px] text-slate-400 block">{item.categoryName}</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                            เต็ม {item.maxScore}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                        ไม่พบรายการที่ตรงกับคำค้นหา
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Options explanation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>ทางเลือกที่ 1: บันทึกตามนี้ (คงช่องว่างไว้)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                บันทึกคะแนนเฉพาะช่องที่กรอกแล้ว ส่วนช่องที่ว่างจะคงสถานะไว้ คุณครูสามารถกลับมากรอกเพิ่มเติมในภายหลังได้
              </p>
            </div>

            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span>ทางเลือกที่ 2: เติม 0 ให้ทุกช่องที่ว่าง แล้วบันทึก</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-normal">
                เหมาะสำหรับกรณีปิดเทอมหรือหมดเขตส่งงาน โดยระบบจะใส่คะแนน 0 ในช่องที่ยังว่างอยู่ทั้งหมดให้อัตโนมัติ
              </p>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => onReviewMissing(firstTab)}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            🔍 กลับไปตรวจสอบช่องที่ว่าง
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onFillZerosAndSave}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>เติม 0 ช่องว่าง & บันทึก</span>
            </button>

            <button
              type="button"
              onClick={onConfirmSaveAsIs}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>บันทึกตามนี้ (คงช่องว่างไว้)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
