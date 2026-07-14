import re

with open('src/components/PrintTemplate.tsx', 'r') as f:
    content = f.read()

target = """          {/* Paragraph 3: แบบประเมิน */}
          {record.evaluations && (
            <div className={`break-inside-avoid ${isCompact ? 'space-y-0.5' : 'space-y-1.5'}`}>
              <h4 className={`font-bold text-indigo-700 flex items-center gap-1.5 font-sans ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
                3. แบบประเมินการจัดการเรียนรู้ :
              </h4>
              <div className={`bg-slate-50/50 print:bg-transparent rounded-lg border border-slate-200 print:border p-3 flex flex-wrap gap-x-6 gap-y-3`}>
                <div className="flex-1 min-w-[150px]">
                  <h5 className="text-[10px] font-bold text-slate-700 border-b border-slate-200 pb-1 mb-1">ด้านผู้สอน</h5>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-slate-600"><span>1. การเตรียมความพร้อมฯ</span><span className="font-bold">{record.evaluations.teacher.t1}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>2. การจัดกิจกรรมฯ</span><span className="font-bold">{record.evaluations.teacher.t2}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>3. การใช้คำถามกระตุ้นฯ</span><span className="font-bold">{record.evaluations.teacher.t3}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>4. การวัดและประเมินผลฯ</span><span className="font-bold">{record.evaluations.teacher.t4}/5</span></div>
                  </div>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <h5 className="text-[10px] font-bold text-slate-700 border-b border-slate-200 pb-1 mb-1">ด้านผู้เรียน</h5>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-slate-600"><span>1. ความสนใจฯ</span><span className="font-bold">{record.evaluations.learner.l1}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>2. ความเข้าใจและบรรลุผลฯ</span><span className="font-bold">{record.evaluations.learner.l2}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>3. ความกระตือรือร้นฯ</span><span className="font-bold">{record.evaluations.learner.l3}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>4. การทำงานร่วมกับผู้อื่น</span><span className="font-bold">{record.evaluations.learner.l4}/5</span></div>
                  </div>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <h5 className="text-[10px] font-bold text-slate-700 border-b border-slate-200 pb-1 mb-1">ด้านสื่อ/แหล่งเรียนรู้</h5>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-slate-600"><span>1. ความสอดคล้องของสื่อฯ</span><span className="font-bold">{record.evaluations.media.m1}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>2. ความหลากหลายฯ</span><span className="font-bold">{record.evaluations.media.m2}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>3. ความพร้อมใช้งานฯ</span><span className="font-bold">{record.evaluations.media.m3}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>4. สภาพแวดล้อมฯ</span><span className="font-bold">{record.evaluations.media.m4}/5</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Paragraph 5 */}
          <div className={`break-inside-avoid ${isCompact ? 'space-y-0.5' : 'space-y-1.5'}`}>
            <h4 className={`font-bold text-amber-700 flex items-center gap-1.5 font-sans ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
              4. ข้อจำกัดและอุปสรรคที่พบ :
            </h4>
            <div className={`bg-amber-50/20 print-bg-gray rounded-r-xl rounded-l-md text-slate-800 leading-relaxed border-y border-r border-amber-100/80 border-l-4 border-l-amber-500 print:border print:bg-none whitespace-pre-line ${
              isCompact ? 'p-2 text-[11px]' : 'p-4 text-xs'
            }`}>
              {record.limitations}
            </div>
          </div>

          {/* Paragraph 6 */}
          <div className={`break-inside-avoid ${isCompact ? 'space-y-0.5' : 'space-y-1.5'}`}>
            <h4 className={`font-bold text-emerald-700 flex items-center gap-1.5 font-sans ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
              5. ข้อเสนอแนะและแนวทางการพัฒนา :
            </h4>
            <div className={`bg-emerald-50/20 print-bg-gray rounded-r-xl rounded-l-md text-slate-800 leading-relaxed border-y border-r border-emerald-100/80 border-l-4 border-l-emerald-500 print:border print:bg-none whitespace-pre-line ${
              isCompact ? 'p-2 text-[11px]' : 'p-4 text-xs'
            }`}>
              {record.suggestions}
            </div>
          </div>"""

