import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle, 
  BookOpen, 
  Check, 
  Layers, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Award
} from 'lucide-react';
import { 
  KINDERGARTEN_2568_STANDARDS, 
  KINDERGARTEN_2568_UNITS, 
  createKindergartenCurriculumPayload 
} from '../lib/kindergartenCurriculumTemplate';
import { CurriculumSubject } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db, cleanFirestoreData } from '../lib/firebase';

interface KindergartenTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCurriculums: CurriculumSubject[];
  onSuccess: (selectedId: string) => void;
}

export const KindergartenTemplateModal: React.FC<KindergartenTemplateModalProps> = ({
  isOpen,
  onClose,
  existingCurriculums,
  onSuccess
}) => {
  const [selectedGrades, setSelectedGrades] = useState<string[]>(['อนุบาล 1', 'อนุบาล 2', 'อนุบาล 3']);
  const [includeThematicUnits, setIncludeThematicUnits] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'standards' | 'units' | null>('standards');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleGrade = (grade: string) => {
    setSelectedGrades(prev => 
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  const handleImport = async () => {
    if (selectedGrades.length === 0) {
      setErrorMsg('กรุณาเลือกระดับชั้นอนุบาลอย่างน้อย 1 ชั้น');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let firstCreatedId = '';

      for (const grade of selectedGrades) {
        // Check if an existing subject for this grade already exists
        const existing = existingCurriculums.find(c => 
          (c.gradeLevel === grade || (c.gradeLevels && c.gradeLevels.includes(grade))) &&
          (c.subjectName.includes('ปฐมวัย') || c.subjectName.includes('อนุบาล'))
        );

        const payload = createKindergartenCurriculumPayload(grade, existing);
        if (!includeThematicUnits) {
          payload.units = [];
        }

        const cleanedPayload = cleanFirestoreData(payload);
        await setDoc(doc(db, 'curriculums', payload.id), cleanedPayload);

        if (!firstCreatedId) {
          firstCreatedId = payload.id;
        }
      }

      onSuccess(firstCreatedId);
      onClose();
    } catch (err: any) {
      console.error('Error importing kindergarten curriculum:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลหลักสูตร');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-pink-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 p-6 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-inner">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full border border-white/20">
                สพฐ. กระทรวงศึกษาธิการ
              </span>
              <h2 className="text-xl font-black tracking-tight mt-0.5">
                นำเข้าแม่แบบหลักสูตรปฐมวัย พ.ศ. 2568
              </h2>
            </div>
          </div>
          <p className="text-xs text-pink-100 font-medium leading-relaxed max-w-xl">
            โครงสร้างหลักสูตรการศึกษาปฐมวัยตามแนวทางใหม่ มุ่งเน้นการพัฒนาสมรรถนะ 4 ด้าน และการจัดประสบการณ์การเรียนรู้บูรณาการตามสาระที่ควรเรียนรู้ 4 เรื่อง
          </p>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 custom-scrollbar">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-bold animate-in shake">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Target Grades Selection */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Award className="h-4 w-4 text-pink-500" />
              <span>1. เลือกระดับชั้นที่ต้องการนำเข้า (สามารถเลือกหลายชั้นได้)</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['อนุบาล 1', 'อนุบาล 2', 'อนุบาล 3'].map(grade => {
                const isSelected = selectedGrades.includes(grade);
                const hasExisting = existingCurriculums.some(c => 
                  (c.gradeLevel === grade || (c.gradeLevels && c.gradeLevels.includes(grade))) &&
                  (c.subjectName.includes('ปฐมวัย') || c.subjectName.includes('อนุบาล'))
                );

                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => toggleGrade(grade)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                      isSelected 
                        ? 'border-pink-500 bg-pink-50/50 shadow-sm ring-2 ring-pink-500/20' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-slate-800 text-sm">{grade}</span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-pink-500 text-white' : 'border border-slate-300'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {hasExisting ? 'มีวิชานี้อยู่แล้ว (จะอัปเดต)' : 'สร้างรายวิชาใหม่'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Options */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-500" />
              <span>2. องค์ประกอบที่บรรจุในแม่แบบ</span>
            </label>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/70 text-xs">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <div className="flex-1 font-bold text-slate-700">
                  สมรรถนะหลัก 4 ด้าน (16 ตัวชี้วัดสำคัญระดับปฐมวัย)
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                  รวมอยู่ในแม่แบบ
                </span>
              </div>

              <label className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/70 text-xs cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={includeThematicUnits}
                  onChange={(e) => setIncludeThematicUnits(e.target.checked)}
                  className="rounded border-slate-300 text-pink-500 focus:ring-pink-400 h-4 w-4"
                />
                <div className="flex-1 font-bold text-slate-700">
                  สาระที่ควรเรียนรู้ 4 เรื่อง (15 หน่วยการเรียนรู้ Thematic Units บูรณาการ)
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                  แนะนำ
                </span>
              </label>

              <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/70 text-xs">
                <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                <div className="flex-1 font-bold text-slate-700">
                  โครงสร้างเวลาเรียนมาตรฐานปฐมวัย (1,000 ชั่วโมง/ปี หรือ 500 ชม./ภาคเรียน)
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold">
                  กำหนดอัตโนมัติ
                </span>
              </div>
            </div>
          </div>

          {/* 3. Detail Preview Accordion */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedSection(expandedSection === 'standards' ? null : 'standards')}
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors border-b border-slate-200 text-xs font-bold text-slate-700"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-pink-500" />
                <span>ดูรายละเอียด 4 สมรรถนะหลัก (Standards & Indicators)</span>
              </div>
              {expandedSection === 'standards' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {expandedSection === 'standards' && (
              <div className="p-4 space-y-3 bg-white max-h-56 overflow-y-auto custom-scrollbar text-xs">
                {KINDERGARTEN_2568_STANDARDS.map((std, idx) => (
                  <div key={std.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 text-[10px] flex items-center justify-center font-black">
                        {idx + 1}
                      </span>
                      <span>{std.title}</span>
                    </div>
                    <ul className="pl-6 space-y-1 list-disc text-slate-600 text-[11px]">
                      {std.indicators.map(ind => (
                        <li key={ind.id}>
                          <span className="font-bold text-slate-700">{ind.code}:</span> {ind.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setExpandedSection(expandedSection === 'units' ? null : 'units')}
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors text-xs font-bold text-slate-700"
            >
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-500" />
                <span>ดูรายละเอียดสาระที่ควรเรียนรู้ 4 เรื่อง (15 หน่วยการเรียนรู้)</span>
              </div>
              {expandedSection === 'units' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {expandedSection === 'units' && (
              <div className="p-4 space-y-2 bg-white max-h-56 overflow-y-auto custom-scrollbar text-xs">
                {KINDERGARTEN_2568_UNITS.map(unit => (
                  <div key={unit.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center text-[11px]">
                    <span className="font-medium text-slate-800">{unit.name}</span>
                    <span className="text-slate-500 shrink-0 ml-2">{unit.hours} ชม.</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 flex-shrink-0">
          <span className="text-xs text-slate-500">
            เลือกไว้ {selectedGrades.length} ระดับชั้น
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              disabled={isSubmitting || selectedGrades.length === 0}
              onClick={handleImport}
              className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl shadow-md shadow-pink-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 text-pink-200" />
              <span>{isSubmitting ? 'กำลังนำเข้าแม่แบบ...' : 'ยืนยันการนำเข้าแม่แบบปฐมวัย'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
