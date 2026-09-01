import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # 1. Lesson Records
    code = code.replace(
        "insights.push({ type: 'positive', text: `ประเมินรายวิชา (${traitInfo.short}) ดีเยี่ยม: ${avg.toFixed(1)}` });",
        "insights.push({ source: 'lesson', type: 'positive', text: `บันทึกหลังสอน: ${traitInfo.short} (ดีเยี่ยม ${avg.toFixed(1)})` });"
    )
    code = code.replace(
        "insights.push({ type: 'warning', text: `ประเมินรายวิชา (${traitInfo.short}) ควรปรับปรุง: ${avg.toFixed(1)}` });",
        "insights.push({ source: 'lesson', type: 'warning', text: `บันทึกหลังสอน: ${traitInfo.short} (ควรปรับปรุง ${avg.toFixed(1)})` });"
    )
    code = code.replace(
        "insights.push({ type: 'neutral', text: `ประเมินรายวิชา (${traitInfo.short}): ${avg.toFixed(1)}` });",
        "insights.push({ source: 'lesson', type: 'neutral', text: `บันทึกหลังสอน: ${traitInfo.short} (ประเมินแล้ว ${avg.toFixed(1)})` });"
    )

    # 2. Events
    code = code.replace(
        "insights.push({ type: 'positive', text: `เข้าร่วม ${eventTraitMap[tId].join(', ')} -> โดดเด่น (${trait.short})` });",
        "insights.push({ source: 'event', type: 'positive', text: `กิจกรรม: ${eventTraitMap[tId].join(', ')} -> โดดเด่น ${trait.short}` });"
    )

    # 3. Attendance
    code = code.replace(
        "insights.push({ type: 'positive', text: `มาเรียนสม่ำเสมอ (${attendancePercent.toFixed(0)}%) -> เพิ่มวินัย` });",
        "insights.push({ source: 'attendance', type: 'positive', text: `เช็คชื่อ: มาเรียนสม่ำเสมอ ${attendancePercent.toFixed(0)}% (เพิ่มวินัย)` });"
    )
    code = code.replace(
        "insights.push({ type: 'warning', text: `มาสายบ่อย (${lateCount} ครั้ง) -> หักวินัย` });",
        "insights.push({ source: 'attendance', type: 'warning', text: `เช็คชื่อ: มาสายบ่อย ${lateCount} ครั้ง (หักวินัย)` });"
    )

    # 4. Discipline
    code = code.replace(
        "insights.push({ type: 'danger', text: `คดีฝ่ายปกครอง (${studentIncidents.length} คดี) -> หักวินัย` });",
        "insights.push({ source: 'discipline', type: 'danger', text: `งานปกครอง: คดีพฤติกรรม ${studentIncidents.length} รายการ (หักวินัย)` });"
    )

    # 5. Academic
    code = code.replace(
        "insights.push({ type: 'positive', text: `การเรียน (${avgScore.toFixed(0)}%) -> เพิ่มใฝ่เรียน/มุ่งมั่น` });",
        "insights.push({ source: 'academic', type: 'positive', text: `ผลการเรียน: เฉลี่ย ${avgScore.toFixed(0)}% (เพิ่มใฝ่เรียน/มุ่งมั่น)` });"
    )
    code = code.replace(
        "insights.push({ type: 'warning', text: `การเรียน (${avgScore.toFixed(0)}%) -> หักใฝ่เรียน/มุ่งมั่น` });",
        "insights.push({ source: 'academic', type: 'warning', text: `ผลการเรียน: เฉลี่ย ${avgScore.toFixed(0)}% (หักใฝ่เรียน/มุ่งมั่น)` });"
    )

    # Rendering section
    render_old = """                            {insights.map((insight, idx) => (
                              <span key={`i-${idx}`} className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border ${
                                insight.type === 'positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                insight.type === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                insight.type === 'neutral' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                                'bg-rose-50 text-rose-700 border-rose-100'
                              }`}>
                                {insight.type === 'positive' && <Sparkles className="h-3 w-3" />}
                                {insight.type === 'warning' && <AlertCircle className="h-3 w-3" />}
                                {insight.type === 'danger' && <AlertCircle className="h-3 w-3" />}
                                {insight.text}
                              </span>
                            ))}"""

    render_new = """                            {insights.map((insight, idx) => (
                              <span key={`i-${idx}`} className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border ${
                                insight.type === 'positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                insight.type === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                insight.type === 'neutral' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                                'bg-rose-50 text-rose-700 border-rose-100'
                              }`}>
                                {insight.source === 'lesson' && <BookOpen className="h-3 w-3" />}
                                {insight.source === 'event' && <Flag className="h-3 w-3" />}
                                {insight.source === 'attendance' && <Clock className="h-3 w-3" />}
                                {insight.source === 'discipline' && <ShieldAlert className="h-3 w-3" />}
                                {insight.source === 'academic' && <GraduationCap className="h-3 w-3" />}
                                {(!insight.source && insight.type === 'positive') && <Sparkles className="h-3 w-3" />}
                                {(!insight.source && insight.type === 'warning') && <AlertCircle className="h-3 w-3" />}
                                {(!insight.source && insight.type === 'danger') && <AlertCircle className="h-3 w-3" />}
                                {insight.text}
                              </span>
                            ))}"""

    code = code.replace(render_old, render_new)

    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/CharacterAssessmentView.tsx')
