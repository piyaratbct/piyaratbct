import React, { useState, useEffect } from 'react';
import { ClassroomConfig, Teacher, Student, GRADE_LEVELS } from '../types';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Plus, Edit2, Trash2, Save, X, AlertCircle, Users, BookOpen, RefreshCw } from 'lucide-react';

interface ClassroomSettingsProps {
  students: Student[];
  teachers: Teacher[];
  currentTeacher: Teacher;
}

export const ClassroomSettings: React.FC<ClassroomSettingsProps> = ({ students, teachers, currentTeacher }) => {
  const [classrooms, setClassrooms] = useState<ClassroomConfig[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [formData, setFormData] = useState<Partial<ClassroomConfig>>({
    name: '',
    baseLevel: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'classrooms'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ClassroomConfig);
      setClassrooms(data.sort((a, b) => a.name.localeCompare(b.name, 'th')));
      setHasLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // Auto-initialize if empty
  useEffect(() => {
    if (hasLoaded && classrooms.length === 0 && !isInitializing && (currentTeacher.role === 'admin' || currentTeacher.role === 'academic')) {
      const autoSeed = async () => {
        setIsInitializing(true);
        try {
          const batch = writeBatch(db);
          const dbGrades = new Set([...GRADE_LEVELS]);
          
          students.forEach(s => { if (s.gradeLevel) dbGrades.add(s.gradeLevel); });
          teachers.forEach(t => {
            if (t.homeroomClass) dbGrades.add(t.homeroomClass);
            if (t.coHomeroomClass) dbGrades.add(t.coHomeroomClass);
          });
          
          const newGrades = Array.from(dbGrades).filter(g => g !== 'จบการศึกษา');
          if (newGrades.length > 0) {
            newGrades.forEach(gradeName => {
              const id = `class-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
              let baseLevel = gradeName;
              if (gradeName.includes('/')) {
                baseLevel = gradeName.split('/')[0];
              }
              batch.set(doc(db, 'classrooms', id), {
                id,
                name: gradeName,
                baseLevel
              });
            });
            await batch.commit();
          }
        } catch (err) {
          console.error("Auto-seed failed", err);
        } finally {
          setIsInitializing(false);
        }
      };
      autoSeed();
    }
  }, [hasLoaded, classrooms.length, currentTeacher.role]);

  const handleSave = async () => {
    if (!formData.name || !formData.baseLevel) {
      setError('กรุณาระบุชื่อห้องเรียนและระดับชั้นพื้นฐาน');
      return;
    }
    try {
      const id = isEditing || `class-${Date.now()}`;
      await setDoc(doc(db, 'classrooms', id), {
        id,
        name: formData.name,
        baseLevel: formData.baseLevel
      });
      setShowAddForm(false);
      setIsEditing(null);
      setFormData({ name: '', baseLevel: '' });
      setError('');
    } catch (err: any) {
      setError('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
    }
  };

  const handleInitialize = async () => {
    if (!window.confirm('ระบบจะดึงรายชื่อห้องเรียนจากข้อมูลนักเรียนและตั้งค่าเริ่มต้น คุณต้องการดำเนินการต่อหรือไม่?')) return;
    
    setIsInitializing(true);
    try {
      const batch = writeBatch(db);
      
      const dbGrades = new Set([...GRADE_LEVELS]);
      
      students.forEach(s => { if (s.gradeLevel) dbGrades.add(s.gradeLevel); });
      teachers.forEach(t => {
        if (t.homeroomClass) dbGrades.add(t.homeroomClass);
        if (t.coHomeroomClass) dbGrades.add(t.coHomeroomClass);
      });
      
      const existingNames = new Set(classrooms.map(c => c.name));
      const newGrades = Array.from(dbGrades).filter(g => !existingNames.has(g) && g !== 'จบการศึกษา');
      
      if (newGrades.length === 0) {
        alert('พบว่ามีข้อมูลห้องเรียนในระบบครบถ้วนแล้ว');
        setIsInitializing(false);
        return;
      }
      
      newGrades.forEach(gradeName => {
        const id = `class-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        let baseLevel = gradeName;
        if (gradeName.includes('/')) {
          baseLevel = gradeName.split('/')[0];
        }
        batch.set(doc(db, 'classrooms', id), {
          id,
          name: gradeName,
          baseLevel
        });
      });
      
      await batch.commit();
      alert(`เพิ่มห้องเรียนตั้งต้นจำนวน ${newGrades.length} ห้อง สำเร็จ!`);
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการสร้างข้อมูล: ' + err.message);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณต้องการลบห้องเรียนนี้ใช่หรือไม่?')) {
      try {
        await deleteDoc(doc(db, 'classrooms', id));
      } catch (err: any) {
        alert('เกิดข้อผิดพลาด: ' + err.message);
      }
    }
  };

  const startEdit = (classroom: ClassroomConfig) => {
    setFormData(classroom);
    setIsEditing(classroom.id);
    setShowAddForm(true);
    setError('');
  };

  const cancelEdit = () => {
    setShowAddForm(false);
    setIsEditing(null);
    setFormData({ name: '', baseLevel: '' });
    setError('');
  };

  // Only allow admin or academic to edit
  const canEdit = currentTeacher.role === 'admin' || currentTeacher.role === 'academic';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-w-5xl mx-auto">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">จัดการโครงสร้างห้องเรียน</h2>
            <p className="text-sm text-slate-500 mt-1">ตั้งค่ารายชื่อห้องเรียน (ครูประจำชั้นจะถูกดึงมาจากระบบจัดการบุคลากร)</p>
          </div>
        </div>
        {canEdit && !showAddForm && (
          <div className="flex items-center gap-3">
            {classrooms.length < 5 && (
              <button
                onClick={handleInitialize}
                disabled={isInitializing}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isInitializing ? 'animate-spin' : ''}`} /> ดึงข้อมูลห้องเรียนตั้งต้น
              </button>
            )}
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm shadow-sm"
            >
              <Plus className="h-4 w-4" /> เพิ่มห้องเรียน
            </button>
          </div>
        )}
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <span className="font-bold text-sm">{error}</span>
          </div>
        )}

        {showAddForm && canEdit && (
          <div className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner">
            <h3 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
              {isEditing ? 'แก้ไขข้อมูลห้องเรียน' : 'เพิ่มห้องเรียนใหม่'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">ชื่อห้องเรียน (เช่น ประถมศึกษาปีที่ 1/3)</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="เช่น ประถมศึกษาปีที่ 1/3"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">ระดับชั้นพื้นฐาน</label>
                <select
                  value={formData.baseLevel || ''}
                  onChange={e => setFormData({ ...formData, baseLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="">-- เลือกระดับชั้น --</option>
                  {GRADE_LEVELS.filter(g => !g.includes('/')).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800 font-medium">
                * หมายเหตุ: การตั้งค่าครูประจำชั้น (หลัก/ร่วม) สามารถทำได้ที่โมดูล <b>จัดการบุคลากร (Staff)</b> เพื่อป้องกันความซ้ำซ้อนของข้อมูล
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg font-bold hover:bg-slate-100 transition-colors text-sm"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm shadow-sm"
              >
                <Save className="h-4 w-4" /> บันทึก
              </button>
            </div>
          </div>
        )}

        {classrooms.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">ยังไม่มีข้อมูลห้องเรียนในระบบ</p>
            {canEdit && (
              <div className="mt-4 flex flex-col items-center gap-3">
                <button
                  onClick={handleInitialize}
                  disabled={isInitializing}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isInitializing ? 'animate-spin' : ''}`} /> ดึงข้อมูลห้องเรียนตั้งต้นจากนักเรียนและครู
                </button>
                <p className="text-xs">หรือคลิกปุ่ม "เพิ่มห้องเรียน" เพื่อสร้างด้วยตนเอง</p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-4 text-sm font-bold w-[5%]">#</th>
                  <th className="py-3 px-4 text-sm font-bold w-[20%]">ชื่อห้องเรียน</th>
                  <th className="py-3 px-4 text-sm font-bold w-[15%]">ระดับชั้น</th>
                  <th className="py-3 px-4 text-sm font-bold w-[25%]">ครูประจำชั้น</th>
                  <th className="py-3 px-4 text-sm font-bold text-center w-[15%]">จำนวนนักเรียน</th>
                  {canEdit && <th className="py-3 px-4 text-sm font-bold text-center w-[20%]">จัดการ</th>}
                </tr>
              </thead>
              <tbody>
                {classrooms.map((c, index) => {
                  const numStudents = students.filter(s => s.gradeLevel === c.name).length;
                  const homeroom = teachers.find(t => t.homeroomClass === c.name);
                  const coHomeroom = teachers.find(t => t.coHomeroomClass === c.name);

                  return (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-slate-500">{index + 1}</td>
                      <td className="py-3 px-4 text-sm font-bold text-slate-800">{c.name}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{c.baseLevel}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        <div className="flex flex-col">
                          {homeroom ? <span className="font-medium text-indigo-700">{homeroom.thaiName || homeroom.displayName}</span> : <span className="text-slate-400 text-xs italic">ยังไม่ระบุครูประจำชั้นหลัก</span>}
                          {coHomeroom && <span className="text-xs text-slate-500 mt-0.5">(ร่วม) {coHomeroom.thaiName || coHomeroom.displayName}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                          <Users className="h-3 w-3" /> {numStudents} คน
                        </span>
                      </td>
                      {canEdit && (
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => startEdit(c)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="แก้ไข"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="ลบ"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
