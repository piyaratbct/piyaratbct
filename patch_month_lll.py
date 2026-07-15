with open('src/components/LessonLogList.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "import { formatThaiDateTime } from '../lib/dateUtils';",
    "import { formatThaiDateTime, formatThaiMonthYear } from '../lib/dateUtils';"
)

target = """          {/* Month Filter */}
          <div className="flex items-center gap-1.5 min-w-[180px]">
            <input
              type="month"
              value={selectedMonth !== "ทั้งหมด" ? selectedMonth : ""}
              onChange={(e) => setSelectedMonth(e.target.value || "ทั้งหมด")}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
              title="เดือนที่สอน"
            />
            {selectedMonth !== "ทั้งหมด" && (
              <button 
                onClick={() => setSelectedMonth("ทั้งหมด")}
                className="text-slate-400 hover:text-slate-600 text-xs"
                title="ล้างตัวกรองเดือน"
              >
                ✕
              </button>
            )}
          </div>"""

replacement = """          {/* Month Filter */}
          <div className="flex items-center gap-1.5 min-w-[180px]">
            <div className="relative w-full">
              <input
                type="month"
                value={selectedMonth !== "ทั้งหมด" ? selectedMonth : ""}
                onChange={(e) => setSelectedMonth(e.target.value || "ทั้งหมด")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="เดือนที่สอน"
              />
              <div className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white pointer-events-none">
                {selectedMonth !== "ทั้งหมด" && selectedMonth ? formatThaiMonthYear(selectedMonth) : "เดือน: ทั้งหมด"}
              </div>
            </div>
            {selectedMonth !== "ทั้งหมด" && (
              <button 
                onClick={() => setSelectedMonth("ทั้งหมด")}
                className="text-slate-400 hover:text-slate-600 text-xs relative z-10 shrink-0"
                title="ล้างตัวกรองเดือน"
              >
                ✕
              </button>
            )}
          </div>"""

if target in content:
    content = content.replace(target, replacement)
    print("FIXED")
else:
    print("NOT FOUND")

with open('src/components/LessonLogList.tsx', 'w') as f:
    f.write(content)
