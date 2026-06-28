import React, { useMemo } from 'react';
import { Teacher, LessonRecord, LessonPlan } from '../types';
import { ShieldCheck, FileText, CheckCircle, Clock, AlertTriangle, Users } from 'lucide-react';

interface AdminMonitoringDashboardProps {
  records: LessonRecord[];
  plans: LessonPlan[];
  teachers: Teacher[];
}

export const AdminMonitoringDashboard: React.FC<AdminMonitoringDashboardProps> = ({
  records,
  plans,
  teachers
}) => {
  // Compute Stats
  const pendingRecords = useMemo(() => records.filter(r => r.teacherSigned && !r.deptHeadApproved), [records]);
  const pendingPlans = useMemo(() => plans.filter(p => p.status === 'submitted' || p.status === 'draft'), [plans]); // Or whatever logic for pending plans

  const teacherStats = useMemo(() => {
    return teachers.filter(t => t.role === 'teacher').map(t => {
      const teacherRecords = records.filter(r => r.teacherId === t.id);
      const teacherPlans = plans.filter(p => p.teacherId === t.id);

      const approvedRecords = teacherRecords.filter(r => r.deptHeadApproved).length;
      const waitingRecords = teacherRecords.filter(r => r.teacherSigned && !r.deptHeadApproved).length;
      
      const approvedPlans = teacherPlans.filter(p => p.status === 'approved').length;
      const waitingPlans = teacherPlans.filter(p => p.status === 'submitted').length; // assuming 'submitted' means waiting for approval

      return {
        teacher: t,
        totalRecords: teacherRecords.length,
        approvedRecords,
        waitingRecords,
        totalPlans: teacherPlans.length,
        approvedPlans,
        waitingPlans
      };
    }).sort((a, b) => b.waitingRecords + b.waitingPlans - (a.waitingRecords + a.waitingPlans));
  }, [teachers, records, plans]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800">แดชบอร์ดติดตามสถานะส่งงาน (ฝ่ายวิชาการ)</h3>
          <p className="text-sm text-slate-500">ภาพรวมการส่งแผนการสอนและบันทึกหลังสอนของคุณครูทั้งหมด</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-orange-600 mb-1">บันทึกหลังสอนรอการอนุมัติ</p>
            <p className="text-2xl font-black text-orange-900">{pendingRecords.length} <span className="text-sm font-medium text-orange-700">รายการ</span></p>
          </div>
          <div className="h-10 w-10 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>
        
        <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-sky-600 mb-1">แผนการสอนรอการอนุมัติ</p>
            <p className="text-2xl font-black text-sky-900">{pendingPlans.length} <span className="text-sm font-medium text-sky-700">รายการ</span></p>
          </div>
          <div className="h-10 w-10 bg-sky-100 text-sky-500 rounded-full flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase bg-slate-50">
              <th className="py-3 px-4 font-bold rounded-tl-lg">ชื่อ - นามสกุล (คุณครู)</th>
              <th className="py-3 px-4 font-bold text-center">แผนการสอน (รอ/ผ่าน)</th>
              <th className="py-3 px-4 font-bold text-center">บันทึกหลังสอน (รอ/ผ่าน)</th>
              <th className="py-3 px-4 font-bold rounded-tr-lg">สถานะ</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-50">
            {teacherStats.map((stat, idx) => (
              <tr key={stat.teacher.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0 font-bold text-xs">
                      {stat.teacher.thaiName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{stat.teacher.thaiName}</p>
                      <p className="text-[10px] text-slate-500">{stat.teacher.affiliation}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {stat.waitingPlans > 0 ? (
                      <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold">{stat.waitingPlans} รออนุมัติ</span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                    <span className="text-slate-300">/</span>
                    <span className="text-emerald-600 font-bold text-xs">{stat.approvedPlans} ผ่าน</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {stat.waitingRecords > 0 ? (
                      <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold">{stat.waitingRecords} รออนุมัติ</span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                    <span className="text-slate-300">/</span>
                    <span className="text-emerald-600 font-bold text-xs">{stat.approvedRecords} ผ่าน</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {stat.waitingPlans > 0 || stat.waitingRecords > 0 ? (
                     <div className="flex items-center gap-1.5 text-orange-600 text-xs font-bold">
                       <AlertTriangle className="h-3.5 w-3.5" /> มีงานค้าง
                     </div>
                  ) : (
                     <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                       <CheckCircle className="h-3.5 w-3.5" /> ครบถ้วน
                     </div>
                  )}
                </td>
              </tr>
            ))}
            {teacherStats.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  ไม่มีข้อมูลผู้สอนในระบบ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
