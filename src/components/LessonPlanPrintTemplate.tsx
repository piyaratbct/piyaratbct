import React, { useState } from 'react';
import { LessonPlan, Teacher } from '../types';
import { Printer, X, Edit3, Save, XCircle } from 'lucide-react';
import { SchoolLogo, SignaturePadModal } from './PrintTemplate';

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
  
  const handlePrint = () => {
    window.print();
  };

  const handleSaveSignature = (name: string, signatureBase64: string) => {
    if (!onUpdatePlan) return;

    let updatedPlan = { ...plan };
    const todayStr = new Date().toISOString().slice(0, 10);

    if (signingRole === 'deptHead') {
      updatedPlan.status = 'approved';
      updatedPlan.approverName = name;
      updatedPlan.approverSignature = signatureBase64;
      updatedPlan.approverDate = todayStr;
      
      // Also save to standard fields from types.ts
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
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex flex-col items-center overflow-y-auto print:bg-white print:block">
      
      {/* Controls Header (Hidden while printing) */}
      <div className="sticky top-0 w-full bg-white border-b border-slate-200 p-4 flex flex-wrap gap-4 justify-between items-center shadow-sm print:hidden z-10 max-w-4xl mx-auto rounded-b-xl">
        <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          <Printer className="h-5 w-5 text-indigo-600" />
          ตัวอย่างก่อนพิมพ์: แผนการจัดการเรียนรู้
        </h2>
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
            onClick={handlePrint}
            className="px-5 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            <Printer className="h-4 w-4" /> สั่งพิมพ์
          </button>
        </div>
      </div>

      {/* A4 Paper Container */}
      <div className="w-full max-w-[800px] bg-white my-8 p-12 shadow-xl print:m-0 print:p-0 print:shadow-none mx-auto border border-slate-200">
        
        {/* Document Header */}
        <div className="text-center mb-8 pb-6 border-b-2 border-slate-900 relative">
          <div className="absolute top-0 left-0">
            <SchoolLogo className="h-20 w-20 grayscale brightness-75 contrast-125" />
          </div>
          <h1 className="text-2xl font-bold font-serif mb-2">แผนการจัดการเรียนรู้</h1>
          <p className="text-base text-slate-700">กลุ่มสาระการเรียนรู้ {plan.subject === 'อื่น ๆ' ? plan.customSubject : plan.subject} ระดับชั้น {plan.gradeLevel}</p>
          <p className="text-sm text-slate-600 mt-1">ภาคเรียน {plan.semester} ปีการศึกษา {plan.semester?.split('/').pop() || '-'}</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 mb-1">สัปดาห์/วันที่สอน (Date)</p>
            <p className="font-medium text-slate-900">{thaiFormatDate(plan.date)}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 mb-1">ผู้สอน (Teacher)</p>
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
          
          {/* Teacher Signature */}
          <div className="text-center pt-8">
            <div className="h-8 border-b border-slate-400 border-dotted mb-2 mx-8 relative flex items-end justify-center">
              {plan.teacherSignature ? (
                <img src={plan.teacherSignature} alt="Teacher Signature" className="h-[200%] absolute bottom-0 object-contain mx-auto" />
              ) : (
                plan.teacherSignedOn && (
                   <span className="font-satisfy text-xl text-slate-800 absolute bottom-1 h-12 flex items-center justify-center -rotate-2">
                     {teacher.thaiName || teacher.displayName}
                   </span>
                )
              )}
            </div>
            <p className="text-sm">( {teacher.thaiName || teacher.displayName} )</p>
            <p className="text-xs text-slate-600 mt-1">ผู้สอน (Teacher)</p>
          </div>

          {/* Academic Head / Approval Signature */}
          <div className="text-center pt-8">
            <div className="h-8 border-b border-slate-400 border-dotted mb-2 mx-8 relative flex items-end justify-center">
              {plan.status === 'approved' && plan.approverSignature ? (
                <img src={plan.approverSignature} alt="Academic Head Signature" className="h-[200%] absolute bottom-0 object-contain mx-auto" />
              ) : plan.status === 'approved' && plan.approverName ? (
                 <span className="font-satisfy text-xl text-blue-800 absolute bottom-1 h-12 flex items-center justify-center -rotate-2">
                   {plan.approverName}
                 </span>
              ) : plan.status === 'approved' && academicHead && (
                 <span className="font-satisfy text-xl text-blue-800 absolute bottom-1 h-12 flex items-center justify-center -rotate-2">
                   {academicHead.thaiName || academicHead.displayName}
                 </span>
              )}
            </div>
            <p className="text-sm">( {plan.approverName || (academicHead ? (academicHead.thaiName || academicHead.displayName) : '...................................................')} )</p>
            <p className="text-xs text-slate-600 mt-1">ผู้ตรวจสอบ / หัวหน้างานวิชาการ</p>
            <div className="mt-3 inline-flex">
              <span className={`text-xs px-2 py-1 border rounded ${plan.status === 'approved' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-slate-300 text-slate-400 text-opacity-0 bg-slate-50'}`}>
                {plan.status === 'approved' ? '✔ อนุมัติแผนการจัดการเรียนรู้' : 'อนุมัติแผนการจัดการเรียนรู้'}
              </span>
            </div>
          </div>
          
        </div>

      </div>

      {signingRole && onUpdatePlan && (
        <SignaturePadModal
          role={signingRole}
          defaultName={signingRole === 'teacher' ? (teacher.thaiName || teacher.displayName) : (currentUser?.thaiName || currentUser?.displayName || academicHead?.thaiName || academicHead?.displayName || '')}
          onSave={handleSaveSignature}
          onClose={() => setSigningRole(null)}
        />
      )}
    </div>
  );
}
