import React from 'react';
import { UserMinus, ShieldAlert, School, ArrowRight, Users, ChevronRight, Building2 } from 'lucide-react';
import { Student } from '../types';

interface ResignedStudentsOverviewCardProps {
  students: Student[];
  onOpenModal: () => void;
}

export function ResignedStudentsOverviewCard({ students, onOpenModal }: ResignedStudentsOverviewCardProps) {
  const inactiveStudents = React.useMemo(() => {
    return students.filter(s => s.status === 'inactive');
  }, [students]);

  const totalMale = inactiveStudents.filter(s => s.gender === 'male').length;
  const totalFemale = inactiveStudents.filter(s => s.gender === 'female').length;
  const withDestCount = inactiveStudents.filter(s => !!s.destinationSchool?.trim()).length;

  // Recent 3 resigned students
  const recentInactive = inactiveStudents.slice(0, 3);

  return (
    <div className="bg-gradient-to-br from-white via-rose-50/20 to-amber-50/30 rounded-3xl p-5 sm:p-6 border border-rose-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-100/70">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-200 shrink-0">
            <UserMinus className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                สถิตินักเรียนย้าย / ลาออก
              </h3>
              <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-200">
                <ShieldAlert className="h-3 w-3" />
                เฉพาะ Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              ติดตามสถิตินักเรียนที่จำหน่ายออกจากสถานศึกษาและโรงเรียนปลายทาง
            </p>
          </div>
        </div>

        <button
          onClick={onOpenModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer w-full sm:w-auto"
        >
          <span>เปิดดูรายงานและรายชื่อทั้งหมด</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
        <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-rose-100/80 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500">จำนวนที่ย้าย/ลาออก</div>
          <div className="text-2xl font-black text-rose-600 mt-0.5">
            {inactiveStudents.length} <span className="text-xs font-bold text-slate-400">คน</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-sky-100/80 shadow-2xs">
          <div className="text-[11px] font-bold text-sky-600">นักเรียนชาย</div>
          <div className="text-2xl font-black text-sky-700 mt-0.5">
            {totalMale} <span className="text-xs font-bold text-slate-400">คน</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-pink-100/80 shadow-2xs">
          <div className="text-[11px] font-bold text-pink-600">นักเรียนหญิง</div>
          <div className="text-2xl font-black text-pink-700 mt-0.5">
            {totalFemale} <span className="text-xs font-bold text-slate-400">คน</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-100/80 shadow-2xs">
          <div className="text-[11px] font-bold text-amber-700">ระบุที่เรียนต่อแล้ว</div>
          <div className="text-2xl font-black text-amber-800 mt-0.5">
            {withDestCount} <span className="text-xs font-bold text-slate-400">คน</span>
          </div>
        </div>
      </div>

      {recentInactive.length > 0 && (
        <div className="mt-4 pt-3 border-t border-rose-100/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="font-bold text-slate-700">ตัวอย่างรายชื่อล่าสุด:</span>
            <div className="flex flex-wrap gap-1.5">
              {recentInactive.map((s) => (
                <span
                  key={s.id}
                  className="bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-slate-600 font-medium text-[11px]"
                >
                  {s.firstName} {s.lastName} ({s.gradeLevel || '-'})
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onOpenModal}
            className="text-rose-600 hover:text-rose-700 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
          >
            ดูทั้งหมด ({inactiveStudents.length}) <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
