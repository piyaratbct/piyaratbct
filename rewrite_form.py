import re

with open('src/components/LessonLogForm.tsx', 'r') as f:
    content = f.read()

# Replace EVALUATION_CRITERIA
old_criteria = r'const EVALUATION_CRITERIA = \{.*?m5: 5 \}\n\};'
new_criteria = """const EVALUATION_CRITERIA = {
  planning: [
    { id: 'p1', label: 'จัดทำแผนการสอนตามมาตรฐานการเรียนรู้ ตัวชี้วัด และหลักสูตรสถานศึกษา (ม.3.1)' },
    { id: 'p2', label: 'จุดประสงค์การเรียนรู้มีความชัดเจน สามารถวัดและประเมินผลได้จริง' },
    { id: 'p3', label: 'การจัดกิจกรรมการเรียนการสอน เป็นไปตามแผนการสอน (ม.3.1)' },
    { id: 'p4', label: 'รูปแบบการจัดกิจกรรมการเรียนการสอนส่งเสริมการลงมือปฏิบัติจริง และกระตุ้นให้ผู้เรียนเกิดการคิดวิเคราะห์' },
    { id: 'p5', label: 'เครื่องมือวัดและประเมินผลสอดคล้องกับจุดประสงค์การเรียนรู้' },
  ],
  time: [
    { id: 'tm1', label: 'ระยะเวลาในการจัดกิจกรรมการเรียนการสอนเพียงพอเหมาะสมกับเนื้อหา' },
    { id: 'tm2', label: 'ใช้เวลาช่วงต้นคาบในการทบทวนความรู้เดิมหรือแจ้งจุดประสงค์การเรียนรู้ได้อย่างกระชับ (ไม่เกิน 5-10 นาที)' },
    { id: 'tm3', label: 'สามารถปรับลด/เพิ่มกิจกรรม หรือเนื้อหาให้สอดคล้องกับเวลาจริงที่เหลืออยู่' },
    { id: 'tm4', label: 'จัดการปัญหาความล่าช้าในชั้นเรียนได้อย่างเป็นระบบโดยไม่กระทบเป้าหมายหลัก' },
    { id: 'tm5', label: 'จัดเตรียมสื่อ อุปกรณ์ และเอกสารการสอนไว้ล่วงหน้า ทำให้ไม่เสียเวลาในการเริ่มคาบ' },
  ],
  media: [
    { id: 'm1', label: 'สื่อการเรียนรู้มีเนื้อหาถูกต้อง ปลอดภัย และเหมาะสมกับวัยของผู้เรียน' },
    { id: 'm2', label: 'สื่อการเรียนรู้มีสีสัน ขนาด รูปแบบ หรือเทคโนโลยีที่กระตุ้นความสนใจได้ดี' },
    { id: 'm3', label: 'สื่อการเรียนรู้เป็นตัวช่วยให้ผู้เรียนเข้าใจเนื้อหาที่ยากหรือเป็นนามธรรมได้ง่ายขึ้น' },
    { id: 'm4', label: 'การจัดวางและการใช้สื่อการเรียนรู้มีความคล่องตัว ไม่ติดขัดระหว่างสอน' },
    { id: 'm5', label: 'ผู้เรียนสามารถมองเห็น เข้าถึง หรือมีโอกาสใช้งานสื่อการเรียนรู้ได้ทั่วถึง' },
  ],
  teacher: [
    { id: 'th1', label: 'ใช้เทคนิคการสอนที่หลากหลายและเหมาะสมกับเนื้อหา' },
    { id: 'th2', label: 'กระตุ้นความสนใจของเด็กได้น่าสนใจและเชื่อมโยงเข้าสู่เนื้อหาได้ดี' },
    { id: 'th3', label: 'วัดและประเมินผลผู้เรียนอย่างเป็นระบบด้วยวิธีที่หลากหลาย และตรงตามสภาพจริง (ม.3.4)' },
    { id: 'th4', label: 'นำผลการประเมินไปใช้ในการซ่อมเสริมและพัฒนาผู้เรียนได้อย่างเป็นรูปธรรม (ม.3.5)' },
  ],
  learner: [
    { id: 'l1', label: 'ผู้เรียนมีความกระตือรือร้นและมีส่วนร่วมในกิจกรรม (Active Learning)' },
    { id: 'l2', label: 'ผู้เรียนเข้าใจเนื้อหาและสามารถตอบคำถามหรือทำใบงานได้ตามเป้าหมาย' },
    { id: 'l3', label: 'ผู้เรียนมีการทำงานร่วมกัน แลกเปลี่ยนความคิดเห็น และช่วยเหลือก่อนหลัง (ม.3.1)' },
    { id: 'l4', label: 'ผู้เรียนปฏิบัติตามข้อตกลงในชั้นเรียนและมีความสุขในการเรียน' },
    { id: 'l5', label: 'ผู้เรียนสามารถสะท้อนความรู้หรือสร้างสรรค์ชิ้นงานจากสิ่งที่เรียนได้ (ม.3.1)' },
  ]
};

const DEFAULT_EVALUATIONS = {
  planning: { p1: 5, p2: 5, p3: 5, p4: 5, p5: 5 },
  time: { tm1: 5, tm2: 5, tm3: 5, tm4: 5, tm5: 5 },
  media: { m1: 5, m2: 5, m3: 5, m4: 5, m5: 5 },
  teacher: { th1: 5, th2: 5, th3: 5, th4: 5 },
  learner: { l1: 5, l2: 5, l3: 5, l4: 5, l5: 5 },
};"""

