import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """          <div className={`flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 shrink-0 w-full xl:w-auto transition-opacity duration-200 ${activeTab === 'assessments' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <label className="text-sm font-bold text-slate-700 whitespace-nowrap">ประจำเดือน:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-sm outline-none bg-transparent font-bold text-pink-600 cursor-pointer w-full"
            />
          </div>"""

replacement = """          <div className={`flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 shrink-0 w-full xl:w-auto transition-opacity duration-200 ${(activeTab === 'assessments' || activeTab === 'special-care') ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <label className="text-sm font-bold text-slate-700 whitespace-nowrap">ประจำเดือน:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-sm outline-none bg-transparent font-bold text-pink-600 cursor-pointer w-full"
            />
          </div>"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
