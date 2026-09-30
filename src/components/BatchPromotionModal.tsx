import React, { useState, useEffect, useMemo } from "react";
import { Student, GRADE_LEVELS } from "../types";
import { db } from "../lib/firebase";
import { writeBatch, doc } from "firebase/firestore";
import { Users, AlertTriangle, ArrowRight, GraduationCap, CheckCircle, Info, Settings2, Lock, Clock, Award, CheckSquare, Square } from "lucide-react";
import { usePromotionEvaluations, StudentPromotionWarning, PromotionCriteriaConfig } from "../hooks/usePromotionEvaluations";
import { PromotionWarningModal } from "./PromotionWarningModal";

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

  // Criteria configuration state
  const [minAttendancePercent, setMinAttendancePercent] = useState<number>(80);
  const [minGpa, setMinGpa] = useState<number>(1.00);
  const [strictEnforcement, setStrictEnforcement] = useState<boolean>(true);
  const [showCriteriaSettings, setShowCriteriaSettings] = useState<boolean>(false);

  const criteriaConfig: PromotionCriteriaConfig = useMemo(() => ({
    minAttendancePercent,
    minGpa,
    disallowFailingGrades: true,
    requireKindergartenPass: true,
    requireRecordedScores: true
  }), [minAttendancePercent, minGpa]);
  
  // Evaluation warnings hook (grades < 1, 0, ร, มส, attendance < 80%, GPA)
  const { warnings, warningCount, eligibleCount, isLoading: isCheckingEvaluations } = usePromotionEvaluations(
    systemAcademicYear,
    currentGrade,
    students,
    criteriaConfig
  );

  const [selectedWarningStudent, setSelectedWarningStudent] = useState<{
    student: Student;
    warning: StudentPromotionWarning;
  } | null>(null);

  // Track which students are selected for promotion/action
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Default selection: select all eligible students, or all if not strict
  useEffect(() => {
    if (!students || students.length === 0) return;
    const initialSelected = new Set<string>();
    students.forEach((s) => {
      const warning = warnings[s.id];
      const hasWarning = warning?.hasWarning;
      // In strict enforcement, only select passing students by default
      if (!strictEnforcement || !hasWarning) {
        initialSelected.add(s.id);
      }
    });
    setSelectedStudentIds(initialSelected);
  }, [students, warnings, strictEnforcement]);

  // Student specific actions
  const [studentActions, setStudentActions] = useState<Record<string, { action: 'promote' | 'retain' | 'graduate', targetGrade?: string, destinationSchool?: string }>>({});

  useEffect(() => {
    const initialActions: any = {};
    students.forEach(s => {
      const isGraduating = defaultNextGrade === 'จบการศึกษา';

      initialActions[s.id] = {
        action: isGraduating ? 'graduate' : 'promote',
        targetGrade: defaultNextGrade === 'จบการศึกษา' ? '' : defaultNextGrade,
        destinationSchool: ''
      };
    });
    setStudentActions(initialActions);
  }, [students, defaultNextGrade]);

  const [isProcessing, setIsProcessing] = useState(false);

  // Toggle individual student selection
  const handleToggleSelectStudent = (studentId: string) => {
    const warning = warnings[studentId];
    if (strictEnforcement && warning?.hasWarning && !selectedStudentIds.has(studentId)) {
      alert(`⛔ ไม่สามารถเลือกนักเรียนคนนี้ได้ เนื่องจากเปิดระบบตรวจสอบเกณฑ์อัตโนมัติ และนักเรียนมีผลการประเมินไม่ผ่านเกณฑ์ (${warning.summaryText})`);
      return;
    }

    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  // Select all or select only passing
  const handleSelectAll = (select: boolean) => {
    if (!select) {
      setSelectedStudentIds(new Set());
      return;
    }

    const next = new Set<string>();
    students.forEach(s => {
      const warning = warnings[s.id];
      if (!strictEnforcement || !warning?.hasWarning) {
        next.add(s.id);
      }
    });
    setSelectedStudentIds(next);
  };

  // Select only passed
  const handleSelectOnlyPassed = () => {
    const next = new Set<string>();
    students.forEach(s => {
      if (!warnings[s.id]?.hasWarning) {
        next.add(s.id);
      }
    });
    setSelectedStudentIds(next);
  };

  const handlePromote = async () => {
    if (!students || students.length === 0) return;

    if (selectedStudentIds.size === 0) {
      alert("กรุณาเลือกนักเรียนอย่างน้อย 1 คน เพื่อดำเนินการเลื่อนชั้นหรือจบการศึกษา");
      return;
    }

    const targetStudents = students.filter(s => selectedStudentIds.has(s.id));

    // Check if any failing students are selected for promotion
    const failingPromotingStudents = targetStudents.filter(s => 
      warnings[s.id]?.hasWarning && studentActions[s.id]?.action === 'promote'
    );

    if (failingPromotingStudents.length > 0) {
      if (strictEnforcement) {
        alert(
          `⛔ ระบบไม่อนุญาตให้เลื่อนชั้นนักเรียนที่ไม่ผ่านเกณฑ์การประเมิน (${failingPromotingStudents.length} คน)\n\nเนื่องจากเปิดใช้งานระบบตรวจสอบอัตโนมัติ (ต้องมีข้อมูลคะแนนบันทึกไว้จริง, เวลาเรียน ≥ ${minAttendancePercent}%, GPA ≥ ${minGpa.toFixed(2)}, ไม่มีวิชาติด 0/ร/มส)\n\nกรุณายกเลิกการเลือกนักเรียนที่ไม่ผ่านเกณฑ์ หรือเปลี่ยนสถานะเป็น "ซ้ำชั้นเดิม"`
        );
        return;
      }

      const proceed = window.confirm(
        `⚠️ แจ้งเตือน: มีนักเรียนจำนวน ${failingPromotingStudents.length} คน ที่ยังไม่ผ่านเกณฑ์การประเมิน แต่ถูกเลือกให้ "เลื่อนชั้น"\n\nคุณแน่ใจหรือไม่ว่าต้องการดำเนินการเลื่อนชั้นนักเรียนเหล่านี้? (แนะนำให้เลือกเฉพาะผู้ที่ผ่านเกณฑ์ หรือสอบซ่อมเสริมก่อน)`
      );
      if (!proceed) return;
    }

    setIsProcessing(true);

    try {
      const batch = writeBatch(db);
      
      targetStudents.forEach((student) => {
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
    if (field === 'action' && value === 'promote' && strictEnforcement && warnings[studentId]?.hasWarning) {
      alert(`⛔ ไม่สามารถเลือก "เลื่อนชั้น" ให้นักเรียนคนนี้ได้ เนื่องจากเปิดระบบตรวจสอบเกณฑ์อัตโนมัติ และนักเรียนมีผลการประเมินไม่ผ่านเกณฑ์ (${warnings[studentId]?.summaryText})`);
      return;
    }

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

            <button
              type="button"
              onClick={() => setShowCriteriaSettings(!showCriteriaSettings)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span>{showCriteriaSettings ? 'ปิดตั้งค่าเกณฑ์' : 'เกณฑ์การเลื่อนชั้น'}</span>
            </button>
          </div>

          {/* Criteria Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3 text-slate-600">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  {strictEnforcement ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                      <Lock className="h-2.5 w-2.5" />
                      ระบบบังคับเกณฑ์อัตโนมัติ (ห้ามเลื่อนผู้ที่ไม่ผ่าน)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      โหมดแจ้งเตือน
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="h-3 w-3 text-slate-400" />
                  เวลาเรียน ≥ <strong>{minAttendancePercent}%</strong>
                </span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Award className="h-3 w-3 text-slate-400" />
                  GPA สะสม ≥ <strong>{minGpa.toFixed(2)}</strong>
                </span>
              </div>
              <div className="text-[11px] font-semibold text-slate-500">
                ผ่านเกณฑ์: <strong className="text-emerald-700">{eligibleCount} คน</strong> • ไม่ผ่าน: <strong className="text-rose-700">{warningCount} คน</strong>
              </div>
            </div>

            {showCriteriaSettings && (
              <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">เวลาเรียนขั้นต่ำ (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={minAttendancePercent}
                    onChange={(e) => setMinAttendancePercent(Number(e.target.value) || 80)}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">เกรดเฉลี่ยขั้นต่ำ (GPA)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="4.0"
                    value={minGpa}
                    onChange={(e) => setMinGpa(Number(e.target.value) || 1.0)}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-700"
                  />
                </div>
                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={strictEnforcement}
                      onChange={(e) => setStrictEnforcement(e.target.checked)}
                      className="h-4 w-4 text-amber-600 rounded"
                    />
                    <span className="text-xs font-semibold text-slate-700">บล็อกการเลื่อนชั้นหากไม่ผ่าน</span>
                  </label>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-center mb-3">
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
              <AlertTriangle className="h-4 w-4 shrink-0 inline mr-1 text-amber-600" />
              ระบบจะบันทึกข้อมูลระดับชั้นเดิมไว้ในประวัตินักเรียนโดยอัตโนมัติ
            </div>
          </div>

          {/* Selection controls & Warning notice */}
          <div className="bg-slate-100/80 border border-slate-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                เลือกนักเรียนที่จะเลื่อนชั้น/จบการศึกษา:
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
                เลือกแล้ว {selectedStudentIds.size} จาก {students.length} คน
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckSquare className="h-3.5 w-3.5 text-indigo-600" />
                <span>เลือกทั้งหมด</span>
              </button>

              {warningCount > 0 && (
                <button
                  type="button"
                  onClick={handleSelectOnlyPassed}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>เลือกเฉพาะผู้ผ่านเกณฑ์ ({eligibleCount})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Square className="h-3.5 w-3.5 text-slate-400" />
                <span>ยกเลิกการเลือกทั้งหมด</span>
              </button>
            </div>
          </div>

          {warningCount > 0 && (
            <div className="mt-2.5 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2.5 animate-in fade-in">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              <div className="text-xs text-rose-900 flex-1">
                <span className="font-bold">ตรวจพบนักเรียน {warningCount} คน ที่มีผลการประเมินไม่ผ่านเกณฑ์</span>
                <span className="text-rose-700 block sm:inline sm:ml-1">
                  (เวลาเรียนไม่ถึง {minAttendancePercent}%, GPA ต่ำกว่า {minGpa.toFixed(2)}, หรือมีวิชาติด 0/ร/มส) — ท่านสามารถคลิกเพื่อติ๊กเลือก/ไม่เลือกนักเรียนแต่ละคนได้ด้านล่าง
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-y-auto p-6 flex-1 bg-slate-50/50">
          <div className="space-y-3">
            {students.map((student, idx) => {
              const actionData = studentActions[student.id];
              if (!actionData) return null;

              const warning = warnings[student.id];
              const hasWarning = warning?.hasWarning;
              const isSelected = selectedStudentIds.has(student.id);
              
              return (
                <div 
                  key={student.id} 
                  className={`p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center transition-all ${
                    !isSelected
                      ? 'bg-slate-50/70 border-slate-200 opacity-60'
                      : hasWarning 
                        ? 'bg-rose-50/30 border-rose-200 hover:bg-rose-50/50' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center cursor-pointer p-1 -m-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectStudent(student.id)}
                        className="h-4 w-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                      />
                    </label>
                    <span className="text-xs font-bold text-slate-400 w-5 shrink-0">{idx + 1}.</span>
                  </div>

                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 flex-wrap">
                        <span 
                          onClick={() => handleToggleSelectStudent(student.id)}
                          className="font-bold text-slate-800 text-sm cursor-pointer hover:text-amber-700" 
                          title={`${student.title || ''}${student.firstName} ${student.lastName}`}
                        >
                          {student.title || ''}{student.firstName} {student.lastName}
                          {student.nickname && <span className="text-slate-400 font-normal ml-1">({student.nickname})</span>}
                        </span>
                        
                        {/* Warning badge */}
                        {hasWarning && (
                          <button
                            type="button"
                            onClick={() => setSelectedWarningStudent({ student, warning })}
                            title="คลิกเพื่อดูรายละเอียดผลการประเมินที่ไม่ผ่าน"
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors cursor-pointer group w-fit whitespace-nowrap ${
                              warning.isMissingScores
                                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                                : 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                            }`}
                          >
                            <AlertTriangle className={`h-3.5 w-3.5 shrink-0 group-hover:scale-110 transition-transform ${
                              warning.isMissingScores ? 'text-amber-700' : 'text-rose-600'
                            }`} />
                            <span>{warning.summaryText || 'ไม่ผ่านเกณฑ์'}</span>
                            <span className={`text-[10px] underline ml-0.5 ${
                              warning.isMissingScores ? 'text-amber-800' : 'text-rose-700'
                            }`}>คลิกดู</span>
                          </button>
                        )}
                        {!hasWarning && !isCheckingEvaluations && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 w-fit whitespace-nowrap">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>ผ่านเกณฑ์</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        รหัส: {student.studentId} • เลขที่ {student.number || '-'}
                        {!isSelected && <span className="text-rose-600 ml-2 font-medium">(ไม่ถูกเลือกเลื่อนชั้น)</span>}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
                    <select
                      value={actionData.action}
                      onChange={(e) => handleActionChange(student.id, 'action', e.target.value)}
                      className={`border rounded-lg px-3 py-2 text-sm font-bold outline-none ${
                        hasWarning && actionData.action === 'promote'
                          ? 'border-rose-400 bg-rose-50 text-rose-900 focus:border-rose-600'
                          : 'border-slate-200 text-slate-700 focus:border-amber-500'
                      }`}
                    >
                      <option 
                        value="promote" 
                        disabled={strictEnforcement && hasWarning}
                      >
                        {strictEnforcement && hasWarning ? '⛔ เลื่อนชั้น (ติดเกณฑ์ประเมิน)' : 'เลื่อนชั้นไปที่'}
                      </option>
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
            disabled={isProcessing || students.length === 0 || selectedStudentIds.size === 0}
            className="flex-1 px-4 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {isProcessing ? "กำลังดำเนินการ..." : `ยืนยันและบันทึกข้อมูล (${selectedStudentIds.size} คน)`}
          </button>
        </div>
      </div>

      {selectedWarningStudent && (
        <PromotionWarningModal
          student={selectedWarningStudent.student}
          warning={selectedWarningStudent.warning}
          onClose={() => setSelectedWarningStudent(null)}
        />
      )}
    </div>
  );
};

