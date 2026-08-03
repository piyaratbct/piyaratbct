import re

with open('src/components/AcademicModule.tsx', 'r') as f:
    content = f.read()

old_settings_btn = """        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all min-w-[150px] ${
            activeTab === "settings"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Settings className="h-4 w-4" /> ตั้งค่าปี/ภาคเรียน
        </button>"""

new_settings_btn = """        {['admin', 'academic', 'deputy'].includes(currentTeacher.role || 'teacher') && (
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all min-w-[150px] ${
              activeTab === "settings"
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Settings className="h-4 w-4" /> ตั้งค่าปี/ภาคเรียน
          </button>
        )}"""

content = content.replace(old_settings_btn, new_settings_btn)


old_promotion_btn = """        <button
          onClick={() => setActiveTab("promotion")}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all min-w-[150px] ${
            activeTab === "promotion"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <ArrowRight className="h-4 w-4" /> เลื่อนชั้น/จบการศึกษา
        </button>"""

new_promotion_btn = """        {['admin', 'academic', 'deputy'].includes(currentTeacher.role || 'teacher') && (
          <button
            onClick={() => setActiveTab("promotion")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all min-w-[150px] ${
              activeTab === "promotion"
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <ArrowRight className="h-4 w-4" /> เลื่อนชั้น/จบการศึกษา
          </button>
        )}"""

content = content.replace(old_promotion_btn, new_promotion_btn)

with open('src/components/AcademicModule.tsx', 'w') as f:
    f.write(content)
