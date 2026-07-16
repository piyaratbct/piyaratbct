import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Header navigation buttons
replacements = [
    (
        r'<LayoutDashboard className="h-4\.5 w-4\.5" />\s*<span>หน้าแรก \(Overview\)</span>',
        r'<LayoutDashboard className="h-4.5 w-4.5 shrink-0" />\n            <div className="flex flex-col items-center sm:items-start leading-tight">\n              <span className="whitespace-nowrap">หน้าแรก</span>\n              <span className="text-[10px] font-medium opacity-80">(Overview)</span>\n            </div>'
    ),
    (
        r'<Presentation className="h-4\.5 w-4\.5" />\s*<span>1\. การจัดการผู้สอน \(LessonTeach\)</span>',
        r'<Presentation className="h-4.5 w-4.5 shrink-0" />\n            <div className="flex flex-col items-center sm:items-start leading-tight">\n              <span className="whitespace-nowrap">1. การจัดการผู้สอน</span>\n              <span className="text-[10px] font-medium opacity-80">(LessonTeach)</span>\n            </div>'
    ),
    (
        r'<Users className="h-4\.5 w-4\.5" />\s*<span>2\. การจัดการชั้นเรียน \(LessonClass\)</span>',
        r'<Users className="h-4.5 w-4.5 shrink-0" />\n            <div className="flex flex-col items-center sm:items-start leading-tight">\n              <span className="whitespace-nowrap">2. การจัดการชั้นเรียน</span>\n              <span className="text-[10px] font-medium opacity-80">(LessonClass)</span>\n            </div>'
    ),
    (
        r'<BarChart3 className="h-4\.5 w-4\.5" />\s*<span>3\. การวัดและประเมินผลผู้เรียน \(LessonAchieve\)</span>',
        r'<BarChart3 className="h-4.5 w-4.5 shrink-0" />\n            <div className="flex flex-col items-center sm:items-start leading-tight">\n              <span className="whitespace-nowrap">3. การวัดและประเมินผลผู้เรียน</span>\n              <span className="text-[10px] font-medium opacity-80">(LessonAchieve)</span>\n            </div>'
    ),
    (
        r'<BookOpen className="h-4\.5 w-4\.5" />\s*<span>4\. การบริหาร<br />งานวิชาการ \(LessonAcad\)</span>',
        r'<BookOpen className="h-4.5 w-4.5 shrink-0" />\n            <div className="flex flex-col items-center sm:items-start leading-tight">\n              <span className="whitespace-nowrap">4. การบริหารงานวิชาการ</span>\n              <span className="text-[10px] font-medium opacity-80">(LessonAcad)</span>\n            </div>'
    ),
    (
        r'<ShieldAlert className="h-4\.5 w-4\.5" />\s*<span>5\. การบริหาร<br />งานปกครอง \(LessonDiscipline\)</span>',
        r'<ShieldAlert className="h-4.5 w-4.5 shrink-0" />\n            <div className="flex flex-col items-center sm:items-start leading-tight">\n              <span className="whitespace-nowrap">5. การบริหารงานปกครอง</span>\n              <span className="text-[10px] font-medium opacity-80">(LessonDiscipline)</span>\n            </div>'
    ),
    (
        r'<ShieldCheck className="h-4\.5 w-4\.5" />\s*<span>การจัดการระบบ<br />ผู้ใช้งาน \(Admin\)</span>',
        r'<ShieldCheck className="h-4.5 w-4.5 shrink-0" />\n            <div className="flex flex-col items-center sm:items-start leading-tight">\n              <span className="whitespace-nowrap">การจัดการระบบผู้ใช้งาน</span>\n              <span className="text-[10px] font-medium opacity-80">(Admin)</span>\n            </div>'
    )
]

for old, new in replacements:
    content = re.sub(old, new, content)

# Welcome screen buttons
welcome_replacements = [
    (
        r'<h3 className="text-lg font-black text-slate-800 mb-2">\s*1\. การจัดการผู้สอน \(LessonTeach\)\s*</h3>',
        r'<h3 className="text-lg font-black text-slate-800 mb-2 leading-tight flex flex-col gap-0.5">\n                  <span className="whitespace-nowrap">1. การจัดการผู้สอน</span>\n                  <span className="text-sm text-slate-500 font-bold">(LessonTeach)</span>\n                </h3>'
    ),
    (
        r'<h3 className="text-lg font-black text-slate-800 mb-2">\s*2\. การจัดการชั้นเรียน \(LessonClass\)\s*</h3>',
        r'<h3 className="text-lg font-black text-slate-800 mb-2 leading-tight flex flex-col gap-0.5">\n                  <span className="whitespace-nowrap">2. การจัดการชั้นเรียน</span>\n                  <span className="text-sm text-slate-500 font-bold">(LessonClass)</span>\n                </h3>'
    ),
    (
        r'<h3 className="text-lg font-black text-slate-800 mb-2">\s*3\. การวัดและประเมินผลผู้เรียน \(LessonAchieve\)\s*</h3>',
        r'<h3 className="text-lg font-black text-slate-800 mb-2 leading-tight flex flex-col gap-0.5">\n                  <span className="whitespace-nowrap text-base sm:text-lg">3. การวัดและประเมินผลผู้เรียน</span>\n                  <span className="text-sm text-slate-500 font-bold">(LessonAchieve)</span>\n                </h3>'
    ),
    (
        r'<h3 className="text-lg font-black text-slate-800 mb-2">\s*4\. การบริหาร<br />งานวิชาการ \(LessonAcad\)\s*</h3>',
        r'<h3 className="text-lg font-black text-slate-800 mb-2 leading-tight flex flex-col gap-0.5">\n                  <span className="whitespace-nowrap">4. การบริหารงานวิชาการ</span>\n                  <span className="text-sm text-slate-500 font-bold">(LessonAcad)</span>\n                </h3>'
    ),
    (
        r'<h3 className="text-lg font-black text-slate-800 mb-2">\s*5\. การบริหาร<br />งานปกครอง \(LessonDiscipline\)\s*</h3>',
        r'<h3 className="text-lg font-black text-slate-800 mb-2 leading-tight flex flex-col gap-0.5">\n                  <span className="whitespace-nowrap">5. การบริหารงานปกครอง</span>\n                  <span className="text-sm text-slate-500 font-bold">(LessonDiscipline)</span>\n                </h3>'
    ),
    (
        r'<h3 className="text-lg font-black text-slate-800 mb-2">\s*การจัดการระบบ<br />ผู้ใช้งาน \(Admin\)\s*</h3>',
        r'<h3 className="text-lg font-black text-slate-800 mb-2 leading-tight flex flex-col gap-0.5">\n                  <span className="whitespace-nowrap">การจัดการระบบผู้ใช้งาน</span>\n                  <span className="text-sm text-slate-500 font-bold">(Admin)</span>\n                </h3>'
    )
]

for old, new in welcome_replacements:
    content = re.sub(old, new, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Replacement complete")
