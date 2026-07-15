with open('src/components/LessonLogForm.tsx', 'r') as f:
    content = f.read()

# Add formatThaiDate import
if "formatThaiDate" not in content:
    content = content.replace(
        "import { Star } from 'lucide-react';",
        "import { Star } from 'lucide-react';\nimport { formatThaiDate } from '../lib/dateUtils';"
    )

target_date = """          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
              วันที่สอน
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>"""

replacement_date = """          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
              วันที่สอน
            </label>
            <div className="relative w-full">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="วันที่สอน"
              />
              <div className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white pointer-events-none">
                {date ? formatThaiDate(date, 'full') : "เลือกวันที่"}
              </div>
            </div>
          </div>"""

if target_date in content:
    content = content.replace(target_date, replacement_date)
    print("FIXED")
else:
    print("NOT FOUND")

with open('src/components/LessonLogForm.tsx', 'w') as f:
    f.write(content)
