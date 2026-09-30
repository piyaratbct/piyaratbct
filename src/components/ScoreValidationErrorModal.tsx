import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, X, Search, Sparkles, Filter, ArrowRight, ShieldAlert } from 'lucide-react';

export interface ScoreValidationError {
  studentId: string;
  studentNumber: string;
  studentName: string;
  fieldKey: string;
  activityId?: string;
  fieldName: string;
  categoryName: string;
  enteredValue: number;
  minAllowed: number;
  maxAllowed: number;
  message: string;
  targetTab?: 'part1' | 'part2';
}

interface ScoreValidationErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: ScoreValidationError[];
  onAutoClampAndSave: () => void;
  onReviewManually: (firstErrorTab?: 'part1' | 'part2') => void;
  subjectName: string;
  gradeLevel: string;
}

export const ScoreValidationErrorModal: React.FC<ScoreValidationErrorModalProps> = ({
  isOpen,
  onClose,
  errors,
  onAutoClampAndSave,
  onReviewManually,
  subjectName,
  gradeLevel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = Array.from(new Set(errors.map(e => e.categoryName)));

  const filteredErrors = errors.filter(err => {
    const matchesSearch = 
      err.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      err.studentNumber.includes(searchTerm) ||
      err.fieldName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || err.categoryName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const firstErrorTab = errors[0]?.targetTab || 'part1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 print:hidden">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-rose-200 animate-in zoom-in-95 duration-200">
        
        {/* Header with High-Impact Warning Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-600 via-rose-700 to-amber-700 text-white flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner text-white">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">ไม่อนุญาตให้บันทึก: พบข้อมูลคะแนนผิดพลาด</h3>
                <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">
                  {errors.length} รายการ
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                วิชา: {subjectName} • ชั้น: {gradeLevel} • การตรวจสอบช่วงคะแนนขั้นต่ำ-สูงสุด [Min/Max Validation]
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
          
          {/* Explanation Alert */}
          <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-bold text-rose-900 text-sm">
                ระบบป้องกันข้อมูลผิดพลาดระงับการบันทึกลงฐานข้อมูลชั่วคราว
              </p>
              <p className="text-slate-600 leading-relaxed">
                ระบบตรวจพบคะแนนที่ <span className="font-bold text-rose-700">เกินคะแนนเต็ม (Max)</span> หรือ <span className="font-bold text-rose-700">ต่ำกว่า 0 (Min)</span> จำนวน <span className="font-bold text-rose-700">{errors.length} รายการ</span> ซึ่งอาจเกิดจากการพิมพ์ผิดตัวเลข หรือใส่คะแนนเกินสัดส่วน ท่านสามารถเลือกแก้ไขเอง หรือใช้ปุ่มปรับคะแนนให้อยู่ในเกณฑ์อัตโนมัติได้ทันที
              </p>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ, เลขที่ หรือชื่อกิจกรรม..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
              />
            </div>

            {categories.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="text-slate-500 font-bold flex items-center gap-1 shrink-0">
                  <Filter className="h-3 w-3" /> หมวด:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ทั้งหมด ({errors.length})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat} ({errors.filter(e => e.categoryName === cat).length})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Errors Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200 z-10">
                  <tr>
                    <th className="px-3 py-2.5 text-center w-14">เลขที่</th>
                    <th className="px-4 py-2.5 w-48">ชื่อ - นามสกุล</th>
                    <th className="px-3 py-2.5">หมวดหมู่ / กิจกรรม</th>
                    <th className="px-3 py-2.5 text-center w-28 bg-rose-50 text-rose-800">คะแนนที่กรอก</th>
                    <th className="px-3 py-2.5 text-center w-28 bg-emerald-50 text-emerald-800">ช่วงที่ถูกต้อง</th>
                    <th className="px-3 py-2.5">ข้อความแจ้งเตือน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredErrors.length > 0 ? (
                    filteredErrors.map((err, idx) => (
                      <tr key={idx} className="hover:bg-rose-50/40 transition-colors">
                        <td className="px-3 py-2.5 text-center font-bold text-slate-500">
                          {err.studentNumber}
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-slate-800">
                          {err.studentName}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-bold text-slate-700">{err.fieldName}</div>
                          <div className="text-[10px] text-slate-400">{err.categoryName}</div>
                        </td>
                        <td className="px-3 py-2.5 text-center bg-rose-50/50">
                          <span className="inline-block px-2.5 py-1 bg-rose-100 text-rose-700 rounded-lg font-black text-sm border border-rose-200">
                            {err.enteredValue}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center bg-emerald-50/50">
                          <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-xs border border-emerald-200">
                            {err.minAllowed} - {err.maxAllowed}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-rose-600 font-medium flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            {err.message}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        ไม่พบรายการที่ตรงกับคำค้นหา
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Solution Recommendation Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-indigo-900 text-xs">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>ทางเลือกที่ 1: ปรับคะแนนให้อยู่ในเกณฑ์อัตโนมัติ (แนะนำ)</span>
              </div>
              <p className="text-[11px] text-indigo-700 leading-normal">
                ระบบจะตัดคะแนนส่วนที่เกินให้เท่ากับคะแนนเต็ม (Max) ทันที และปรับคะแนนที่ติดลบเป็น 0 จากนั้นจะบันทึกคะแนนลงระบบให้อัตโนมัติ สะดวกรวดเร็วไม่ต้องไล่พิมพ์ใหม่ทีละช่อง
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                <ArrowRight className="h-4 w-4 text-slate-600" />
                <span>ทางเลือกที่ 2: กลับไปแก้ไขด้วยตนเอง</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                ปิดหน้าต่างนี้และกลับไปยังตารางคะแนน ช่องที่กรอกผิดจะแสดง <span className="text-rose-600 font-bold">กรอบสีแดง</span> เพื่อให้คุณครูกรอกตัวเลขที่ถูกต้องด้วยตนเอง
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => onReviewManually(firstErrorTab)}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors shadow-sm"
          >
            กลับไปแก้ไขด้วยตนเองในตาราง
          </button>

          <button
            type="button"
            onClick={onAutoClampAndSave}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span>ปรับคะแนนให้อยู่ในเกณฑ์อัตโนมัติ และบันทึกทันที</span>
          </button>
        </div>

      </div>
    </div>
  );
};
