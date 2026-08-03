import React, { useState } from 'react';
import { Users, Circle, ChevronDown, Activity } from 'lucide-react';
import { Teacher } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  currentTeacher: Teacher;
  teachers: Teacher[];
}

export function OnlineUsersIndicator({ currentTeacher, teachers }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Only admins can see this
  if (currentTeacher.role !== 'admin') return null;

  // Active within last 15 minutes
  const activeTeachers = teachers.filter(t => 
    t.lastActiveAt && (new Date().getTime() - new Date(t.lastActiveAt).getTime() < 15 * 60 * 1000)
  );
  
  if (activeTeachers.length === 0) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 bg-emerald-50 text-emerald-700 px-2 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors"
      >
        <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-emerald-500"></span>
        </span>
        <span className="hidden sm:inline">กำลังออนไลน์</span>
        <span>{activeTeachers.length} คน</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-64 sm:w-72 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden"
          >
            <div className="p-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
              <h4 className="font-bold text-emerald-800 text-xs sm:text-sm flex items-center gap-1.5">
                <Activity className="h-4 w-4" /> ผู้ใช้งานที่กำลังออนไลน์
              </h4>
              <div className="bg-emerald-200 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {activeTeachers.length} คน
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto p-2 space-y-1">
              {activeTeachers.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                    {t.thaiName ? t.thaiName.substring(0, 1) : t.displayName?.substring(0, 1) || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs sm:text-sm text-slate-700 truncate">{t.thaiName || t.displayName}</div>
                    <div className="text-[10px] sm:text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                      <Circle className="h-1.5 w-1.5 sm:h-2 sm:w-2 fill-current" /> กำลังใช้งาน
                    </div>
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-slate-400">
                    {t.role === 'admin' ? 'ผู้ดูแล' : t.role === 'academic' ? 'วิชาการ' : t.role === 'deputy' ? 'รองฯ' : 'ครู'}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
