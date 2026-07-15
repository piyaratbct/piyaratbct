with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

if "import { formatThaiDate" not in content:
    content = content.replace(
        "import { formatThaiMonthYear } from '../lib/dateUtils';",
        "import { formatThaiMonthYear, formatThaiDate } from '../lib/dateUtils';"
    )

target = """                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>"""

replacement = """                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                      <div className="relative w-full">
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 pointer-events-none">
                          {date ? formatThaiDate(date, 'full') : "เลือกวันที่"}
                        </div>
                      </div>
                    </div>"""

if target in content:
    content = content.replace(target, replacement)
    print("FIXED")
else:
    print("NOT FOUND")

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
