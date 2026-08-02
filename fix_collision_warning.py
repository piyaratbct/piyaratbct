import re

with open('src/components/ScheduleManager.tsx', 'r') as f:
    content = f.read()

# Manage view update
manage_map_start = "                  {schedules.filter(s => s.dayOfWeek === day).sort((a, b) => periods.indexOf(a.period) - periods.indexOf(b.period)).map(schedule => ("
manage_map_end = "                  ))}                  "

manage_replacement = """                  {schedules.filter(s => s.dayOfWeek === day).sort((a, b) => periods.indexOf(a.period) - periods.indexOf(b.period)).map(schedule => {
                    const isClashing = allSchedules.some(other => other.id !== schedule.id && other.dayOfWeek === schedule.dayOfWeek && other.period === schedule.period && other.gradeLevel === schedule.gradeLevel);
                    return (
                    <div key={schedule.id} className={`p-4 flex flex-col md:flex-row gap-4 items-start md:items-center transition-colors ${isClashing ? 'bg-amber-50 border border-amber-200' : 'bg-white hover:bg-slate-50'}`}>
                      <div className={`w-full md:w-1/6 font-bold ${isClashing ? 'text-amber-700' : 'text-slate-700'}`}>
                        {schedule.period}
                        {isClashing && (
                          <div className="text-[10px] text-amber-600 font-normal flex items-center gap-1 mt-1">
                            <AlertTriangle className="h-3 w-3" /> ชนกับครูท่านอื่น
                          </div>
                        )}
                      </div>
                      
                      <div className="w-full md:w-2/6">
                        <select 
                          value={schedule.subject}
                          onChange={(e) => handleUpdateSchedule(schedule.id, 'subject', e.target.value)}
                          className={`w-full p-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-1 ${isClashing ? 'border-amber-300 focus:ring-amber-500' : 'border-slate-200 focus:ring-indigo-500'}`}
                        >
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      
                      <div className="w-full md:w-2/6">
                        <select 
                          value={schedule.gradeLevel}
                          onChange={(e) => handleUpdateSchedule(schedule.id, 'gradeLevel', e.target.value)}
                          className={`w-full p-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-1 ${isClashing ? 'border-amber-300 focus:ring-amber-500' : 'border-slate-200 focus:ring-indigo-500'}`}
                        >
                          {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      
                      <div className="w-full md:w-1/6 flex justify-end">
                        {(currentTeacher.role === 'admin' || currentTeacher.role === 'academic' || currentTeacher.role === 'discipline') && (
                          <button 
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )})}
                  """

# Overview view update
overview_map_start = "                                  {schedulesInPeriod.map(s => {"
overview_map_end = """                                    );
                                  })}"""

overview_replacement = """                                  {schedulesInPeriod.map(s => {
                                    const teacher = teachers.find(t => t.id === s.teacherId);
                                    const displayName = teacher?.displayName || s.teacherName;
                                    const isClashing = schedulesInPeriod.some(other => other.id !== s.id && other.gradeLevel === s.gradeLevel);
                                    return (
                                      <div key={s.id} className={`border rounded p-1.5 text-xs ${isClashing ? 'bg-amber-50 border-amber-300' : 'bg-indigo-50 border-indigo-100'}`}>
                                        <div className={`font-bold truncate ${isClashing ? 'text-amber-900' : 'text-indigo-900'}`} title={s.teacherName}>{displayName}</div>
                                        <div className={`flex justify-between items-center gap-1 mt-0.5 ${isClashing ? 'text-amber-700' : 'text-indigo-700'}`}>
                                          <span className="truncate flex-1">{s.subject}</span>
                                          <div className="flex items-center gap-1">
                                            <span className="font-medium whitespace-nowrap">{formatShortGrade(s.gradeLevel)}</span>
                                            {isClashing && <AlertTriangle className="h-3 w-3 text-amber-600" title="ห้องนี้เรียนซ้ำคาบเดียวกัน" />}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}"""

# Replace in content
manage_pattern = r'                  \{schedules\.filter\(s => s\.dayOfWeek === day\)\.sort\(\(a, b\) => periods\.indexOf\(a\.period\) - periods\.indexOf\(b\.period\)\)\.map\(schedule => \(\n                    <div key=\{schedule\.id\}.*?</div>\n                    </div>\n                  \)\)\}'
content = re.sub(manage_pattern, manage_replacement, content, flags=re.DOTALL)

overview_pattern = r'                                  \{schedulesInPeriod\.map\(s => \{\n                                    const teacher = teachers\.find\(t => t\.id === s\.teacherId\);\n                                    const displayName = teacher\?\.displayName \|\| s\.teacherName;\n                                    return \(\n                                      <div key=\{s\.id\} className="bg-indigo-50 border border-indigo-100 rounded p\.1\.5 text-xs">\n                                        <div className="font-bold text-indigo-900 truncate" title=\{s\.teacherName\}>\{displayName\}</div>\n                                        <div className="text-indigo-700 flex justify-between gap-1 mt-0\.5">\n                                          <span className="truncate flex-1">\{s\.subject\}</span>\n                                          <span className="font-medium whitespace-nowrap">\{formatShortGrade\(s\.gradeLevel\)\}</span>\n                                        </div>\n                                      </div>\n                                    \);\n                                  \}\)\}'
content = re.sub(overview_pattern, overview_replacement, content, flags=re.DOTALL)


with open('src/components/ScheduleManager.tsx', 'w') as f:
    f.write(content)
print("Updated collision UI")
