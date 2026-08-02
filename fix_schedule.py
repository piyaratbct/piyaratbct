import re

with open('src/components/ScheduleManager.tsx', 'r') as f:
    content = f.read()

# Add allSchedules state
state_match = re.search(r'const \[schedules, setSchedules\] = useState<TeacherSchedule\[\]>\(\[\]\);', content)
if state_match:
    content = content[:state_match.end()] + '\n  const [allSchedules, setAllSchedules] = useState<TeacherSchedule[]>([]);' + content[state_match.end():]

# Add free-periods state/vars
state_match2 = re.search(r"const \[viewMode, setViewMode\] = useState<'manage' \| 'overview'>(.*?\n)", content)
if state_match2:
    content = content.replace(state_match2.group(0), "  const [viewMode, setViewMode] = useState<'manage' | 'overview' | 'free-periods'>('manage');\n  const [searchDay, setSearchDay] = useState<number>(1);\n  const [searchPeriod, setSearchPeriod] = useState<string>(PERIODS[0]);\n")

# Update fetch functions
fetch_funcs = """  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'schedules'),
        where('semester', '==', systemSemester),
        where('academicYear', '==', systemAcademicYear)
      );
      const snapshot = await getDocs(q);
      const scheduleList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherSchedule));
      setAllSchedules(scheduleList);
      if (selectedTeacherId) {
        setSchedules(scheduleList.filter(s => s.teacherId === selectedTeacherId));
      }
    } catch (error) {
      console.error("Error fetching all schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };"""

content = re.sub(r'const fetchAllSchedules = async \(\) => \{.*?\n  \};\n\n  const fetchSchedules = async \(teacherId: string\) => \{.*?\n  \};', fetch_funcs, content, flags=re.DOTALL)

# Update useEffects
use_effect1 = """  useEffect(() => {
    fetchTeachers();
    fetchAllData();
  }, [systemSemester, systemAcademicYear]);

  useEffect(() => {
    if (selectedTeacherId) {
      setSchedules(allSchedules.filter(s => s.teacherId === selectedTeacherId));
    } else {
      setSchedules([]);
    }
  }, [selectedTeacherId, allSchedules]);"""

content = re.sub(r'useEffect\(\(\) => \{\n    fetchTeachers\(\);\n  \}, \[\]\);\n\n  useEffect\(\(\) => \{\n    if \(viewMode === \'manage\'\) \{.*?\n  \}, \[selectedTeacherId, systemSemester, systemAcademicYear, viewMode\]\);', use_effect1, content, flags=re.DOTALL)

# Add collision check in handleAddSchedule
add_check = """    if (schedules.some(s => s.dayOfWeek === dayOfWeek && s.period === period)) {
      alert('ครูท่านนี้มีสอนในคาบนี้แล้ว');
      return;
    }

    // Check class collision
    if (allSchedules.some(s => s.dayOfWeek === dayOfWeek && s.period === period && s.gradeLevel === GRADE_LEVELS[0])) {
      if (!confirm(`ห้อง ${GRADE_LEVELS[0]} มีครูท่านอื่นสอนในคาบนี้แล้ว ต้องการจัดซ้อนกันหรือไม่?`)) {
        return;
      }
    }"""

content = re.sub(r'    if \(schedules\.some\(s => s\.dayOfWeek === dayOfWeek && s\.period === period\)\) \{\n      console\.warn\(\'มีวิชาในคาบนี้แล้ว\'\);\n      return;\n    \}', add_check, content)

# Update state in handleAddSchedule
content = content.replace(
    'setSchedules([...schedules, { id: docRef.id, ...newSchedule }]);',
    'setAllSchedules([...allSchedules, { id: docRef.id, ...newSchedule }]);'
)

# Update state in handleUpdateSchedule
content = content.replace(
    'setSchedules(schedules.map(s => s.id === id ? { ...s, [field]: value } : s));',
    """setAllSchedules(allSchedules.map(s => {
        if (s.id === id) {
          const updated = { ...s, [field]: value };
          // If changing grade level or period, we should probably warn, but for now just update
          return updated;
        }
        return s;
      }));"""
)

# Update handleUpdateSchedule to check collision
update_check = """  const handleUpdateSchedule = async (id: string, field: keyof TeacherSchedule, value: string | number) => {
    const currentSchedule = allSchedules.find(s => s.id === id);
    if (!currentSchedule) return;

    // If changing grade level, check for collision
    if (field === 'gradeLevel') {
      const colliding = allSchedules.find(s => 
        s.id !== id && 
        s.dayOfWeek === currentSchedule.dayOfWeek && 
        s.period === currentSchedule.period && 
        s.gradeLevel === value
      );
      if (colliding) {
        if (!confirm(`ห้อง ${value} มีครูท่านอื่นสอนในคาบนี้แล้ว ต้องการจัดซ้อนกันหรือไม่?`)) {
          return; // Cancel update
        }
      }
    }"""

