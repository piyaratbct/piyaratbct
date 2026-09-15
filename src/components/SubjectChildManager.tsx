import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CurriculumSubject, GRADE_LEVELS, Student } from '../types';
import { Plus, Edit, Trash2, Loader2, X, Percent, Clock, Link as LinkIcon, CheckCircle2, AlertCircle, BookOpen, Calculator, RefreshCw, Save, Layers } from 'lucide-react';

interface SubjectChildManagerProps {
  parentSubject: CurriculumSubject;
  onUpdate: () => void;
  canEdit: boolean;
  students?: Student[];
  systemSemester?: string;
  systemAcademicYear?: string;
}

export const SubjectChildManager: React.FC<SubjectChildManagerProps> = ({ parentSubject, onUpdate, canEdit, students: allStudents = [], systemSemester = '1', systemAcademicYear = '2567' }) => {
  const [children, setChildren] = useState<CurriculumSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [editingChild, setEditingChild] = useState<Partial<CurriculumSubject>>({});

  const [allocatingChildId, setAllocatingChildId] = useState<string | null>(null);
  const [selectedIndicators, setSelectedIndicators] = useState<Record<string, string[]>>({}); // standardId -> indicatorId[]

  const [showMergeForm, setShowMergeForm] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<CurriculumSubject[]>([]);
  const [selectedSubjectIdsToMerge, setSelectedSubjectIdsToMerge] = useState<string[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [parentHours, setParentHours] = useState(parentSubject.totalHours || parentSubject.requiredHoursPerTerm || 0);
  const [isSavingParent, setIsSavingParent] = useState(false);

  useEffect(() => {
    setParentHours(parentSubject.totalHours || parentSubject.requiredHoursPerTerm || 0);
  }, [parentSubject]);

  const handleUpdateParentHours = async (val) => {
    setParentHours(val);
    if (!canEdit) return;
    setIsSavingParent(true);
    try {
      await setDoc(doc(db, 'curriculums', parentSubject.id), { 
          totalHours: val, 
          requiredHoursPerTerm: Math.round(val / 2) 
      }, { merge: true });
      onUpdate();
    } catch(e) {
      console.error("Error updating parent hours", e);
    } finally {
      setIsSavingParent(false);
    }
  };
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // --- Aggregation State ---
  const [activeTab, setActiveTab] = useState<'structure' | 'aggregation'>('structure');
  const [childScores, setChildScores] = useState<Record<string, Record<string, number>>>({}); // childId -> studentId -> score
  const [isFetchingScores, setIsFetchingScores] = useState(false);
  const [toastMessage, setToastMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const students = React.useMemo(() => 
    allStudents.filter(s => s.gradeLevel === parentSubject.gradeLevel && (s.status === 'active' || !s.status))
      .sort((a, b) => Number(a.number) - Number(b.number)),
  [allStudents, parentSubject.gradeLevel]);

  const fetchScores = async () => {
    setIsFetchingScores(true);
    try {
      const scoresData: Record<string, Record<string, number>> = {};
      const safeGrade = (parentSubject.gradeLevel || '').replace(/[\/]/g, '_');
      
      for (const child of children) {
        const safeSubject = child.subjectName.replace(/[\/]/g, '_');
        
        // Try fetching from gradebooks (auto-gradebook)
        const gbDocId = `${systemAcademicYear}_${systemSemester}_${safeSubject}_${safeGrade}`;
        const gbSnap = await getDocs(query(collection(db, 'gradebooks'), where('__name__', '==', gbDocId)));
        
        let hasScores = false;
        if (!gbSnap.empty) {
          const gbData = gbSnap.docs[0].data();
          if (gbData.scores) {
             scoresData[child.id] = {};
             Object.keys(gbData.scores).forEach(studentId => {
                let total = 0;
                Object.values(gbData.scores[studentId] as Record<string, number>).forEach(v => total += v);
                scoresData[child.id][studentId] = total;
             });
             hasScores = true;
          }
        }
        
        // Fallback to subject_scores (manual gradebook)
        if (!hasScores) {
           const ssQuery = query(
              collection(db, 'subject_scores'), 
              where('subject', '==', child.subjectName),
              where('gradeLevel', '==', parentSubject.gradeLevel),
              where('academicYear', '==', systemAcademicYear),
              where('semester', '==', systemSemester)
           );
           const ssSnap = await getDocs(ssQuery);
           if (!ssSnap.empty) {
              scoresData[child.id] = {};
              ssSnap.docs.forEach(doc => {
                 const data = doc.data();
                 scoresData[child.id][data.studentId] = data.totalScore || 0;
              });
           }
        }
      }
      setChildScores(scoresData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingScores(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'aggregation' && children.length > 0) {
      fetchScores();
    }
  }, [activeTab, children, systemAcademicYear, systemSemester, parentSubject.gradeLevel]);

  const calculateGrade = (total: number): string => {
    if (total >= 80) return "4";
    if (total >= 75) return "3.5";
    if (total >= 70) return "3";
    if (total >= 65) return "2.5";
    if (total >= 60) return "2";
    if (total >= 55) return "1.5";
    if (total >= 50) return "1";
    return "0";
  };

  const handleSaveAggregation = async () => {
    setIsSaving(true);
    try {
      const promises = students.map(student => {
        let finalTotal = 0;
        
        children.forEach(child => {
           const weight = child.weightPercentage || 0;
           const rawScore = childScores[child.id]?.[student.id] || 0;
           const weightedScore = (rawScore * weight) / 100;
           finalTotal += weightedScore;
        });
        
        finalTotal = Math.round(finalTotal);
        const key = `${student.id}_${systemAcademicYear}_${systemSemester}_${parentSubject.subjectName}`;
        const ref = doc(db, 'subject_scores', key);
        
        return setDoc(ref, {
          studentId: student.id,
          academicYear: systemAcademicYear,
          semester: systemSemester,
          subject: parentSubject.subjectName,
          gradeLevel: parentSubject.gradeLevel,
          totalScore: finalTotal,
          grade: calculateGrade(finalTotal),
          isAggregated: true,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });
      
      await Promise.all(promises);
      
      setToastMessage({ type: 'success', text: 'บันทึกการประมวลผลวิชาหลักเรียบร้อยแล้ว' });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.error(e);
      setToastMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึก' });
    } finally {
      setIsSaving(false);
    }
  };


  useEffect(() => {
    fetchChildren();
  }, [parentSubject.id]);

  const fetchChildren = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'curriculums'), where('parentId', '==', parentSubject.id));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => d.data() as CurriculumSubject);
      setChildren(data);
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'curriculums');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChild = async () => {
    if (!editingChild.subjectName || !editingChild.subjectCode) {
      alert('กรุณากรอกรหัสวิชาและชื่อวิชาให้ครบถ้วน');
      return;
    }

    setIsSaving(true);
    try {
      const docId = editingChild.id || `${parentSubject.id}-child-${Date.now()}`;
      const childData: CurriculumSubject = {
        id: docId,
        subjectCode: editingChild.subjectCode,
        subjectName: editingChild.subjectName,
        gradeLevel: parentSubject.gradeLevel,
        standards: [], // indicators mapping to child can be done later
        isParent: false,
        parentId: parentSubject.id,
        weightPercentage: editingChild.weightPercentage || 0,
        totalHours: editingChild.totalHours || 0,
        createdAt: editingChild.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'curriculums', docId), childData);
      
      // Also ensure parent is marked as parent
      if (!parentSubject.isParent) {
        await setDoc(doc(db, 'curriculums', parentSubject.id), {
          ...parentSubject,
          isParent: true,
          updatedAt: new Date().toISOString()
        });
        onUpdate();
      }

      setShowForm(false);
      fetchChildren();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'curriculums');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteChild = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteChild = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteDoc(doc(db, 'curriculums', deleteConfirmId));
      fetchChildren();
      setDeleteConfirmId(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'curriculums');
      alert('เกิดข้อผิดพลาดในการลบข้อมูล กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleOpenAllocation = (child: CurriculumSubject) => {
    const initialSelected: Record<string, string[]> = {};
    if (child.standards) {
      child.standards.forEach(std => {
        initialSelected[std.id] = std.indicators.map(ind => ind.code || ind.id);
      });
    }
    setSelectedIndicators(initialSelected);
    setAllocatingChildId(child.id);
  };

  const handleSaveAllocation = async () => {
    if (!allocatingChildId) return;
    setIsSaving(true);
    try {
      const child = children.find(c => c.id === allocatingChildId);
      if (!child) return;

      const newStandards = (parentSubject.standards || [])
        .map(parentStd => {
          const selectedIndIds = selectedIndicators[parentStd.id] || [];
          if (selectedIndIds.length === 0) return null;
          
          return {
            ...parentStd,
            indicators: parentStd.indicators.filter(ind => selectedIndIds.includes(ind.code || ind.id))
          };
        })
        .filter(Boolean) as typeof parentSubject.standards;

      await setDoc(doc(db, 'curriculums', allocatingChildId), {
        ...child,
        standards: newStandards,
        updatedAt: new Date().toISOString()
      });

      fetchChildren();
      setAllocatingChildId(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'curriculums');
    } finally {
      setIsSaving(false);
    }
  };

  const fetchAvailableMergeSubjects = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'curriculums'), where('gradeLevel', '==', parentSubject.gradeLevel));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => d.data() as CurriculumSubject);
      
      const available = data.filter(s => s.id !== parentSubject.id && !s.isParent && !s.parentId);
      
      setAvailableSubjects(available);
      setShowMergeForm(true);
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'curriculums');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMergeSubjects = async () => {
    if (selectedSubjectIdsToMerge.length === 0) return;
    setIsMerging(true);
    try {
      let updatedParent = { ...parentSubject };
      if (!updatedParent.standards) updatedParent.standards = [];

      for (const subId of selectedSubjectIdsToMerge) {
        const sub = availableSubjects.find(s => s.id === subId);
        if (!sub) continue;

        if (sub.standards && sub.standards.length > 0) {
            sub.standards.forEach(std => {
                const existingStd = updatedParent.standards.find(ps => ps.title === std.title);
                if (existingStd) {
                    existingStd.indicators.push(...std.indicators);
                } else {
                    updatedParent.standards.push(std);
                }
            });
        }

        await setDoc(doc(db, 'curriculums', sub.id), {
            ...sub,
            parentId: parentSubject.id,
            isParent: false,
            updatedAt: new Date().toISOString()
        });
      }

      updatedParent.isParent = true;
      updatedParent.updatedAt = new Date().toISOString();
      await setDoc(doc(db, 'curriculums', updatedParent.id), updatedParent);

      setShowMergeForm(false);
      setSelectedSubjectIdsToMerge([]);
      fetchChildren();
      onUpdate();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'curriculums');
    } finally {
      setIsMerging(false);
    }
  };

  const totalWeight = children.reduce((sum, c) => sum + (c.weightPercentage || 0), 0);
  const totalChildHours = children.reduce((sum, c) => sum + (c.totalHours || 0), 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[calc(100vh-200px)] animate-in fade-in duration-300">
      <div className="flex flex-col mb-6 gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-slate-800">จัดการวิชาย่อย (Parent-Child)</h3>
            <p className="text-slate-500 text-sm mt-1">แตกวิชา {parentSubject.subjectName} เป็นวิชาย่อยเพื่อแยกสัดส่วนการสอนและคะแนน</p>
          </div>
          {canEdit && activeTab === 'structure' && (
            <div className="flex gap-2">
              <button 
                onClick={fetchAvailableMergeSubjects}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <LinkIcon className="h-4 w-4 text-indigo-500" /> ดึงวิชาอื่นมารวม (Merge)
              </button>
              <button 
                onClick={() => {
                  setEditingChild({
                    subjectCode: parentSubject.subjectCode ? `${parentSubject.subjectCode}-` : '',
                    weightPercentage: 0,
                    totalHours: 0
                  });
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> เพิ่มวิชาย่อย
              </button>
            </div>
          )}
        </div>
        
        {/* Tabs for Structure / Aggregation */}
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('structure')}
            className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${activeTab === 'structure' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Layers className="h-4 w-4 inline-block mr-2" /> โครงสร้างและสัดส่วน
          </button>
          <button 
            onClick={() => setActiveTab('aggregation')}
            className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${activeTab === 'aggregation' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Calculator className="h-4 w-4 inline-block mr-2" /> ประมวลผลคะแนนรวม
          </button>
        </div>
      </div>

      {activeTab === 'structure' && (
        <div className="space-y-6 animate-in fade-in duration-300">
      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
      ) : (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border ${totalWeight > 100 ? 'bg-rose-50 border-rose-200 text-rose-700' : totalWeight === 100 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
              <div className="text-xs font-bold mb-1 opacity-70">น้ำหนักคะแนนรวม (เป้าหมาย 100%)</div>
              <div className="text-2xl font-black">{totalWeight}%</div>
              {totalWeight > 100 && <div className="text-xs mt-1">คำเตือน: น้ำหนักเกิน 100%</div>}
            </div>
            
            <div className="p-4 rounded-xl border bg-indigo-50 border-indigo-200 text-indigo-900">
              <div className="text-xs font-bold mb-1 opacity-70 flex items-center justify-between">
                <span>เวลาเรียนวิชาหลัก (เป้าหมาย)</span>
                {isSavingParent && <Loader2 className="w-3 h-3 animate-spin" />}
              </div>
              <div className="flex items-end gap-2 mt-1">
                <input 
                  type="number" 
                  disabled={!canEdit}
                  value={parentHours || ''}
                  onChange={(e) => setParentHours(Number(e.target.value))}
                  onBlur={(e) => handleUpdateParentHours(Number(e.target.value))}
                  className="w-20 px-2 py-1 text-xl font-black bg-white border border-indigo-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-sm font-bold mb-1">ชั่วโมง/ปี</span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${totalChildHours > parentHours ? 'bg-rose-50 border-rose-200 text-rose-700' : totalChildHours === parentHours ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
              <div className="text-xs font-bold mb-1 opacity-70">เวลาเรียนรวมของวิชาย่อย (แจกจ่าย)</div>
              <div className="text-2xl font-black">{totalChildHours} <span className="text-sm font-bold">ชั่วโมง</span></div>
              {totalChildHours > parentHours && parentHours > 0 && <div className="text-xs mt-1">คำเตือน: เวลาเกินเป้าหมายวิชาหลัก</div>}
              {totalChildHours < parentHours && parentHours > 0 && <div className="text-xs mt-1">ขาดอีก: {parentHours - totalChildHours} ชม.</div>}
            </div>
          </div>

          <div className="space-y-3">
            {children.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-slate-500">ยังไม่มีวิชาย่อย หากเพิ่มวิชาย่อย วิชานี้จะถูกตั้งค่าเป็นวิชาหลัก (Parent) โดยอัตโนมัติ</p>
              </div>
            ) : (
              children.map(child => (
                <div key={child.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors bg-white shadow-sm">
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      {child.subjectCode} {child.subjectName}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
                      <div className="flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-lg">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {child.totalHours} ชม.
                      </div>
                      <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg">
                        <Percent className="h-4 w-4" />
                        {child.weightPercentage}%
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
                        <button 
                          onClick={() => handleOpenAllocation(child)} 
                          className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
                        >
                          จัดสรรตัวชี้วัด ({(child.standards || []).reduce((acc, curr) => acc + curr.indicators.length, 0)})
                        </button>
                        <button onClick={() => {
                          setEditingChild(child);
                          setShowForm(true);
                        }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteChild(child.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
        </div>
      )}

      {activeTab === 'aggregation' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100">
                ปีการศึกษา {systemAcademicYear}
              </span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100">
                เทอม {systemSemester}
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-100">
                {parentSubject.gradeLevel}
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={fetchScores}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className="h-3 w-3" /> ดึงข้อมูลใหม่
              </button>
              <button 
                onClick={handleSaveAggregation}
                disabled={isSaving || children.length === 0}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} 
                บันทึกผลการเรียนวิชาหลัก
              </button>
            </div>
          </div>
          
          {toastMessage && (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {toastMessage.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <p className="font-bold">{toastMessage.text}</p>
            </div>
          )}
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <span className="font-bold text-slate-700">สัดส่วนคะแนนย่อย:</span>
              {children.length > 0 ? children.map(c => (
                <span key={c.id} className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600 shadow-sm">
                  {c.subjectName} ({c.weightPercentage || 0}%)
                </span>
              )) : <span className="text-sm text-rose-500 font-medium">ยังไม่มีการตั้งค่าวีชาย่อยในโครงสร้าง</span>}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-center w-16 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">เลขที่</th>
                    <th className="px-4 py-3 w-48 sticky left-16 bg-slate-50 z-10 border-r border-slate-200">ชื่อ-นามสกุล</th>
                    {children.map(child => (
                      <th key={child.id} className="px-4 py-3 text-center border-r border-slate-200 min-w-[120px]">
                        คะแนน {child.subjectName} <br/>
                        <span className="text-xs text-indigo-500 font-normal">(ปรับเป็น {child.weightPercentage || 0}%)</span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center bg-indigo-50 text-indigo-700 border-r border-indigo-100 w-24">คะแนนรวม</th>
                    <th className="px-4 py-3 text-center bg-indigo-50 text-indigo-700 w-24">ผลการเรียน</th>
                  </tr>
                </thead>
                <tbody>
                  {isFetchingScores ? (
                    <tr>
                      <td colSpan={5 + children.length} className="px-4 py-8 text-center text-slate-500">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        กำลังดึงข้อมูลคะแนน...
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={5 + children.length} className="px-4 py-8 text-center text-slate-500">ไม่มีข้อมูลนักเรียน</td>
                    </tr>
                  ) : (
                    students.map(student => {
                      let finalTotal = 0;
                      
                      return (
                        <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2 text-center sticky left-0 bg-white border-r border-slate-200">{student.number}</td>
                          <td className="px-4 py-2 whitespace-nowrap sticky left-16 bg-white border-r border-slate-200">{student.firstName} {student.lastName}</td>
                          
                          {children.map(child => {
                            const weight = child.weightPercentage || 0;
                            const rawScore = childScores[child.id]?.[student.id];
                            const hasScore = rawScore !== undefined;
                            const weightedScore = hasScore ? (rawScore * weight) / 100 : 0;
                            finalTotal += weightedScore;
                            
                            return (
                              <td key={child.id} className="px-4 py-2 text-center border-r border-slate-100">
                                {hasScore ? (
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-700">{weightedScore.toFixed(1)}</span>
                                    <span className="text-[10px] text-slate-400">ดิบ: {rawScore}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                            );
                          })}
                          
                          <td className="px-4 py-2 text-center font-black text-indigo-600 bg-indigo-50/30 border-r border-indigo-100">
                            {Math.round(finalTotal)}
                          </td>
                          <td className="px-4 py-2 text-center font-black text-emerald-600 bg-indigo-50/30">
                            {calculateGrade(Math.round(finalTotal))}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

{showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                {editingChild.id ? 'แก้ไขวิชาย่อย' : 'เพิ่มวิชาย่อย'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รหัสวิชาย่อย</label>
                <input 
                  type="text"
                  value={editingChild.subjectCode || ''}
                  onChange={e => setEditingChild({...editingChild, subjectCode: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="เช่น ศ11101-1"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อวิชาย่อย</label>
                <input 
                  type="text"
                  value={editingChild.subjectName || ''}
                  onChange={e => setEditingChild({...editingChild, subjectName: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="เช่น ทัศนศิลป์"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">น้ำหนักคะแนน (%)</label>
                  <input 
                    type="number"
                    value={editingChild.weightPercentage || 0}
                    onChange={e => setEditingChild({...editingChild, weightPercentage: Number(e.target.value)})}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">เวลาเรียน (ชั่วโมง)</label>
                  <input 
                    type="number"
                    value={editingChild.totalHours || 0}
                    onChange={e => setEditingChild({...editingChild, totalHours: Number(e.target.value)})}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                ยกเลิก
              </button>
              <button onClick={handleSaveChild} disabled={isSaving} className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {showMergeForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-indigo-500" /> รวมวิชาอื่นมาเป็นวิชาย่อย
              </h3>
              <button onClick={() => setShowMergeForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4">
                เลือกรายวิชาอิสระในระดับชั้น <strong>{parentSubject.gradeLevel}</strong> ที่ต้องการดึงเข้ามาเป็นวิชาย่อยของ <strong>{parentSubject.subjectName}</strong> 
                (ตัวชี้วัดของวิชาที่เลือก จะถูกย้ายมารวมที่วิชานี้ทั้งหมด)
              </p>
              
              <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2 bg-slate-50">
                {availableSubjects.length === 0 ? (
                  <div className="text-center p-4 text-slate-400 text-sm">ไม่มีวิชาอื่นในระดับชั้นนี้ที่สามารถดึงมารวมได้</div>
                ) : (
                  availableSubjects.map(sub => {
                    const isSelected = selectedSubjectIdsToMerge.includes(sub.id);
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedSubjectIdsToMerge(prev => prev.filter(id => id !== sub.id));
                          } else {
                            setSelectedSubjectIdsToMerge(prev => [...prev, sub.id]);
                          }
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center justify-between ${
                          isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <div>
                          <div className={`font-bold text-sm ${isSelected ? 'text-indigo-800' : 'text-slate-700'}`}>
                            {sub.subjectCode} {sub.subjectName}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {(sub.standards || []).reduce((acc, curr) => acc + (curr.indicators?.length || 0), 0)} ตัวชี้วัด
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setShowMergeForm(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                ยกเลิก
              </button>
              <button 
                onClick={handleMergeSubjects} 
                disabled={isMerging || selectedSubjectIdsToMerge.length === 0} 
                className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isMerging && <Loader2 className="h-4 w-4 animate-spin" />}
                รวมรายวิชาที่เลือก ({selectedSubjectIdsToMerge.length})
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-rose-500" />
              ยืนยันการลบวิชาย่อย
            </h3>
            <p className="text-slate-600 mb-6">
              คุณต้องการลบวิชาย่อยนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={confirmDeleteChild}
                className="px-4 py-2 font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {allocatingChildId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-500" /> จัดสรรตัวชี้วัดให้วิชาย่อย
                </h3>
                <p className="text-sm text-slate-500 mt-1">เลือกตัวชี้วัดจากวิชาหลักที่ต้องการให้ประเมินในวิชาย่อยนี้</p>
              </div>
              <button onClick={() => setAllocatingChildId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {(!parentSubject.standards || parentSubject.standards.length === 0) ? (
                <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-500 font-bold mb-2">ยังไม่มีมาตรฐานและตัวชี้วัดในวิชาหลัก</p>
                  <p className="text-sm text-slate-400">กรุณาเพิ่มตัวชี้วัดในหน้าวิชาหลัก (Parent) ก่อนทำการจัดสรร</p>
                </div>
              ) : (
                parentSubject.standards.map((std) => {
                  const allIndIds = std.indicators.map(ind => ind.code || ind.id);
                  const selectedCount = (selectedIndicators[std.id] || []).length;
                  const isAllSelected = selectedCount === allIndIds.length && allIndIds.length > 0;

                  return (
                    <div key={std.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                        <div className="font-bold text-slate-800 text-sm">
                          {std.title}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedIndicators(prev => ({
                              ...prev,
                              [std.id]: isAllSelected ? [] : [...allIndIds]
                            }));
                          }}
                          className={`text-xs font-bold px-3 py-1 rounded-lg border transition-colors ${isAllSelected ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                        >
                          {isAllSelected ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                        </button>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {std.indicators.map(ind => {
                          const isSelected = (selectedIndicators[std.id] || []).includes(ind.code || ind.id);
                          return (
                            <label key={ind.id} className="flex items-start gap-3 p-4 hover:bg-slate-50 cursor-pointer transition-colors">
                              <div className="mt-0.5">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    setSelectedIndicators(prev => {
                                      const current = prev[std.id] || [];
                                      const identifier = ind.code || ind.id;
                                      return {
                                        ...prev,
                                        [std.id]: e.target.checked 
                                          ? [...current, identifier]
                                          : current.filter(id => id !== identifier)
                                      };
                                    });
                                  }}
                                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-bold text-slate-800">{ind.code}</div>
                                <div className="text-sm text-slate-600 mt-1">{ind.description}</div>
                              </div>
                              <div className="flex-shrink-0">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${ind.type === 'core' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {ind.type === 'core' ? 'ต้องรู้' : 'ควรรู้'}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 rounded-b-2xl">
              <button onClick={() => setAllocatingChildId(null)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                ยกเลิก
              </button>
              <button 
                onClick={handleSaveAllocation} 
                disabled={isSaving} 
                className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                บันทึกการจัดสรรตัวชี้วัด
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
