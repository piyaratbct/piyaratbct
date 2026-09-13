import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CurriculumSubject, GRADE_LEVELS, BASE_GRADE_LEVELS } from '../types';
import { Plus, Edit, Trash2, Loader2, X, AlertCircle } from 'lucide-react';

export interface IntegratedUnit {
  id: string;
  name: string;
  gradeLevel: string;
  hours: number;
  score: number;
  description: string;
  subjectIds?: string[];
  indicators: {
    subjectId: string;
    subjectName: string;
    code: string;
    description: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface Props {
  canEdit: boolean;
  curriculums: CurriculumSubject[];
}

export const IntegratedUnitBuilder: React.FC<Props> = ({ canEdit, curriculums }) => {
  const [units, setUnits] = useState<IntegratedUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Partial<IntegratedUnit>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [gradeFilter, setGradeFilter] = useState<string>(BASE_GRADE_LEVELS[0]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'integratedUnits'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => doc.data() as IntegratedUnit);
      setUnits(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'integratedUnits');
    } finally {
      setIsLoading(false);
    }
  };

  const getBaseGradeLevel = (grade: string) => {
    return grade ? grade.split('/')[0].trim() : '';
  };

  const selectedGrade = editingUnit.gradeLevel || gradeFilter;
  const baseSelectedGrade = getBaseGradeLevel(selectedGrade);

  const availableSubjectsForGrade = curriculums.filter(c => getBaseGradeLevel(c.gradeLevel) === baseSelectedGrade);

  const toggleSubject = (subjectId: string) => {
    const currentSubjectIds = editingUnit.subjectIds || [];
    if (currentSubjectIds.includes(subjectId)) {
      setEditingUnit({
        ...editingUnit,
        subjectIds: currentSubjectIds.filter(id => id !== subjectId),
        indicators: (editingUnit.indicators || []).filter(i => i.subjectId !== subjectId)
      });
    } else {
      setEditingUnit({
        ...editingUnit,
        subjectIds: [...currentSubjectIds, subjectId]
      });
    }
  };

  const toggleIndicator = (subjectId: string, subjectName: string, indCode: string, indDesc: string) => {
    const currentList = editingUnit.indicators || [];
    const exists = currentList.find(i => i.code === indCode && i.subjectId === subjectId);
    
    if (exists) {
      setEditingUnit({
        ...editingUnit,
        indicators: currentList.filter(i => !(i.code === indCode && i.subjectId === subjectId))
      });
    } else {
      setEditingUnit({
        ...editingUnit,
        indicators: [...currentList, { subjectId, subjectName, code: indCode, description: indDesc }]
      });
    }
  };

