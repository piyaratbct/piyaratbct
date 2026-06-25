import React, { useEffect } from 'react';
import { Student, StudentAssessment, Teacher } from '../types';
import { SchoolLogo } from './PrintTemplate';

interface AssessmentPrintTemplateProps {
  students: Student[];
  assessments: Record<string, StudentAssessment>;
  teacher: Teacher;
  academicYear: string;
  semester: string;
  onClose: () => void;
}

export const AssessmentPrintTemplate: React.FC<AssessmentPrintTemplateProps> = ({ 
  students, assessments, teacher, academicYear, semester, onClose 
}) => {

  useEffect(() => {
    // Add print styles to document when mounted
    document.body.classList.add('print-mode-active');
    return () => {
      document.body.classList.remove('print-mode-active');
    };
  }, []);

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn("window.print() is blocked or unsupported in this sandbox:", e);
      window.alert("ไม่สามารถเปิดระบบพิมพ์เอกสารได้เนื่องจากข้อจำกัดความปลอดภัยของเบราว์เซอร์ในโหมดพรีวิว กรุณากดเปิดแท็บใหม่ (Open in new tab) เพื่อพิมพ์");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 overflow-y-auto print:static print:bg-white print:overflow-visible">
      {/* Control Bar (Hidden when printing) */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center print:hidden shadow-sm">
        <div className="flex flex-col">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800">
              ตัวอย่างก่อนพิมพ์รายงานพัฒนาการ ({students.length} รายการ)
            </h2>
            <span className="text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded">กระดาษ A4 แนวตั้ง</span>
          </div>
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            หากปุ่มพิมพ์ไม่ทำงาน กรุณาเปิดแอปในแท็บใหม่ (Open in new tab)
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            onClick={handlePrint}
            className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            พิมพ์ / บันทึก PDF
          </button>
        </div>
      </div>

      {/* Pages Container */}
      <div className="p-8 print:p-0 flex flex-col items-center pb-24">
        {students.map((student, index) => {
          const assessment = assessments[student.id];
          if (!assessment) return null; // Skip if no assessment
          
          return (
            <div 
              key={student.id} 
              className="w-[210mm] min-h-[297mm] bg-white shadow-xl print:shadow-none print:w-full print:h-auto mx-auto mb-8 print:mb-0 relative text-black"
              style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', padding: '20mm', boxSizing: 'border-box', pageBreakAfter: index < students.length - 1 ? 'always' : 'auto' }}
            >
              
              {/* Header */}
              <div className="flex flex-col items-center text-center mb-8">
                <SchoolLogo className="w-20 h-20 mb-3 text-[#e54a93] drop-shadow-sm" />
                <h1 className="text-2xl font-black mb-2 text-slate-900 tracking-tight">รายงานผลการพัฒนาผู้เรียนรายบุคคล</h1>
                <h2 className="text-xl font-black text-[#e54a93] mb-0.5 tracking-wide">โรงเรียนศิริมงคลศึกษา บางบัวทอง</h2>
                <p className="text-xs font-bold text-slate-500 font-mono mb-4 uppercase tracking-wider">
                  Sirimongkolsuksa Bangbuathong School
                </p>
                <p className="text-sm font-semibold text-sky-700 bg-sky-50 px-5 py-1.5 rounded-full border border-sky-100">
                  ภาคเรียนที่ {assessment.semester} ปีการศึกษา {assessment.academicYear} • ระดับชั้น {student.gradeLevel.replace(/\s*\(.*?\)/g, '')}
                </p>
              </div>

              {/* Student Info */}
              <div className="border border-sky-200 bg-sky-50/50 rounded-xl p-5 mb-6 text-slate-800">
                <div className="grid grid-cols-2 gap-4 text-base">
                  <div><span className="font-bold text-sky-900">รหัสประจำตัวนักเรียน:</span> {student.studentId}</div>
                  <div><span className="font-bold text-sky-900">เลขที่:</span> {student.number}</div>
                  <div className="col-span-2"><span className="font-bold text-sky-900">ชื่อ-นามสกุล:</span> {student.firstName} {student.lastName} {student.nickname && <span className="text-slate-600">({student.nickname})</span>}</div>
                </div>
              </div>

              {/* Assessment Data */}
              <div className="space-y-6 text-sm">
                
                {/* Narrative Log */}
                <div className="border border-pink-200 bg-pink-50/40 rounded-xl p-5 space-y-5">
                  <h3 className="font-bold text-lg text-pink-700 border-b border-pink-200 pb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                    บันทึกพัฒนาการรายบุคคล
                  </h3>
                  
                  <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm bg-white p-3 rounded-lg border border-pink-100">
                    <div><span className="font-bold text-slate-700">รายวิชา/กิจกรรมที่ประเมิน:</span> {assessment.subject || '-'}</div>
                    <div><span className="font-bold text-slate-700">วันที่ประเมิน:</span> {assessment.date || '-'}</div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 mb-1">พฤติกรรม/พัฒนาการที่พบ:</h4>
                      <p className="text-sm whitespace-pre-wrap text-slate-700 bg-white p-3 rounded border border-slate-100">{assessment.content || '-'}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-800 mb-1">วิธีการส่งเสริม/แก้ไขปัญหา:</h4>
                      <p className="text-sm whitespace-pre-wrap text-slate-700 bg-white p-3 rounded border border-slate-100">{assessment.activities || '-'}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-800 mb-1">ปัญหาอุปสรรค:</h4>
                      <p className="text-sm whitespace-pre-wrap text-slate-700 bg-white p-3 rounded border border-slate-100">{assessment.limitations || '-'}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-800 mb-1">ผลการพัฒนา/ข้อเสนอแนะ:</h4>
                      <p className="text-sm whitespace-pre-wrap text-slate-700 bg-white p-3 rounded border border-slate-100">{assessment.suggestions || '-'}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Signatures */}
              <div className="mt-16 grid grid-cols-2 gap-8 text-center pt-8">
                <div>
                  <div className="mb-2">ลงชื่อ..............................................................</div>
                  <div className="mb-1">({teacher.thaiName || teacher.displayName})</div>
                  <div className="text-sm">ครูประจำชั้น / ผู้ประเมิน</div>
                </div>
                <div>
                  <div className="mb-2">ลงชื่อ..............................................................</div>
                  <div className="mb-1">(..............................................................)</div>
                  <div className="text-sm">หัวหน้าวิชาการ / ผู้อำนวยการโรงเรียน</div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
