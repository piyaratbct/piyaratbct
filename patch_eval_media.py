import re

with open('src/components/LessonLogForm.tsx', 'r') as f:
    content = f.read()

target1 = """  media: [
    { id: 'm1', label: 'ความสอดคล้องของสื่อกับเนื้อหา/กิจกรรม' },
    { id: 'm2', label: 'ความหลากหลายและความน่าสนใจของสื่อ' },
    { id: 'm3', label: 'ความพร้อมใช้งานและเพียงพอต่อผู้เรียน' },
    { id: 'm4', label: 'สภาพแวดล้อมและแหล่งเรียนรู้เอื้อต่อการเรียน' },
  ]"""

replacement1 = """  media: [
    { id: 'm1', label: 'ความเหมาะสมถูกต้อง ปลอดภัย และเหมาะสมกับวัย' },
    { id: 'm2', label: 'สีสัน ขนาด รูปแบบหรือเทคโนโลยีที่กระตุ้นความสนใจ' },
    { id: 'm3', label: 'การจัดวางและใช้อุปกรณ์มีความคล่องตัว ไม่ติดขัดระหว่างสอน' },
    { id: 'm4', label: 'ช่วยให้ผู้เรียนเข้าใจเนื้อหาที่เป็นนามธรรมได้ง่ายขึ้น' },
    { id: 'm5', label: 'ผู้เรียนสามารถมองเห็น เข้าถึง หรือมีโอกาสจับต้องได้ทั่วถึง' },
  ]"""

content = content.replace(target1, replacement1)

target_def = """  media: { m1: 5, m2: 5, m3: 5, m4: 5 }"""
replacement_def = """  media: { m1: 5, m2: 5, m3: 5, m4: 5, m5: 5 }"""
content = content.replace(target_def, replacement_def)

with open('src/components/LessonLogForm.tsx', 'w') as f:
    f.write(content)


with open('src/components/PrintTemplate.tsx', 'r') as f:
    content = f.read()

target2 = """                <div className="flex-1 min-w-[150px]">
                  <h5 className="text-[10px] font-bold text-slate-700 border-b border-slate-200 pb-1 mb-1">ด้านสื่อ/แหล่งเรียนรู้</h5>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-slate-600"><span>1. ความสอดคล้องของสื่อฯ</span><span className="font-bold">{record.evaluations.media.m1}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>2. ความหลากหลายฯ</span><span className="font-bold">{record.evaluations.media.m2}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>3. ความพร้อมใช้งานฯ</span><span className="font-bold">{record.evaluations.media.m3}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>4. สภาพแวดล้อมฯ</span><span className="font-bold">{record.evaluations.media.m4}/5</span></div>
                  </div>
                </div>"""

replacement2 = """                <div className="flex-1 min-w-[150px]">
                  <h5 className="text-[10px] font-bold text-slate-700 border-b border-slate-200 pb-1 mb-1">ด้านสื่อ/แหล่งเรียนรู้</h5>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-slate-600"><span>1. ความเหมาะสมปลอดภัยฯ</span><span className="font-bold">{record.evaluations.media.m1 || 0}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>2. กระตุ้นความสนใจฯ</span><span className="font-bold">{record.evaluations.media.m2 || 0}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>3. ความคล่องตัวในการใช้ฯ</span><span className="font-bold">{record.evaluations.media.m3 || 0}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>4. ช่วยให้เข้าใจง่ายขึ้นฯ</span><span className="font-bold">{record.evaluations.media.m4 || 0}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>5. การเข้าถึงทั่วถึงฯ</span><span className="font-bold">{record.evaluations.media.m5 || 0}/5</span></div>
                  </div>
                </div>"""
content = content.replace(target2, replacement2)

with open('src/components/PrintTemplate.tsx', 'w') as f:
    f.write(content)

