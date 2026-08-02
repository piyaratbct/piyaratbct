import re

with open('src/components/ScheduleManager.tsx', 'r') as f:
    content = f.read()

# 1. Update useState
content = content.replace(
    "const [viewMode, setViewMode] = useState<'manage' | 'overview'>('manage');",
    "const [viewMode, setViewMode] = useState<'manage' | 'overview' | 'summary'>('manage');"
)

# 2. Add the summary button
button_pattern = """            <button
              onClick={() => setViewMode('overview')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              ภาพรวมตารางสอน
            </button>
            <button
              onClick={() => setViewMode('summary')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'summary' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              สรุปจำนวนคาบสอน
            </button>"""

content = re.sub(
    r'<button\s*onClick=\{\(\) => setViewMode\(\'overview\'\)\}.*?ภาพรวมตารางสอน\s*</button>',
    button_pattern,
    content,
    flags=re.DOTALL
)

# 3. Add the viewMode === 'summary' UI
summary_ui = """
        {viewMode === 'summary' && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                สรุปจำนวนคาบสอนของครูแต่ละท่าน
              </h3>
              
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                      <th className="p-3 font-bold">ลำดับ</th>
                      <th className="p-3 font-bold">ชื่อ-นามสกุล</th>
                      <th className="p-3 font-bold text-center">จำนวนคาบสอน (ต่อสัปดาห์)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers
                      .map(t => ({
                        ...t,
                        totalPeriods: allSchedules.filter(s => s.teacherId === t.id).length
                      }))
                      .sort((a, b) => b.totalPeriods - a.totalPeriods)
                      .map((t, index) => (
                      <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 text-slate-500">{index + 1}</td>
                        <td className="p-3 font-medium text-slate-800">{t.thaiName || t.displayName}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-full text-xs font-bold ${
                            t.totalPeriods === 0 ? 'bg-slate-100 text-slate-500' : 
                            t.totalPeriods > 20 ? 'bg-rose-100 text-rose-700' : 
                            'bg-indigo-100 text-indigo-700'
                          }`}>
                            {t.totalPeriods}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {teachers.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-slate-500">ไม่มีข้อมูลครู</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
"""

content = content.replace('{viewMode === \'overview\' && (', summary_ui + '\n        {viewMode === \'overview\' && (')

with open('src/components/ScheduleManager.tsx', 'w') as f:
    f.write(content)

print("Added summary feature")