content = re.sub(old_criteria, new_criteria, content, flags=re.DOTALL)

# Replace state initialization type
content = re.sub(
    r'const \[evaluations, setEvaluations\] = useState<\{\s*teacher: Record<string, number>;\s*learner: Record<string, number>;\s*media: Record<string, number>;\s*\}>\(DEFAULT_EVALUATIONS\);',
    r'const [evaluations, setEvaluations] = useState<{ planning: Record<string, number>; time: Record<string, number>; media: Record<string, number>; teacher: Record<string, number>; learner: Record<string, number>; }>(DEFAULT_EVALUATIONS);',
    content
)

# Fix useEffect initialization logic for backwards compatibility
old_init = r'if \(initialRecord\.evaluations\) \{\s*setEvaluations\(initialRecord\.evaluations\);\s*\} else \{\s*setEvaluations\(DEFAULT_EVALUATIONS\);\s*\}'
new_init = """if (initialRecord.evaluations) {
        setEvaluations({
          planning: initialRecord.evaluations.planning || DEFAULT_EVALUATIONS.planning,
          time: initialRecord.evaluations.time || DEFAULT_EVALUATIONS.time,
          media: initialRecord.evaluations.media || DEFAULT_EVALUATIONS.media,
          teacher: initialRecord.evaluations.teacher || DEFAULT_EVALUATIONS.teacher,
          learner: initialRecord.evaluations.learner || DEFAULT_EVALUATIONS.learner,
        });
      } else {
        setEvaluations(DEFAULT_EVALUATIONS);
      }"""
content = re.sub(old_init, new_init, content, flags=re.DOTALL)

