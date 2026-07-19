import React, { useState, useMemo } from "react";
import { Student, GRADE_LEVELS } from "../types";
import { db } from "../lib/firebase";
import { writeBatch, doc } from "firebase/firestore";
import { Users, AlertTriangle, ArrowRight, GraduationCap } from "lucide-react";

interface BatchPromotionModalProps {
  students: Student[];
  currentGrade: string;
  systemAcademicYear: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const BatchPromotionModal: React.FC<BatchPromotionModalProps> = ({
  students,
  currentGrade,
  systemAcademicYear,
  onClose,
  onSuccess,
}) => {
  const getNextGrade = (current: string) => {
    if (current === 'อนุบาล 3') return 'ประถมศึกษาปีที่ 1';
    if (current.startsWith('ประถมศึกษาปีที่ 6')) return 'จบการศึกษา';
    
    // Check for /1 or /2
    const match = current.match(/ประถมศึกษาปีที่ (\d)(\/(\d))?/);
    if (match) {
      const year = parseInt(match[1]);
      const room = match[3];
      if (room) {
        return `ประถมศึกษาปีที่ ${year + 1}/${room}`;
      } else {
        return `ประถมศึกษาปีที่ ${year + 1}`;
      }
    }
    
    return GRADE_LEVELS[GRADE_LEVELS.indexOf(current) + 1] || 'จบการศึกษา';
  };

  const defaultNextGrade = getNextGrade(currentGrade);
  
  // Default to system year + 1 for promotion
  const [newAcademicYear, setNewAcademicYear] = useState<string>(
    (parseInt(systemAcademicYear) + 1).toString()
  );
  
  // Student specific actions
  const [studentActions, setStudentActions] = useState<Record<string, { action: 'promote' | 'retain' | 'graduate', targetGrade?: string, destinationSchool?: string }>>({});

  useMemo(() => {
    const initialActions: any = {};
    students.forEach(s => {
      initialActions[s.id] = {
        action: defaultNextGrade === 'จบการศึกษา' ? 'graduate' : 'promote',
        targetGrade: defaultNextGrade === 'จบการศึกษา' ? '' : defaultNextGrade,
        destinationSchool: ''
      };
    });
    setStudentActions(initialActions);
  }, [students, defaultNextGrade]);

  const [isProcessing, setIsProcessing] = useState(false);

  const handlePromote = async () => {
    if (!students || students.length === 0) return;
    setIsProcessing(true);

    try {
      const batch = writeBatch(db);
      
      students.forEach((student) => {
        const actionData = studentActions[student.id];
        if (!actionData) return;
        
        const studentRef = doc(db, "students", student.id);
        
        const historicalRecord = {
          academicYear: systemAcademicYear,
          gradeLevel: student.gradeLevel,
          promotedAt: new Date().toISOString()
        };
        
        const updatedHistory = [...(student.historicalRecords || []), historicalRecord];
        
        if (actionData.action === 'graduate') {
           batch.update(studentRef, {
             status: 'graduated',
             gradeLevel: 'จบการศึกษา',
             destinationSchool: actionData.destinationSchool || '',
             historicalRecords: updatedHistory,
             academicYear: newAcademicYear
           });
        } else if (actionData.action === 'promote') {
           batch.update(studentRef, {
             gradeLevel: actionData.targetGrade,
             academicYear: newAcademicYear,
             historicalRecords: updatedHistory
           });
        } else if (actionData.action === 'retain') {
           batch.update(studentRef, {
             academicYear: newAcademicYear,
             historicalRecords: updatedHistory
           });
        }
      });
      await batch.commit();
      onSuccess();
    } catch (error) {
      console.error("Error promoting students:", error);
      alert("เกิดข้อผิดพลาดในการเลื่อนชั้น");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActionChange = (studentId: string, field: string, value: string) => {
    setStudentActions(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg">
                  เลื่อนชั้น / จบการศึกษา
                </h3>
                <p className="text-slate-500 text-sm">
                  อัปเดตระดับชั้นและปีการศึกษาของนักเรียนทั้งหมดในห้อง พร้อมบันทึกประวัติ
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4 flex-1 w-full">
               <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 mb-1">ชั้นเรียนปัจจุบัน</p>
                  <p className="font-bold text-slate-800">{currentGrade}</p>
                  <p className="text-xs text-slate-500">ปีการศึกษา {systemAcademicYear}</p>
               </div>
               <ArrowRight className="h-5 w-5 text-slate-300" />
               <div className="flex-1 text-right">
                  <p className="text-xs font-bold text-slate-400 mb-1">ปีการศึกษาใหม่</p>
                  <input
                    type="text"
                    value={newAcademicYear}
                    onChange={(e) => setNewAcademicYear(e.target.value)}
                    className="w-24 border border-slate-200 rounded px-2 py-1 text-sm font-bold text-slate-700 outline-none focus:border-amber-500 text-right"
                  />
               </div>
            </div>
            <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-xs font-medium flex-1 h-full w-full">
              <AlertTriangle className="h-4 w-4 shrink-0 inline mr-1" />
              ระบบจะบันทึกข้อมูลระดับชั้นเดิมไว้ในประวัตินักเรียนโดยอัตโนมัติ
            </div>
          </div>
        </div>

        <div className="overflow-y-auto p-6 flex-1 bg-slate-50/50">
          <div className="space-y-3">
            {students.map((student, idx) => {
              const actionData = studentActions[student.id];
              if (!actionData) return null;
              
              return (
                <div key={student.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-slate-400 w-6">{idx + 1}.</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800 truncate">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-slate-500 truncate">รหัส: {student.studentId}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
                    <select
                      value={actionData.action}
                      onChange={(e) => handleActionChange(student.id, 'action', e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-amber-500"
                    >
                      <option value="promote">เลื่อนชั้นไปที่</option>
                      <option value="retain">ซ้ำชั้นเดิม</option>
                      <option value="graduate">จบการศึกษา/ย้ายออก</option>
                    </select>
                    
                    {actionData.action === 'promote' && (
                      <select
                        value={actionData.targetGrade}
                        onChange={(e) => handleActionChange(student.id, 'targetGrade', e.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-amber-500"
                      >
                        {Array.from(new Set([actionData.targetGrade || '', ...GRADE_LEVELS])).filter(Boolean).map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    )}
                    
                    {actionData.action === 'graduate' && (
                      <input
                        type="text"
                        placeholder="โรงเรียนปลายทางที่ไปศึกษาต่อ..."
                        value={actionData.destinationSchool || ''}
                        onChange={(e) => handleActionChange(student.id, 'destinationSchool', e.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-amber-500 w-full sm:w-64"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 shrink-0 flex gap-3 bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handlePromote}
            disabled={isProcessing || students.length === 0}
            className="flex-1 px-4 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? "กำลังดำเนินการ..." : "ยืนยันและบันทึกข้อมูล"}
          </button>
        </div>
      </div>
    </div>
  );
};
