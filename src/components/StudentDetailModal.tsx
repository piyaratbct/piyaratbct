import React from 'react';
import { Student } from '../types';
import { X, User, HeartPulse, MapPin, Phone, Calendar, AlertTriangle } from 'lucide-react';

interface StudentDetailModalProps {
  student: Student;
  onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, onClose }) => {
  const formatThaiDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      
      const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      
      const day = d.getDate();
      const month = thaiMonths[d.getMonth()];
      const year = d.getFullYear() + 543;
      
      return `${day} ${month} ${year}`;
    } catch {
      return dateString;
    }
  };
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
          <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-500" />
            ข้อมูลนักเรียน
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center shrink-0">
              <span className="text-2xl font-black">{student.firstName.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">
                {student.firstName} {student.lastName} {student.nickname && `(${student.nickname})`}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-bold font-mono">
                  รหัส: {student.studentId}
                </span>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-bold">
                  ชั้น: {student.gradeLevel}
                </span>
                <span className="px-2 py-0.5 bg-pink-50 text-pink-600 rounded text-xs font-bold">
                  เลขที่: {student.number}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 md:col-span-2 flex flex-col md:flex-row gap-4 justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <User className="h-4 w-4" />
                  <span className="text-xs font-bold">เลขประจำตัวประชาชน</span>
                </div>
                <p className="font-semibold text-slate-800 font-mono">{student.nationalId || '-'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-bold">วันเกิด</span>
                </div>
                <p className="font-semibold text-slate-800">{formatThaiDate(student.dob)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <User className="h-4 w-4" />
                  <span className="text-xs font-bold">สัญชาติ / เชื้อชาติ</span>
                </div>
                <p className="font-semibold text-slate-800">{student.nationality || '-'} / {student.ethnicity || '-'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <User className="h-4 w-4" />
                  <span className="text-xs font-bold">ศาสนา</span>
                </div>
                <p className="font-semibold text-slate-800">{student.religion || '-'}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 md:col-span-2">
              <div className="flex items-center gap-2 text-slate-500 mb-3 border-b border-slate-200 pb-2">
                <User className="h-4 w-4" />
                <span className="font-bold text-slate-700">ข้อมูลครอบครัว (สถานภาพ: {student.familyStatus || '-'})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Father Info */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-indigo-600">ข้อมูลบิดา</h4>
                  <p className="text-sm"><span className="text-slate-500 font-bold">ชื่อ-นามสกุล:</span> {student.fatherName || '-'}</p>
                  <p className="text-sm"><span className="text-slate-500 font-bold">อาชีพ:</span> {student.fatherOccupation || '-'}</p>
                  <p className="text-sm"><span className="text-slate-500 font-bold">รายได้:</span> {student.fatherIncome || '-'}</p>
                  <p className="text-sm"><span className="text-slate-500 font-bold">สถานที่ทำงาน:</span> {student.fatherWorkplace || '-'} {student.fatherWorkplaceProvince ? `(จ.${student.fatherWorkplaceProvince})` : ''}</p>
                  <p className="text-sm"><span className="text-slate-500 font-bold">เบอร์โทรศัพท์:</span> {student.fatherPhone || '-'}</p>
                </div>
                {/* Mother Info */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-pink-600">ข้อมูลมารดา</h4>
                  <p className="text-sm"><span className="text-slate-500 font-bold">ชื่อ-นามสกุล:</span> {student.motherName || '-'}</p>
                  <p className="text-sm"><span className="text-slate-500 font-bold">อาชีพ:</span> {student.motherOccupation || '-'}</p>
                  <p className="text-sm"><span className="text-slate-500 font-bold">รายได้:</span> {student.motherIncome || '-'}</p>
                  <p className="text-sm"><span className="text-slate-500 font-bold">สถานที่ทำงาน:</span> {student.motherWorkplace || '-'} {student.motherWorkplaceProvince ? `(จ.${student.motherWorkplaceProvince})` : ''}</p>
                  <p className="text-sm"><span className="text-slate-500 font-bold">เบอร์โทรศัพท์:</span> {student.motherPhone || '-'}</p>
                </div>
                {/* Guardian Info */}
                <div className="space-y-2 md:col-span-2 border-t border-slate-200 pt-3">
                  <h4 className="text-sm font-bold text-amber-600">ข้อมูลผู้ปกครอง (เกี่ยวข้องเป็น: {student.guardianRelation || '-'})</h4>
                  <p className="text-sm"><span className="text-slate-500 font-bold">ชื่อ-นามสกุล:</span> {student.parentName || '-'}</p>
                  <p className="text-sm"><span className="text-slate-500 font-bold">อาชีพ:</span> {student.guardianOccupation || '-'}</p>
                  <p className="text-sm"><span className="text-slate-500 font-bold">รายได้:</span> {student.guardianIncome || '-'}</p>
                  <p className="text-sm"><span className="text-slate-500 font-bold">สถานที่ทำงาน:</span> {student.guardianWorkplace || '-'} {student.guardianWorkplaceProvince ? `(จ.${student.guardianWorkplaceProvince})` : ''}</p>
                  <p className="text-sm"><span className="text-slate-500 font-bold">เบอร์โทรศัพท์:</span> {student.parentPhone || '-'}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 md:col-span-2">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <MapPin className="h-4 w-4" />
                <span className="text-xs font-bold">ที่อยู่ปัจจุบัน</span>
              </div>
              <p className="font-semibold text-slate-800">{student.address || '-'}</p>
            </div>
          </div>

          <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500 opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
            <div className="flex items-center gap-2 text-rose-600 mb-3 relative z-10">
              <HeartPulse className="h-5 w-5" />
              <span className="font-black text-sm uppercase tracking-wider">ข้อมูลสุขภาพ / โรคประจำตัว / การแพ้</span>
            </div>
            <div className="relative z-10 space-y-3">
              <div>
                <span className="block text-xs font-bold text-rose-700/70 mb-1">การแพ้ยา</span>
                <p className="font-semibold text-rose-800">{student.allergicMedicine || '-'}</p>
              </div>
              <div>
                <span className="block text-xs font-bold text-rose-700/70 mb-1">การแพ้อาหาร</span>
                <p className="font-semibold text-rose-800">{student.allergicFood || '-'}</p>
              </div>
              <div>
                <span className="block text-xs font-bold text-rose-700/70 mb-1">โรคประจำตัว</span>
                <p className="font-semibold text-rose-800">{student.congenitalDisease || '-'}</p>
              </div>
              <div>
                <span className="block text-xs font-bold text-rose-700/70 mb-1">ข้อมูลอื่นๆ</span>
                <p className="font-semibold text-rose-800 whitespace-pre-wrap">{student.medicalInfo || '-'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors shadow-sm"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
