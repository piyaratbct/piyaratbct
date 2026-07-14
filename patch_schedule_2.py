import re

with open('src/components/ScheduleManager.tsx', 'r') as f:
    content = f.read()

target = """                  <div className="flex gap-2">
                    <select id={`add-period-${day}`} className="p-1.5 text-xs bg-white border border-slate-200 rounded-lg">
                      {periods.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {(currentTeacher.role === 'admin' || currentTeacher.role === 'academic') && (
                      <button 
                        onClick={() => {
                          const sel = document.getElementById(`add-period-${day}`) as HTMLSelectElement;
                          handleAddSchedule(day, sel.value);
                        }}
                        className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-200 flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> เพิ่มคาบ
                      </button>
                    )}
                  </div>"""

replacement = """                  <div className="flex gap-2">
                    {(currentTeacher.role === 'admin' || currentTeacher.role === 'academic') && (
                      <>
                        <select id={`add-period-${day}`} className="p-1.5 text-xs bg-white border border-slate-200 rounded-lg">
                          {periods.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <button 
                          onClick={() => {
                            const sel = document.getElementById(`add-period-${day}`) as HTMLSelectElement;
                            handleAddSchedule(day, sel.value);
                          }}
                          className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-200 flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" /> เพิ่มคาบ
                        </button>
                      </>
                    )}
                  </div>"""
content = content.replace(target, replacement)

with open('src/components/ScheduleManager.tsx', 'w') as f:
    f.write(content)
