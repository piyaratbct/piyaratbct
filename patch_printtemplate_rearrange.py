import re

with open('src/components/PrintTemplate.tsx', 'r') as f:
    content = f.read()

# Let's extract the components and put them in order.

part_3_eval = """          {/* Paragraph 3: แบบประเมิน */}
          {record.evaluations && (
            <div className={`break-inside-avoid ${isCompact ? 'space-y-0.5' : 'space-y-1.5'}`}>
              <h4 className={`font-bold text-indigo-700 flex items-center gap-1.5 font-sans ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
                3. แบบประเมินการจัดการเรียนรู้ :
              </h4>
              <div className={`bg-slate-50/50 print:bg-transparent rounded-lg border border-slate-200 print:border p-3 flex flex-wrap gap-x-6 gap-y-3`}>
                <div className="flex-1 min-w-[150px]">
                  <h5 className="text-[10px] font-bold text-slate-700 border-b border-slate-200 pb-1 mb-1">ด้านผู้สอน</h5>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-slate-600"><span>1. เตรียมการจัดทำแผนฯ</span><span className="font-bold">{record.evaluations.teacher.t1}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>2. นำเข้าสู่บทเรียนฯ</span><span className="font-bold">{record.evaluations.teacher.t2}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>3. จัดกิจกรรมโดยใช้เทคนิคฯ</span><span className="font-bold">{record.evaluations.teacher.t3}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>4. ประเมินผลผู้เรียนฯ</span><span className="font-bold">{record.evaluations.teacher.t4}/5</span></div>
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

part_4_lim = """          {/* Paragraph 5 */}
          <div className={`break-inside-avoid ${isCompact ? 'space-y-0.5' : 'space-y-1.5'}`}>
            <h4 className={`font-bold text-amber-700 flex items-center gap-1.5 font-sans ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
              4. ข้อจำกัดและอุปสรรคที่พบ :
            </h4>
            <div className={`bg-amber-50/20 print-bg-gray rounded-r-xl rounded-l-md text-slate-800 leading-relaxed border-y border-r border-amber-100/80 border-l-4 border-l-amber-500 print:border print:bg-none whitespace-pre-line ${
              isCompact ? 'p-2 text-[11px]' : 'p-4 text-xs'
            }`}>
              {record.limitations}
            </div>
          </div>"""

part_5_sug = """          {/* Paragraph 5 */}
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

target_all = part_3_eval + "\n\n" + part_4_lim + "\n\n" + part_5_sug

new_part_3 = """          {/* Paragraph 3 */}
          <div className={`break-inside-avoid ${isCompact ? 'space-y-0.5' : 'space-y-1.5'}`}>
            <h4 className={`font-bold text-rose-700 flex items-center gap-1.5 font-sans ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
              3. ข้อจำกัดและอุปสรรคที่พบ :
            </h4>
            <div className={`bg-rose-50/20 print-bg-gray rounded-r-xl rounded-l-md text-slate-800 leading-relaxed border-y border-r border-rose-100/80 border-l-4 border-l-rose-500 print:border print:bg-none whitespace-pre-line ${
              isCompact ? 'p-2 text-[11px]' : 'p-4 text-xs'
            }`}>
              {record.limitations}
            </div>
          </div>"""

new_part_4 = """          {/* Paragraph 4 */}
          <div className={`break-inside-avoid ${isCompact ? 'space-y-0.5' : 'space-y-1.5'}`}>
            <h4 className={`font-bold text-emerald-700 flex items-center gap-1.5 font-sans ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
              4. ข้อเสนอแนะและแนวทางการพัฒนา :
            </h4>
            <div className={`bg-emerald-50/20 print-bg-gray rounded-r-xl rounded-l-md text-slate-800 leading-relaxed border-y border-r border-emerald-100/80 border-l-4 border-l-emerald-500 print:border print:bg-none whitespace-pre-line ${
              isCompact ? 'p-2 text-[11px]' : 'p-4 text-xs'
            }`}>
              {record.suggestions}
            </div>
          </div>"""

new_part_5 = """          {/* Paragraph 5 */}
          {record.strengths && (
            <div className={`break-inside-avoid ${isCompact ? 'space-y-0.5' : 'space-y-1.5'}`}>
              <h4 className={`font-bold text-amber-700 flex items-center gap-1.5 font-sans ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
                5. จุดเด่นในการสอนครั้งนี้ :
              </h4>
              <div className={`bg-amber-50/20 print-bg-gray rounded-r-xl rounded-l-md text-slate-800 leading-relaxed border-y border-r border-amber-100/80 border-l-4 border-l-amber-500 print:border print:bg-none whitespace-pre-line ${
                isCompact ? 'p-2 text-[11px]' : 'p-4 text-xs'
              }`}>
                {record.strengths}
              </div>
            </div>
          )}"""

new_part_6 = """          {/* Paragraph 6: แบบประเมิน */}
          {record.evaluations && (
            <div className={`break-inside-avoid ${isCompact ? 'space-y-0.5' : 'space-y-1.5'}`}>
              <h4 className={`font-bold text-indigo-700 flex items-center gap-1.5 font-sans ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
                6. แบบประเมินการจัดการเรียนรู้ :
              </h4>
              <div className={`bg-slate-50/50 print:bg-transparent rounded-lg border border-slate-200 print:border p-3 flex flex-wrap gap-x-6 gap-y-3`}>
                <div className="flex-1 min-w-[150px]">
                  <h5 className="text-[10px] font-bold text-slate-700 border-b border-slate-200 pb-1 mb-1">ด้านผู้สอน</h5>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-slate-600"><span>1. เตรียมการจัดทำแผนฯ</span><span className="font-bold">{record.evaluations.teacher.t1}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>2. นำเข้าสู่บทเรียนฯ</span><span className="font-bold">{record.evaluations.teacher.t2}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>3. จัดกิจกรรมโดยใช้เทคนิคฯ</span><span className="font-bold">{record.evaluations.teacher.t3}/5</span></div>
                    <div className="flex justify-between text-[9px] text-slate-600"><span>4. ประเมินผลผู้เรียนฯ</span><span className="font-bold">{record.evaluations.teacher.t4}/5</span></div>
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

replacement_all = new_part_3 + "\n\n" + new_part_4 + "\n\n" + new_part_5 + "\n\n" + new_part_6

if target_all in content:
    content = content.replace(target_all, replacement_all)
    with open('src/components/PrintTemplate.tsx', 'w') as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Could not find target_all")