# Replace rendering UI logic
old_ui = r'<div className="divide-y divide-slate-100">\s*\{/\* ด้านผู้สอน \*/\}.*?\{/\* ด้านสื่อและแหล่งเรียนรู้ \*/\}.*?</div>\s*</div>\s*</div>\s*</div>\s*</div>'
new_ui = """<div className="divide-y divide-slate-100">
              {/* ด้านการวางแผนการสอน */}
              <div className="p-4 bg-slate-50/30">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-violet-500 rounded-full"></div>
                  ด้านการวางแผนการสอน
                </h4>
                <div className="space-y-3">
                  {EVALUATION_CRITERIA.planning.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                      <span className="text-[11px] text-slate-700 flex-1 flex gap-2">
                        <span className="text-slate-400 font-medium">{index + 1}.</span> 
                        {item.label}
                      </span>
                      <div className="flex gap-1.5 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            type="button"
                            key={score}
                            onClick={() => setEvaluations(prev => ({ ...prev, planning: { ...prev.planning, [item.id]: score } }))}
                            className={`w-8 h-8 flex items-center justify-center rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                              evaluations.planning[item.id] === score
                                ? 'bg-violet-500 text-white shadow-md shadow-violet-200 scale-110'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* ด้านบริหารเวลาการจัดการเรียนการเรียนรู้ */}
              <div className="p-4 bg-slate-50/30">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-orange-500 rounded-full"></div>
                  ด้านบริหารเวลาการจัดการเรียนการเรียนรู้
                </h4>
                <div className="space-y-3">
                  {EVALUATION_CRITERIA.time.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                      <span className="text-[11px] text-slate-700 flex-1 flex gap-2">
                        <span className="text-slate-400 font-medium">{index + 1}.</span> 
                        {item.label}
                      </span>
                      <div className="flex gap-1.5 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            type="button"
                            key={score}
                            onClick={() => setEvaluations(prev => ({ ...prev, time: { ...prev.time, [item.id]: score } }))}
                            className={`w-8 h-8 flex items-center justify-center rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                              evaluations.time[item.id] === score
                                ? 'bg-orange-500 text-white shadow-md shadow-orange-200 scale-110'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* ด้านสื่อและแหล่งเรียนรู้ */}
              <div className="p-4 bg-slate-50/30">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                  ด้านสื่อและแหล่งเรียนรู้ (ม.3.2)
                </h4>
                <div className="space-y-3">
                  {EVALUATION_CRITERIA.media.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                      <span className="text-[11px] text-slate-700 flex-1 flex gap-2">
                        <span className="text-slate-400 font-medium">{index + 1}.</span> 
                        {item.label}
                      </span>
                      <div className="flex gap-1.5 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            type="button"
                            key={score}
                            onClick={() => setEvaluations(prev => ({ ...prev, media: { ...prev.media, [item.id]: score } }))}
                            className={`w-8 h-8 flex items-center justify-center rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                              evaluations.media[item.id] === score
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 scale-110'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* ด้านผู้สอน */}
              <div className="p-4 bg-slate-50/30">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                  ด้านผู้สอน
                </h4>
                <div className="space-y-3">
                  {EVALUATION_CRITERIA.teacher.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                      <span className="text-[11px] text-slate-700 flex-1 flex gap-2">
                        <span className="text-slate-400 font-medium">{index + 1}.</span> 
                        {item.label}
                      </span>
                      <div className="flex gap-1.5 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            type="button"
                            key={score}
                            onClick={() => setEvaluations(prev => ({ ...prev, teacher: { ...prev.teacher, [item.id]: score } }))}
                            className={`w-8 h-8 flex items-center justify-center rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                              evaluations.teacher[item.id] === score
                                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200 scale-110'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* ด้านผู้เรียน */}
              <div className="p-4 bg-slate-50/30">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                  ด้านผู้เรียน
                </h4>
                <div className="space-y-3">
                  {EVALUATION_CRITERIA.learner.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                      <span className="text-[11px] text-slate-700 flex-1 flex gap-2">
                        <span className="text-slate-400 font-medium">{index + 1}.</span> 
                        {item.label}
                      </span>
                      <div className="flex gap-1.5 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            type="button"
                            key={score}
                            onClick={() => setEvaluations(prev => ({ ...prev, learner: { ...prev.learner, [item.id]: score } }))}
                            className={`w-8 h-8 flex items-center justify-center rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                              evaluations.learner[item.id] === score
                                ? 'bg-blue-500 text-white shadow-md shadow-blue-200 scale-110'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>"""

content = re.sub(old_ui, new_ui, content, flags=re.DOTALL)

with open('src/components/LessonLogForm.tsx', 'w') as f:
    f.write(content)

print("Updated LessonLogForm.tsx")
