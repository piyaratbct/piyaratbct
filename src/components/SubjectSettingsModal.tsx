import React, { useState, useEffect } from 'react';
import { SubjectSettings, ActivityColumn } from '../types';
import { X, Plus, Trash2, Save, AlertCircle, ListChecks, Info, Sliders, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: SubjectSettings;
  onSave: (newSettings: SubjectSettings) => void;
  onOpenStandardScoreStructure?: () => void;
}

export const SubjectSettingsModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSave,
  onOpenStandardScoreStructure
}) => {
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

  const handleSave = () => {
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
    subtitle: string,
    category: 'beforeMidKnowledge' | 'beforeMidSoftSkill' | 'afterMidKnowledge' | 'afterMidSoftSkill', 
    targetValue: number, 
    colorClass: string,
    accentBg: string
  ) => {
    const currentSum = localSettings[category].reduce((acc, c) => acc + Number(c.maxScore), 0);

    return (
      <div className={`p-4 rounded-xl border border-slate-200 bg-white shadow-xs transition-all hover:border-slate-300`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${accentBg}`} />
              {title}
            </h4>
            <div className="text-[11px] text-slate-400 mt-0.5">{subtitle}</div>
          </div>

          {/* Standard score proportion reference badge */}
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium border border-slate-200">
              คะแนนดิบรวม: <strong className="text-slate-800 font-bold">{currentSum}</strong>
            </span>
            <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-bold border border-indigo-200 flex items-center gap-1">
              สัดส่วนมาตรฐาน: <strong>{targetValue}</strong> คะแนน
            </span>
          </div>
        </div>
        
        <div className="space-y-2.5">
          <div className="text-[11px] text-slate-400 flex justify-between px-1">
            <span>รายการกิจกรรมย่อย / ใบงาน / ชิ้นงาน / แบบฝึกหัด</span>
            <span className="w-24 text-center">คะแนนดิบเต็ม</span>
          </div>
          {localSettings[category].length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
              ยังไม่มีกิจกรรมในหมวดนี้ กรุณากดปุ่ม "เพิ่มกิจกรรมย่อย" ด้านล่าง
            </div>
          ) : (
            localSettings[category].map((col, idx) => (
              <div key={col.id} className="flex gap-2 items-center">
                <div className="text-xs font-semibold text-slate-400 w-5 text-right shrink-0">{idx + 1}.</div>
                <input 
                  type="text" 
                  value={col.name}
                  onChange={(e) => updateColumn(category, col.id, 'name', e.target.value)}
                  className="flex-1 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none hover:border-slate-300 transition-colors bg-white"
                  placeholder="ชื่อกิจกรรม / ชิ้นงาน / ใบงาน"
                />
                <input 
                  type="number" 
                  min={1}
                  value={col.maxScore}
                  onChange={(e) => updateColumn(category, col.id, 'maxScore', Number(e.target.value))}
                  className="w-24 border border-slate-200 rounded-lg p-2 text-sm text-center font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none hover:border-slate-300 transition-colors bg-white shrink-0"
                  placeholder="คะแนน"
                />
                <button 
                  type="button"
                  onClick={() => removeColumn(category, col.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                  title="ลบกิจกรรมนี้"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
          <button 
            type="button"
            onClick={() => addColumn(category)}
            className={`flex items-center gap-1.5 text-xs font-bold mt-2 py-2 px-3 rounded-lg border border-dashed border-slate-300 hover:border-indigo-400 ${colorClass} hover:bg-slate-50 transition-all w-full justify-center`}
          >
            <Plus className="h-4 w-4" /> เพิ่มกิจกรรมย่อย / ชิ้นงาน
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/40 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs">
              <ListChecks className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-800">ตั้งค่ากิจกรรมเก็บคะแนน</h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  {settings.gradeLevel}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                รายวิชา: <strong className="text-slate-700">{settings.subject}</strong> (กำหนดชิ้นงาน ใบงาน และคะแนนดิบของแต่ละกิจกรรม)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/60">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Standard Proportion Reference Banner */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                  สัดส่วนคะแนนอ้างอิงตามโครงสร้างมาตรฐานกลางของโรงเรียน
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  ระบบจะนำคะแนนดิบที่นักเรียนทำได้ในกิจกรรมต่างๆ มาคำนวณสัดส่วนคะแนนตามมาตรฐานโรงเรียนให้อัตโนมัติ
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-500">ก่อนกลาง: <strong className="text-emerald-600">{targetBMK + targetBMS}</strong></span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-500">สอบกลาง: <strong className="text-amber-600">{targetMid}</strong></span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-500">หลังกลาง: <strong className="text-indigo-600">{targetAMK + targetAMS}</strong></span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-500">สอบปลาย: <strong className="text-rose-600">{targetFin}</strong></span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-700 font-bold">รวม {totalAll100}</span>
              </div>
              {onOpenStandardScoreStructure && (
                <button
                  type="button"
                  onClick={onOpenStandardScoreStructure}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
                >
                  <Sliders className="h-3.5 w-3.5" /> ปรับสัดส่วนมาตรฐาน
                </button>
              )}
            </div>
          </div>

          {/* Activity Category Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-5">
              {renderSection(
                "ความรู้ก่อนกลางภาค (Knowledge)", 
                "แบบฝึกหัด ชิ้นงาน ใบงาน และการทดสอบย่อย",
                "beforeMidKnowledge", 
                targetBMK, 
                "text-emerald-600 hover:text-emerald-700",
                "bg-emerald-500"
              )}
              {renderSection(
                "จิตพิสัยก่อนกลางภาค (Soft Skills)", 
                "การส่งงาน ความตรงต่อเวลา ความรับผิดชอบ และพฤติกรรม",
                "beforeMidSoftSkill", 
                targetBMS, 
                "text-emerald-600 hover:text-emerald-700",
                "bg-emerald-400"
              )}
            </div>
            <div className="space-y-5">
              {renderSection(
                "ความรู้หลังกลางภาค (Knowledge)", 
                "ชิ้นงาน โครงงาน แบบฝึกหัด และการทดสอบย่อย",
                "afterMidKnowledge", 
                targetAMK, 
                "text-indigo-600 hover:text-indigo-700",
                "bg-indigo-500"
              )}
              {renderSection(
                "จิตพิสัยหลังกลางภาค (Soft Skills)", 
                "วินัย การมีส่วนร่วมในชั้นเรียน การทำงานกลุ่ม และพฤติกรรม",
                "afterMidSoftSkill", 
                targetAMS, 
                "text-indigo-600 hover:text-indigo-700",
                "bg-indigo-400"
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white">
          <div className="text-xs text-slate-500">
            * ครูผู้สอนสามารถเพิ่มหรือลดจำนวนกิจกรรมย่อยได้อิสระตามแผนการจัดการเรียนรู้ของแต่ละวิชา
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
              บันทึกกิจกรรมเก็บคะแนน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
