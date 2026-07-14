import re

with open('src/components/LessonLogForm.tsx', 'r') as f:
    content = f.read()

eval_criteria = """
const EVALUATION_CRITERIA = {
  teacher: [
    { id: 't1', label: 'การเตรียมความพร้อมและแผนการจัดการเรียนรู้' },
    { id: 't2', label: 'การจัดกิจกรรมการเรียนรู้ที่เน้นผู้เรียนเป็นสำคัญ' },
    { id: 't3', label: 'การใช้คำถามกระตุ้นการคิดและทักษะกระบวนการ' },
    { id: 't4', label: 'การวัดและประเมินผลตามสภาพจริง' },
  ],
  learner: [
    { id: 'l1', label: 'ความสนใจและการมีส่วนร่วมในกิจกรรม' },
    { id: 'l2', label: 'ความเข้าใจและการบรรลุวัตถุประสงค์การเรียนรู้' },
    { id: 'l3', label: 'ความกระตือรือร้นในการค้นคว้า/ซักถาม' },
    { id: 'l4', label: 'การทำงานร่วมกับผู้อื่น (ทักษะทางสังคม)' },
  ],
  media: [
    { id: 'm1', label: 'ความสอดคล้องของสื่อกับเนื้อหา/กิจกรรม' },
    { id: 'm2', label: 'ความหลากหลายและความน่าสนใจของสื่อ' },
    { id: 'm3', label: 'ความพร้อมใช้งานและเพียงพอต่อผู้เรียน' },
    { id: 'm4', label: 'สภาพแวดล้อมและแหล่งเรียนรู้เอื้อต่อการเรียน' },
  ]
};

const DEFAULT_EVALUATIONS = {
  teacher: { t1: 5, t2: 5, t3: 5, t4: 5 },
  learner: { l1: 5, l2: 5, l3: 5, l4: 5 },
  media: { m1: 5, m2: 5, m3: 5, m4: 5 }
};
"""

import_target = """import { AttachmentManager } from './AttachmentManager';"""
content = content.replace(import_target, import_target + "\nimport { Star } from 'lucide-react';\n" + eval_criteria)

state_target = """  const [suggestions, setSuggestions] = useState('');
  // Attachment states
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [errorMsg, setErrorMsg] = useState('');"""
  
state_repl = """  const [suggestions, setSuggestions] = useState('');
  const [evaluations, setEvaluations] = useState<{
    teacher: Record<string, number>;
    learner: Record<string, number>;
    media: Record<string, number>;
  }>(DEFAULT_EVALUATIONS);
  // Attachment states
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [errorMsg, setErrorMsg] = useState('');"""
content = content.replace(state_target, state_repl)

init_target = """      setContent(initialRecord.content);
      setActivities(initialRecord.activities);
      setLimitations(initialRecord.limitations);
      setSuggestions(initialRecord.suggestions);
      setAttachments(initialRecord.attachments || []);"""
init_repl = """      setContent(initialRecord.content);
      setActivities(initialRecord.activities);
      setLimitations(initialRecord.limitations);
      setSuggestions(initialRecord.suggestions);
      setAttachments(initialRecord.attachments || []);
      if (initialRecord.evaluations) {
        setEvaluations(initialRecord.evaluations);
      } else {
        setEvaluations(DEFAULT_EVALUATIONS);
      }"""
content = content.replace(init_target, init_repl)

reset_target = """    setLimitations('');
    setSuggestions('');
    setAttachments([]);
    setErrorMsg('');"""
reset_repl = """    setLimitations('');
    setSuggestions('');
    setEvaluations(DEFAULT_EVALUATIONS);
    setAttachments([]);
    setErrorMsg('');"""
content = content.replace(reset_target, reset_repl)

payload_target = """      limitations: limitations.trim(),
      suggestions: suggestions.trim(),
      attachments,"""
payload_repl = """      limitations: limitations.trim(),
      suggestions: suggestions.trim(),
      evaluations,
      attachments,"""
content = content.replace(payload_target, payload_repl)

ui_target = """        {/* ข้อจำกัดในการจัดการเรียนการสอน */}"""
ui_repl = """        {/* แบบประเมินการจัดการเรียนรู้ */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-6">
          <label className="block text-xs font-bold text-slate-700 mb-4 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            3. แบบประเมินการจัดการเรียนรู้ (5 = ดีเยี่ยม, 1 = ปรับปรุง)
          </label>
          <div className="space-y-6">
            {/* ด้านผู้สอน */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-600 mb-2 border-b border-slate-200 pb-1">ด้านผู้สอน</h4>
              <div className="space-y-2">
                {EVALUATION_CRITERIA.teacher.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <span className="text-[10px] text-slate-600 flex-1">{item.label}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          type="button"
                          key={score}
                          onClick={() => setEvaluations(prev => ({ ...prev, teacher: { ...prev.teacher, [item.id]: score } }))}
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                            evaluations.teacher[item.id] === score
                              ? 'bg-indigo-500 text-white'
                              : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500'
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
            <div>
              <h4 className="text-[11px] font-bold text-slate-600 mb-2 border-b border-slate-200 pb-1">ด้านผู้เรียน</h4>
              <div className="space-y-2">
                {EVALUATION_CRITERIA.learner.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <span className="text-[10px] text-slate-600 flex-1">{item.label}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          type="button"
                          key={score}
                          onClick={() => setEvaluations(prev => ({ ...prev, learner: { ...prev.learner, [item.id]: score } }))}
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                            evaluations.learner[item.id] === score
                              ? 'bg-blue-500 text-white'
                              : 'bg-white border border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500'
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
            <div>
              <h4 className="text-[11px] font-bold text-slate-600 mb-2 border-b border-slate-200 pb-1">ด้านสื่อและแหล่งเรียนรู้</h4>
              <div className="space-y-2">
                {EVALUATION_CRITERIA.media.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <span className="text-[10px] text-slate-600 flex-1">{item.label}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          type="button"
                          key={score}
                          onClick={() => setEvaluations(prev => ({ ...prev, media: { ...prev.media, [item.id]: score } }))}
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                            evaluations.media[item.id] === score
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white border border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-500'
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

        {/* ข้อจำกัดในการจัดการเรียนการสอน */}"""
content = content.replace(ui_target, ui_repl)

content = content.replace("3. ข้อจำกัดและอุปสรรคที่พบ", "4. ข้อจำกัดและอุปสรรคที่พบ")
content = content.replace("4. ข้อเสนอแนะและแนวทางการพัฒนา", "5. ข้อเสนอแนะและแนวทางการพัฒนา")

with open('src/components/LessonLogForm.tsx', 'w') as f:
    f.write(content)
