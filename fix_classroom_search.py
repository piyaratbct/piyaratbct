import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

old_layout = """        {/* Tabs and Filters */}
        <div className="flex flex-col xl:flex-row gap-4 w-full xl:items-center xl:justify-between">
          <div className="grid grid-cols-2 md:flex md:flex-wrap bg-white rounded-xl p-1 shadow-sm border border-slate-100 w-full xl:w-auto xl:shrink-0 custom-scrollbar gap-1">"""

new_layout = """        {/* Tabs and Filters */}
        <div className="flex flex-col gap-4 w-full">
          <div className="grid grid-cols-2 md:flex md:flex-wrap bg-white rounded-xl p-1 shadow-sm border border-slate-100 w-full custom-scrollbar gap-1">"""

content = content.replace(old_layout, new_layout)

old_controls = """          </div>
          
          <div className={`flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 shrink-0 w-full xl:w-auto transition-opacity duration-200 ${(activeTab === 'assessments' || activeTab === 'health-report') ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <label className="text-sm font-bold text-slate-700 whitespace-nowrap">ประจำเดือน:</label>
            <div className="flex items-center min-w-[120px]">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-sm outline-none bg-white font-bold text-pink-600 border border-slate-200 rounded px-2 py-1 focus:ring-2 focus:ring-pink-500"
              />
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
          </div>
          
          <div className="relative w-full xl:w-64 flex-1 xl:flex-none shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="ค้นหานักเรียน (ทั้งหมด)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl shadow-sm text-sm font-medium text-slate-700 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white w-full transition-all"
            />
          </div>
        </div>"""

new_controls = """          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-between items-start sm:items-center">
            <div className={`flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 shrink-0 w-full sm:w-auto transition-opacity duration-200 ${(activeTab === 'assessments' || activeTab === 'health-report') ? 'opacity-100' : 'opacity-0 hidden sm:flex pointer-events-none'}`}>
              <label className="text-sm font-bold text-slate-700 whitespace-nowrap">ประจำเดือน:</label>
              <div className="flex items-center min-w-[120px]">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-sm outline-none bg-white font-bold text-pink-600 border border-slate-200 rounded px-2 py-1 focus:ring-2 focus:ring-pink-500"
                />
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
            </div>
            
            <div className="relative w-full sm:w-80 shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="ค้นหานักเรียน (ทั้งหมด)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl shadow-sm text-sm font-medium text-slate-700 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white w-full transition-all"
              />
            </div>
          </div>
        </div>"""

content = content.replace(old_controls, new_controls)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)

print("Replacement complete")
