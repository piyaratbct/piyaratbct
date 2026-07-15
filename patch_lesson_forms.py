with open('src/components/LessonLogForm.tsx', 'r') as f:
    content = f.read()

target1 = """          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
              วันที่สอน
            </label>
            <div className="relative w-full">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onClick={(e) => { try { (e.target as any).showPicker(); } catch(err) {} }}
                title="วันที่สอน"
              />
              <div className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white pointer-events-none">
                {date ? formatThaiDate(date, 'full') : "เลือกวันที่"}
              </div>
            </div>
          </div>"""

replacement1 = """          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              วันที่สอน
            </label>
            <div className="relative w-full">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 z-10" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onClick={(e) => { try { (e.target as any).showPicker(); } catch(err) {} }}
                title="วันที่สอน"
              />
              <div className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 pointer-events-none">
                {date ? formatThaiDate(date, 'full') : "เลือกวันที่"}
              </div>
            </div>
          </div>"""

if target1 in content:
    content = content.replace(target1, replacement1)
    with open('src/components/LessonLogForm.tsx', 'w') as f:
        f.write(content)
    print("Patched LessonLogForm.tsx")
else:
    print("Target 1 not found")

with open('src/components/LessonPlanForm.tsx', 'r') as f:
    content = f.read()

target2 = """          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              สัปดาห์/วันที่สอน (Date)
            </label>
            <div className="relative w-full">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onClick={(e) => { try { (e.target as any).showPicker(); } catch(err) {} }}
                title="วันที่สอน"
              />
              <div className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white pointer-events-none">
                {date ? formatThaiDate(date, 'full') : "เลือกวันที่"}
              </div>
            </div>
          </div>"""

# add CalendarDays import if missing
if "CalendarDays" not in content:
    content = content.replace("import { Save", "import { CalendarDays, Save")

replacement2 = """          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              สัปดาห์/วันที่สอน (Date)
            </label>
            <div className="relative w-full">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 z-10" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onClick={(e) => { try { (e.target as any).showPicker(); } catch(err) {} }}
                title="วันที่สอน"
              />
              <div className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 pointer-events-none">
                {date ? formatThaiDate(date, 'full') : "เลือกวันที่"}
              </div>
            </div>
          </div>"""

if target2 in content:
    content = content.replace(target2, replacement2)
    with open('src/components/LessonPlanForm.tsx', 'w') as f:
        f.write(content)
    print("Patched LessonPlanForm.tsx")
else:
    print("Target 2 not found")
