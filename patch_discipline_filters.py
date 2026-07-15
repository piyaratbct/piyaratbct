import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

# Add formatThaiMonthYear import
if "formatThaiMonthYear" not in content:
    content = content.replace(
        "import { db } from '../lib/firebase';",
        "import { db } from '../lib/firebase';\nimport { formatThaiMonthYear } from '../lib/dateUtils';"
    )

# Add selectedMonth state
if "const [selectedMonth, setSelectedMonth] = useState<string>('');" not in content:
    content = content.replace(
        "const [selectedGrade, setSelectedGrade] = useState<string>('ภาพรวม');",
        "const [selectedGrade, setSelectedGrade] = useState<string>('ภาพรวม');\n  const [selectedMonth, setSelectedMonth] = useState<string>('');"
    )

# Update filtering logic
target_filter = """  const filteredIncidents = incidents.filter(i => {
    const matchesSearch = i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.studentNames.some(name => name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      i.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;"""

replacement_filter = """  const filteredIncidents = incidents.filter(i => {
    const matchesSearch = i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.studentNames.some(name => name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      i.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;
    
    if (selectedMonth && !i.date.startsWith(selectedMonth)) return false;"""

if target_filter in content:
    content = content.replace(target_filter, replacement_filter)

# Add UI filters
target_ui = """      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อนักเรียน, ครู หรือรายละเอียด..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
          />
        </div>"""

replacement_ui = """      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อนักเรียน, ครู หรือรายละเอียด..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
          </div>
          
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white min-w-[150px]"
          >
            <option value="ภาพรวม">ชั้นเรียน: ทั้งหมด</option>
            <option value="ระดับอนุบาล">ระดับอนุบาล</option>
            <option value="ระดับประถมศึกษา">ระดับประถมศึกษา</option>
            {GRADE_LEVELS.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <div className="relative w-full min-w-[150px]">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="เดือน"
              />
              <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white pointer-events-none whitespace-nowrap">
                {selectedMonth ? formatThaiMonthYear(selectedMonth) : "เดือน: ทั้งหมด"}
              </div>
            </div>
            {selectedMonth && (
              <button 
                onClick={() => setSelectedMonth("")}
                className="text-slate-400 hover:text-slate-600 shrink-0"
                title="ล้างตัวกรองเดือน"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>"""

if target_ui in content:
    content = content.replace(target_ui, replacement_ui)

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
print("FIXED")
