import React from 'react';
import { AlertTriangle, X, CheckCircle, Clock, BookOpen, AlertCircle, Award, BarChart3, FileQuestion } from 'lucide-react';
import { Student } from '../types';
import { StudentPromotionWarning } from '../hooks/usePromotionEvaluations';

interface PromotionWarningModalProps {
  student: Student;
  warning: StudentPromotionWarning;
  onClose: () => void;
}

export const PromotionWarningModal: React.FC<PromotionWarningModalProps> = ({
  student,
  warning,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 text-white flex items-center justify-between ${
          warning.isMissingScores
            ? 'bg-gradient-to-r from-amber-600 to-orange-500'
            : 'bg-gradient-to-r from-amber-500 to-rose-500'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              {warning.isMissingScores ? (
                <FileQuestion className="h-6 w-6 text-white" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {warning.isMissingScores ? 'ยังไม่มีข้อมูลผลการเรียน' : 'แจ้งเตือนผลการประเมินการเลื่อนชั้น'}
              </h3>
              <p className="text-xs text-amber-100 mt-0.5">
                เลขที่ {student.number || '-'} • {student.title || ''}{student.firstName} {student.lastName} (รหัส {student.studentId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className={`${warning.isMissingScores ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-rose-50 border-rose-200 text-rose-900'} border rounded-xl p-3.5 text-xs flex items-start gap-2.5`}>
            <AlertCircle className={`h-4 w-4 shrink-0 mt-0.5 ${warning.isMissingScores ? 'text-amber-600' : 'text-rose-600'}`} />
            <div>
              <p className="font-bold">
                {warning.isMissingScores
                  ? 'นักเรียนรายนี้ยังไม่มีการบันทึกคะแนนในระบบ'
                  : 'นักเรียนรายนี้ยังไม่ผ่านเกณฑ์การประเมินสำหรับการเลื่อนชั้น'}
              </p>
              <p className={`${warning.isMissingScores ? 'text-amber-700' : 'text-rose-700'} mt-0.5`}>
                {warning.isMissingScores
                  ? 'ระบบกำหนดให้นักเรียนต้องมีข้อมูลคะแนนหรือผลการประเมินจริงก่อน จึงจะพิจารณาการผ่านเกณฑ์เพื่อเลื่อนชั้นได้'
                  : 'ตามระเบียบวัดผลฯ นักเรียนต้องมีเวลาเรียนไม่น้อยกว่า 80% และมีผลการเรียนเฉลี่ยรวมถึงเกณฑ์ที่กำหนด จึงจะได้รับอนุมัติเลื่อนชั้นอัตโนมัติ'}
              </p>
            </div>
          </div>

          {/* Missing scores notice */}
          {warning.isMissingScores && (
            <div className="border border-amber-200 rounded-xl p-4 bg-amber-50/50">
              <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-sm">
                <FileQuestion className="h-4 w-4 text-amber-600" />
                <span>ยังไม่มีข้อมูลคะแนนรายวิชา</span>
              </div>
              <div className="bg-white border border-amber-200 rounded-lg p-3 text-xs space-y-2">
                <p className="text-slate-700">
                  ระบบไม่พบคะแนนหรือผลการประเมินใดๆ ของนักเรียนรายนี้ในฐานข้อมูล
                </p>
                <div className="p-2.5 bg-amber-50 rounded-md border border-amber-200 text-amber-800 font-medium">
                  📌 <strong>ข้อแนะนำ:</strong> บันทึกคะแนนของนักเรียนในเมนูงานวัดผลและวิชาการก่อนดำเนินการเลื่อนชั้น เพื่อให้การประเมินถูกต้องตามเกณฑ์
                </div>
              </div>
            </div>
          )}

          {/* Academic Overview Bar */}
          {warning.academicStats && (
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">เกรดเฉลี่ยสะสม (GPA)</span>
                <span className={`font-black text-sm ${warning.lowGpa ? 'text-rose-600' : 'text-slate-800'}`}>
                  {warning.academicStats.gpa !== undefined ? warning.academicStats.gpa.toFixed(2) : '-'}
                </span>
                {warning.lowGpa && (
                  <span className="text-[10px] text-rose-500 block font-medium">เกณฑ์ ≥ {warning.lowGpa.required.toFixed(2)}</span>
                )}
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">ร้อยละเวลาเรียน</span>
                <span className={`font-black text-sm ${warning.lowAttendance ? 'text-rose-600' : 'text-slate-800'}`}>
                  {warning.academicStats.attendancePercentage !== undefined ? `${warning.academicStats.attendancePercentage}%` : '-'}
                </span>
                {warning.lowAttendance && (
                  <span className="text-[10px] text-rose-500 block font-medium">เกณฑ์ ≥ {warning.lowAttendance.required}%</span>
                )}
              </div>
            </div>
          )}

          {/* 1. Low GPA / Grade Point Average Warning */}
          {warning.lowGpa && (
            <div className="border border-rose-200 rounded-xl p-4 bg-rose-50/40">
              <div className="flex items-center gap-2 mb-2 text-rose-900 font-bold text-sm">
                <Award className="h-4 w-4 text-rose-600" />
                <span>ค่าเฉลี่ยผลการเรียนรวม (ต่ำกว่าเกณฑ์)</span>
              </div>
              <div className="bg-white border border-rose-200 rounded-lg p-3 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">เกรดเฉลี่ยปัจจุบัน (GPA):</span>
                  <span className="font-bold text-rose-600 text-sm">{warning.lowGpa.gpa.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>เกณฑ์ขั้นต่ำที่กำหนด:</span>
                  <span className="font-semibold text-slate-700">เกรดเฉลี่ย {warning.lowGpa.required.toFixed(2)}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  คำนวณจากรายวิชาที่ได้รับการประเมิน {warning.lowGpa.totalSubjects} วิชา
                </div>
                <div className="pt-1.5 border-t border-rose-100 text-rose-700 font-medium">
                  ⚠️ ผลการเรียนเฉลี่ยรวมไม่ถึงเกณฑ์ที่กำหนดสำหรับการเลื่อนชั้น
                </div>
              </div>
            </div>
          )}

          {/* 2. Low attendance (Less than 80%) */}
          {warning.lowAttendance && (
            <div className="border border-amber-200 rounded-xl p-4 bg-amber-50/40">
              <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-sm">
                <Clock className="h-4 w-4 text-amber-600" />
                <span>สถิติเวลาเรียน (ต่ำกว่าเกณฑ์ {warning.lowAttendance.required}%)</span>
              </div>
              <div className="bg-white border border-amber-200 rounded-lg p-3 text-xs">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-slate-600">ร้อยละเวลาเรียนที่บันทึก:</span>
                  <span className="font-bold text-rose-600 text-sm">{warning.lowAttendance.percentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2 overflow-hidden">
                  <div 
                    className="bg-rose-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.min(100, warning.lowAttendance.percentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>มาเรียน {warning.lowAttendance.attended} คาบ/ครั้ง</span>
                  <span>จากทั้งหมด {warning.lowAttendance.total} คาบ/ครั้ง (เกณฑ์ผ่าน {warning.lowAttendance.required}%)</span>
                </div>
                <div className="mt-2 pt-2 border-t border-amber-100 text-rose-700 font-medium">
                  ⚠️ มีเวลาเรียนไม่ถึง {warning.lowAttendance.required}% ติดสถานะหมดสิทธิ์สอบ (มส.)
                </div>
              </div>
            </div>
          )}

          {/* 3. Failed subjects */}
          {warning.failedSubjects.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-4 bg-white">
              <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold text-sm">
                <BookOpen className="h-4 w-4 text-rose-500" />
                <span>รายวิชาที่ยังไม่ผ่านเกณฑ์ ({warning.failedSubjects.length} วิชา)</span>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {warning.failedSubjects.map((sub, idx) => (
                  <div key={idx} className="bg-rose-50/70 border border-rose-200 rounded-lg p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{sub.subject}</div>
                      <div className="text-rose-700 mt-0.5">{sub.reason}</div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-800 font-black text-xs">
                        เกรด {sub.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Kindergarten issues */}
          {warning.kindergartenIssues && warning.kindergartenIssues.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-4 bg-white">
              <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold text-sm">
                <AlertCircle className="h-4 w-4 text-purple-500" />
                <span>พัฒนาการปฐมวัยที่ต้องปรับปรุง</span>
              </div>
              <ul className="space-y-1.5 text-xs text-purple-900">
                {warning.kindergartenIssues.map((issue, idx) => (
                  <li key={idx} className="bg-purple-50 p-2 rounded border border-purple-200">
                    • {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-700">แนวทางการดำเนินการตามระเบียบวัดผล:</p>
            <p>1. จัดการสอบแก้ตัว หรือส่งผลงานซ่อมเสริมเพื่อปรับเกรดให้ผ่านเกณฑ์</p>
            <p>2. จัดสอนเสริมชดเชยเวลาเรียนกรณีติด มส. ให้ครบตามเกณฑ์ {warning.lowAttendance?.required ?? 80}%</p>
            <p>3. หากไม่ผ่านการซ่อมเสริม ให้คณะกรรมการพิจารณาบันทึก <strong>"ซ้ำชั้นเดิม"</strong></p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
