import React, { useState, useEffect } from 'react';
import { SubjectSettings, ActivityColumn } from '../types';
import { X, Plus, Trash2, Save, AlertCircle } from 'lucide-react';

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
    setLocalSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  const addColumn = (category: keyof Omit<SubjectSettings, 'id' | 'academicYear' | 'semester' | 'gradeLevel' | 'subject'>) => {
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

  const removeColumn = (category: keyof Omit<SubjectSettings, 'id' | 'academicYear' | 'semester' | 'gradeLevel' | 'subject'>, id: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: prev[category].filter(c => c.id !== id)
    }));
  };

  const updateColumn = (category: keyof Omit<SubjectSettings, 'id' | 'academicYear' | 'semester' | 'gradeLevel' | 'subject'>, id: string, field: 'name' | 'maxScore', value: string | number) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: prev[category].map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const handleSave = () => {
    // Validate
    const sumBMK = localSettings.beforeMidKnowledge.reduce((acc, c) => acc + Number(c.maxScore), 0);
    const sumBMS = localSettings.beforeMidSoftSkill.reduce((acc, c) => acc + Number(c.maxScore), 0);
    const sumAMK = localSettings.afterMidKnowledge.reduce((acc, c) => acc + Number(c.maxScore), 0);
    const sumAMS = localSettings.afterMidSoftSkill.reduce((acc, c) => acc + Number(c.maxScore), 0);



    setError(null);
    onSave(localSettings);
  };

  const renderSection = (
    title: string, 
    category: keyof Omit<SubjectSettings, 'id' | 'academicYear' | 'semester' | 'gradeLevel' | 'subject'>, 
    maxTotal: number, 
    colorClass: string
  ) => {
    const currentSum = localSettings[category].reduce((acc, c) => acc + Number(c.maxScore), 0);
    const isExceeded = currentSum > maxTotal;

    return (
      <div className={`p-4 rounded-xl border border-slate-200 bg-white`}>
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-slate-800">{title}</h4>
          <div className={`text-sm font-bold text-slate-600 text-right`}>
            ดิบรวม: {currentSum}
            <div className="text-xs font-normal text-slate-400">ระบบจะแปลงสัดส่วนให้เป็น {maxTotal}</div>
          </div>
        </div>
        
        <div className="space-y-3">
          {localSettings[category].map((col, idx) => (
            <div key={col.id} className="flex gap-2 items-center">
              <div className="text-sm font-medium text-slate-400 w-6">{idx + 1}.</div>
              <input 
                type="text" 
                value={col.name}
                onChange={(e) => updateColumn(category, col.id, 'name', e.target.value)}
                className="flex-1 border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="ชื่อกิจกรรม"
              />
              <input 
                type="number" 
                value={col.maxScore}
                onChange={(e) => updateColumn(category, col.id, 'maxScore', Number(e.target.value))}
                className="w-20 border border-slate-200 rounded p-2 text-sm text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="คะแนน"
              />
              <button 
                onClick={() => removeColumn(category, col.id)}
                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button 
            onClick={() => addColumn(category)}
            className={`flex items-center gap-1 text-sm font-bold mt-2 ${colorClass}`}
          >
            <Plus className="h-4 w-4" /> เพิ่มกิจกรรม
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-800">ตั้งค่าโครงสร้างคะแนน</h2>
            <p className="text-sm text-slate-500 mt-1">กำหนดสัดส่วนคะแนนระหว่างเรียน ({settings.gradeLevel} - {settings.subject})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {renderSection("ความรู้ก่อนกลางภาค", "beforeMidKnowledge", 20, "text-emerald-600 hover:text-emerald-700")}
              {renderSection("จิตพิสัยก่อนกลางภาค", "beforeMidSoftSkill", 10, "text-emerald-600 hover:text-emerald-700")}
            </div>
            <div className="space-y-6">
              {renderSection("ความรู้หลังกลางภาค", "afterMidKnowledge", 20, "text-indigo-600 hover:text-indigo-700")}
              {renderSection("จิตพิสัยหลังกลางภาค", "afterMidSoftSkill", 10, "text-indigo-600 hover:text-indigo-700")}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </div>
  );
};
