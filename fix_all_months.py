with open('src/components/LessonLogList.tsx', 'r') as f:
    content = f.read()

target1 = """          {/* Month Filter */}
          <div className="flex items-center gap-1.5 min-w-[180px]">
            <div className="relative w-full">
              <input
                type="month"
                value={selectedMonth !== "ทั้งหมด" ? selectedMonth : ""}
                onChange={(e) => setSelectedMonth(e.target.value || "ทั้งหมด")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onClick={(e) => { try { (e.target as any).showPicker(); } catch(err) {} }}
                title="เดือนที่สอน"
              />
              <div className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white pointer-events-none">
                {selectedMonth !== "ทั้งหมด" && selectedMonth ? formatThaiMonthYear(selectedMonth) : "เดือน: ทั้งหมด"}
              </div>
            </div>"""

replacement1 = """          {/* Month Filter */}
          <div className="flex items-center gap-1.5 min-w-[180px]">
            <input
              type="month"
              value={selectedMonth !== "ทั้งหมด" ? selectedMonth : ""}
              onChange={(e) => setSelectedMonth(e.target.value || "ทั้งหมด")}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
              title="เดือนที่สอน"
            />"""

if target1 in content:
    content = content.replace(target1, replacement1)
    with open('src/components/LessonLogList.tsx', 'w') as f:
        f.write(content)
    print("Patched LessonLogList.tsx")
else:
    print("Target 1 not found")

with open('src/components/AssessmentModal.tsx', 'r') as f:
    content = f.read()

target2 = """                <div className="relative w-full max-w-xs">
                  <input
                    type="month"
                    value={formData.month || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, month: e.target.value }))
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onClick={(e) => { try { (e.target as any).showPicker(); } catch(err) {} }}
                  />
                  <div className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-pink-500 bg-white pointer-events-none">
                    {formData.month ? formatThaiMonthYear(formData.month) : "เลือกเดือน"}
                  </div>
                </div>"""

replacement2 = """                <div className="w-full max-w-xs">
                  <input
                    type="month"
                    value={formData.month || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, month: e.target.value }))
                    }
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-pink-500 bg-white"
                  />
                </div>"""

if target2 in content:
    content = content.replace(target2, replacement2)
    with open('src/components/AssessmentModal.tsx', 'w') as f:
        f.write(content)
    print("Patched AssessmentModal.tsx")
else:
    print("Target 2 not found")


with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target3 = """          <div className={`flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 shrink-0 w-full xl:w-auto transition-opacity duration-200 ${(activeTab === 'assessments' || activeTab === 'health-report') ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <label className="text-sm font-bold text-slate-700 whitespace-nowrap">ประจำเดือน:</label>
            <div className="relative flex items-center min-w-[120px]">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onClick={(e) => { try { (e.target as any).showPicker(); } catch(err) {} }}
              />
              <div className="text-sm outline-none bg-transparent font-bold text-pink-600 pointer-events-none">
                {selectedMonth ? formatThaiMonthYear(selectedMonth) : 'เลือกเดือน'}
              </div>
            </div>"""

replacement3 = """          <div className={`flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 shrink-0 w-full xl:w-auto transition-opacity duration-200 ${(activeTab === 'assessments' || activeTab === 'health-report') ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <label className="text-sm font-bold text-slate-700 whitespace-nowrap">ประจำเดือน:</label>
            <div className="flex items-center min-w-[120px]">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-sm outline-none bg-white font-bold text-pink-600 border border-slate-200 rounded px-2 py-1 focus:ring-2 focus:ring-pink-500"
              />
            </div>"""

if target3 in content:
    content = content.replace(target3, replacement3)
    with open('src/components/ClassroomModule.tsx', 'w') as f:
        f.write(content)
    print("Patched ClassroomModule.tsx")
else:
    print("Target 3 not found")


with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

target4 = """          <div className="flex items-center gap-2">
            <div className="relative w-full min-w-[150px]">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onClick={(e) => { try { (e.target as any).showPicker(); } catch(err) {} }}
                title="เดือน"
              />
              <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white pointer-events-none whitespace-nowrap">
                {selectedMonth ? formatThaiMonthYear(selectedMonth) : "เดือน: ทั้งหมด"}
              </div>
            </div>"""

replacement4 = """          <div className="flex items-center gap-2">
            <div className="w-full min-w-[150px]">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                title="เดือน"
              />
            </div>"""

if target4 in content:
    content = content.replace(target4, replacement4)
    with open('src/components/DisciplineModule.tsx', 'w') as f:
        f.write(content)
    print("Patched DisciplineModule.tsx")
else:
    print("Target 4 not found")

