import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

# Add GRADE_LEVELS to imports
content = content.replace("import { Teacher, Student, DisciplineIncident } from '../types';", "import { Teacher, Student, DisciplineIncident, GRADE_LEVELS } from '../types';")

# Add state
state_target = "  const [searchQuery, setSearchQuery] = useState('');"
state_replacement = "  const [searchQuery, setSearchQuery] = useState('');\n  const [selectedGrade, setSelectedGrade] = useState<string>('ภาพรวม');"
content = content.replace(state_target, state_replacement)

# Update filter
filter_target = """  const filteredIncidents = incidents.filter(i => 
    i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.studentNames.some(name => name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    i.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
  );"""
filter_replacement = """  const filteredIncidents = incidents.filter(i => {
    const matchesSearch = i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.studentNames.some(name => name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      i.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;
    
    if (selectedGrade === 'ภาพรวม') return true;
    
    // Check if any student in the incident belongs to the selected grade view
    const involvedStudents = i.studentIds.map(id => students.find(s => s.id === id)).filter(Boolean) as Student[];
    if (involvedStudents.length === 0) return true; // If no students found, show it anyway
    
    return involvedStudents.some(student => {
      if (selectedGrade === 'ระดับอนุบาล') {
        return student.gradeLevel.includes('อนุบาล');
      } else if (selectedGrade === 'ระดับประถมศึกษา') {
        return student.gradeLevel.includes('ประถม');
      } else {
        return student.gradeLevel === selectedGrade;
      }
    });
  });"""
content = content.replace(filter_target, filter_replacement)

# Add dropdown
dropdown_target = """        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            ประวัติการบริหารงานปกครอง
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>"""
dropdown_replacement = """        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            ประวัติการบริหารงานปกครอง
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 min-w-[150px] shadow-sm cursor-pointer"
            >
              <optgroup label="มุมมองพิเศษ">
                <option value="ภาพรวม">ภาพรวม (ทั้งหมด)</option>
                <option value="ระดับอนุบาล">ระดับอนุบาล (อนุบาล 1-3)</option>
                <option value="ระดับประถมศึกษา">ระดับประถมศึกษา (ป.1-ป.6)</option>
              </optgroup>
              <optgroup label="รายชั้นเรียน">
                {GRADE_LEVELS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </optgroup>
            </select>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหา..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>"""
content = content.replace(dropdown_target, dropdown_replacement)

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