content = content.replace(
    'const handleUpdateSchedule = async (id: string, field: keyof TeacherSchedule, value: string | number) => {\n    try {',
    update_check + '\n    try {'
)


# Update state in handleDeleteSchedule
content = content.replace(
    'setSchedules(schedules.filter(s => s.id !== id));',
    'setAllSchedules(allSchedules.filter(s => s.id !== id));'
)


# Add button for viewMode 'free-periods'
nav_buttons = """          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('manage')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'manage' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              จัดตารางสอนรายบุคคล
            </button>
            <button
              onClick={() => setViewMode('overview')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              ภาพรวมตารางสอน
            </button>
            <button
              onClick={() => setViewMode('free-periods')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'free-periods' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              ตรวจสอบคาบว่าง/ชน
            </button>
          </div>"""

content = re.sub(r'<div className="flex bg-slate-100 p-1 rounded-lg">.*?</div>', nav_buttons, content, flags=re.DOTALL, count=1)


# Add viewMode 'free-periods' UI
free_periods_ui = """        {viewMode === 'free-periods' && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-500" />
                ตรวจสอบคาบว่างและตารางชน
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">เลือกวัน</label>
                  <select 
                    value={searchDay}
                    onChange={(e) => setSearchDay(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  >
                    {[1, 2, 3, 4, 5].map(d => (
                      <option key={d} value={d}>วัน{daysOfWeek[d]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">เลือกคาบเรียน</label>
                  <select 
                    value={searchPeriod}
                    onChange={(e) => setSearchPeriod(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  >
                    {periods.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <h4 className="font-bold text-emerald-600 mb-3 border-b pb-2">ครูที่ว่างในคาบนี้</h4>
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {teachers.filter(t => !allSchedules.some(s => s.dayOfWeek === searchDay && s.period === searchPeriod && s.teacherId === t.id)).map(t => (
                      <li key={t.id} className="text-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        {t.thaiName || t.displayName}
                      </li>
                    ))}
                    {teachers.filter(t => !allSchedules.some(s => s.dayOfWeek === searchDay && s.period === searchPeriod && s.teacherId === t.id)).length === 0 && (
                      <li className="text-sm text-slate-500">ไม่มีครูว่าง</li>
                    )}
                  </ul>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <h4 className="font-bold text-rose-600 mb-3 border-b pb-2">ห้องเรียนที่ว่างในคาบนี้</h4>
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {GRADE_LEVELS.filter(g => !allSchedules.some(s => s.dayOfWeek === searchDay && s.period === searchPeriod && s.gradeLevel === g)).map(g => (
                      <li key={g} className="text-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                        {g}
                      </li>
                    ))}
                    {GRADE_LEVELS.filter(g => !allSchedules.some(s => s.dayOfWeek === searchDay && s.period === searchPeriod && s.gradeLevel === g)).length === 0 && (
                      <li className="text-sm text-slate-500">ไม่มีห้องว่าง</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-white border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-amber-600 mb-3 border-b pb-2">ตรวจสอบตารางสอนชนกัน (ทั้งระบบ)</h4>
                <div className="space-y-3">
                  {(() => {
                    // Find classes with multiple teachers at the same time
                    const clashes = [];
                    for (const d of [1,2,3,4,5]) {
                      for (const p of periods) {
                        for (const g of GRADE_LEVELS) {
                          const scheds = allSchedules.filter(s => s.dayOfWeek === d && s.period === p && s.gradeLevel === g);
                          if (scheds.length > 1) {
                            clashes.push({
                              day: d,
                              period: p,
                              grade: g,
                              teachers: scheds.map(s => s.teacherName)
                            });
                          }
                        }
                      }
                    }
                    if (clashes.length === 0) {
                      return <div className="text-sm text-slate-500">ไม่พบตารางสอนชนกัน</div>;
                    }
                    return clashes.map((clash, idx) => (
                      <div key={idx} className="text-sm p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <strong>วัน{daysOfWeek[clash.day]} {clash.period} ห้อง {clash.grade}:</strong> ซ้อนทับกันโดย {clash.teachers.join(', ')}
                      </div>
                    ));
                  })()}
                </div>
              </div>

            </div>
          </div>
        )}"""

content = content.replace('{viewMode === \'overview\' && (', free_periods_ui + '\n\n        {viewMode === \'overview\' && (')


with open('src/components/ScheduleManager.tsx', 'w') as f:
    f.write(content)
