import re

with open('src/components/ScheduleManager.tsx', 'r') as f:
    content = f.read()

target = """  return (
    <div className="space-y-6">"""

replacement = """  return (
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
      )}"""

content = content.replace(target, replacement)

with open('src/components/ScheduleManager.tsx', 'w') as f:
    f.write(content)
