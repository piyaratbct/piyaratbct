import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Users, ArrowRight, GraduationCap, ChevronRight } from 'lucide-react';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Student, GRADE_LEVELS } from '../types';

export const PromotionManager: React.FC<{
  currentAcademicYear: string;
  targetAcademicYear: string;
  students: Student[];
}> = ({ currentAcademicYear, targetAcademicYear, students }) => {
  const [selectedGrade, setSelectedGrade] = useState<string>(GRADE_LEVELS[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Active students in the selected grade
  const classStudents = students.filter(s => 
    s.gradeLevel === selectedGrade && 
    (s.status === 'active' || !s.status)
  ).sort((a, b) => a.number - b.number);

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

  const handlePromoteAll = async () => {
    if (classStudents.length === 0) return;
    const nextGrade = getNextGrade(selectedGrade);
    const confirmMsg = nextGrade === 'จบการศึกษา' 
      ? `ยืนยันการบันทึกสถานะ "จบการศึกษา" ให้นักเรียนชั้น ${selectedGrade} จำนวน ${classStudents.length} คน?`
      : `ยืนยันการเลื่อนชั้นนักเรียน ${selectedGrade} ไปยัง "${nextGrade}" จำนวน ${classStudents.length} คน?`;
      
    if (!window.confirm(confirmMsg)) return;

    try {
      setIsProcessing(true);
      const batch = writeBatch(db);
      
      classStudents.forEach(student => {
        const studentRef = doc(db, 'students', student.id);
        if (nextGrade === 'จบการศึกษา') {
          batch.update(studentRef, { status: 'graduated' });
        } else {
          batch.update(studentRef, { gradeLevel: nextGrade });
        }
      });
      
      await batch.commit();
      alert('ดำเนินการเรียบร้อยแล้ว (กรุณารีเฟรชหน้าจอเพื่อดูข้อมูลล่าสุด)');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเลื่อนชั้น');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-2">จัดการเลื่อนชั้นและจบการศึกษา</h3>
        <p className="text-sm text-slate-500 mb-6">
          เมื่อสิ้นสุดปีการศึกษา {currentAcademicYear} ระบบจะเลื่อนชั้นนักเรียนไปยังระดับชั้นถัดไป<br/>
          สำหรับชั้น อ.3 และ ป.6 ระบบจะสามารถปรับสถานะเป็น "จบการศึกษา" ได้
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

        <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
            <span className="font-bold text-slate-700 text-sm">รายชื่อนักเรียน ({classStudents.length} คน)</span>
            {classStudents.length > 0 && (
              <button 
                onClick={handlePromoteAll}
                disabled={isProcessing}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold shadow-sm disabled:opacity-50"
              >
                {isProcessing ? 'กำลังดำเนินการ...' : 'ดำเนินการทั้งหมด'}
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto p-4">
            {classStudents.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-medium text-sm">ไม่มีนักเรียนที่มีสถานะกำลังศึกษาในระดับชั้นนี้</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {classStudents.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {student.number}
                      </div>
                      <div className="text-sm font-medium text-slate-700">
                        {student.firstName} {student.lastName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
