import re

with open('src/components/ScheduleManager.tsx', 'r') as f:
    content = f.read()

overview_pattern = r'                                  \{schedulesInPeriod\.map\(s => \{\n                                    const teacher = teachers\.find\(t => t\.id === s\.teacherId\);\n                                    const displayName = teacher\?\.displayName \|\| s\.teacherName;\n                                    return \(\n                                      <div key=\{s\.id\} className="bg-indigo-50 border border-indigo-100 rounded p-1\.5 text-xs">\n                                        <div className="font-bold text-indigo-900 truncate" title=\{s\.teacherName\}>\{displayName\}</div>\n                                        <div className="text-indigo-700 flex justify-between gap-1 mt-0\.5">\n                                          <span className="truncate flex-1">\{s\.subject\}</span>\n                                          <span className="font-medium whitespace-nowrap">\{formatShortGrade\(s\.gradeLevel\)\}</span>\n                                        </div>\n                                      </div>\n                                    \);\n                                  \}\)\}'

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

content = re.sub(overview_pattern, overview_replacement, content, flags=re.DOTALL)

with open('src/components/ScheduleManager.tsx', 'w') as f:
    f.write(content)