  const handleSave = async () => {
    if (!editingUnit.name || !editingUnit.gradeLevel) {
      alert('กรุณากรอกชื่อหน่วยการเรียนรู้ และระดับชั้น');
      return;
    }
    
    // Automatically infer subjectIds if not explicitly selected but indicators exist (for backward compatibility)
    const inferredSubjectIds = Array.from(new Set((editingUnit.indicators || []).map(i => i.subjectId)));
    const finalSubjectIds = Array.from(new Set([...(editingUnit.subjectIds || []), ...inferredSubjectIds]));

    setIsSaving(true);
    try {
      const isNew = !editingUnit.id;
      const id = isNew ? `int-unit-${Date.now()}` : editingUnit.id!;
      const payload: IntegratedUnit = {
        id,
        name: editingUnit.name || '',
        gradeLevel: editingUnit.gradeLevel || '',
        hours: Number(editingUnit.hours) || 0,
        score: Number(editingUnit.score) || 0,
        description: editingUnit.description || '',
        subjectIds: finalSubjectIds,
        indicators: editingUnit.indicators || [],
        createdAt: isNew ? new Date().toISOString() : (editingUnit.createdAt || new Date().toISOString()),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'integratedUnits', id), payload);
      await fetchUnits();
      setShowForm(false);
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteDoc(doc(db, 'integratedUnits', deleteConfirmId));
      await fetchUnits();
      setDeleteConfirmId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'integratedUnits');
      alert('เกิดข้อผิดพลาดในการลบข้อมูล กรุณาลองใหม่อีกครั้ง');
    }
  };

  const filteredUnits = units.filter(u => u.gradeLevel === gradeFilter);

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;
  }

  if (showForm) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-800">
              {editingUnit.id ? 'แก้ไขหน่วยบูรณาการ (PBL)' : 'สร้างหน่วยบูรณาการใหม่ (Integrated PBL)'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">กำหนดธีมหลัก และดึงตัวชี้วัดจากหลายวิชามามัดรวมกัน</p>
          </div>
          <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อหน่วยการเรียนรู้ / Theme <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={editingUnit.name || ''} 
              onChange={e => setEditingUnit({...editingUnit, name: e.target.value})}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              placeholder="เช่น ของเล่นรักษ์โลก, Smart City"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">ระดับชั้น <span className="text-red-500">*</span></label>
            <select 
              value={editingUnit.gradeLevel || gradeFilter} 
              onChange={e => setEditingUnit({...editingUnit, gradeLevel: e.target.value, indicators: [], subjectIds: []})}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              {BASE_GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">เวลาเรียนรวม (ชั่วโมง)</label>
            <input 
              type="number" 
              value={editingUnit.hours || 0} 
              onChange={e => setEditingUnit({...editingUnit, hours: Number(e.target.value)})}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">คะแนนเก็บ (คะแนน)</label>
            <input 
              type="number" 
              value={editingUnit.score || 0} 
              onChange={e => setEditingUnit({...editingUnit, score: Number(e.target.value)})}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              min="0"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1">คำอธิบาย/เป้าหมายของหน่วย</label>
            <textarea 
              value={editingUnit.description || ''} 
              onChange={e => setEditingUnit({...editingUnit, description: e.target.value})}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              rows={2}
            />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            1. เลือกรายวิชาที่ต้องการบูรณาการ
          </h4>
          <p className="text-sm text-slate-500 mb-4">คลิกเลือกวิชาตั้งแต่ 2 วิชาขึ้นไป เพื่อนำมาสร้างธีมหน่วยบูรณาการสำหรับระดับชั้น {editingUnit.gradeLevel || gradeFilter}</p>
          
          <div className="flex flex-wrap gap-3 mb-8">
            {availableSubjectsForGrade.length === 0 ? (
               <div className="p-4 bg-amber-50 text-amber-700 rounded-lg text-sm border border-amber-200 flex items-start gap-2 w-full">
                 <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                 ไม่มีข้อมูลรายวิชาและตัวชี้วัดสำหรับระดับชั้นนี้ โปรดนำเข้าตัวชี้วัดในโหมด "รายวิชาเดี่ยว" ก่อน
               </div>
            ) : (
              availableSubjectsForGrade.map(subject => {
                const isSelected = (editingUnit.subjectIds || []).includes(subject.id);
                return (
                  <button
                    type="button"
                    key={subject.id}
                    onClick={() => toggleSubject(subject.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors flex items-center gap-2 ${isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50'}`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                      {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    {subject.subjectName}
                  </button>
                );
              })
            )}
          </div>

          {(editingUnit.subjectIds || []).length > 0 && (
            <div className="border-t border-slate-100 pt-6 animate-in fade-in duration-300">
              <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                2. ตะกร้าตัวชี้วัดบูรณาการ
              </h4>
              <p className="text-sm text-slate-500 mb-4">คลิกเลือกตัวชี้วัดที่ตรงกับธีม จากรายวิชาที่คุณครูเลือกไว้ด้านบน</p>
              
              <div className="grid grid-cols-1 gap-6">
                {availableSubjectsForGrade.filter(s => (editingUnit.subjectIds || []).includes(s.id)).map(subject => {
                  const subjectIndicators = subject.standards.flatMap(s => s.indicators);
                  if (subjectIndicators.length === 0) return null;
                  
                  const selectedCount = (editingUnit.indicators || []).filter(i => i.subjectId === subject.id).length;

                  return (
                    <div key={subject.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                        <div className="font-bold text-slate-800">
                          {subject.subjectName}
                          <span className="ml-2 text-xs font-normal text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                            {selectedCount} / {subjectIndicators.length} ตัวชี้วัดที่เลือก
                          </span>
                        </div>
                      </div>
                      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                        {subjectIndicators.map(ind => {
                          const isSelected = (editingUnit.indicators || []).some(i => i.code === ind.code && i.subjectId === subject.id);
                          return (
                            <div 
                              key={ind.code}
                              onClick={() => toggleIndicator(subject.id, subject.subjectName, ind.code, ind.description)}
                              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                            >
                              <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              <div>
                                <div className="font-bold text-sm text-slate-800">{ind.code}</div>
                                <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">{ind.description}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button onClick={() => setShowForm(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
            ยกเลิก
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            บันทึกหน่วยบูรณาการ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[calc(100vh-200px)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-800">คลังหน่วยการเรียนรู้บูรณาการ (PBL)</h3>
            <p className="text-slate-500 text-sm mt-1">ออกแบบธีมข้ามรายวิชาสำหรับจัดการเรียนการสอนแบบ Project-Based Learning</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {BASE_GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            {canEdit && (
              <button 
                onClick={() => {
                  setEditingUnit({ gradeLevel: gradeFilter, indicators: [] });
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> สร้างหน่วยบูรณาการ
              </button>
            )}
          </div>
        </div>

        {filteredUnits.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-slate-500 font-bold mb-2">ยังไม่มีหน่วยบูรณาการสำหรับระดับชั้นนี้</p>
            <p className="text-slate-400 text-sm">สร้างหน่วยบูรณาการเพื่อมัดรวมตัวชี้วัดจากหลายวิชาให้ครูผู้สอนใช้งานได้สะดวกขึ้น</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredUnits.map(unit => {
              // Group indicators by subject for display
              const grouped = (unit.indicators || []).reduce((acc, curr) => {
                if (!acc[curr.subjectName]) acc[curr.subjectName] = [];
                acc[curr.subjectName].push(curr);
                return acc;
              }, {} as Record<string, typeof unit.indicators>);

              return (
                <div key={unit.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:border-indigo-200 transition-colors">
                  <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-indigo-900">{unit.name}</h4>
                      <p className="text-sm text-slate-500 mt-1">{unit.description || 'ไม่มีคำอธิบาย'}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600">
                          เวลาเรียน {unit.hours} ชั่วโมง
                        </span>
                        <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600">
                          คะแนนเก็บ {unit.score} คะแนน
                        </span>
                        <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-700">
                          รวม {(unit.indicators || []).length} ตัวชี้วัด
                        </span>
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => { 
                          const inferredSubjectIds = Array.from(new Set((unit.indicators || []).map(i => i.subjectId)));
                          const finalSubjectIds = Array.from(new Set([...(unit.subjectIds || []), ...inferredSubjectIds]));
                          setEditingUnit({ ...unit, subjectIds: finalSubjectIds }); 
                          setShowForm(true); 
                        }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(unit.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {unit.indicators && unit.indicators.length > 0 && (
                    <div className="p-5">
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">องค์ประกอบวิชาที่บูรณาการ</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(grouped).map(([subjName, inds]) => (
                          <div key={subjName} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <div className="font-bold text-sm text-slate-700 mb-2 border-b border-slate-200 pb-1">{subjName}</div>
                            <div className="flex flex-wrap gap-1.5">
                              {(inds as any[]).map(ind => (
                                <span key={ind.code} title={ind.description} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 shadow-sm cursor-help">
                                  {ind.code}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-rose-500" />
              ยืนยันการลบข้อมูล
            </h3>
            <p className="text-slate-600 mb-6">
              คุณต้องการลบหน่วยบูรณาการนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
