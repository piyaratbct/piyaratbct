import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# 1. Patch state definition
content = content.replace(
    'const [activeTab, setActiveTab] = useState<"students" | "attendance" | "assessments">',
    'const [activeTab, setActiveTab] = useState<"students" | "attendance" | "assessments" | "special-care">'
)

# 2. Patch tab buttons
target_buttons = """            <button
              onClick={() => setActiveTab("assessments")}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "assessments"
                  ? "bg-pink-100 text-pink-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <CheckCircle className="h-4 w-4 shrink-0" /> 
              <span className="whitespace-nowrap">ประเมินพัฒนาการ</span>
            </button>
          </div>"""

replacement_buttons = """            <button
              onClick={() => setActiveTab("assessments")}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "assessments"
                  ? "bg-pink-100 text-pink-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <CheckCircle className="h-4 w-4 shrink-0" /> 
              <span className="whitespace-nowrap">ประเมินพัฒนาการ</span>
            </button>
            <button
              onClick={() => setActiveTab("special-care")}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "special-care"
                  ? "bg-pink-100 text-pink-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <AlertTriangle className="h-4 w-4 shrink-0" /> 
              <span className="whitespace-nowrap">นักเรียนที่ต้องดูแลพิเศษ</span>
            </button>
          </div>"""

content = content.replace(target_buttons, replacement_buttons)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
