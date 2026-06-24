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
    window.print();
  };

  const getTraitLabel = (value: number) => {
    switch (value) {
      case 3: return 'ดีเยี่ยม';
      case 2: return 'ดี';
      case 1: return 'ผ่าน';
      case 0: return 'ไม่ผ่าน';
      default: return '-';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 overflow-y-auto print:static print:bg-white print:overflow-visible">
      {/* Control Bar (Hidden when printing) */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center print:hidden shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800">
            ตัวอย่างก่อนพิมพ์รายงานพัฒนาการ ({students.length} รายการ)
          </h2>
          <span className="text-sm text-slate-500">กระดาษ A4 แนวตั้ง</span>
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
              style={{ padding: '20mm', boxSizing: 'border-box', pageBreakAfter: index < students.length - 1 ? 'always' : 'auto' }}
            >
              
              {/* Header */}
              <div className="flex flex-col items-center text-center mb-8">
                <SchoolLogo className="w-20 h-20 mb-4" />
                <h1 className="text-2xl font-bold mb-1">รายงานผลการพัฒนาผู้เรียนรายบุคคล</h1>
                <h2 className="text-xl font-bold mb-1">โรงเรียนตัวอย่าง (LessonLog School)</h2>
                <p className="text-base mb-1">
                  ภาคเรียนที่ {assessment.semester} ปีการศึกษา {assessment.academicYear}
                </p>
                <p className="text-base">
                  ระดับชั้น {student.gradeLevel}
                </p>
              </div>

              {/* Student Info */}
              <div className="border border-black p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-base">
                  <div><span className="font-bold">รหัสประจำตัวนักเรียน:</span> {student.studentId}</div>
                  <div><span className="font-bold">เลขที่:</span> {student.number}</div>
                  <div className="col-span-2"><span className="font-bold">ชื่อ-นามสกุล:</span> {student.firstName} {student.lastName} {student.nickname && `(${student.nickname})`}</div>
                </div>
              </div>

              {/* Assessment Data */}
              <div className="space-y-6 text-sm">
                
                {/* Section 1 */}
                <div>
                  <h3 className="font-bold text-base mb-2">1. ผลการประเมินคุณลักษณะอันพึงประสงค์ 8 ประการ</h3>
                  <table className="w-full border-collapse border border-black text-center">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-black py-2 px-2 w-[15%]">หัวข้อ</th>
                        <th className="border border-black py-2 px-2 text-left">คุณลักษณะ</th>
                        <th className="border border-black py-2 px-2 w-[25%]">ผลการประเมิน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { k: 'trait1', l: 'รักชาติ ศาสน์ กษัตริย์' },
                        { k: 'trait2', l: 'ซื่อสัตย์สุจริต' },
                        { k: 'trait3', l: 'มีวินัย' },
                        { k: 'trait4', l: 'ใฝ่เรียนรู้' },
                        { k: 'trait5', l: 'อยู่อย่างพอเพียง' },
                        { k: 'trait6', l: 'มุ่งมั่นในการทำงาน' },
                        { k: 'trait7', l: 'รักความเป็นไทย' },
                        { k: 'trait8', l: 'มีจิตสาธารณะ' },
                      ].map((item, i) => (
                        <tr key={item.k}>
                          <td className="border border-black py-1 px-2">{i+1}</td>
                          <td className="border border-black py-1 px-2 text-left">{item.l}</td>
                          <td className="border border-black py-1 px-2 font-bold">{getTraitLabel(assessment.characterTraits[item.k as keyof typeof assessment.characterTraits])}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Section 2 */}
                <div>
                  <h3 className="font-bold text-base mb-2">2. ผลการประเมินสมรรถนะสำคัญของผู้เรียน 5 ประการ</h3>
                  <table className="w-full border-collapse border border-black text-center">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-black py-2 px-2 w-[15%]">หัวข้อ</th>
                        <th className="border border-black py-2 px-2 text-left">สมรรถนะ</th>
                        <th className="border border-black py-2 px-2 w-[25%]">ผลการประเมิน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { k: 'comp1', l: 'ความสามารถในการสื่อสาร' },
                        { k: 'comp2', l: 'ความสามารถในการคิด' },
                        { k: 'comp3', l: 'ความสามารถในการแก้ปัญหา' },
                        { k: 'comp4', l: 'ความสามารถในการใช้ทักษะชีวิต' },
                        { k: 'comp5', l: 'ความสามารถในการใช้เทคโนโลยี' },
                      ].map((item, i) => (
                        <tr key={item.k}>
                          <td className="border border-black py-1 px-2">{i+1}</td>
                          <td className="border border-black py-1 px-2 text-left">{item.l}</td>
                          <td className="border border-black py-1 px-2 font-bold">{getTraitLabel(assessment.competencies[item.k as keyof typeof assessment.competencies])}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Section 3 */}
                <div className="flex items-center gap-4 border border-black p-4">
                  <h3 className="font-bold text-base">3. การประเมินการอ่าน คิดวิเคราะห์ และเขียน:</h3>
                  <span className="text-base font-bold underline underline-offset-4 decoration-dotted px-8">
                    {getTraitLabel(assessment.readingWriting)}
                  </span>
                </div>

                {/* Section 4 */}
                <div className="border border-black p-4 min-h-[60px]">
                  <h3 className="font-bold text-base mb-2">4. ความคิดเห็นเพิ่มเติม / ข้อเสนอแนะ:</h3>
                  <p className="whitespace-pre-wrap">{assessment.comments || '-'}</p>
                </div>

                {/* Section 5: Narrative Log */}
                {(assessment.content || assessment.activities || assessment.limitations || assessment.suggestions) && (
                  <div className="border border-black p-4 space-y-4">
                    <h3 className="font-bold text-base border-b border-slate-300 pb-2">5. บันทึกพัฒนาการรายบุคคล (เพิ่มเติม):</h3>
                    
                    <div className="flex gap-8 text-sm">
                      <div><span className="font-bold">รายวิชา/กิจกรรมที่ประเมิน:</span> {assessment.subject || '-'}</div>
                      <div><span className="font-bold">วันที่ประเมิน:</span> {assessment.date || '-'}</div>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm">พฤติกรรม/พัฒนาการที่พบ:</h4>
                      <p className="text-sm whitespace-pre-wrap mt-1">{assessment.content || '-'}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm">วิธีการส่งเสริม/แก้ไขปัญหา:</h4>
                      <p className="text-sm whitespace-pre-wrap mt-1">{assessment.activities || '-'}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm">ปัญหาอุปสรรค:</h4>
                      <p className="text-sm whitespace-pre-wrap mt-1">{assessment.limitations || '-'}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm">ผลการพัฒนา/ข้อเสนอแนะ:</h4>
                      <p className="text-sm whitespace-pre-wrap mt-1">{assessment.suggestions || '-'}</p>
                    </div>
                  </div>
                )}

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
