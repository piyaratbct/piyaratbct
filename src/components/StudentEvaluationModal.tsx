import React, { useState, useEffect } from 'react';
import { X, Save, ClipboardList, Loader2, Info } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { LessonRecord, LessonPlan } from '../types';
import { DESIRABLE_CHARACTERISTICS } from '../data';

interface Student {
  id: string;
  number: number;
  firstName: string;
  lastName: string;
  gradeLevel: string;
}

interface StudentEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: LessonRecord | null;
  plans: LessonPlan[];
  onSuccess: () => void;
}


const getDesirableFullText = (id: string) => {
  for (const char of DESIRABLE_CHARACTERISTICS) {
    const indicator = char.indicators.find(ind => ind.id === id);
    if (indicator) {
      return `${indicator.id} ${indicator.text}`;
    }
  }
  return id;
};

export function StudentEvaluationModal({
  isOpen,
  onClose,
  record,
  plans,
  onSuccess
}: StudentEvaluationModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [importedDesirable, setImportedDesirable] = useState<string[]>([]);
  const [studentDesirableScores, setStudentDesirableScores] = useState<Record<string, Record<string, number>>>({});
  
  const [importedIndicators, setImportedIndicators] = useState<string[]>([]);
  const [studentIndicatorScores, setStudentIndicatorScores] = useState<Record<string, Record<string, number>>>({});
  
  const [importedCompetencies, setImportedCompetencies] = useState<string[]>([]);
  const [studentCompetencyScores, setStudentCompetencyScores] = useState<Record<string, Record<string, number>>>({});

  // Initialize data when record changes
  useEffect(() => {
    if (!record || !isOpen) return;

    let initDesirable = record.importedDesirable || [];
    let initIndicators = record.importedIndicators || [];
    let initCompetencies = record.importedCompetencies || [];

    // Fallback to plan if empty
    if (initDesirable.length === 0 && initIndicators.length === 0 && initCompetencies.length === 0 && record.lessonPlanId) {
      const plan = plans.find(p => p.id === record.lessonPlanId);
      if (plan) {
        initDesirable = plan.desirableCharacteristics || [];
        
        const indicators = [];
        if (plan.coreIndicators) indicators.push(...plan.coreIndicators.split('\n').filter(s => s.trim()));
        if (plan.targetIndicators) indicators.push(...plan.targetIndicators.split('\n').filter(s => s.trim()));
        initIndicators = indicators;

        const comps = [];
        if (plan.competencies) comps.push(...plan.competencies.split('\n').filter(s => s.trim()));
        initCompetencies = comps;
      }
    }

    setImportedDesirable(initDesirable);
    setImportedIndicators(initIndicators);
    setImportedCompetencies(initCompetencies);

    setStudentDesirableScores(record.studentDesirableScores || {});
    setStudentIndicatorScores(record.studentIndicatorScores || {});
    setStudentCompetencyScores(record.studentCompetencyScores || {});

  }, [record, isOpen, plans]);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      if (!record?.gradeLevel || !isOpen) {
        setStudents([]);
        return;
      }
      setIsLoadingStudents(true);
      try {
        const q = query(collection(db, 'students'), where('gradeLevel', '==', record.gradeLevel), where('status', '==', 'active'));
        const snap = await getDocs(q);
        const studentList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        studentList.sort((a, b) => a.number - b.number);
        setStudents(studentList);
      } catch(e) {
        console.error(e);
      }
      setIsLoadingStudents(false);
    };
    fetchStudents();
  }, [record?.gradeLevel, isOpen]);

  const handleSave = async () => {
    if (!record) return;
    setIsSaving(true);
    try {
      const recordRef = doc(db, 'records', record.id);
      await updateDoc(recordRef, {
        importedDesirable,
        studentDesirableScores,
        importedIndicators,
        studentIndicatorScores,
        importedCompetencies,
        studentCompetencyScores,
        updatedAt: new Date().toISOString()
      });
      onSuccess();
      onClose();
    } catch (e) {
      console.error("Error saving evaluations:", e);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !record) return null;

  const hasAnyEvaluations = importedDesirable.length > 0 || importedIndicators.length > 0 || importedCompetencies.length > 0;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-500" />
              ประเมินผลรายบุคคล
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {record.content.split('\n')[0]} • {record.gradeLevel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/50">
          {!hasAnyEvaluations ? (
            <div className="flex flex-col items-center justify-center h-48 bg-white border border-slate-200 rounded-xl">
              <Info className="w-8 h-8 text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-600">ไม่มีข้อมูลเกณฑ์การประเมิน</p>
              <p className="text-xs text-slate-500 mt-1">กรุณาเพิ่มข้อมูลตัวชี้วัด, สมรรถนะ หรือคุณลักษณะในแผนการสอน</p>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Indicators Table */}
              {importedIndicators.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-slate-100 bg-white">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-blue-500" />
                      ตารางประเมินผลรายบุคคล (ตัวชี้วัด / จุดประสงค์)
                    </label>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold text-slate-700 w-16">เลขที่</th>
                          <th className="px-4 py-3 text-left font-bold text-slate-700 min-w-[150px] sticky left-0 bg-slate-50 z-10 shadow-[1px_0_0_#e2e8f0]">ชื่อ - สกุล</th>
                          {importedIndicators.map((char, idx) => (
                            <th key={idx} className="px-4 py-3 text-center font-bold text-slate-700 min-w-[120px] max-w-[200px] whitespace-normal">
                              {char}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.length > 0 ? (
                          students.map(student => (
                            <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 text-slate-600 font-medium">{student.number}</td>
                              <td className="px-4 py-3 text-slate-800 font-medium sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-[1px_0_0_#e2e8f0]">
                                {student.firstName} {student.lastName}
                              </td>
                              {importedIndicators.map((char, idx) => (
                                <td key={idx} className="px-4 py-2 text-center">
                                  <select
                                    className="w-16 p-1.5 text-center border border-slate-200 rounded-lg text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer bg-slate-50 hover:bg-white"
                                    value={studentIndicatorScores[student.id]?.[char] ?? ''}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? null : Number(e.target.value);
                                      setStudentIndicatorScores(prev => {
                                        const next = { ...prev };
                                        if (!next[student.id]) next[student.id] = {};
                                        if (val === null) {
                                          delete next[student.id][char];
                                        } else {
                                          next[student.id][char] = val;
                                        }
                                        return next;
                                      });
                                    }}
                                  >
                                    <option value="">-</option>
                                    <option value="3">3 (ดีเยี่ยม)</option>
                                    <option value="2">2 (ดี)</option>
                                    <option value="1">1 (ผ่าน)</option>
                                    <option value="0">0 (ไม่ผ่าน)</option>
                                  </select>
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={importedIndicators.length + 2} className="px-4 py-8 text-center text-slate-500">
                              {isLoadingStudents ? 'กำลังโหลดข้อมูลนักเรียน...' : 'ไม่พบข้อมูลนักเรียน'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Competencies Table */}
              {importedCompetencies.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-slate-100 bg-white">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-violet-500" />
                      ตารางประเมินผลรายบุคคล (สมรรถนะสำคัญของผู้เรียน)
                    </label>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold text-slate-700 w-16">เลขที่</th>
                          <th className="px-4 py-3 text-left font-bold text-slate-700 min-w-[150px] sticky left-0 bg-slate-50 z-10 shadow-[1px_0_0_#e2e8f0]">ชื่อ - สกุล</th>
                          {importedCompetencies.map((char, idx) => (
                            <th key={idx} className="px-4 py-3 text-center font-bold text-slate-700 min-w-[120px] max-w-[200px] whitespace-normal">
                              {char}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.length > 0 ? (
                          students.map(student => (
                            <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 text-slate-600 font-medium">{student.number}</td>
                              <td className="px-4 py-3 text-slate-800 font-medium sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-[1px_0_0_#e2e8f0]">
                                {student.firstName} {student.lastName}
                              </td>
                              {importedCompetencies.map((char, idx) => (
                                <td key={idx} className="px-4 py-2 text-center">
                                  <select
                                    className="w-16 p-1.5 text-center border border-slate-200 rounded-lg text-slate-700 outline-none focus:ring-2 focus:ring-violet-500 appearance-none cursor-pointer bg-slate-50 hover:bg-white"
                                    value={studentCompetencyScores[student.id]?.[char] ?? ''}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? null : Number(e.target.value);
                                      setStudentCompetencyScores(prev => {
                                        const next = { ...prev };
                                        if (!next[student.id]) next[student.id] = {};
                                        if (val === null) {
                                          delete next[student.id][char];
                                        } else {
                                          next[student.id][char] = val;
                                        }
                                        return next;
                                      });
                                    }}
                                  >
                                    <option value="">-</option>
                                    <option value="3">3 (ดีเยี่ยม)</option>
                                    <option value="2">2 (ดี)</option>
                                    <option value="1">1 (ผ่าน)</option>
                                    <option value="0">0 (ไม่ผ่าน)</option>
                                  </select>
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={importedCompetencies.length + 2} className="px-4 py-8 text-center text-slate-500">
                              {isLoadingStudents ? 'กำลังโหลดข้อมูลนักเรียน...' : 'ไม่พบข้อมูลนักเรียน'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Desirables Table */}
              {importedDesirable.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-slate-100 bg-white">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-emerald-500" />
                      ตารางประเมินผลรายบุคคล (คุณลักษณะอันพึงประสงค์)
                    </label>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold text-slate-700 w-16">เลขที่</th>
                          <th className="px-4 py-3 text-left font-bold text-slate-700 min-w-[150px] sticky left-0 bg-slate-50 z-10 shadow-[1px_0_0_#e2e8f0]">ชื่อ - สกุล</th>
                          {importedDesirable.map((char, idx) => (
                            <th key={idx} className="px-4 py-3 text-center font-bold text-slate-700 min-w-[120px] max-w-[200px] whitespace-normal">
                              {getDesirableFullText(char)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.length > 0 ? (
                          students.map(student => (
                            <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 text-slate-600 font-medium">{student.number}</td>
                              <td className="px-4 py-3 text-slate-800 font-medium sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-[1px_0_0_#e2e8f0]">
                                {student.firstName} {student.lastName}
                              </td>
                              {importedDesirable.map((char, idx) => (
                                <td key={idx} className="px-4 py-2 text-center">
                                  <select
                                    className="w-16 p-1.5 text-center border border-slate-200 rounded-lg text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer bg-slate-50 hover:bg-white"
                                    value={studentDesirableScores[student.id]?.[char] ?? ''}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? null : Number(e.target.value);
                                      setStudentDesirableScores(prev => {
                                        const next = { ...prev };
                                        if (!next[student.id]) next[student.id] = {};
                                        if (val === null) {
                                          delete next[student.id][char];
                                        } else {
                                          next[student.id][char] = val;
                                        }
                                        return next;
                                      });
                                    }}
                                  >
                                    <option value="">-</option>
                                    <option value="3">3 (ดีเยี่ยม)</option>
                                    <option value="2">2 (ดี)</option>
                                    <option value="1">1 (ผ่าน)</option>
                                    <option value="0">0 (ไม่ผ่าน)</option>
                                  </select>
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={importedDesirable.length + 2} className="px-4 py-8 text-center text-slate-500">
                              {isLoadingStudents ? 'กำลังโหลดข้อมูลนักเรียน...' : 'ไม่พบข้อมูลนักเรียน'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between rounded-b-2xl">
          <div className="text-[11px] text-slate-500">
            ระดับคะแนน: <span className="font-semibold text-slate-700">3</span> = ดีเยี่ยม, <span className="font-semibold text-slate-700">2</span> = ดี, <span className="font-semibold text-slate-700">1</span> = ผ่าน, <span className="font-semibold text-slate-700">0</span> = ไม่ผ่าน
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 bg-slate-100 rounded-xl transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !hasAnyEvaluations}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              บันทึกคะแนน
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
