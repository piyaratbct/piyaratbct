import React, { useState, useEffect } from 'react';
import { CheckSquare } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Student } from '../types';

interface EventAttendanceModalProps {
  attendanceEvent: any;
  setAttendanceEvent: (event: any) => void;
  students: Student[];
  onSuccess?: () => void;
  currentTeacher?: any;
}

export function EventAttendanceModal({ attendanceEvent, setAttendanceEvent, students, onSuccess, currentTeacher }: EventAttendanceModalProps) {
  const [currentAttendees, setCurrentAttendees] = useState<string[]>([]);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

  useEffect(() => {
    if (attendanceEvent) {
      setCurrentAttendees(attendanceEvent.attendeeIds || []);
      setAttendanceSearch('');
      // Default to homeroom class if available
      if (currentTeacher?.homeroomClass) {
        if (!attendanceEvent.targetGrades || attendanceEvent.targetGrades.length === 0 || attendanceEvent.targetGrades.includes(currentTeacher.homeroomClass)) {
          setGradeFilter(currentTeacher.homeroomClass);
        } else {
          setGradeFilter('');
        }
      } else {
        setGradeFilter('');
      }
    }
  }, [attendanceEvent, currentTeacher]);

  

  if (!attendanceEvent) return null;

  const availableGrades = Array.from(new Set(students.map(s => s.gradeLevel))).filter(Boolean).sort();
  const displayedGrades = attendanceEvent.targetGrades && attendanceEvent.targetGrades.length > 0
    ? attendanceEvent.targetGrades
    : availableGrades;

  const modalFilteredStudents = (students?.filter(s => {
    if (attendanceEvent.targetGrades && attendanceEvent.targetGrades.length > 0) {
      if (!attendanceEvent.targetGrades.includes(s.gradeLevel)) return false;
    }
    if (gradeFilter && s.gradeLevel !== gradeFilter) return false;
    
    if (attendanceSearch) {
      return s.firstName.includes(attendanceSearch) || s.lastName.includes(attendanceSearch) || s.studentId.includes(attendanceSearch);
    }
    return true;
  }) || []).sort((a, b) => {
    const aId = a.studentId || "";
    const bId = b.studentId || "";
    return aId.localeCompare(bId, 'th', { numeric: true });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-black text-emerald-800 flex items-center gap-2">
              <CheckSquare className="h-6 w-6" />
              เช็คชื่อผู้เข้าร่วมกิจกรรม
            </h3>
            <p className="text-sm text-emerald-600 font-medium mt-1">{attendanceEvent.title}</p>
          </div>
        </div>
        
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex gap-2 w-full sm:w-auto flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="ค้นหาชื่อ..."
              value={attendanceSearch}
              onChange={e => setAttendanceSearch(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <select
              value={gradeFilter}
              onChange={e => setGradeFilter(e.target.value)}
              className="w-full sm:w-36 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">ทุกระดับชั้น</option>
              {displayedGrades.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const allIds = modalFilteredStudents.map(s => s.id);
                  setCurrentAttendees(prev => Array.from(new Set([...prev, ...allIds])));
                }}
                className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-200"
              >
                เช็คชื่อทั้งหมด
              </button>
              <button 
                onClick={() => {
                  const currentModalIds = new Set(modalFilteredStudents.map(s => s.id));
                  setCurrentAttendees(prev => prev.filter(id => !currentModalIds.has(id)));
                }}
                className="text-xs bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-300"
              >
                ล้างทั้งหมด
              </button>
            </div>
            <div className="text-sm text-slate-600 font-bold border-l border-slate-300 pl-4">
              ยอดรวม: <span className="text-emerald-600 text-lg">{currentAttendees.length}</span> คน
            </div>
          </div>
        </div>

        <div className="p-2 overflow-y-auto flex-1 bg-slate-50">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {modalFilteredStudents.map((student, index) => {
              const isChecked = currentAttendees.includes(student.id);
              return (
                <label key={student.id} className={`flex items-center justify-between p-3 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-emerald-50/50 transition-colors ${isChecked ? 'bg-emerald-50/30' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="text-slate-400 font-medium text-xs w-6">{index + 1}.</div>
                    <div>
                      <div className="font-bold text-sm text-slate-800 flex flex-wrap items-center gap-x-1 gap-y-0.5 leading-snug"><span>{student.firstName} {student.lastName}</span>{student.nickname && <span className="text-emerald-700 font-medium text-xs whitespace-nowrap">({student.nickname})</span>}</div>
                      <div className="text-xs text-slate-500">{student.gradeLevel} | รหัส: {student.studentId}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCurrentAttendees(prev => [...prev, student.id]);
                        } else {
                          setCurrentAttendees(prev => prev.filter(id => id !== student.id));
                        }
                      }}
                      className="w-5 h-5 rounded text-emerald-500 border-slate-300 focus:ring-emerald-500"
                    />
                  </div>
                </label>
              );
            })}
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={() => {
              setAttendanceEvent(null);
            }}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200"
          >
            ยกเลิก
          </button>
          <button
            onClick={async () => {
              try {
                await updateDoc(doc(db, 'schoolEvents', attendanceEvent.id), {
                  attendeeIds: currentAttendees
                });
                setAttendanceEvent(null);
                if (onSuccess) onSuccess();
                window.dispatchEvent(new CustomEvent('app-custom-toast', { detail: { message: 'บันทึกการเข้าร่วมสำเร็จ', type: 'success' }}));
              } catch (error) {
                console.error('Error saving attendance:', error);
              }
            }}
            className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-sm"
          >
            บันทึกการเข้าร่วม
          </button>
        </div>
      </div>
    </div>
  );
}
