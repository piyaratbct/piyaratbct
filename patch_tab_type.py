import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

content = content.replace('useState<"students" | "attendance" | "assessments" | "special-care">(', 'useState<"students" | "attendance" | "assessments" | "special-care" | "health-report">(')

target_btn = """            <button
              onClick={() => setActiveTab("special-care")}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "special-care"
                  ? "bg-pink-100 text-pink-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <HeartPulse className="h-4 w-4 shrink-0" /> 
              <span className="whitespace-nowrap">ข้อมูลสุขภาพ</span>
            </button>
          </div>"""

replacement_btn = """            <button
              onClick={() => setActiveTab("special-care")}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "special-care"
                  ? "bg-pink-100 text-pink-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <HeartPulse className="h-4 w-4 shrink-0" /> 
              <span className="whitespace-nowrap">ข้อมูลสุขภาพ</span>
            </button>
            <button
              onClick={() => setActiveTab("health-report")}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "health-report"
                  ? "bg-pink-100 text-pink-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <FileSpreadsheet className="h-4 w-4 shrink-0" /> 
              <span className="whitespace-nowrap">พัฒนาการทางร่างกาย</span>
            </button>
          </div>"""

content = content.replace(target_btn, replacement_btn)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
