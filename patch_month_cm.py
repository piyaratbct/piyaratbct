with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """          <div className={`flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 shrink-0 w-full xl:w-auto transition-opacity duration-200 ${(activeTab === 'assessments' || activeTab === 'health-report') ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <label className="text-sm font-bold text-slate-700 whitespace-nowrap">ประจำเดือน:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-sm outline-none bg-transparent font-bold text-pink-600 cursor-pointer w-full"
            />
            {selectedMonth && activeTab === 'health-report' && (
              <button 
                onClick={() => setSelectedMonth('')}
                className="text-slate-400 hover:text-slate-600 flex-shrink-0 ml-1"
                title="ล้างการเลือกเดือน (ดูข้อมูลล่าสุด)"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>"""

replacement = """          <div className={`flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 shrink-0 w-full xl:w-auto transition-opacity duration-200 ${(activeTab === 'assessments' || activeTab === 'health-report') ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <label className="text-sm font-bold text-slate-700 whitespace-nowrap">ประจำเดือน:</label>
            <div className="relative flex items-center min-w-[120px]">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-sm outline-none bg-transparent font-bold text-pink-600 pointer-events-none">
                {selectedMonth ? formatThaiMonthYear(selectedMonth) : 'เลือกเดือน'}
              </div>
            </div>
            {selectedMonth && activeTab === 'health-report' && (
              <button 
                onClick={() => setSelectedMonth('')}
                className="text-slate-400 hover:text-slate-600 flex-shrink-0 ml-1 relative z-10"
                title="ล้างการเลือกเดือน (ดูข้อมูลล่าสุด)"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>"""

if target in content:
    content = content.replace(target, replacement)
    print("FIXED")
else:
    print("NOT FOUND")

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