replacement = """          {/* Paragraph 3 */}
          <div className={`break-inside-avoid ${isCompact ? 'space-y-0.5' : 'space-y-1.5'}`}>
            <h4 className={`font-bold text-amber-700 flex items-center gap-1.5 font-sans ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
              3. ข้อจำกัดและอุปสรรคที่พบ :
            </h4>
            <div className={`bg-amber-50/20 print-bg-gray rounded-r-xl rounded-l-md text-slate-800 leading-relaxed border-y border-r border-amber-100/80 border-l-4 border-l-amber-500 print:border print:bg-none whitespace-pre-line ${
              isCompact ? 'p-2 text-[11px]' : 'p-4 text-xs'
            }`}>
              {record.limitations}
            </div>
          </div>

          {/* Paragraph 4 */}
          <div className={`break-inside-avoid ${isCompact ? 'space-y-0.5' : 'space-y-1.5'}`}>
            <h4 className={`font-bold text-emerald-700 flex items-center gap-1.5 font-sans ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
              4. ข้อเสนอแนะและแนวทางการพัฒนา :
            </h4>
            <div className={`bg-emerald-50/20 print-bg-gray rounded-r-xl rounded-l-md text-slate-800 leading-relaxed border-y border-r border-emerald-100/80 border-l-4 border-l-emerald-500 print:border print:bg-none whitespace-pre-line ${
              isCompact ? 'p-2 text-[11px]' : 'p-4 text-xs'
            }`}>
              {record.suggestions}
            </div>
          </div>

          {/* Paragraph 5: แบบประเมิน */}
          {record.evaluations && (
            <div className={`break-inside-avoid ${isCompact ? 'space-y-0.5' : 'space-y-1.5'}`}>
              <h4 className={`font-bold text-indigo-700 flex items-center gap-1.5 font-sans ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
                5. แบบประเมินการจัดการเรียนรู้ :
              </h4>
              <div className={`bg-slate-50/50 print:bg-transparent rounded-lg border border-slate-200 print:border p-3 flex flex-wrap gap-x-6 gap-y-3`}>
                <div className="flex-1 min-w-[150px]">
                  <h5 className="text-[10px] font-bold text-slate-700 border-b border-slate-200 pb-1 mb-1">ด้านผู้สอน</h5>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-slate-600"><span>1. การเตรียมความพร้อมฯ</span><span className="font-bold">{record.evaluations.teacher.t1}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>2. การจัดกิจกรรมฯ</span><span className="font-bold">{record.evaluations.teacher.t2}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>3. การใช้คำถามกระตุ้นฯ</span><span className="font-bold">{record.evaluations.teacher.t3}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>4. การวัดและประเมินผลฯ</span><span className="font-bold">{record.evaluations.teacher.t4}/5</span></div>
                  </div>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <h5 className="text-[10px] font-bold text-slate-700 border-b border-slate-200 pb-1 mb-1">ด้านผู้เรียน</h5>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-slate-600"><span>1. ความสนใจฯ</span><span className="font-bold">{record.evaluations.learner.l1}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>2. ความเข้าใจและบรรลุผลฯ</span><span className="font-bold">{record.evaluations.learner.l2}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>3. ความกระตือรือร้นฯ</span><span className="font-bold">{record.evaluations.learner.l3}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>4. การทำงานร่วมกับผู้อื่น</span><span className="font-bold">{record.evaluations.learner.l4}/5</span></div>
                  </div>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <h5 className="text-[10px] font-bold text-slate-700 border-b border-slate-200 pb-1 mb-1">ด้านสื่อ/แหล่งเรียนรู้</h5>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-slate-600"><span>1. ความสอดคล้องของสื่อฯ</span><span className="font-bold">{record.evaluations.media.m1}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>2. ความหลากหลายฯ</span><span className="font-bold">{record.evaluations.media.m2}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>3. ความพร้อมใช้งานฯ</span><span className="font-bold">{record.evaluations.media.m3}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>4. สภาพแวดล้อมฯ</span><span className="font-bold">{record.evaluations.media.m4}/5</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}"""

content = content.replace(target, replacement)

with open('src/components/PrintTemplate.tsx', 'w') as f:
    f.write(content)
