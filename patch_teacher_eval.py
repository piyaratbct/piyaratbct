import re

with open('src/components/LessonLogForm.tsx', 'r') as f:
    content = f.read()

target = """const EVALUATION_CRITERIA = {
  teacher: [
    { id: 't1', label: 'การเตรียมความพร้อมและแผนการจัดการเรียนรู้' },
    { id: 't2', label: 'การจัดกิจกรรมการเรียนรู้ที่เน้นผู้เรียนเป็นสำคัญ' },
    { id: 't3', label: 'การใช้คำถามกระตุ้นการคิดและทักษะกระบวนการ' },
    { id: 't4', label: 'การวัดและประเมินผลตามสภาพจริง' },
  ],"""

replacement = """const EVALUATION_CRITERIA = {
  teacher: [
    { id: 't1', label: 'เตรียมการจัดทำแผนการสอนตรงตามตัวชี้วัดและวัตถุประสงค์' },
    { id: 't2', label: 'นำเข้าสู่บทเรียน กระตุ้นความสนใจของเด็กได้น่าสนใจและเชื่อมโยงเข้าสู่เนื้อหาได้ดี' },
    { id: 't3', label: 'จัดกิจกรรมโดยใช้เทคนิคการสอนที่หลากหลายและเหมาะสมกับเนื้อหา' },
    { id: 't4', label: 'ประเมินผลผู้เรียนด้วยวิธีที่หลากหลายและตรงตามสภาพจริง' },
  ],"""

content = content.replace(target, replacement)
with open('src/components/LessonLogForm.tsx', 'w') as f:
    f.write(content)

with open('src/components/PrintTemplate.tsx', 'r') as f:
    content = f.read()

target_print = """                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-slate-600"><span>1. การเตรียมความพร้อมฯ</span><span className="font-bold">{record.evaluations.teacher.t1}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>2. การจัดกิจกรรมฯ</span><span className="font-bold">{record.evaluations.teacher.t2}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>3. การใช้คำถามกระตุ้นฯ</span><span className="font-bold">{record.evaluations.teacher.t3}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>4. การวัดและประเมินผลฯ</span><span className="font-bold">{record.evaluations.teacher.t4}/5</span></div>
                  </div>"""

replacement_print = """                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-slate-600"><span>1. เตรียมการจัดทำแผนฯ</span><span className="font-bold">{record.evaluations.teacher.t1}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>2. นำเข้าสู่บทเรียนฯ</span><span className="font-bold">{record.evaluations.teacher.t2}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>3. จัดกิจกรรมโดยใช้เทคนิคฯ</span><span className="font-bold">{record.evaluations.teacher.t3}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>4. ประเมินผลผู้เรียนฯ</span><span className="font-bold">{record.evaluations.teacher.t4}/5</span></div>
                  </div>"""
content = content.replace(target_print, replacement_print)
with open('src/components/PrintTemplate.tsx', 'w') as f:
    f.write(content)
