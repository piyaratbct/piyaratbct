import re

with open('src/components/LessonLogForm.tsx', 'r') as f:
    content = f.read()

target1 = """  learner: [
    { id: 'l1', label: 'ความสนใจและการมีส่วนร่วมในกิจกรรม' },
    { id: 'l2', label: 'ความเข้าใจและการบรรลุวัตถุประสงค์การเรียนรู้' },
    { id: 'l3', label: 'ความกระตือรือร้นในการค้นคว้า/ซักถาม' },
    { id: 'l4', label: 'การทำงานร่วมกับผู้อื่น (ทักษะทางสังคม)' },
  ],"""

replacement1 = """  learner: [
    { id: 'l1', label: 'การมีส่วนร่วมในกิจกรรม ผู้เรียนมีความกระตือรือร้น' },
    { id: 'l2', label: 'ผู้เรียนมีความเข้าใจเนื้อหาและสามารถตอบคำถามหรือทำใบงานได้' },
    { id: 'l3', label: 'ผู้เรียนมีการทำงานร่วมกัน แลกเปลี่ยนความคิดเห็น' },
    { id: 'l4', label: 'ผู้เรียนปฏิบัติตามข้อตกลงในชั้นเรียนและมีความสุขในการเรียน' },
    { id: 'l5', label: 'ผู้เรียนสามารถสะท้อนความรู้หรือสร้างสรรค์ผลงานจากสิ่งที่เรียนได้' },
  ],"""

content = content.replace(target1, replacement1)

target_def = """  learner: { l1: 5, l2: 5, l3: 5, l4: 5 },"""
replacement_def = """  learner: { l1: 5, l2: 5, l3: 5, l4: 5, l5: 5 },"""
content = content.replace(target_def, replacement_def)

with open('src/components/LessonLogForm.tsx', 'w') as f:
    f.write(content)

with open('src/components/PrintTemplate.tsx', 'r') as f:
    content = f.read()

target2 = """                <div className="flex-1 min-w-[150px]">
                  <h5 className="text-[10px] font-bold text-slate-700 border-b border-slate-200 pb-1 mb-1">ด้านผู้เรียน</h5>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-slate-600"><span>1. ความสนใจฯ</span><span className="font-bold">{record.evaluations.learner.l1}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>2. ความเข้าใจและบรรลุผลฯ</span><span className="font-bold">{record.evaluations.learner.l2}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>3. ความกระตือรือร้นฯ</span><span className="font-bold">{record.evaluations.learner.l3}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>4. การทำงานร่วมกับผู้อื่น</span><span className="font-bold">{record.evaluations.learner.l4}/5</span></div>
                  </div>
                </div>"""

replacement2 = """                <div className="flex-1 min-w-[150px]">
                  <h5 className="text-[10px] font-bold text-slate-700 border-b border-slate-200 pb-1 mb-1">ด้านผู้เรียน</h5>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-slate-600"><span>1. การมีส่วนร่วมฯ</span><span className="font-bold">{record.evaluations.learner.l1 || 0}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>2. ความเข้าใจเนื้อหาฯ</span><span className="font-bold">{record.evaluations.learner.l2 || 0}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>3. การทำงานร่วมกันฯ</span><span className="font-bold">{record.evaluations.learner.l3 || 0}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>4. ปฏิบัติตามข้อตกลงฯ</span><span className="font-bold">{record.evaluations.learner.l4 || 0}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>5. สะท้อนความรู้ฯ</span><span className="font-bold">{record.evaluations.learner.l5 || 0}/5</span></div>
                  </div>
                </div>"""
content = content.replace(target2, replacement2)

with open('src/components/PrintTemplate.tsx', 'w') as f:
    f.write(content)

