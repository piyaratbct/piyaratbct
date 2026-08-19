import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Teacher, PDRecord, PDRecordType } from '../types';
import { Award, BookOpen, GraduationCap, LayoutDashboard, Plus, Trash2, X, FileText, Pencil, ExternalLink, Link as LinkIcon, AlertTriangle } from 'lucide-react';

interface StaffProfileModuleProps {
  currentTeacher: Teacher;
  teachers: Teacher[];
  systemAcademicYear: string;
  systemSemester: string;
  isPersonalView?: boolean;
}

export function StaffProfileModule({ currentTeacher, teachers, systemAcademicYear, systemSemester, isPersonalView = false }: StaffProfileModuleProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(currentTeacher.id);
  const [activeTab, setActiveTab] = useState<PDRecordType>('sar_overview');
  const [localAcademicYear, setLocalAcademicYear] = useState<string>("ทั้งหมด");
  const [records, setRecords] = useState<PDRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PDRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const canViewAll = !isPersonalView && (currentTeacher.role === 'admin' || currentTeacher.role === 'academic' || currentTeacher.role === 'deputy');
  const displayTeacher = teachers.find(t => t.id === selectedTeacherId) || currentTeacher;

  useEffect(() => {
    if (!selectedTeacherId) return;
    const q = query(collection(db, 'pd_records'), where('teacherId', '==', selectedTeacherId));
    const unsub = onSnapshot(q, (snapshot) => {
      const parsed = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PDRecord));
      setRecords(parsed);
    });
    return () => unsub();
  }, [selectedTeacherId]);

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      title: { value: string };
      date: { value: string };
      hours: { value: string };
      organizer: { value: string };
      description: { value: string };
      level: { value: string };
      evidenceUrl: { value: string };
    };

    const payload: Partial<PDRecord> = {
      title: target.title?.value || '',
      date: target.date?.value || '',
      hours: target.hours ? parseFloat(target.hours.value) : 0,
      organizer: target.organizer?.value || '',
      description: target.description?.value || '',
      level: target.level?.value || '',
      evidenceUrl: target.evidenceUrl?.value || '',
      type: activeTab,
      teacherId: selectedTeacherId,
      academicYear: systemAcademicYear,
      semester: systemSemester,
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingRecord) {
        await updateDoc(doc(db, 'pd_records', editingRecord.id), payload);
        window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'อัปเดตข้อมูลสำเร็จ', type: 'success' } }));
      } else {
        payload.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'pd_records'), payload);
        window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'บันทึกข้อมูลสำเร็จ', type: 'success' } }));
      }
      setShowForm(false);
      setEditingRecord(null);
    } catch (error) {
      console.error(error);
      window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'เกิดข้อผิดพลาดในการบันทึก', type: 'error' } }));
    }
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      await deleteDoc(doc(db, 'pd_records', recordToDelete));
      window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'ลบข้อมูลสำเร็จ', type: 'success' } }));
    } catch (error) {
      console.error(error);
      window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'เกิดข้อผิดพลาดในการลบ', type: 'error' } }));
    } finally {
      setRecordToDelete(null);
    }
  };

  const uniqueYears = Array.from(new Set(records.map(r => r.academicYear).filter(Boolean))).sort().reverse();
  const filteredRecords = records
    .filter(r => r.type === activeTab && (localAcademicYear === "ทั้งหมด" || r.academicYear === localAcademicYear))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // SAR Overview Stats
  const trainingRecords = records.filter(r => r.type === 'training' && (localAcademicYear === "ทั้งหมด" || r.academicYear === localAcademicYear));
  const plcRecords = records.filter(r => r.type === 'plc' && (localAcademicYear === "ทั้งหมด" || r.academicYear === localAcademicYear));
  const researchRecords = records.filter(r => r.type === 'research' && (localAcademicYear === "ทั้งหมด" || r.academicYear === localAcademicYear));
  
  const totalTrainingHours = trainingRecords.reduce((sum, r) => sum + (r.hours || 0), 0);
  const totalPLCHours = plcRecords.reduce((sum, r) => sum + (r.hours || 0), 0);
  const totalResearch = researchRecords.length;

  const TARGET_TRAINING = 20;
  const TARGET_PLC = 50;
  const TARGET_RESEARCH = 1;

  const getStatusColor = (current: number, target: number) => {
    if (current >= target) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (current >= target * 0.5) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };
  const getProgressColor = (current: number, target: number) => {
    if (current >= target) return 'bg-emerald-500';
    if (current >= target * 0.5) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-6">
      {/* Header & Teacher Selector */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-fuchsia-500" />
            แฟ้มสะสมผลงาน (e-Portfolio)
          </h2>
          <p className="text-sm text-slate-500 mt-1">บันทึกประวัติการพัฒนาวิชาชีพและผลงานเพื่อประกอบ SAR</p>
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <select
            value={localAcademicYear}
            onChange={(e) => setLocalAcademicYear(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm font-semibold bg-slate-50"
          >
            <option value="ทั้งหมด">แสดงปีการศึกษาทั้งหมด</option>
            {uniqueYears.map(year => (
              <option key={year as string} value={year as string}>ปีการศึกษา {year as string}</option>
            ))}
          </select>

          {canViewAll && (
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm font-semibold"
            >
              <option value={currentTeacher.id}>แฟ้มผลงานของฉัน ({currentTeacher.displayName})</option>
              <optgroup label="คุณครูทั้งหมด">
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.displayName} ({t.thaiName})</option>
                ))}
              </optgroup>
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Col: Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
            {displayTeacher.photoURL ? (
              <img src={displayTeacher.photoURL} alt={displayTeacher.thaiName} className="h-20 w-20 rounded-full mx-auto object-cover mb-4 border-2 border-fuchsia-100 shadow-sm" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-fuchsia-100 to-pink-100 mx-auto flex items-center justify-center text-2xl font-black text-fuchsia-600 mb-4">
                {displayTeacher.displayName?.charAt(0) || displayTeacher.thaiName?.charAt(0) || 'U'}
              </div>
            )}
            <h3 
              className="text-lg font-bold text-slate-800 whitespace-nowrap truncate px-2" 
              title={displayTeacher.thaiName}
            >
              ครู{displayTeacher.displayName}
            </h3>
            <p className="text-xs text-slate-500 mt-1" title={displayTeacher.thaiName}>{displayTeacher.thaiName}</p>
            <p className="text-xs text-slate-500 mt-1">รหัสประจำตัว: {displayTeacher.employeeId || '-'}</p>
            <div className="inline-block mt-3 px-3 py-1 bg-fuchsia-50 text-fuchsia-700 text-xs font-semibold rounded-full border border-fuchsia-100">
              {displayTeacher.affiliation || 'คุณครู'}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between text-left gap-2">
              <div className="bg-slate-50 p-3 rounded-xl flex-1">
                <span className="block text-[10px] text-slate-500 font-bold">ชม.อบรมรวม</span>
                <span className="text-xl font-black text-slate-800">
                  {records.filter(r => r.type === 'training').reduce((sum, r) => sum + (r.hours || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: PD Records */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs */}
          <div className="flex overflow-x-auto custom-scrollbar gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 shrink-0">
            {[
              { id: 'sar_overview', label: 'ภาพรวม SAR', icon: LayoutDashboard },
              { id: 'training', label: 'อบรม/สัมมนา', icon: GraduationCap },
              { id: 'plc', label: 'ชั่วโมง PLC', icon: BookOpen },
              { id: 'award', label: 'ผลงาน/รางวัล', icon: Award },
              { id: 'research', label: 'วิจัยชั้นเรียน', icon: FileText }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as PDRecordType)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-fuchsia-500 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'sar_overview' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Training Metric */}
                <div className={`p-5 rounded-2xl border bg-white flex flex-col justify-between ${totalTrainingHours >= TARGET_TRAINING ? 'border-emerald-200' : 'border-amber-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <GraduationCap className="h-5 w-5 text-slate-600" />
                    </div>
                    {totalTrainingHours >= TARGET_TRAINING ? (
                      <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">ผ่านเกณฑ์</span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-full">รอการพัฒนา</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-slate-500 text-xs font-bold mb-1">ชั่วโมงอบรม/พัฒนาตนเอง</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-800">{totalTrainingHours}</span>
                      <span className="text-sm font-semibold text-slate-400">/ {TARGET_TRAINING} ชม.</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${getProgressColor(totalTrainingHours, TARGET_TRAINING)}`} 
                        style={{ width: `${Math.min((totalTrainingHours / TARGET_TRAINING) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  {totalTrainingHours < TARGET_TRAINING && (
                    <button onClick={() => setActiveTab('training')} className="mt-4 text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center justify-between p-2 bg-amber-50 rounded-lg transition-colors">
                      ขาดอีก {TARGET_TRAINING - totalTrainingHours} ชม.
                      <span className="underline">เพิ่มข้อมูล &rarr;</span>
                    </button>
                  )}
                </div>

                {/* PLC Metric */}
                <div className={`p-5 rounded-2xl border bg-white flex flex-col justify-between ${totalPLCHours >= TARGET_PLC ? 'border-emerald-200' : 'border-amber-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <BookOpen className="h-5 w-5 text-slate-600" />
                    </div>
                    {totalPLCHours >= TARGET_PLC ? (
                      <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">ผ่านเกณฑ์</span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-full">รอการพัฒนา</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-slate-500 text-xs font-bold mb-1">ชั่วโมงชุมชนการเรียนรู้ (PLC)</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-800">{totalPLCHours}</span>
                      <span className="text-sm font-semibold text-slate-400">/ {TARGET_PLC} ชม.</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${getProgressColor(totalPLCHours, TARGET_PLC)}`} 
                        style={{ width: `${Math.min((totalPLCHours / TARGET_PLC) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  {totalPLCHours < TARGET_PLC && (
                    <button onClick={() => setActiveTab('plc')} className="mt-4 text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center justify-between p-2 bg-amber-50 rounded-lg transition-colors">
                      ขาดอีก {TARGET_PLC - totalPLCHours} ชม.
                      <span className="underline">เพิ่มข้อมูล &rarr;</span>
                    </button>
                  )}
                </div>

                {/* Research Metric */}
                <div className={`p-5 rounded-2xl border bg-white flex flex-col justify-between ${totalResearch >= TARGET_RESEARCH ? 'border-emerald-200' : 'border-rose-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <FileText className="h-5 w-5 text-slate-600" />
                    </div>
                    {totalResearch >= TARGET_RESEARCH ? (
                      <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">ผ่านเกณฑ์</span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-1 bg-rose-100 text-rose-700 rounded-full">ต้องดำเนินการ</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-slate-500 text-xs font-bold mb-1">วิจัยในชั้นเรียน / นวัตกรรม</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-800">{totalResearch}</span>
                      <span className="text-sm font-semibold text-slate-400">/ {TARGET_RESEARCH} เรื่อง</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${getProgressColor(totalResearch, TARGET_RESEARCH)}`} 
                        style={{ width: `${Math.min((totalResearch / TARGET_RESEARCH) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  {totalResearch < TARGET_RESEARCH && (
                    <button onClick={() => setActiveTab('research')} className="mt-4 text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center justify-between p-2 bg-rose-50 rounded-lg transition-colors">
                      ยังไม่มีผลงาน
                      <span className="underline">เพิ่มข้อมูล &rarr;</span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Optional: AI insights or tips panel */}
              <div className="bg-gradient-to-r from-indigo-500 to-fuchsia-600 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <LayoutDashboard className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-bold text-lg mb-1">การประเมินตนเอง (SAR)</h3>
                  <p className="text-indigo-100 text-sm">
                    ระบบจะนำข้อมูลผลงานและการอบรมที่บันทึกในหน้านี้ ไปคำนวณและจัดทำรูปเล่มรายงาน SAR ประจำปีให้อัตโนมัติในตอนสิ้นปีการศึกษา กรุณาอัปเดตข้อมูลให้เป็นปัจจุบันอยู่เสมอ
                  </p>
                </div>
              </div>
            </div>
          ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">
                {activeTab === 'training' ? 'ประวัติการอบรมและพัฒนาตนเอง' :
                 activeTab === 'plc' ? 'บันทึกชั่วโมงชุมชนการเรียนรู้ (PLC)' :
                 activeTab === 'award' ? 'ประวัติผลงานและรางวัลที่ได้รับ' :
                 'ทะเบียนสื่อ นวัตกรรม และวิจัยในชั้นเรียน'}
              </h3>
              {(currentTeacher.id === selectedTeacherId || currentTeacher.role === 'admin') && (
                <button
                  onClick={() => { setEditingRecord(null); setShowForm(true); }}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  เพิ่มข้อมูล
                </button>
              )}
            </div>

            <div className="p-4 sm:p-6">
              {filteredRecords.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                  <div className="h-12 w-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">ยังไม่มีข้อมูลในหมวดหมู่นี้</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecords.map(record => (
                    <div key={record.id} className="p-4 rounded-xl border border-slate-200 hover:border-fuchsia-300 transition-colors bg-white flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800">{record.title}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>วันที่: {new Date(record.date).toLocaleDateString('th-TH')}</span>
                          {(activeTab === 'training') && record.hours && (
                            <span className="font-semibold text-fuchsia-600">{record.hours} ชั่วโมง</span>
                          )}
                          {(activeTab === 'training' || activeTab === 'award') && record.organizer && (
                            <span>หน่วยงาน: {record.organizer}</span>
                          )}
                          {activeTab === 'award' && record.level && (
                            <span>ระดับ: {record.level}</span>
                          )}
                        </div>
                        {record.description && (
                          <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg">{record.description}</p>
                        )}
                        {record.evidenceUrl && (
                          <a 
                            href={record.evidenceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1.5 mt-2 text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors w-fit"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            ดูหลักฐานอ้างอิง
                          </a>
                        )}
                      </div>
                      
                      {(currentTeacher.id === selectedTeacherId || currentTeacher.role === 'admin') && (
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          <button 
                            onClick={() => { setEditingRecord(record); setShowForm(true); }}
                            className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => setRecordToDelete(record.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                {editingRecord ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูลใหม่'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-lg border border-slate-200 shadow-xs">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveRecord} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หัวข้อเรื่อง / ชื่อรายการ <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={editingRecord?.title} 
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm bg-slate-50"
                  placeholder={activeTab === 'training' ? 'หัวข้อการอบรม...' : activeTab === 'award' ? 'ชื่อรางวัล...' : 'ชื่องานวิจัย/นวัตกรรม...'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    วันที่ดำเนินการ <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    name="date" 
                    defaultValue={editingRecord?.date || new Date().toISOString().split('T')[0]} 
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm bg-slate-50"
                  />
                </div>
                {(activeTab === 'training') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">จำนวนชั่วโมง</label>
                    <input 
                      type="number" 
                      name="hours" 
                      min="0" step="0.5"
                      defaultValue={editingRecord?.hours} 
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm bg-slate-50"
                    />
                  </div>
                )}
                {activeTab === 'award' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ระดับรางวัล</label>
                    <select name="level" defaultValue={editingRecord?.level} className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm bg-slate-50">
                      <option value="">- เลือกระดับ -</option>
                      <option value="ระดับโรงเรียน">ระดับโรงเรียน</option>
                      <option value="ระดับเขตพื้นที่ฯ">ระดับเขตพื้นที่ฯ</option>
                      <option value="ระดับจังหวัด">ระดับจังหวัด</option>
                      <option value="ระดับภูมิภาค">ระดับภูมิภาค</option>
                      <option value="ระดับประเทศ">ระดับประเทศ</option>
                      <option value="ระดับนานาชาติ">ระดับนานาชาติ</option>
                    </select>
                  </div>
                )}
              </div>

              {(activeTab === 'training' || activeTab === 'award') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">หน่วยงานที่จัด / มอบรางวัล</label>
                  <input 
                    type="text" 
                    name="organizer" 
                    defaultValue={editingRecord?.organizer} 
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm bg-slate-50"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รายละเอียดเพิ่มเติม / สรุปผล</label>
                <textarea 
                  name="description" 
                  defaultValue={editingRecord?.description} 
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm bg-slate-50 resize-none"
                  placeholder="รายละเอียด..."
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ลิงก์หลักฐาน / รูปภาพประกอบ (URL)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <input 
                    type="url" 
                    name="evidenceUrl" 
                    defaultValue={editingRecord?.evidenceUrl} 
                    className="w-full pl-9 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm bg-slate-50"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  ยกเลิก
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-sm transition-colors">
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">ยืนยันการลบข้อมูล?</h3>
            <p className="text-sm text-slate-500 mb-6">คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้? การกระทำนี้ไม่สามารถกู้คืนได้</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
