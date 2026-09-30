import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle, AlertCircle, Users, ArrowRight, GraduationCap, 
  ChevronRight, ShieldAlert, AlertTriangle, Filter, Info, Settings2, Lock, Award, Clock,
  CheckSquare, Square
} from 'lucide-react';
import { writeBatch, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Student, GRADE_LEVELS, Teacher } from '../types';
import { usePromotionEvaluations, StudentPromotionWarning, PromotionCriteriaConfig } from '../hooks/usePromotionEvaluations';
import { PromotionWarningModal } from './PromotionWarningModal';

export const PromotionManager: React.FC<{
  currentAcademicYear: string;
  targetAcademicYear: string;
  students: Student[];
  currentTeacher?: Teacher;
}> = ({ currentAcademicYear, targetAcademicYear, students, currentTeacher }) => {
  const [selectedGrade, setSelectedGrade] = useState<string>(GRADE_LEVELS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOnlyWarnings, setShowOnlyWarnings] = useState(false);
  const [selectedStudentForWarning, setSelectedStudentForWarning] = useState<{
    student: Student;
    warning: StudentPromotionWarning;
  } | null>(null);

  // Set of selected student IDs to promote
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Criteria configuration state
  const [minAttendancePercent, setMinAttendancePercent] = useState<number>(80);
  const [minGpa, setMinGpa] = useState<number>(1.00);
  const [strictEnforcement, setStrictEnforcement] = useState<boolean>(true);
  const [showCriteriaSettings, setShowCriteriaSettings] = useState<boolean>(false);

  const canManage = Boolean(currentTeacher && (currentTeacher.role === 'admin' || currentTeacher.role === 'academic' || currentTeacher.role === 'deputy'));

  // Active students in the selected grade
  const classStudents = useMemo(() => 
    students.filter(s => 
      s.gradeLevel === selectedGrade && 
      (s.status === 'active' || !s.status)
    ).sort((a, b) => a.number - b.number),
    [students, selectedGrade]
  );

  const criteriaConfig: PromotionCriteriaConfig = useMemo(() => ({
    minAttendancePercent,
    minGpa,
    disallowFailingGrades: true,
    requireKindergartenPass: true,
    requireRecordedScores: true
  }), [minAttendancePercent, minGpa]);

  // Hook to check student promotion evaluations (grades < 1, 0, ร, มส, attendance < 80%, GPA)
  const { warnings, warningCount, eligibleCount, isLoading: isCheckingEvaluations } = usePromotionEvaluations(
    currentAcademicYear,
    selectedGrade,
    classStudents,
    criteriaConfig
  );

  // Initialize selected students whenever grade or classStudents change
  useEffect(() => {
    const initial = new Set<string>();
    classStudents.forEach(s => {
      const warning = warnings[s.id];
      // In strict mode, only select students who pass criteria
      if (!strictEnforcement || !warning?.hasWarning) {
        initial.add(s.id);
      }
    });
    setSelectedStudentIds(initial);
  }, [selectedGrade, classStudents.length, warnings, strictEnforcement]);

  const displayedStudents = showOnlyWarnings
    ? classStudents.filter(s => warnings[s.id]?.hasWarning)
    : classStudents;

  const getNextGrade = (current: string): string => {
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

  // Toggle selection for an individual student
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

  // Select all or deselect all
  const handleSelectAll = (select: boolean) => {
    if (!select) {
      setSelectedStudentIds(new Set());
      return;
    }

    const next = new Set<string>();
    classStudents.forEach(s => {
      const warning = warnings[s.id];
      if (!strictEnforcement || !warning?.hasWarning) {
        next.add(s.id);
      }
    });
    setSelectedStudentIds(next);
  };

  // Select only passing students
  const handleSelectOnlyPassed = () => {
    const next = new Set<string>();
    classStudents.forEach(s => {
      if (!warnings[s.id]?.hasWarning) {
        next.add(s.id);
      }
    });
    setSelectedStudentIds(next);
  };

  // Promote selected students
  const handlePromoteSelected = async () => {
    if (!canManage) {
      alert('คุณไม่มีสิทธิ์ในการจัดการเลื่อนชั้นหรือจบการศึกษา (สงวนสิทธิ์เฉพาะฝ่ายวิชาการและผู้ดูแลระบบ)');
      return;
    }

    if (selectedStudentIds.size === 0) {
      alert('กรุณาเลือกนักเรียนอย่างน้อย 1 คน เพื่อดำเนินการเลื่อนชั้นหรือจบการศึกษา');
      return;
    }

    const studentsToPromote = classStudents.filter(s => selectedStudentIds.has(s.id));
    const failingSelected = studentsToPromote.filter(s => warnings[s.id]?.hasWarning);

    if (failingSelected.length > 0) {
      if (strictEnforcement) {
        alert(
          `⛔ ระบบไม่อนุญาตให้เลื่อนชั้นนักเรียนที่ไม่ผ่านเกณฑ์ (${failingSelected.length} คน)\n\nกรุณายกเลิกการเลือกนักเรียนที่ไม่ผ่านเกณฑ์ หรือปรับโหมดเป็นแจ้งเตือน`
        );
        return;
      }

      const proceed = window.confirm(
        `⚠️ แจ้งเตือน: มีนักเรียนที่ไม่ผ่านเกณฑ์การประเมินจำนวน ${failingSelected.length} คน ถูกเลือกให้เลื่อนชั้น\n\nคุณแน่ใจหรือไม่ว่าต้องการดำเนินการเลื่อนชั้นนักเรียนเหล่านี้?`
      );
      if (!proceed) return;
    }

    const nextGrade = getNextGrade(selectedGrade);
    const confirmMsg = nextGrade === 'จบการศึกษา'
      ? `ยืนยันการบันทึกสถานะ "จบการศึกษา" ให้นักเรียนที่เลือกจำนวน ${studentsToPromote.length} คน?\n(นักเรียนที่ไม่ได้เลือกจำนวน ${classStudents.length - studentsToPromote.length} คน จะยังคงอยู่ในระดับชั้นเดิม)`
      : `ยืนยันการเลื่อนชั้นนักเรียนที่เลือกไปยัง "${nextGrade}" จำนวน ${studentsToPromote.length} คน?\n(นักเรียนที่ไม่ได้เลือกจำนวน ${classStudents.length - studentsToPromote.length} คน จะยังคงอยู่ในระดับชั้นเดิมเพื่อรอสอบซ่อมเสริม/ซ้ำชั้น)`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setIsProcessing(true);
      const batch = writeBatch(db);

      studentsToPromote.forEach(student => {
        const studentRef = doc(db, 'students', student.id);
        const historicalRecord = {
          academicYear: currentAcademicYear,
          gradeLevel: student.gradeLevel,
          promotedAt: new Date().toISOString()
        };
        const updatedHistory = [...(student.historicalRecords || []), historicalRecord];

        if (nextGrade === 'จบการศึกษา') {
          batch.update(studentRef, { 
            status: 'graduated',
            historicalRecords: updatedHistory,
            academicYear: targetAcademicYear
          });
        } else {
          batch.update(studentRef, { 
            gradeLevel: nextGrade,
            historicalRecords: updatedHistory,
            academicYear: targetAcademicYear
          });
        }
      });

      await batch.commit();
      alert(`ดำเนินการเลื่อนชั้นนักเรียนที่เลือกสำเร็จ ${studentsToPromote.length} คน! (กรุณารีเฟรชหน้าจอเพื่อดูข้อมูลล่าสุด)`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'students');
      alert('เกิดข้อผิดพลาดในการเลื่อนชั้น');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!canManage) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center max-w-2xl mx-auto my-6">
        <div className="h-16 w-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">จำกัดสิทธิ์การเข้าถึง</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          หน้า <strong>"จัดการเลื่อนชั้นและจบการศึกษา"</strong> ถูกจำกัดสิทธิ์การเข้าถึงสำหรับครูผู้สอน
          ฟังก์ชันนี้สงวนสิทธิ์เฉพาะฝ่ายวิชาการ (Academic), ผู้บริหาร (Deputy) และผู้ดูแลระบบ (Admin) เท่านั้น
          เพื่อป้องกันความผิดพลาดของข้อมูลสถานะนักเรียนทั้งโรงเรียน
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
          สถานะบัญชีปัจจุบัน: ครูผู้สอน (Teacher)
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-2">จัดการเลื่อนชั้นและจบการศึกษา</h3>
        <p className="text-sm text-slate-500 mb-6">
          เมื่อสิ้นสุดปีการศึกษา {currentAcademicYear} ระบบจะเลื่อนชั้นนักเรียนไปยังระดับชั้นถัดไป<br/>
          สำหรับชั้น อ.3 และ ป.6 ระบบจะสามารถปรับสถานะเป็น "จบการศึกษา" ได้
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-600 mb-1">เลือกระดับชั้นต้นทาง</label>
            <select 
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
            >
              {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <div className="w-10 h-10 flex items-center justify-center text-slate-300">
              <ChevronRight className="h-6 w-6" />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-600 mb-1">ระดับชั้นถัดไป / สถานะใหม่</label>
            <div className="w-full border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold rounded-lg px-3 py-2 text-sm flex items-center gap-2">
              {getNextGrade(selectedGrade) === 'จบการศึกษา' ? <GraduationCap className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              {getNextGrade(selectedGrade)}
            </div>
          </div>
        </div>

        {/* Promotion Criteria Bar & Toggle */}
        <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                <Settings2 className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>เกณฑ์การประเมินการเลื่อนชั้นอัตโนมัติ</span>
                  {strictEnforcement ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                      <Lock className="h-2.5 w-2.5" />
                      เปิดการบังคับเกณฑ์ (ห้ามเลื่อนผู้ที่ไม่ผ่าน)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      แจ้งเตือนเท่านั้น
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    เวลาเรียนขั้นต่ำ: <strong className="text-slate-700 font-semibold">{minAttendancePercent}%</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3 text-slate-400" />
                    GPA สะสมขั้นต่ำ: <strong className="text-slate-700 font-semibold">{minGpa.toFixed(2)}</strong>
                  </span>
                  <span>
                    วิชาบังคับ: <strong className="text-slate-700 font-semibold">ห้ามติด 0/ร/มส/ขส</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCriteriaSettings(!showCriteriaSettings)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>{showCriteriaSettings ? 'ซ่อนตั้งค่าเกณฑ์' : 'ปรับเปลี่ยนเกณฑ์'}</span>
              </button>
            </div>
          </div>

          {/* Expanded Criteria Settings */}
          {showCriteriaSettings && (
            <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  เกณฑ์เวลาเรียนขั้นต่ำ (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={minAttendancePercent}
                    onChange={(e) => setMinAttendancePercent(Number(e.target.value) || 80)}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
                  />
                  <span className="text-xs text-slate-500 font-medium">%</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">มาตรฐาน สพฐ. กำหนดที่ 80%</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  เกรดเฉลี่ยรวมขั้นต่ำ (GPA)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="4.0"
                    value={minGpa}
                    onChange={(e) => setMinGpa(Number(e.target.value) || 1.0)}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">เกณฑ์ทั่วไปขั้นต่ำคือ 1.00</p>
              </div>

              <div className="flex flex-col justify-center">
                <label className="text-[11px] font-bold text-slate-600 mb-1">
                  ระบบตรวจสอบอัตโนมัติ
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-white border border-slate-200 p-2 rounded-lg">
                  <input
                    type="checkbox"
                    checked={strictEnforcement}
                    onChange={(e) => setStrictEnforcement(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 rounded"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    ห้ามเลื่อนชั้นนักเรียนที่ไม่ผ่านเกณฑ์
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Evaluation Warning Banner */}
        {warningCount > 0 && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5 text-amber-700">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">
                  พบนักเรียน {warningCount} คน ที่ยังไม่ผ่านเกณฑ์การประเมินสำหรับการเลื่อนชั้น
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  ยังไม่มีการบันทึกคะแนน, เวลาเรียนต่ำกว่าเกณฑ์ ({minAttendancePercent}%), เกรดเฉลี่ยต่ำกว่า {minGpa.toFixed(2)}, หรือมีรายวิชาติด 0/ร/มส
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowOnlyWarnings(!showOnlyWarnings)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 shrink-0 ${
                showOnlyWarnings
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-100/50'
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>{showOnlyWarnings ? 'แสดงนักเรียนทั้งหมด' : `กรองดูเฉพาะที่ไม่ผ่าน (${warningCount})`}</span>
            </button>
          </div>
        )}

        <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-700 text-sm">
                รายชื่อนักเรียน ({displayedStudents.length} {showOnlyWarnings ? `จาก ${classStudents.length}` : ''} คน)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white shadow-2xs">
                เลือกแล้ว {selectedStudentIds.size} คน
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ผ่านเกณฑ์ {eligibleCount} คน
              </span>
              {warningCount > 0 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                  ไม่ผ่าน {warningCount} คน
                </span>
              )}
            </div>

            {classStudents.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
                {/* Selection quick actions */}
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
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <span>เลือกเฉพาะผู้ผ่านเกณฑ์</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSelectAll(false)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Square className="h-3.5 w-3.5 text-slate-400" />
                  <span>ยกเลิกเลือก</span>
                </button>

                {/* Primary Action Button: Promote Selected */}
                <button 
                  onClick={handlePromoteSelected}
                  disabled={isProcessing || selectedStudentIds.size === 0}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>{isProcessing ? 'กำลังดำเนินการ...' : `ดำเนินการเลื่อนชั้น (${selectedStudentIds.size} คน)`}</span>
                </button>
              </div>
            )}
          </div>
          <div className="max-h-[460px] overflow-y-auto p-4">
            {classStudents.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-medium text-sm">ไม่มีนักเรียนที่มีสถานะกำลังศึกษาในระดับชั้นนี้</div>
            ) : displayedStudents.length === 0 ? (
              <div className="text-center py-8 text-slate-500 font-medium text-sm">
                ไม่มีนักเรียนที่ติดเงื่อนไขการประเมินในระดับชั้นนี้
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {displayedStudents.map(student => {
                  const warning = warnings[student.id];
                  const hasWarning = warning?.hasWarning;
                  const isSelected = selectedStudentIds.has(student.id);

                  return (
                    <div 
                      key={student.id} 
                      className={`flex items-center justify-between p-3.5 border rounded-xl transition-all gap-3 ${
                        !isSelected
                          ? 'border-slate-200 bg-slate-50/70 opacity-60'
                          : hasWarning 
                            ? 'border-rose-300 bg-rose-50/40 hover:bg-rose-50/70 shadow-2xs' 
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {/* Checkbox */}
                      <label className="flex items-center cursor-pointer p-1 -m-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectStudent(student.id)}
                          className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                      </label>

                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          hasWarning ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {student.number || '-'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div 
                            onClick={() => handleToggleSelectStudent(student.id)}
                            className="text-sm font-bold text-slate-800 truncate cursor-pointer hover:text-indigo-600" 
                            title={`${student.title || ''}${student.firstName} ${student.lastName}`}
                          >
                            {student.title || ''}{student.firstName} {student.lastName}
                            {student.nickname && <span className="text-slate-400 font-normal ml-1">({student.nickname})</span>}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            รหัส: {student.studentId}
                            {!isSelected && <span className="text-rose-600 ml-2 font-medium">(ไม่ถูกเลือก)</span>}
                          </div>
                        </div>
                      </div>

                      {/* Warning status or passed status */}
                      <div className="shrink-0 flex items-center">
                        {hasWarning ? (
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForWarning({ student, warning })}
                            title="คลิกเพื่อดูรายละเอียดผลการประเมินที่ไม่ผ่าน"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap group ${
                              warning.isMissingScores
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                                : 'bg-rose-100/80 text-rose-800 border border-rose-300 hover:bg-rose-200'
                            }`}
                          >
                            <AlertTriangle className={`h-3.5 w-3.5 shrink-0 group-hover:scale-110 transition-transform ${
                              warning.isMissingScores ? 'text-amber-700' : 'text-rose-600'
                            }`} />
                            <span>{warning.summaryText || 'ไม่ผ่านเกณฑ์'}</span>
                            <span className={`text-[11px] underline ml-0.5 ${
                              warning.isMissingScores ? 'text-amber-800' : 'text-rose-700'
                            }`}>ดูสาเหตุ</span>
                          </button>
                        ) : isCheckingEvaluations ? (
                          <span className="text-xs text-slate-400 whitespace-nowrap">กำลังตรวจ...</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 whitespace-nowrap">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>ผ่านเกณฑ์</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {selectedStudentForWarning && (
        <PromotionWarningModal
          student={selectedStudentForWarning.student}
          warning={selectedStudentForWarning.warning}
          onClose={() => setSelectedStudentForWarning(null)}
        />
      )}
    </div>
  );
};
