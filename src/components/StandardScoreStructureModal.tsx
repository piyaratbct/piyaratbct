import React, { useState, useEffect } from 'react';
import { StandardScoreStructure } from '../types';
import { X, Save, AlertCircle, Sliders, CheckCircle2, Sparkles, RefreshCw, Info } from 'lucide-react';

interface StandardScoreStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStandard: StandardScoreStructure;
  onSaveStandard: (structure: StandardScoreStructure, applyToAllSubjects: boolean) => Promise<void>;
  isReadOnly?: boolean;
  academicYear?: string;
  semester?: string;
}

export const StandardScoreStructureModal: React.FC<StandardScoreStructureModalProps> = ({
  isOpen,
  onClose,
  currentStandard,
  onSaveStandard,
  isReadOnly = false,
  academicYear,
  semester
}) => {
  const [targetBMK, setTargetBMK] = useState<number>(currentStandard.targetBeforeMidKnowledge ?? 20);
  const [targetBMS, setTargetBMS] = useState<number>(currentStandard.targetBeforeMidSoftSkill ?? 10);
  const [targetMid, setTargetMid] = useState<number>(currentStandard.targetMidterm ?? 20);
  const [targetAMK, setTargetAMK] = useState<number>(currentStandard.targetAfterMidKnowledge ?? 20);
  const [targetAMS, setTargetAMS] = useState<number>(currentStandard.targetAfterMidSoftSkill ?? 10);
  const [targetFin, setTargetFin] = useState<number>(currentStandard.targetFinal ?? 20);
  
  const [applyToAll, setApplyToAll] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTargetBMK(currentStandard.targetBeforeMidKnowledge ?? 20);
      setTargetBMS(currentStandard.targetBeforeMidSoftSkill ?? 10);
      setTargetMid(currentStandard.targetMidterm ?? 20);
      setTargetAMK(currentStandard.targetAfterMidKnowledge ?? 20);
      setTargetAMS(currentStandard.targetAfterMidSoftSkill ?? 10);
      setTargetFin(currentStandard.targetFinal ?? 20);
      setError(null);
    }
  }, [isOpen, currentStandard]);

  if (!isOpen) return null;

  const totalCoursework = targetBMK + targetBMS + targetAMK + targetAMS;
  const totalExams = targetMid + targetFin;
  const totalAll = totalCoursework + totalExams;

  const presets = [
    {
      name: 'มาตรฐาน สพฐ. ทั่วไป (60 : 40)',
      desc: 'เก็บ 60 (20+10+20+10) / สอบ 40 (กลาง 20, ปลาย 20)',
      bmk: 20, bms: 10, mid: 20, amk: 20, ams: 10, fin: 20
    },
    {
      name: 'มาตรฐานเน้นปฏิบัติ (70 : 30)',
      desc: 'เก็บ 70 (25+10+25+10) / สอบ 30 (กลาง 15, ปลาย 15)',
      bmk: 25, bms: 10, mid: 15, amk: 25, ams: 10, fin: 15
    },
    {
      name: 'มาตรฐานเน้นทฤษฎี/วิชาการ (50 : 50)',
      desc: 'เก็บ 50 (15+10+15+10) / สอบ 50 (กลาง 25, ปลาย 25)',
      bmk: 15, bms: 10, mid: 25, amk: 15, ams: 10, fin: 25
    },
    {
      name: 'มาตรฐานกิจกรรม/ทักษะ (80 : 20)',
      desc: 'เก็บ 80 (30+10+30+10) / สอบ 20 (กลาง 10, ปลาย 10)',
      bmk: 30, bms: 10, mid: 10, amk: 30, ams: 10, fin: 10
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setTargetBMK(preset.bmk);
    setTargetBMS(preset.bms);
    setTargetMid(preset.mid);
    setTargetAMK(preset.amk);
    setTargetAMS(preset.ams);
    setTargetFin(preset.fin);
    setError(null);
  };

  const handleSave = async () => {
    if (targetBMK < 0 || targetBMS < 0 || targetAMK < 0 || targetAMS < 0 || targetMid < 0 || targetFin < 0) {
      setError('สัดส่วนคะแนนต้องไม่เป็นค่าติดลบ');
      return;
    }

    if (totalAll !== 100) {
      const confirmSave = window.confirm(
        `ยอดรวมสัดส่วนคะแนนปัจจุบันเท่ากับ ${totalAll} คะแนน (แนะนำคือ 100 คะแนนพอดี)\nท่านต้องการบันทึกสัดส่วนนี้เป็นมาตรฐานหรือไม่?`
      );
      if (!confirmSave) return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSaveStandard(
        {
          targetBeforeMidKnowledge: targetBMK,
          targetBeforeMidSoftSkill: targetBMS,
          targetMidterm: targetMid,
          targetAfterMidKnowledge: targetAMK,
          targetAfterMidSoftSkill: targetAMS,
          targetFinal: targetFin,
          updatedAt: new Date().toISOString()
        },
        applyToAll
      );
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'เกิดข้อผิดพลาดในการบันทึกสัดส่วนคะแนน');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-800">ตั้งค่าโครงสร้างและสัดส่วนคะแนน</h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  มาตรฐานรวมทุกรายวิชา
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                กำหนดสัดส่วนคะแนนเต็มมาตรฐานกลางของโรงเรียนสำหรับใช้ในการวัดผลและตัดเกรดทุกวิชา
                {academicYear ? ` (ปีการศึกษา ${academicYear}${semester ? ` ภาคเรียนที่ ${semester}` : ''})` : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/60">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Educational Principle Notice */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <strong className="font-bold">หลักการจัดการสัดส่วนคะแนน:</strong> การตั้งค่าในหน้านี้เป็น <strong>"สัดส่วนคะแนนมาตรฐานกลาง"</strong> ที่บังคับใช้กับทุกรายวิชาและระดับชั้น เพื่อความเท่าเทียมและเป็นมาตรฐานเดียวกัน ส่วนคะแนนกิจกรรมย่อย ชิ้นงาน และใบงาน ครูผู้สอนสามารถเข้าไปจัดการในแต่ละวิชาได้แยกต่างหากผ่านปุ่ม <strong>"ตั้งค่ากิจกรรมเก็บคะแนน"</strong>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>เลือกสัดส่วนคะแนนมาตรฐานสำเร็จรูป:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((p, idx) => {
                const isActive = targetBMK === p.bmk && targetBMS === p.bms && targetMid === p.mid && targetAMK === p.amk && targetAMS === p.ams && targetFin === p.fin;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`text-left p-3 rounded-xl border text-xs transition-all ${
                      isActive 
                        ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 ring-1 ring-indigo-400 font-semibold' 
                        : 'bg-white border-slate-200 hover:border-indigo-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      <span>{p.name}</span>
                      {isActive && <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Overall Proportion Summary Card */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span>สรุปสัดส่วนคะแนนมาตรฐานรวม</span>
                {totalAll === 100 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" /> ครบ 100 คะแนน
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertCircle className="h-3 w-3" /> รวม {totalAll} คะแนน
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-500">เก็บระหว่างเรียน: <strong className="text-indigo-600 font-bold">{totalCoursework}</strong></span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">สอบวัดผล: <strong className="text-amber-600 font-bold">{totalExams}</strong></span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">รวมทั้งสิ้น: <strong className={`font-black ${totalAll === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{totalAll}</strong></span>
              </div>
            </div>

            {/* Proportion Visualization Bar */}
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div style={{ width: `${(targetBMK / Math.max(1, totalAll)) * 100}%` }} className="bg-emerald-500 h-full transition-all" title={`ความรู้ก่อนกลาง: ${targetBMK}`} />
              <div style={{ width: `${(targetBMS / Math.max(1, totalAll)) * 100}%` }} className="bg-emerald-300 h-full transition-all" title={`จิตพิสัยก่อนกลาง: ${targetBMS}`} />
              <div style={{ width: `${(targetMid / Math.max(1, totalAll)) * 100}%` }} className="bg-amber-400 h-full transition-all" title={`สอบกลางภาค: ${targetMid}`} />
              <div style={{ width: `${(targetAMK / Math.max(1, totalAll)) * 100}%` }} className="bg-indigo-500 h-full transition-all" title={`ความรู้หลังกลาง: ${targetAMK}`} />
              <div style={{ width: `${(targetAMS / Math.max(1, totalAll)) * 100}%` }} className="bg-indigo-300 h-full transition-all" title={`จิตพิสัยหลังกลาง: ${targetAMS}`} />
              <div style={{ width: `${(targetFin / Math.max(1, totalAll)) * 100}%` }} className="bg-rose-500 h-full transition-all" title={`สอบปลายภาค: ${targetFin}`} />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" /> ความรู้ก่อนกลาง ({targetBMK})</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-300 shrink-0" /> จิตพิสัยก่อนกลาง ({targetBMS})</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" /> สอบกลางภาค ({targetMid})</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" /> ความรู้หลังกลาง ({targetAMK})</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-300 shrink-0" /> จิตพิสัยหลังกลาง ({targetAMS})</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" /> สอบปลายภาค ({targetFin})</div>
            </div>
          </div>

          {/* Form Fields: Two Columns (Before Midterm vs After Midterm) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Column 1: ช่วงก่อนกลางภาค และ สอบกลางภาค */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  ช่วงก่อนกลางภาค (Before Midterm)
                </h4>
                <p className="text-[11px] text-slate-400">สัดส่วนคะแนนเก็บและสอบกลางภาค</p>
              </div>

              {/* BMK */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/40 border border-emerald-100">
                <div>
                  <div className="text-xs font-bold text-slate-700">1. ความรู้ก่อนกลางภาค (Knowledge)</div>
                  <div className="text-[11px] text-slate-500">แบบฝึกหัด ชิ้นงาน ใบงาน การทดสอบย่อย</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={targetBMK}
                    onChange={(e) => setTargetBMK(Math.max(0, Number(e.target.value)))}
                    className="w-16 px-2 py-1.5 bg-white border border-emerald-300 rounded-lg text-center text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-xs text-slate-500">คะแนน</span>
                </div>
              </div>

              {/* BMS */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/30 border border-emerald-100">
                <div>
                  <div className="text-xs font-bold text-slate-700">2. จิตพิสัยก่อนกลางภาค (Soft Skills)</div>
                  <div className="text-[11px] text-slate-500">การเข้าเรียน ความรับผิดชอบ พฤติกรรม</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={targetBMS}
                    onChange={(e) => setTargetBMS(Math.max(0, Number(e.target.value)))}
                    className="w-16 px-2 py-1.5 bg-white border border-emerald-300 rounded-lg text-center text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-xs text-slate-500">คะแนน</span>
                </div>
              </div>

              {/* Midterm */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/60 border border-amber-200">
                <div>
                  <div className="text-xs font-bold text-amber-900">3. สอบกลางภาค (Midterm Exam)</div>
                  <div className="text-[11px] text-amber-700">การสอบวัดผลกลางภาคเรียน</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={targetMid}
                    onChange={(e) => setTargetMid(Math.max(0, Number(e.target.value)))}
                    className="w-16 px-2 py-1.5 bg-white border border-amber-300 rounded-lg text-center text-sm font-bold text-amber-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <span className="text-xs text-amber-800">คะแนน</span>
                </div>
              </div>
            </div>

            {/* Column 2: ช่วงหลังกลางภาค และ สอบปลายภาค */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  ช่วงหลังกลางภาค (After Midterm)
                </h4>
                <p className="text-[11px] text-slate-400">สัดส่วนคะแนนเก็บและสอบปลายภาค</p>
              </div>

              {/* AMK */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-50/40 border border-indigo-100">
                <div>
                  <div className="text-xs font-bold text-slate-700">4. ความรู้หลังกลางภาค (Knowledge)</div>
                  <div className="text-[11px] text-slate-500">ชิ้นงาน โครงงาน แบบฝึกหัด การทดสอบย่อย</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={targetAMK}
                    onChange={(e) => setTargetAMK(Math.max(0, Number(e.target.value)))}
                    className="w-16 px-2 py-1.5 bg-white border border-indigo-300 rounded-lg text-center text-sm font-bold text-indigo-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <span className="text-xs text-slate-500">คะแนน</span>
                </div>
              </div>

              {/* AMS */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-50/30 border border-indigo-100">
                <div>
                  <div className="text-xs font-bold text-slate-700">5. จิตพิสัยหลังกลางภาค (Soft Skills)</div>
                  <div className="text-[11px] text-slate-500">วินัย การทำงานกลุ่ม พฤติกรรม</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={targetAMS}
                    onChange={(e) => setTargetAMS(Math.max(0, Number(e.target.value)))}
                    className="w-16 px-2 py-1.5 bg-white border border-indigo-300 rounded-lg text-center text-sm font-bold text-indigo-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <span className="text-xs text-slate-500">คะแนน</span>
                </div>
              </div>

              {/* Final */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50/60 border border-rose-200">
                <div>
                  <div className="text-xs font-bold text-rose-900">6. สอบปลายภาค (Final Exam)</div>
                  <div className="text-[11px] text-rose-700">การสอบวัดผลสัมฤทธิ์ปลายภาคเรียน</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={targetFin}
                    onChange={(e) => setTargetFin(Math.max(0, Number(e.target.value)))}
                    className="w-16 px-2 py-1.5 bg-white border border-rose-300 rounded-lg text-center text-sm font-bold text-rose-900 focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                  <span className="text-xs text-rose-800">คะแนน</span>
                </div>
              </div>
            </div>

          </div>

          {/* Sync All Subjects Checkbox */}
          <div className="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl flex items-center justify-between gap-3">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 text-indigo-600" />
                  ปรับใช้สัดส่วนมาตรฐานนี้กับทุกรายวิชาในระบบทันที
                </div>
                <div className="text-[11px] text-indigo-800/80 mt-0.5">
                  ระบบจะอัปเดตสัดส่วนคะแนนเต็มให้กับทุกรายวิชาที่มีอยู่แล้ว เพื่อให้โครงสร้างสัดส่วนตรงกันทั้งโรงเรียน
                </div>
              </div>
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white">
          <div className="text-xs text-slate-500">
            * สัดส่วนคะแนนรวมแนะนำคือ 100 คะแนน (ปัจจุบัน: <strong className={totalAll === 100 ? 'text-emerald-600' : 'text-amber-600'}>{totalAll}</strong>)
          </div>
          <div className="flex gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isReadOnly}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'กำลังบันทึกมาตรฐาน...' : 'บันทึกสัดส่วนคะแนนมาตรฐาน'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
