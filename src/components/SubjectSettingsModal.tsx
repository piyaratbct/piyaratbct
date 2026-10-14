import React, { useState, useEffect } from 'react';
import { SubjectSettings, ActivityColumn } from '../types';
import { X, Plus, Trash2, Save, AlertCircle, Sliders, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: SubjectSettings;
  onSave: (newSettings: SubjectSettings) => void;
}

export const SubjectSettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<SubjectSettings>(settings);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalSettings({
      ...settings,
      targetBeforeMidKnowledge: settings.targetBeforeMidKnowledge ?? 20,
      targetBeforeMidSoftSkill: settings.targetBeforeMidSoftSkill ?? 10,
      targetAfterMidKnowledge: settings.targetAfterMidKnowledge ?? 20,
      targetAfterMidSoftSkill: settings.targetAfterMidSoftSkill ?? 10,
      targetMidterm: settings.targetMidterm ?? 20,
      targetFinal: settings.targetFinal ?? 20,
    });
  }, [settings]);

  if (!isOpen) return null;

  const targetBMK = localSettings.targetBeforeMidKnowledge ?? 20;
  const targetBMS = localSettings.targetBeforeMidSoftSkill ?? 10;
  const targetAMK = localSettings.targetAfterMidKnowledge ?? 20;
  const targetAMS = localSettings.targetAfterMidSoftSkill ?? 10;
  const targetMid = localSettings.targetMidterm ?? 20;
  const targetFin = localSettings.targetFinal ?? 20;

  const totalCoursework = targetBMK + targetBMS + targetAMK + targetAMS;
  const totalAll100 = totalCoursework + targetMid + targetFin;

  const addColumn = (category: 'beforeMidKnowledge' | 'beforeMidSoftSkill' | 'afterMidKnowledge' | 'afterMidSoftSkill') => {
    const newCol: ActivityColumn = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `กิจกรรมใหม่`,
      maxScore: 10
    };
    setLocalSettings(prev => ({
      ...prev,
      [category]: [...prev[category], newCol]
    }));
  };

  const removeColumn = (category: 'beforeMidKnowledge' | 'beforeMidSoftSkill' | 'afterMidKnowledge' | 'afterMidSoftSkill', id: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: prev[category].filter(c => c.id !== id)
    }));
  };

  const updateColumn = (category: 'beforeMidKnowledge' | 'beforeMidSoftSkill' | 'afterMidKnowledge' | 'afterMidSoftSkill', id: string, field: 'name' | 'maxScore', value: string | number) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: prev[category].map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const updateTargetScore = (field: 'targetBeforeMidKnowledge' | 'targetBeforeMidSoftSkill' | 'targetAfterMidKnowledge' | 'targetAfterMidSoftSkill' | 'targetMidterm' | 'targetFinal', value: number) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: Math.max(0, value)
    }));
  };

  const handleSave = () => {
    // Validate target scores
    if (targetBMK < 0 || targetBMS < 0 || targetAMK < 0 || targetAMS < 0 || targetMid < 0 || targetFin < 0) {
      setError('สัดส่วนคะแนนเต็มของแต่ละหมวดต้องเป็นจำนวนเต็มหรือทศนิยมที่ไม่ติดลบ');
      return;
    }

    if (totalAll100 !== 100) {
      const confirmSave = window.confirm(
        `คำเตือน: ยอดรวมสัดส่วนคะแนนทั้งรายวิชาปัจจุบันเท่ากับ ${totalAll100} คะแนน (แนะนำคือ 100 คะแนน)\nท่านต้องการบันทึกสัดส่วนนี้ต่อไปหรือไม่?`
      );
      if (!confirmSave) {
        return;
      }
    }

    // Validate that all activities have a valid name and maxScore > 0
    const allActivities = [
      ...localSettings.beforeMidKnowledge,
      ...localSettings.beforeMidSoftSkill,
      ...localSettings.afterMidKnowledge,
      ...localSettings.afterMidSoftSkill
    ];

    for (const act of allActivities) {
      if (!act.name.trim()) {
        setError('กรุณาระบุชื่อกิจกรรมให้ครบถ้วนทุกช่อง');
        return;
      }
      if (Number(act.maxScore) <= 0 || isNaN(Number(act.maxScore))) {
        setError(`คะแนนเต็มของกิจกรรม "${act.name}" ต้องมากกว่า 0 คะแนน`);
        return;
      }
    }

    setError(null);
    onSave({
      ...localSettings,
      targetBeforeMidKnowledge: targetBMK,
      targetBeforeMidSoftSkill: targetBMS,
      targetAfterMidKnowledge: targetAMK,
      targetAfterMidSoftSkill: targetAMS,
      targetMidterm: targetMid,
      targetFinal: targetFin
    });
  };

  const renderSection = (
    title: string, 
    category: 'beforeMidKnowledge' | 'beforeMidSoftSkill' | 'afterMidKnowledge' | 'afterMidSoftSkill', 
    targetScoreKey: 'targetBeforeMidKnowledge' | 'targetBeforeMidSoftSkill' | 'targetAfterMidKnowledge' | 'targetAfterMidSoftSkill',
    targetValue: number, 
    colorClass: string,
    accentBg: string
  ) => {
    const currentSum = localSettings[category].reduce((acc, c) => acc + Number(c.maxScore), 0);

    return (
      <div className={`p-4 rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${accentBg}`} />
              {title}
            </h4>
            <div className="text-xs text-slate-500 mt-0.5">
              คะแนนดิบรวมของกิจกรรม: <span className="font-semibold text-slate-700">{currentSum}</span> คะแนน
            </div>
          </div>

          {/* Editable target weight */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">สัดส่วนคะแนนเต็มหมวด:</span>
            <input 
              type="number"
              min={0}
              max={100}
              value={targetValue}
              onChange={(e) => updateTargetScore(targetScoreKey, Number(e.target.value))}
              className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-center text-sm font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              title="สัดส่วนคะแนนเต็มจริงที่จะนำไปคำนวณตัดเกรด"
            />
            <span className="text-xs text-slate-500">คะแนน</span>
          </div>
        </div>
        
        <div className="space-y-2.5">
          <div className="text-[11px] text-slate-400 flex justify-between px-1">
            <span>รายการกิจกรรมย่อย / ใบงาน / ชิ้นงาน</span>
            <span>คะแนนดิบ</span>
          </div>
          {localSettings[category].map((col, idx) => (
            <div key={col.id} className="flex gap-2 items-center">
              <div className="text-xs font-semibold text-slate-400 w-5 text-right">{idx + 1}.</div>
              <input 
                type="text" 
                value={col.name}
                onChange={(e) => updateColumn(category, col.id, 'name', e.target.value)}
                className="flex-1 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none hover:border-slate-300 transition-colors"
                placeholder="ชื่อกิจกรรม / ชิ้นงาน"
              />
              <input 
                type="number" 
                value={col.maxScore}
                onChange={(e) => updateColumn(category, col.id, 'maxScore', Number(e.target.value))}
                className="w-20 border border-slate-200 rounded-lg p-2 text-sm text-center font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none hover:border-slate-300 transition-colors"
                placeholder="คะแนน"
              />
              <button 
                type="button"
                onClick={() => removeColumn(category, col.id)}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                title="ลบกิจกรรมนี้"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button 
            type="button"
            onClick={() => addColumn(category)}
            className={`flex items-center gap-1.5 text-xs font-bold mt-2 py-1.5 px-2.5 rounded-lg border border-dashed border-slate-300 hover:border-indigo-400 ${colorClass} hover:bg-slate-50 transition-all`}
          >
            <Plus className="h-3.5 w-3.5" /> เพิ่มกิจกรรมย่อย
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">ตั้งค่าโครงสร้างและสัดส่วนคะแนน</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                กำหนดสัดส่วนคะแนนเต็มของแต่ละหมวด และกิจกรรมเก็บคะแนน ({settings.gradeLevel} - {settings.subject})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/70">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Overall Score Proportion Summary Card */}
          <div className="p-4 rounded-xl bg-white border border-indigo-100 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span>สรุปสัดส่วนคะแนนรวมของรายวิชา</span>
                  {totalAll100 === 100 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" /> ครบ 100 คะแนนพอดี
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertCircle className="h-3 w-3" /> ยอดรวมปัจจุบัน: {totalAll100} คะแนน
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ท่านสามารถปรับสัดส่วนคะแนนเต็มของแต่ละหมวดได้ตามโครงสร้างหลักสูตรของโรงเรียน (ระบบจะเทียบอัตราส่วนคะแนนดิบให้อัตโนมัติ)
                </p>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500">คะแนนเก็บระหว่างเรียน: </span>
                  <strong className="text-indigo-600 font-bold">{totalCoursework}</strong>
                </div>
                <div className="border-l border-slate-300 pl-3">
                  <span className="text-slate-500">สอบวัดผล: </span>
                  <strong className="text-indigo-600 font-bold">{targetMid + targetFin}</strong>
                </div>
                <div className="border-l border-slate-300 pl-3">
                  <span className="text-slate-500">รวมทั้งสิ้น: </span>
                  <strong className={`font-black text-sm ${totalAll100 === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{totalAll100}</strong>
                </div>
              </div>
            </div>

            {/* Examination Weights (Midterm & Final) */}
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 border border-amber-200/60">
                <div>
                  <div className="text-xs font-bold text-amber-900">คะแนนเต็มสอบกลางภาค (Midterm)</div>
                  <div className="text-[11px] text-amber-700">สำหรับการสอบวัดผลกลางภาคเรียน</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <input 
                    type="number"
                    min={0}
                    max={100}
                    value={targetMid}
                    onChange={(e) => updateTargetScore('targetMidterm', Number(e.target.value))}
                    className="w-16 px-2 py-1 bg-white border border-amber-300 rounded text-center text-sm font-bold text-amber-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <span className="text-xs text-amber-800">คะแนน</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50/50 border border-rose-200/60">
                <div>
                  <div className="text-xs font-bold text-rose-900">คะแนนเต็มสอบปลายภาค (Final)</div>
                  <div className="text-[11px] text-rose-700">สำหรับการสอบวัดผลปลายภาคเรียน</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <input 
                    type="number"
                    min={0}
                    max={100}
                    value={targetFin}
                    onChange={(e) => updateTargetScore('targetFinal', Number(e.target.value))}
                    className="w-16 px-2 py-1 bg-white border border-rose-300 rounded text-center text-sm font-bold text-rose-900 focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                  <span className="text-xs text-rose-800">คะแนน</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Category Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {renderSection(
                "ความรู้ก่อนกลางภาค (Knowledge)", 
                "beforeMidKnowledge", 
                "targetBeforeMidKnowledge",
                targetBMK, 
                "text-emerald-600 hover:text-emerald-700",
                "bg-emerald-500"
              )}
              {renderSection(
                "จิตพิสัยก่อนกลางภาค (Soft Skills)", 
                "beforeMidSoftSkill", 
                "targetBeforeMidSoftSkill",
                targetBMS, 
                "text-emerald-600 hover:text-emerald-700",
                "bg-emerald-400"
              )}
            </div>
            <div className="space-y-6">
              {renderSection(
                "ความรู้หลังกลางภาค (Knowledge)", 
                "afterMidKnowledge", 
                "targetAfterMidKnowledge",
                targetAMK, 
                "text-indigo-600 hover:text-indigo-700",
                "bg-indigo-500"
              )}
              {renderSection(
                "จิตพิสัยหลังกลางภาค (Soft Skills)", 
                "afterMidSoftSkill", 
                "targetAfterMidSoftSkill",
                targetAMS, 
                "text-indigo-600 hover:text-indigo-700",
                "bg-indigo-400"
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white rounded-b-2xl">
          <div className="text-xs text-slate-500">
            * ระบบจะคำนวณสัดส่วนคะแนนของนักเรียนทุกคนโดยอัตโนมัติตามสัดส่วนคะแนนเต็มที่ตั้งไว้
          </div>
          <div className="flex gap-2.5 w-full sm:w-auto">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button 
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow transition-all"
            >
              <Save className="h-4 w-4" />
              บันทึกโครงสร้างสัดส่วนคะแนน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
