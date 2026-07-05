import React from 'react';
import { Users, X, User } from 'lucide-react';
import { Teacher } from '../types';

interface TeacherListModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
}

export function TeacherListModal({ isOpen, onClose, teachers }: TeacherListModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">รายชื่อครูผู้สอนในระบบ</h3>
              <p className="text-amber-100 text-xs mt-0.5">
                รายชื่อครูทั้งหมด {teachers.length} ท่าน
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teachers.map(teacher => (
              <div key={teacher.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0 font-bold">
                  {teacher.thaiName ? teacher.thaiName.charAt(0) : <User className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{teacher.thaiName || 'ไม่ระบุชื่อ'}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{teacher.affiliation || 'ไม่ระบุหมวดหมู่'}</p>
                </div>
              </div>
            ))}
          </div>
          {teachers.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
              ไม่มีข้อมูลคุณครูในระบบ
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
