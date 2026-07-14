import re

with open('src/components/ScheduleManager.tsx', 'r') as f:
    content = f.read()

target = """  return (
    <div className="space-y-6">
      {(currentTeacher.role !== 'admin' && currentTeacher.role !== 'academic') && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-700 shadow-sm animate-in fade-in">
          <ShieldCheck className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-bold">สงวนสิทธิ์การเข้าถึงข้อมูล</h4>
            <p className="text-sm mt-1">
              ผู้ใช้งานในบทบาทของคุณสามารถเข้าดูข้อมูลได้เท่านั้น ไม่สามารถแก้ไขหรือตั้งค่าในส่วนของการจัดตารางสอนได้
            </p>
          </div>
        </div>
      )}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">"""

replacement = """  if (currentTeacher.role !== 'admin' && currentTeacher.role !== 'academic') {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center animate-in fade-in">
        <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">จัดการตารางสอน</h3>
        <p className="text-slate-500">ส่วนนี้ใช้สำหรับจัดโครงสร้างครูประจำชั้น และจัดสรรตารางสอนให้กับบุคลากร</p>
        <p className="mt-4 text-sm text-rose-500 font-medium">คุณไม่มีสิทธิ์เข้าถึงการจัดการตารางสอน</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">"""

content = content.replace(target, replacement)

with open('src/components/ScheduleManager.tsx', 'w') as f:
    f.write(content)
