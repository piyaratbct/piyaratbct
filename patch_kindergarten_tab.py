import re

with open('src/components/EvaluationModule.tsx', 'r') as f:
    content = f.read()

# 1. Update activeTab state
old_state = "const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'attendance'>('overview');"
new_state = "const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'kindergarten' | 'attendance'>('overview');"
content = content.replace(old_state, new_state)

# 2. Add the tab button
old_tabs = """            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'attendance' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <CalendarDays className="h-4 w-4" /> สรุปการเช็กชื่อ
            </button>"""

new_tabs = """            <button
              onClick={() => setActiveTab('kindergarten')}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'kindergarten' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Award className="h-4 w-4" /> ประเมินอนุบาล
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'attendance' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <CalendarDays className="h-4 w-4" /> สรุปการเช็กชื่อ
            </button>"""
content = content.replace(old_tabs, new_tabs)

# 3. Add the tab content
old_attendance_content = """          {activeTab === 'attendance' && (
            <AttendanceSummary 
              systemAcademicYear={systemAcademicYear}
              systemSemester={systemSemester}
            />
          )}"""

new_kindergarten_content = """          {activeTab === 'kindergarten' && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">การวัดและประเมินผลระดับอนุบาล</h3>
              <p className="text-slate-500">
                ฟังก์ชันสำหรับประเมินพัฒนาการนักเรียนระดับปฐมวัย<br/>
                (รอการกำหนดรูปแบบและวิธีการประเมิน)
              </p>
            </div>
          )}
          {activeTab === 'attendance' && (
            <AttendanceSummary 
              systemAcademicYear={systemAcademicYear}
              systemSemester={systemSemester}
            />
          )}"""
content = content.replace(old_attendance_content, new_kindergarten_content)

# Update the "grades" button label to be specific to Primary/ประถม
old_grades_btn = """            <button
              onClick={() => setActiveTab('grades')}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'grades' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Award className="h-4 w-4" /> บันทึกคะแนน
            </button>"""
new_grades_btn = """            <button
              onClick={() => setActiveTab('grades')}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'grades' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <FileText className="h-4 w-4" /> บันทึกคะแนน (ประถม)
            </button>"""
content = content.replace(old_grades_btn, new_grades_btn)


with open('src/components/EvaluationModule.tsx', 'w') as f:
    f.write(content)
