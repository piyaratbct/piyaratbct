import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, setDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { SchoolSubject, GRADE_LEVELS } from '../types';
import { BookOpen, Plus, Edit, Trash2, Loader2, Save, X, ChevronDown, ChevronRight, Layers, Percent } from 'lucide-react';

interface SubjectStructureManagerProps {
  currentUserRole?: string;
}

import { SUBJECTS } from '../types';

export const SubjectStructureManager: React.FC<SubjectStructureManagerProps> = ({ currentUserRole = 'teacher' }) => {
  const canEdit = currentUserRole === "admin" || currentUserRole === "academic" || currentUserRole === "deputy" || currentUserRole === "staff";
  
  const [subjects, setSubjects] = useState<SchoolSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create_parent' | 'edit_parent' | 'create_child' | 'edit_child'>('create_parent');
  const [editingSubject, setEditingSubject] = useState<Partial<SchoolSubject> | null>(null);
  
  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSeedData = async () => {
    if (!confirm('ต้องการดึงข้อมูลจาก "ระบบจัดการหลักสูตรและรายวิชา" มาสร้างเป็นโครงสร้างวิชาหลักหรือไม่?')) return;
    
    setIsSaving(true);
    try {
      // ดึงข้อมูลจาก curriculums
      const curriculumsRef = collection(db, 'curriculums');
      // Remove any orderBy or where clauses just fetch all to avoid index issues
      const q = query(curriculumsRef);
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        alert('ไม่พบข้อมูลรายวิชาในระบบจัดการหลักสูตรและรายวิชา (คุณอาจจะยังไม่ได้อัปโหลดตัวชี้วัด)');
        setIsSaving(false);
        return;
      }

      let count = 0;
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const fullSubjectName = data.subjectName || 'วิชาไม่มีชื่อ';
        
        // ลองสกัดรหัสวิชาจากวงเล็บ เช่น "คณิตศาสตร์พื้นฐาน (ค11101)" -> รหัส "ค11101", ชื่อ "คณิตศาสตร์พื้นฐาน"
        let subjectCode = data.subjectCode || '';
        let name = fullSubjectName;
        
        if (!subjectCode) {
          const match = fullSubjectName.match(/\(([^)]+)\)$/);
          if (match) {
            subjectCode = match[1].trim();
            name = fullSubjectName.replace(match[0], '').trim();
          } else {
            subjectCode = 'รหัส-' + Math.floor(Math.random() * 10000);
          }
        }

        const docId = subjectCode.replace(/[^a-zA-Z0-9-]/g, '') + '-' + Date.now().toString().slice(-4);
        
        const subjectData = {
          id: docId,
          subjectCode: subjectCode,
          name: name,
          gradeLevel: data.gradeLevel || 'ประถมศึกษาปีที่ 1',
          isParent: true,
          parentId: null,
          weightPercentage: 0,
          totalHours: 80, // ค่าเริ่มต้น
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await setDoc(doc(db, 'schoolSubjects', docId), subjectData);
        count++;
      }
      
      alert(`ดึงข้อมูลสำเร็จ! สร้างวิชาหลักจำนวน ${count} วิชา\nคุณสามารถกดเพิ่มวิชาย่อย (Child Subject) ให้กับวิชาเหล่านี้ได้เลย`);
      fetchSubjects();
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาด: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsSaving(false);
    }
  };

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'schoolSubjects'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolSubject));
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const parentSubjects = subjects.filter(s => s.isParent).sort((a, b) => a.gradeLevel.localeCompare(b.gradeLevel) || a.subjectCode.localeCompare(b.subjectCode));
  const getChildSubjects = (parentId: string) => subjects.filter(s => !s.isParent && s.parentId === parentId).sort((a, b) => a.subjectCode.localeCompare(b.subjectCode));

  const toggleParent = (parentId: string) => {
    setExpandedParents(prev => ({ ...prev, [parentId]: !prev[parentId] }));
  };

  const handleOpenModal = (mode: 'create_parent' | 'edit_parent' | 'create_child' | 'edit_child', subject?: Partial<SchoolSubject>, parentId?: string) => {
    setModalMode(mode);
    if (mode === 'create_parent') {
      setEditingSubject({
        isParent: true,
        subjectCode: '',
        name: '',
        gradeLevel: GRADE_LEVELS[0],
        totalHours: 80,
      });
    } else if (mode === 'create_child') {
      const parent = subjects.find(s => s.id === parentId);
      setEditingSubject({
        isParent: false,
        parentId: parentId,
        subjectCode: parent ? parent.subjectCode + '-' : '',
        name: '',
        gradeLevel: parent ? parent.gradeLevel : GRADE_LEVELS[0],
        totalHours: 40,
        weightPercentage: 100,
      });
    } else if (subject) {
      setEditingSubject({ ...subject });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !editingSubject.subjectCode || !editingSubject.name) return;
    
    setIsSaving(true);
    try {
      const isNew = !editingSubject.id;
      const docId = isNew ? editingSubject.subjectCode.replace(/[^a-zA-Z0-9-]/g, '') + '-' + Date.now().toString().slice(-4) : editingSubject.id!;
      const subjectData: SchoolSubject = {
        id: docId,
        subjectCode: editingSubject.subjectCode,
        name: editingSubject.name,
        gradeLevel: editingSubject.gradeLevel || GRADE_LEVELS[0],
        isParent: !!editingSubject.isParent,
        parentId: editingSubject.parentId || null,
        weightPercentage: editingSubject.weightPercentage || 0,
        totalHours: editingSubject.totalHours || 0,
        createdAt: editingSubject.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, 'schoolSubjects', docId), subjectData);
      
      window.dispatchEvent(new CustomEvent('app-custom-toast', {
        detail: { message: 'บันทึกข้อมูลรายวิชาเรียบร้อยแล้ว', type: 'success', title: 'บันทึกสำเร็จ' }
      }));
      
      setIsModalOpen(false);
      fetchSubjects();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'schoolSubjects');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, isParent: boolean) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายวิชานี้? ' + (isParent ? 'วิชาย่อยทั้งหมดจะถูกลบไปด้วย (ในระบบ)' : ''))) return;
    
    try {
      if (isParent) {
        const children = getChildSubjects(id);
        for (const child of children) {
          await deleteDoc(doc(db, 'schoolSubjects', child.id));
        }
      }
      await deleteDoc(doc(db, 'schoolSubjects', id));
      
      window.dispatchEvent(new CustomEvent('app-custom-toast', {
        detail: { message: 'ลบข้อมูลรายวิชาเรียบร้อยแล้ว', type: 'success', title: 'ลบสำเร็จ' }
      }));
      
      fetchSubjects();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'schoolSubjects');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">โครงสร้างรายวิชา (Subject Structure)</h2>
          <p className="text-sm text-slate-500">จัดการวิชาหลักและวิชาย่อย พร้อมกำหนดสัดส่วนคะแนนและชั่วโมงเรียน</p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
          <button
            onClick={handleSeedData}
            className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
          >
             <Layers className="h-4 w-4" /> ดึงวิชาจากระบบหลักสูตร
          </button>
          <button
            onClick={() => handleOpenModal('create_parent')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> สร้างวิชาหลักใหม่
          </button>
</div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {parentSubjects.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p>ยังไม่มีข้อมูลโครงสร้างรายวิชา</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {parentSubjects.map(parent => {
              const children = getChildSubjects(parent.id);
              const isExpanded = expandedParents[parent.id];
              const totalWeight = children.reduce((sum, c) => sum + (c.weightPercentage || 0), 0);
              
              return (
                <div key={parent.id} className="group">
                  {/* Parent Row */}
                  <div className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleParent(parent.id)}
                        className="p-1 rounded-md hover:bg-slate-200 text-slate-400"
                      >
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      </button>
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{parent.subjectCode} {parent.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">{parent.gradeLevel}</span>
                          {children.length > 0 && totalWeight !== 100 && (
                            <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-medium">สัดส่วนรวม: {totalWeight}% (ควรเป็น 100%)</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          รวมเวลาเรียน: {parent.totalHours} ชั่วโมง/ปีการศึกษา | วิชาย่อย: {children.length} วิชา
                        </div>
                      </div>
                    </div>
                    
                    {canEdit && (
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal('create_child', undefined, parent.id)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg flex items-center gap-1 text-sm font-medium"
                          title="เพิ่มวิชาย่อย"
                        >
                          <Plus className="h-4 w-4" /> เพิ่มวิชาย่อย
                        </button>
                        <button 
                          onClick={() => handleOpenModal('edit_parent', parent)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(parent.id, true)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Children Rows */}
                  {isExpanded && children.length > 0 && (
                    <div className="bg-slate-50/50 border-t border-slate-100">
                      {children.map(child => (
                        <div key={child.id} className="pl-16 pr-4 py-3 flex items-center justify-between hover:bg-slate-100/50 group/child border-b border-slate-100 last:border-b-0">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                            <div>
                              <span className="font-semibold text-slate-700">{child.subjectCode} {child.name}</span>
                              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                                <span>เวลาเรียน: {child.totalHours} ชั่วโมง</span>
                                <span className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                                  <Percent className="h-3 w-3 mr-0.5" /> สัดส่วนคะแนน: {child.weightPercentage}%
                                </span>
                              </div>
                            </div>
                          </div>
                          {canEdit && (
                            <div className="flex items-center gap-1 opacity-0 group-hover/child:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleOpenModal('edit_child', child, parent.id)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(child.id, false)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {isExpanded && children.length === 0 && (
                    <div className="pl-16 pr-4 py-3 text-sm text-slate-400 bg-slate-50/50 border-t border-slate-100">
                      ยังไม่มีวิชาย่อยในวิชาหลักนี้
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && editingSubject && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">
                {modalMode === 'create_parent' ? 'สร้างวิชาหลักใหม่' : 
                 modalMode === 'edit_parent' ? 'แก้ไขวิชาหลัก' : 
                 modalMode === 'create_child' ? 'เพิ่มวิชาย่อย' : 'แก้ไขวิชาย่อย'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">รหัสวิชา</label>
                  <input
                    type="text"
                    required
                    value={editingSubject.subjectCode || ''}
                    onChange={(e) => setEditingSubject({...editingSubject, subjectCode: e.target.value})}
                    placeholder={editingSubject.isParent ? "ศ11101" : "ศ11101-1"}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700">ชื่อวิชา</label>
                  <input
                    type="text"
                    required
                    value={editingSubject.name || ''}
                    onChange={(e) => setEditingSubject({...editingSubject, name: e.target.value})}
                    placeholder={editingSubject.isParent ? "ศิลปะ" : "ทัศนศิลป์"}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {editingSubject.isParent && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ระดับชั้น</label>
                  <select
                    value={editingSubject.gradeLevel}
                    onChange={(e) => setEditingSubject({...editingSubject, gradeLevel: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">เป้าหมายเวลาเรียนรวม (ชั่วโมง/ปีการศึกษา)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingSubject.totalHours || ''}
                    onChange={(e) => setEditingSubject({...editingSubject, totalHours: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                
                {!editingSubject.isParent && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">สัดส่วนคะแนน (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={editingSubject.weightPercentage || ''}
                      onChange={(e) => setEditingSubject({...editingSubject, weightPercentage: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
