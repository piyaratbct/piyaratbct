import React, { useState, useEffect } from 'react';
import { Student, GRADE_LEVELS } from '../types';
import { X, Save } from 'lucide-react';

interface StudentModalProps {
  student: Student | null;
  selectedGrade: string;
  onClose: () => void;
  onSave: (student: Omit<Student, 'id'>, id?: string) => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({ student, selectedGrade, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    nickname: '',
    gender: 'male' as 'male' | 'female',
    number: 1,
    status: 'active' as 'active' | 'inactive',
    gradeLevel: selectedGrade,
    dob: '',
    parentName: '',
    parentPhone: '',
    fatherName: '',
    fatherPhone: '',
    motherName: '',
    motherPhone: '',
    familyStatus: 'สมรส',
    address: '',
    medicalInfo: '',
    allergicMedicine: '',
    allergicFood: '',
    congenitalDisease: '',
    weight: '',
    height: ''
  });

  useEffect(() => {
    if (student) {
      setFormData({
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        nickname: student.nickname || '',
        gender: student.gender,
        number: student.number,
        status: student.status,
        gradeLevel: student.gradeLevel,
        dob: student.dob || '',
        parentName: student.parentName || '',
        parentPhone: student.parentPhone || '',
        fatherName: student.fatherName || '',
        fatherPhone: student.fatherPhone || '',
        motherName: student.motherName || '',
        motherPhone: student.motherPhone || '',
        familyStatus: student.familyStatus || 'สมรส',
        address: student.address || '',
        medicalInfo: student.medicalInfo || '',
        allergicMedicine: student.allergicMedicine || '',
        allergicFood: student.allergicFood || '',
        congenitalDisease: student.congenitalDisease || '',
        weight: student.weight || '',
        height: student.height || ''
      });
    } else {
      setFormData(prev => ({ ...prev, gradeLevel: selectedGrade }));
    }
  }, [student, selectedGrade]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, student?.id);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-black text-slate-800 text-lg">
            {student ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">รหัสนักเรียน</label>
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none font-mono"
                placeholder="เช่น 12345"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">เลขที่</label>
              <input
                type="number"
                required
                min="1"
                value={formData.number}
                onChange={e => setFormData({ ...formData, number: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อจริง</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">นามสกุล</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อเล่น</label>
              <input
                type="text"
                value={formData.nickname}
                onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">เพศ</label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              >
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">วันเกิด</label>
            <input
              type="date"
              value={formData.dob}
              onChange={e => setFormData({ ...formData, dob: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
            <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">ข้อมูลครอบครัว</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อ-นามสกุลบิดา</label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์บิดา</label>
                <input
                  type="tel"
                  value={formData.fatherPhone}
                  onChange={e => setFormData({ ...formData, fatherPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อ-นามสกุลมารดา</label>
                <input
                  type="text"
                  value={formData.motherName}
                  onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์มารดา</label>
                <input
                  type="tel"
                  value={formData.motherPhone}
                  onChange={e => setFormData({ ...formData, motherPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">สถานภาพครอบครัว</label>
              <select
                value={formData.familyStatus}
                onChange={e => setFormData({ ...formData, familyStatus: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              >
                <option value="สมรส">สมรส</option>
                <option value="หย่าร้าง">หย่าร้าง</option>
                <option value="แยกกันอยู่">แยกกันอยู่</option>
                <option value="บิดาเสียชีวิต">บิดาเสียชีวิต</option>
                <option value="มารดาเสียชีวิต">มารดาเสียชีวิต</option>
                <option value="บิดาและมารดาเสียชีวิต">บิดาและมารดาเสียชีวิต</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อ-นามสกุลผู้ปกครอง (ถ้าไม่ใช่บิดา/มารดา)</label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ผู้ปกครอง</label>
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ที่อยู่ปัจจุบัน</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none resize-none"
            ></textarea>
          </div>

          <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 space-y-4">
            <h4 className="font-bold text-rose-800 text-sm border-b border-rose-200 pb-2">ข้อมูลสุขภาพ</h4>
            
            <div>
              <label className="block text-xs font-bold text-rose-700 mb-1">การแพ้ยา</label>
              <input
                type="text"
                value={formData.allergicMedicine}
                onChange={e => setFormData({ ...formData, allergicMedicine: e.target.value })}
                className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none placeholder-rose-300"
                placeholder="เช่น Amoxicillin (ถ้าไม่มีให้เว้นว่าง)"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-rose-700 mb-1">การแพ้อาหาร</label>
              <input
                type="text"
                value={formData.allergicFood}
                onChange={e => setFormData({ ...formData, allergicFood: e.target.value })}
                className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none placeholder-rose-300"
                placeholder="เช่น อาหารทะเล, ถั่วลิสง (ถ้าไม่มีให้เว้นว่าง)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-700 mb-1">โรคประจำตัว</label>
              <input
                type="text"
                value={formData.congenitalDisease}
                onChange={e => setFormData({ ...formData, congenitalDisease: e.target.value })}
                className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none placeholder-rose-300"
                placeholder="เช่น หอบหืด, ภูมิแพ้ (ถ้าไม่มีให้เว้นว่าง)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-700 mb-1">ข้อมูลสุขภาพอื่นๆ</label>
              <textarea
                rows={2}
                value={formData.medicalInfo}
                onChange={e => setFormData({ ...formData, medicalInfo: e.target.value })}
                className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none resize-none placeholder-rose-300"
                placeholder="รายละเอียดเพิ่มเติม"
              ></textarea>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ชั้นเรียน</label>
              <select
                value={formData.gradeLevel}
                onChange={e => setFormData({ ...formData, gradeLevel: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              >
                {GRADE_LEVELS.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">สถานะ</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              >
                <option value="active">ปกติ</option>
                <option value="inactive">ย้าย/ออก</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Save className="h-4 w-4" /> บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
