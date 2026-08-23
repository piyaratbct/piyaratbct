import React, { useState, useEffect } from 'react';
import { X, Search, Medal, Sparkles, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Student, StudentBadge } from '../types';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';

interface BadgeAwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  currentTeacher: any;
  systemAcademicYear?: string;
  systemSemester?: string;
}

export const BadgeAwardModal: React.FC<BadgeAwardModalProps> = ({
  isOpen, onClose, students, currentTeacher, systemAcademicYear, systemSemester
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const filteredStudents = searchTerm.length >= 2 
    ? students.filter(s => 
        (s.firstName?.includes(searchTerm) || s.lastName?.includes(searchTerm) || s.studentId?.includes(searchTerm)) &&
        s.status === 'active'
      ).slice(0, 5)
    : [];

  const handleAward = async (badgeType: StudentBadge['badgeType'], description: string) => {
    if (!selectedStudent || !systemAcademicYear || !systemSemester) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'studentBadges'), {
        studentId: selectedStudent.id,
        teacherId: currentTeacher.id,
        teacherName: currentTeacher.displayName || currentTeacher.thaiName || '',
        badgeType,
        description,
        date: new Date().toISOString(),
        academicYear: systemAcademicYear,
        semester: systemSemester,
        createdAt: new Date().toISOString()
      });
      setSuccessMsg(`มอบเหรียญให้ ${selectedStudent.firstName} สำเร็จแล้ว!`);
      setTimeout(() => {
        setSuccessMsg('');
        setSelectedStudent(null);
        setSearchTerm('');
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err as Error, 'write', 'เพิ่มข้อมูลเหรียญความดี');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
          <h3 className="font-bold text-indigo-900 flex items-center gap-2">
            <Medal className="h-5 w-5 text-indigo-600" />
            แจกเหรียญความดี
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {successMsg ? (
            <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">{successMsg}</h3>
            </div>
          ) : !selectedStudent ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">ค้นหานักเรียนเพื่อมอบเหรียญ</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="พิมพ์ชื่อ นามสกุล หรือรหัสประจำตัว..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>
                {searchTerm.length > 0 && searchTerm.length < 2 && (
                  <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> พิมพ์อย่างน้อย 2 ตัวอักษร
                  </p>
                )}
              </div>

              {filteredStudents.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100 animate-in fade-in">
                  {filteredStudents.map(student => (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-indigo-50/50 text-left transition-colors"
                    >
                      <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shrink-0">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 text-sm truncate">{student.firstName} {student.lastName}</div>
                        <div className="text-xs text-slate-500">{student.gradeLevel} • เลขที่ {student.number || '-'}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchTerm.length >= 2 && filteredStudents.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  ไม่พบนักเรียนที่ค้นหา
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                 <div className="h-12 w-12 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center shrink-0">
                   <User className="h-6 w-6" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="text-xs text-slate-500 font-medium">กำลังมอบให้</div>
                   <div className="font-bold text-slate-800 text-lg truncate">{selectedStudent.firstName} {selectedStudent.lastName}</div>
                 </div>
                 <button 
                   onClick={() => setSelectedStudent(null)}
                   className="text-xs text-indigo-600 font-bold hover:underline"
                 >
                   เปลี่ยนคน
                 </button>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  เลือกเหรียญความดี
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleAward('honesty', 'เหรียญเด็กดีศรีซื่อสัตย์')}
                    disabled={isSaving}
                    className="flex flex-col items-center p-4 border-2 border-slate-100 hover:border-amber-400 hover:bg-amber-50 rounded-xl transition-all gap-2 group disabled:opacity-50"
                  >
                    <div className="h-12 w-12 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Medal className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <span className="block font-bold text-sm text-slate-700">ซื่อสัตย์สุจริต</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">เด็กดีศรีซื่อสัตย์</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleAward('public_mind', 'ฮีโร่จิตสาธารณะ')}
                    disabled={isSaving}
                    className="flex flex-col items-center p-4 border-2 border-slate-100 hover:border-emerald-400 hover:bg-emerald-50 rounded-xl transition-all gap-2 group disabled:opacity-50"
                  >
                    <div className="h-12 w-12 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <span className="block font-bold text-sm text-slate-700">จิตสาธารณะ</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">ฮีโร่จิตสาธารณะ</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleAward('discipline', 'วินัยดีเด่น')}
                    disabled={isSaving}
                    className="flex flex-col items-center p-4 border-2 border-slate-100 hover:border-sky-400 hover:bg-sky-50 rounded-xl transition-all gap-2 group disabled:opacity-50"
                  >
                    <div className="h-12 w-12 bg-sky-100 text-sky-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <span className="block font-bold text-sm text-slate-700">มีวินัย</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">วินัยดีเด่น</span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => handleAward('learning', 'ยอดนักสืบใฝ่รู้')}
                    disabled={isSaving}
                    className="flex flex-col items-center p-4 border-2 border-slate-100 hover:border-purple-400 hover:bg-purple-50 rounded-xl transition-all gap-2 group disabled:opacity-50"
                  >
                    <div className="h-12 w-12 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Search className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <span className="block font-bold text-sm text-slate-700">ใฝ่เรียนรู้</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">ยอดนักสืบใฝ่รู้</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
