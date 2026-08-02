import re

with open('src/components/ScheduleManager.tsx', 'r') as f:
    content = f.read()

# Revert manage view
manage_pattern = r'                  \{schedules\.filter\(s => s\.dayOfWeek === day\)\.sort\(\(a, b\) => periods\.indexOf\(a\.period\) - periods\.indexOf\(b\.period\)\)\.map\(schedule => \{\n                    const isClashing = allSchedules\.some\(other => other\.id !== schedule\.id && other\.dayOfWeek === schedule\.dayOfWeek && other\.period === schedule\.period && other\.gradeLevel === schedule\.gradeLevel\);\n                    return \(\n                    <div key=\{schedule\.id\}.*?</div>\n                  \)\}\)\}'
manage_replacement = """                  {schedules.filter(s => s.dayOfWeek === day).sort((a, b) => periods.indexOf(a.period) - periods.indexOf(b.period)).map(schedule => (
                    <div key={schedule.id} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center bg-white hover:bg-slate-50 transition-colors">
                      <div className="w-full md:w-1/6 font-bold text-slate-700">{schedule.period}</div>
                      
                      <div className="w-full md:w-2/6">
                        <select 
                          value={schedule.subject}
                          onChange={(e) => handleUpdateSchedule(schedule.id, 'subject', e.target.value)}
                          className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      
                      <div className="w-full md:w-2/6">
                        <select 
                          value={schedule.gradeLevel}
                          onChange={(e) => handleUpdateSchedule(schedule.id, 'gradeLevel', e.target.value)}
                          className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                  ))}"""

content = re.sub(manage_pattern, manage_replacement, content, flags=re.DOTALL)

# Revert overview view
overview_pattern = r'                                  \{schedulesInPeriod\.map\(s => \{\n                                    const teacher = teachers\.find\(t => t\.id === s\.teacherId\);\n                                    const displayName = teacher\?\.displayName \|\| s\.teacherName;\n                                    const isClashing = schedulesInPeriod\.some\(other => other\.id !== s\.id && other\.gradeLevel === s\.gradeLevel\);\n                                    return \(\n                                      <div key=\{s\.id\} className=\{`border rounded p-1\.5 text-xs \$\{isClashing \? \'bg-amber-50 border-amber-300\' : \'bg-indigo-50 border-indigo-100\'\}`\}>\n                                        <div className=\{`font-bold truncate \$\{isClashing \? \'text-amber-900\' : \'text-indigo-900\'\}`\} title=\{s\.teacherName\}>\{displayName\}</div>\n                                        <div className=\{`flex justify-between items-center gap-1 mt-0\.5 \$\{isClashing \? \'text-amber-700\' : \'text-indigo-700\'\}`\}>\n                                          <span className="truncate flex-1">\{s\.subject\}</span>\n                                          <div className="flex items-center gap-1">\n                                            <span className="font-medium whitespace-nowrap">\{formatShortGrade\(s\.gradeLevel\)\}</span>\n                                            \{isClashing && <AlertTriangle className="h-3 w-3 text-amber-600" title="ห้องนี้เรียนซ้ำคาบเดียวกัน" />\}\n                                          </div>\n                                        </div>\n                                      </div>\n                                    \);\n                                  \}\)\}'

overview_replacement = """                                  {schedulesInPeriod.map(s => {
                                    const teacher = teachers.find(t => t.id === s.teacherId);
                                    const displayName = teacher?.displayName || s.teacherName;
                                    return (
                                      <div key={s.id} className="bg-indigo-50 border border-indigo-100 rounded p-1.5 text-xs">
                                        <div className="font-bold text-indigo-900 truncate" title={s.teacherName}>{displayName}</div>
                                        <div className="text-indigo-700 flex justify-between gap-1 mt-0.5">
                                          <span className="truncate flex-1">{s.subject}</span>
                                          <span className="font-medium whitespace-nowrap">{formatShortGrade(s.gradeLevel)}</span>
                                        </div>
                                      </div>
                                    );
                                  })}"""

content = re.sub(overview_pattern, overview_replacement, content, flags=re.DOTALL)

with open('src/components/ScheduleManager.tsx', 'w') as f:
    f.write(content)

print("Reverted collision UI")
