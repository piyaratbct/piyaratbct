import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CurriculumSubject, SubjectUnit, CurriculumIndicator } from '../types';
import { Plus, Edit, Trash2, Loader2, X, Clock, Target, Percent } from 'lucide-react';

interface SubjectUnitBuilderProps {
  subject: CurriculumSubject;
  onUpdate: () => void;
  canEdit: boolean;
}

export const SubjectUnitBuilder: React.FC<SubjectUnitBuilderProps> = ({ subject, onUpdate, canEdit }) => {
  const [units, setUnits] = useState<SubjectUnit[]>(subject.units || []);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Partial<SubjectUnit>>({});
  
  // All indicators available for this subject
  const availableIndicators = subject.standards.reduce((acc, std) => {
    return [...acc, ...std.indicators];
  }, [] as CurriculumIndicator[]);

  const handleSaveUnit = async () => {
    if (!editingUnit.name) {
      alert('กรุณากรอกชื่อหน่วยการเรียนรู้');
      return;
    }
    
    const newUnit: SubjectUnit = {
      id: editingUnit.id || `unit-${Date.now()}`,
      name: editingUnit.name || '',
      hours: editingUnit.hours || 0,
      score: editingUnit.score || 0,
      indicators: editingUnit.indicators || []
    };

    let updatedUnits = [...units];
    if (editingUnit.id) {
      updatedUnits = updatedUnits.map(u => u.id === editingUnit.id ? newUnit : u);
    } else {
      updatedUnits.push(newUnit);
    }

    setIsSaving(true);
    try {
      await setDoc(doc(db, 'curriculums', subject.id), {
        ...subject,
        units: updatedUnits,
        updatedAt: new Date().toISOString()
      });
      setUnits(updatedUnits);
      setShowForm(false);
      onUpdate();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'curriculums');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUnit = async (id: string) => {
    if (!confirm('ยืนยันการลบหน่วยการเรียนรู้นี้?')) return;
    
    const updatedUnits = units.filter(u => u.id !== id);
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'curriculums', subject.id), {
        ...subject,
        units: updatedUnits,
        updatedAt: new Date().toISOString()
      });
      setUnits(updatedUnits);
      onUpdate();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'curriculums');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleIndicator = (indicatorCode: string) => {
    const currentIndicators = editingUnit.indicators || [];
    if (currentIndicators.includes(indicatorCode)) {
      setEditingUnit({ ...editingUnit, indicators: currentIndicators.filter(c => c !== indicatorCode) });
    } else {
      setEditingUnit({ ...editingUnit, indicators: [...currentIndicators, indicatorCode] });
    }
  };

  const totalScore = units.reduce((sum, u) => sum + u.score, 0);
  const totalHours = units.reduce((sum, u) => sum + u.hours, 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[calc(100vh-200px)] animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-black text-slate-800">โครงสร้างและหน่วยการเรียนรู้</h3>
          <p className="text-slate-500 text-sm mt-1">จัดกลุ่มตัวชี้วัดเป็นหน่วยการเรียนรู้ กำหนดเวลาและน้ำหนักคะแนน</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => {
              setEditingUnit({ name: '', hours: 0, score: 0, indicators: [] });
              setShowForm(true);
            }}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> สร้างหน่วยการเรียนรู้
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-xl border ${totalScore > 100 ? 'bg-rose-50 border-rose-200 text-rose-700' : totalScore === 100 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
          <div className="text-xs font-bold mb-1 opacity-70">คะแนนเก็บรวม (เป้าหมาย 100)</div>
          <div className="text-2xl font-black">{totalScore} <span className="text-sm font-bold">คะแนน</span></div>
          {totalScore > 100 && <div className="text-xs mt-1">คำเตือน: คะแนนรวมเกิน 100</div>}
        </div>
        <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 text-slate-700">
          <div className="text-xs font-bold mb-1 opacity-70">เวลาเรียนรวม</div>
          <div className="text-2xl font-black">{totalHours} <span className="text-sm font-bold">ชั่วโมง</span></div>
        </div>
      </div>

      {units.length === 0 ? (
        <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-slate-500">ยังไม่มีหน่วยการเรียนรู้</p>
        </div>
      ) : (
        <div className="space-y-4">
          {units.map((unit, index) => (
            <div key={unit.id} className="border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-200 transition-colors bg-white shadow-sm">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </div>
                  {unit.name}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
                    <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-md shadow-sm">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {unit.hours} ชม.
                    </div>
                    <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-1 rounded-md shadow-sm">
                      <Target className="h-4 w-4" />
                      {unit.score} คะแนน
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                      <button onClick={() => {
                        setEditingUnit(unit);
                        setShowForm(true);
                      }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteUnit(unit.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">ตัวชี้วัดที่ประเมินในหน่วยนี้</div>
                {unit.indicators && unit.indicators.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {unit.indicators.map(code => (
                      <span key={code} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold border border-slate-200">
                        {code}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 italic">ไม่มีตัวชี้วัดที่ถูกผูกไว้</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                {editingUnit.id ? 'แก้ไขหน่วยการเรียนรู้' : 'สร้างหน่วยการเรียนรู้'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อหน่วยการเรียนรู้</label>
                <input 
                  type="text"
                  value={editingUnit.name || ''}
                  onChange={e => setEditingUnit({...editingUnit, name: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                  placeholder="เช่น หน่วยที่ 1 จำนวนนับ 1 ถึง 100"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">น้ำหนักคะแนน (คะแนนดิบ)</label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="number"
                      value={editingUnit.score || 0}
                      onChange={e => setEditingUnit({...editingUnit, score: Number(e.target.value)})}
                      className="w-full pl-9 p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">เวลาเรียน (ชั่วโมง)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="number"
                      value={editingUnit.hours || 0}
                      onChange={e => setEditingUnit({...editingUnit, hours: Number(e.target.value)})}
                      className="w-full pl-9 p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-3 border-b border-slate-100 pb-2">
                  ตัวชี้วัดที่ใช้ในหน่วยนี้ (เลือกจากทั้งหมด {availableIndicators.length} ตัวชี้วัด)
                </label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {availableIndicators.length === 0 ? (
                    <div className="text-center p-4 text-slate-500 text-sm bg-slate-50 rounded-lg">วิชานี้ยังไม่ได้เพิ่มตัวชี้วัด</div>
                  ) : (
                    availableIndicators.map(indicator => {
                      const isSelected = editingUnit.indicators?.includes(indicator.code);
                      return (
                        <div 
                          key={indicator.code} 
                          onClick={() => toggleIndicator(indicator.code)}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                            {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-800">{indicator.code}</div>
                            <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">{indicator.description}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                ยกเลิก
              </button>
              <button onClick={handleSaveUnit} disabled={isSaving} className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                บันทึกหน่วยการเรียนรู้
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
