with open('src/components/LessonPlanForm.tsx', 'r') as f:
    content = f.read()

if "formatThaiDate" not in content:
    content = content.replace(
        "import { AttachmentManager } from './AttachmentManager';",
        "import { AttachmentManager } from './AttachmentManager';\nimport { formatThaiDate } from '../lib/dateUtils';"
    )

target_date = """          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              สัปดาห์/วันที่สอน (Date)
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>"""

replacement_date = """          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              สัปดาห์/วันที่สอน (Date)
            </label>
            <div className="relative w-full">
              <input
                type="date"
                required
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

with open('src/components/LessonPlanForm.tsx', 'w') as f:
    f.write(content)
