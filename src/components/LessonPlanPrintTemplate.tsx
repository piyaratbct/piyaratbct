import React, { useState } from 'react';
import { LessonPlan, Teacher } from '../types';
import { Printer, X, Edit3, Save, XCircle } from 'lucide-react';
import { SignaturePadModal } from './PrintTemplate';
import { PDFPrintHelper, PrintPageContainer, PrintHeader, PrintSignatureBox } from './PDFPrintHelper';

interface LessonPlanPrintTemplateProps {
  plan: LessonPlan;
  teacher: Teacher;
  academicHead?: Teacher | null;
  currentUser?: Teacher | null;
  onUpdatePlan?: (plan: LessonPlan) => void;
  onClose: () => void;
}

export function LessonPlanPrintTemplate({ plan, teacher, academicHead, currentUser, onUpdatePlan, onClose }: LessonPlanPrintTemplateProps) {
  const [signingRole, setSigningRole] = useState<'teacher' | 'deptHead' | null>(null);

  const subjectName = plan.subject.replace(/[\/\\:*?"<>|\s]/g, '_');
  const teacherIdentifier = (teacher.employeeId || teacher.thaiName || 'ครูผู้สอน').replace(/[\/\\:*?"<>|\s]/g, '_');
  const planDate = (plan.date || '').replace(/[\/\\:*?"<>|\s]/g, '_');
  const documentTitle = `แผนการสอน_${teacherIdentifier}_${subjectName}_${planDate}`;

  const handleSaveSignature = (name: string, signatureBase64: string) => {
    if (!onUpdatePlan) return;

    let updatedPlan = { ...plan };
    const todayStr = new Date().toISOString().slice(0, 10);

    if (signingRole === 'deptHead') {
      updatedPlan.status = 'approved';
      updatedPlan.approverName = name;
      updatedPlan.approverSignature = signatureBase64;
      updatedPlan.approverDate = todayStr;
    } else if (signingRole === 'teacher') {
      updatedPlan.teacherSignedOn = todayStr;
      updatedPlan.teacherSignature = signatureBase64;
    }

    onUpdatePlan(updatedPlan);
    setSigningRole(null);
  };

  const handleResetSignature = (role: 'teacher' | 'deptHead') => {
    if (!onUpdatePlan) return;
    let updatedPlan = { ...plan };

    if (role === 'deptHead') {
      updatedPlan.status = 'draft';
      delete updatedPlan.approverName;
      delete updatedPlan.approverSignature;
      delete updatedPlan.approverDate;
    } else if (role === 'teacher') {
      delete updatedPlan.teacherSignedOn;
      delete updatedPlan.teacherSignature;
    }

    onUpdatePlan(updatedPlan);
  };

  const handleRejectPlan = () => {
    if (!onUpdatePlan) return;
    if (confirm('ต้องการตีกลับให้แก้ไขแผนการสอนนี้ใช่หรือไม่?')) {
      onUpdatePlan({ ...plan, status: 'rejected' });
    }
  };

  const thaiFormatDate = (dateString: string) => {
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0]) + 543;
      const month = months[parseInt(parts[1]) - 1];
      const day = parseInt(parts[2]);
      return `${day} ${month} พ.ศ. ${year}`;
    }
    return dateString;
  };

  return (
    <PDFPrintHelper onClose={onClose} documentTitle={documentTitle} hideControls>
      {/* Custom Controls Header for Lesson Plan */}
      <div className="sticky top-0 w-full bg-white border-b border-slate-200 p-4 flex flex-wrap gap-4 justify-between items-center shadow-sm print:hidden z-10 max-w-[210mm] mx-auto rounded-b-xl mb-4">
        <div className="flex flex-col">
          <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Printer className="h-5 w-5 text-indigo-600" />
            ตัวอย่างก่อนพิมพ์: แผนการจัดการเรียนรู้
          </h2>
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            หากปุ่มพิมพ์ไม่ทำงาน กรุณาเปิดแอปในแท็บใหม่ (Open in new tab)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          
          {/* Action buttons based on Role */}
          {currentUser && currentUser.id === teacher.id && !plan.teacherSignature && onUpdatePlan && plan.status !== 'approved' && (
            <button
               onClick={() => setSigningRole('teacher')}
               className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 font-medium hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2"
            >
               <Edit3 className="h-4 w-4" /> ลงนามผู้แต่ง
            </button>
          )}
          
          {currentUser && currentUser.id === teacher.id && plan.teacherSignature && onUpdatePlan && plan.status !== 'approved' && (
            <button
               onClick={() => handleResetSignature('teacher')}
               className="px-4 py-2 bg-slate-50 text-slate-700 border border-slate-200 font-medium hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
            >
               <XCircle className="h-4 w-4" /> ล้างลายมือชื่อ
            </button>
          )}

          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'academic' || currentUser.role === 'deputy') && onUpdatePlan && (
            <>
              {plan.status !== 'approved' ? (
                <>
                  <button
                    onClick={handleRejectPlan}
                    className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 font-medium hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" /> ตีกลับให้แก้ (Reject)
                  </button>
                  <button
                    onClick={() => setSigningRole('deptHead')}
                    className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" /> เซ็นอนุมัติ (Approve)
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleResetSignature('deptHead')}
                  className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 font-medium hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" /> ยกเลิกการอนุมัติ
                </button>
              )}
            </>
          )}

          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <X className="h-4 w-4" /> ปิดหน้าต่าง
          </button>
          <button 
            onClick={() => window.print()}
            className="px-5 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            <Printer className="h-4 w-4" /> พิมพ์ / บันทึก PDF
          </button>
        </div>
      </div>

      <PrintPageContainer>
        <PrintHeader 
          title="แผนการจัดการเรียนรู้" 
          subtitle={<p className="text-base text-sky-800 bg-sky-50 inline-block px-4 py-1 rounded-full border border-sky-100">กลุ่มสาระการเรียนรู้ {plan.subject === 'อื่น ๆ' ? plan.customSubject : plan.subject} ระดับชั้น {plan.gradeLevel.replace(/\s*\(.*?\)/g, '')}</p>}
        />
        
        <div className="text-center mb-6">
          <p className="text-sm text-slate-600">
            {(() => {
              const s = plan.semester || '';
              const parts = s.replace('ภาคเรียนที่ ', '').split('/');
              if (parts.length === 2) {
                return `ภาคเรียนที่ ${parts[0]} ปีการศึกษา ${parts[1]}`;
              }
              return s;
            })()}
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-200">
            <p className="text-xs font-bold text-sky-800 mb-1">สัปดาห์/วันที่สอน (Date)</p>
            <p className="font-medium text-slate-900">{thaiFormatDate(plan.date)}</p>
          </div>
          <div className="bg-pink-50/40 p-4 rounded-xl border border-pink-200">
            <p className="text-xs font-bold text-pink-800 mb-1">ผู้สอน (Teacher)</p>
            <p className="font-medium text-slate-900">{teacher.thaiName || teacher.displayName}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">
              1. ชื่อหน่วยการเรียนรู้ / เรื่อง (Topic)
            </h3>
            <p className="text-slate-700 font-medium pl-4">{plan.title}</p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">
              2. จุดประสงค์การเรียนรู้ (Objectives)
            </h3>
            <div className="pl-4 whitespace-pre-wrap text-slate-700 leading-relaxed bg-white">
              {plan.objectives}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">
              3. กิจกรรมการเรียนรู้ (Learning Activities)
            </h3>
            <div className="pl-4 whitespace-pre-wrap text-slate-700 leading-relaxed bg-white min-h-[120px]">
              {plan.activities}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">
              4. สื่อการเรียนรู้ / แหล่งเรียนรู้ (Materials)
            </h3>
            <div className="pl-4 whitespace-pre-wrap text-slate-700 leading-relaxed bg-white">
              {plan.materials || '-'}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">
              5. การวัดและประเมินผล (Evaluation)
            </h3>
            <div className="pl-4 whitespace-pre-wrap text-slate-700 leading-relaxed bg-white">
              {plan.evaluation || '-'}
            </div>
          </div>
        </div>

        {/* Signatures Section */}
        <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 gap-12 font-serif">
          <PrintSignatureBox 
            role="ผู้สอน (Teacher)"
            name={teacher.thaiName || teacher.displayName}
            date={plan.teacherSignedOn ? thaiFormatDate(plan.teacherSignedOn) : undefined}
            signature={plan.teacherSignature}
            label="ลงชื่อ"
          />

          <div className="flex flex-col items-center justify-end h-full">
            <p className="text-sm text-slate-600 mb-2">ลงชื่อ</p>
            <div className="w-40 border-b border-slate-400 mb-2 flex items-center justify-center min-h-[40px] relative">
              {plan.status === 'approved' && plan.approverSignature && (
                <img src={plan.approverSignature} alt={`ลายเซ็น${plan.approverName || ''}`} className="h-10 object-contain absolute bottom-0" crossOrigin="anonymous" />
              )}
            </div>
            <p className="text-sm font-medium text-slate-900">{plan.approverName ? `(${plan.approverName})` : '(............................................)'}</p>
            <p className="text-xs text-slate-500 mt-1">หัวหน้าฝ่ายวิชาการ / ผู้ตรวจสอบ</p>
            <div className="mt-2 inline-flex">
              <span className={`text-[10px] px-2 py-0.5 border rounded ${plan.status === 'approved' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-slate-300 text-slate-400 text-opacity-0 bg-slate-50'}`}>
                {plan.status === 'approved' ? '✔ อนุมัติแผนการจัดการเรียนรู้' : 'อนุมัติแผนการจัดการเรียนรู้'}
              </span>
            </div>
          </div>
        </div>
      </PrintPageContainer>

      {signingRole && onUpdatePlan && (
        <SignaturePadModal
          role={signingRole}
          defaultName={signingRole === 'teacher' ? (teacher.thaiName || teacher.displayName) : (currentUser?.thaiName || currentUser?.displayName || academicHead?.thaiName || academicHead?.displayName || '')}
          onSave={handleSaveSignature}
          onClose={() => setSigningRole(null)}
        />
      )}
    </PDFPrintHelper>
  );
}
