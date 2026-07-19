import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { Teacher, GRADE_LEVELS } from "../types";
import { Users, Edit2, Save, X, Search, Shield, GraduationCap, Phone, UserCircle } from "lucide-react";

interface StaffManagerProps {
  currentTeacher: Teacher;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "ผู้ดูแลระบบสูงสุด (Admin)",
  deputy: "รองผู้อำนวยการ",
  academic: "ฝ่ายวิชาการ",
  discipline: "ฝ่ายปกครอง",
  teacher: "ครูผู้สอน",
  staff: "บุคลากรทั่วไป"
};

export function StaffManager({ currentTeacher }: StaffManagerProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [editRole, setEditRole] = useState<string>("teacher");
  const [editHomeroom, setEditHomeroom] = useState<string>("");
  const [editCoHomeroom, setEditCoHomeroom] = useState<string>("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const canEdit = currentTeacher.role === "admin" || currentTeacher.role === "academic" || currentTeacher.role === "deputy";

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "teachers"), (snapshot) => {
      const fetched: Teacher[] = [];
      snapshot.forEach(doc => {
        fetched.push(doc.data() as Teacher);
      });
      // Sort by role then name
      fetched.sort((a, b) => {
        const roleWeight = { admin: 1, deputy: 2, academic: 3, discipline: 4, teacher: 5, staff: 6 } as any;
        const wA = roleWeight[a.role || 'teacher'] || 99;
        const wB = roleWeight[b.role || 'teacher'] || 99;
        if (wA !== wB) return wA - wB;
        const canView = currentTeacher.role === "admin" || currentTeacher.role === "academic" || currentTeacher.role === "deputy";

  if (!canView) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center max-w-2xl mx-auto mt-12">
        <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
        <p className="text-slate-500 mb-6">คุณไม่มีสิทธิ์ในการเข้าถึงระบบจัดการบุคลากร (เฉพาะผู้ดูแลระบบ, รองผู้อำนวยการ, และฝ่ายวิชาการเท่านั้น)</p>
      </div>
    );
  }

  return (a.thaiName || "").localeCompare(b.thaiName || "");
      });
      setTeachers(fetched);
      setLoading(false);
    });
    const canView = currentTeacher.role === "admin" || currentTeacher.role === "academic" || currentTeacher.role === "deputy";

  if (!canView) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center max-w-2xl mx-auto mt-12">
        <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
        <p className="text-slate-500 mb-6">คุณไม่มีสิทธิ์ในการเข้าถึงระบบจัดการบุคลากร (เฉพาะผู้ดูแลระบบ, รองผู้อำนวยการ, และฝ่ายวิชาการเท่านั้น)</p>
      </div>
    );
  }

  return () => unsub();
  }, []);

  const handleEditClick = (t: Teacher) => {
    if (!canEdit) return;
    setEditingId(t.id);
    setEditRole(t.role || "teacher");
    setEditHomeroom(t.homeroomClass || "");
    setEditCoHomeroom(t.coHomeroomClass || "");
  };

  const handleSave = async (id: string) => {
    try {
      setIsProcessing(true);
      await updateDoc(doc(db, "teachers", id), {
        role: editRole,
        homeroomClass: editHomeroom,
        coHomeroomClass: editCoHomeroom
      });
      setEditingId(null);
    } catch (err) {
      console.error("Error updating teacher:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.thaiName?.includes(search) || 
    t.englishName?.includes(search) || 
    t.displayName?.includes(search) ||
    t.employeeId?.includes(search)
  );

  const canView = currentTeacher.role === "admin" || currentTeacher.role === "academic" || currentTeacher.role === "deputy";

  if (!canView) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center max-w-2xl mx-auto mt-12">
        <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
        <p className="text-slate-500 mb-6">คุณไม่มีสิทธิ์ในการเข้าถึงระบบจัดการบุคลากร (เฉพาะผู้ดูแลระบบ, รองผู้อำนวยการ, และฝ่ายวิชาการเท่านั้น)</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">ระบบจัดการบุคลากร (Staff Management)</h2>
            <p className="text-sm text-slate-500 mt-1">กำหนดสิทธิ์การใช้งานและมอบหมายหน้าที่ครูประจำชั้น</p>
          </div>
        </div>
        
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อ, รหัส..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="p-6">
        {!canEdit && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            คุณสามารถดูข้อมูลบุคลากรได้เท่านั้น (เฉพาะผู้ดูแลระบบและวิชาการจึงจะแก้ไขได้)
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-500">กำลังโหลดข้อมูลบุคลากร...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-sm font-bold text-slate-500">บุคลากร</th>
                  <th className="pb-3 text-sm font-bold text-slate-500">บทบาท/สิทธิ์</th>
                  <th className="pb-3 text-sm font-bold text-slate-500">ครูประจำชั้น</th>
                  <th className="pb-3 text-sm font-bold text-slate-500 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map(teacher => {
                  const isEditing = editingId === teacher.id;
                  
                  const canView = currentTeacher.role === "admin" || currentTeacher.role === "academic" || currentTeacher.role === "deputy";

  if (!canView) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center max-w-2xl mx-auto mt-12">
        <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
        <p className="text-slate-500 mb-6">คุณไม่มีสิทธิ์ในการเข้าถึงระบบจัดการบุคลากร (เฉพาะผู้ดูแลระบบ, รองผู้อำนวยการ, และฝ่ายวิชาการเท่านั้น)</p>
      </div>
    );
  }

  return (
                    <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 align-top">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                            {teacher.thaiName?.[0] || <UserCircle className="h-6 w-6" />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{teacher.thaiName}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{teacher.employeeId || '-'}</span>
                              {teacher.phoneNumber && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" /> {teacher.phoneNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 align-top">
                        {isEditing ? (
                          <select 
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="w-full max-w-[200px] border border-slate-200 rounded-md px-3 py-1.5 text-sm"
                          >
                            <option value="admin">ผู้ดูแลระบบสูงสุด (Admin)</option>
                            <option value="deputy">รองผู้อำนวยการ</option>
                            <option value="academic">ฝ่ายวิชาการ</option>
                            <option value="discipline">ฝ่ายปกครอง</option>
                            <option value="teacher">ครูผู้สอน</option>
                            <option value="staff">บุคลากรทั่วไป</option>
                          </select>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                            <Shield className="h-3.5 w-3.5" />
                            {ROLE_LABELS[teacher.role || 'teacher'] || ROLE_LABELS['teacher']}
                          </div>
                        )}
                      </td>

                      <td className="py-4 align-top">
                        {isEditing ? (
                          <div className="space-y-2">
                            <div>
                              <select
                                value={editHomeroom}
                                onChange={(e) => setEditHomeroom(e.target.value)}
                                className="w-full max-w-[200px] border border-slate-200 rounded-md px-3 py-1.5 text-sm"
                              >
                                <option value="">ไม่มี</option>
                                {GRADE_LEVELS.map(g => (
                                  <option key={`p1-${g}`} value={g}>{g}</option>
                                ))}
                              </select>
                              <div className="text-[10px] text-slate-400 mt-1">ประจำชั้นหลัก</div>
                            </div>
                            <div>
                              <select
                                value={editCoHomeroom}
                                onChange={(e) => setEditCoHomeroom(e.target.value)}
                                className="w-full max-w-[200px] border border-slate-200 rounded-md px-3 py-1.5 text-sm"
                              >
                                <option value="">ไม่มี</option>
                                {GRADE_LEVELS.map(g => (
                                  <option key={`p2-${g}`} value={g}>{g}</option>
                                ))}
                              </select>
                              <div className="text-[10px] text-slate-400 mt-1">ประจำชั้นร่วม (ถ้ามี)</div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {teacher.homeroomClass ? (
                              <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-flex">
                                <GraduationCap className="h-4 w-4" />
                                {teacher.homeroomClass}
                              </div>
                            ) : (
                              <div className="text-sm text-slate-400">-</div>
                            )}
                            
                            {teacher.coHomeroomClass && (
                              <div className="flex items-center gap-1.5 text-xs font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded inline-flex">
                                ผช. {teacher.coHomeroomClass}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-4 align-top text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleSave(teacher.id)}
                              disabled={isProcessing}
                              className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50 transition-colors"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              disabled={isProcessing}
                              className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-md transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleEditClick(teacher)}
                            disabled={!canEdit}
                            className={`p-1.5 rounded-md transition-colors ${canEdit ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 shadow-sm' : 'opacity-30 cursor-not-allowed text-slate-400'}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredTeachers.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                ไม่พบข้อมูลบุคลากรที่ค้นหา
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
