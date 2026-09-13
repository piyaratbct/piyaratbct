const fs = require('fs');
let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

const filterTarget = `    const matchesGrade = gradeFilter === 'all' || 
                         c.gradeLevel === gradeFilter || 
                         getBaseGrade(c.gradeLevel) === getBaseGrade(gradeFilter);`;
                         
const newFilterTarget = `    const matchesGrade = gradeFilter === 'all' || 
                         (c.gradeLevels && c.gradeLevels.some(g => getBaseGrade(g) === getBaseGrade(gradeFilter))) ||
                         c.gradeLevel === gradeFilter || 
                         getBaseGrade(c.gradeLevel) === getBaseGrade(gradeFilter);`;

content = content.replace(filterTarget, newFilterTarget);

const displayTarget = `                      <div className="text-[10px] text-slate-400">{c.gradeLevel}</div>`;
const newDisplayTarget = `                      <div className="text-[10px] text-slate-400">
                        {c.gradeLevels && c.gradeLevels.length > 1 
                          ? \`\${c.gradeLevels[0]} - \${c.gradeLevels[c.gradeLevels.length - 1]}\`
                          : c.gradeLevel}
                      </div>`;

content = content.replace(displayTarget, newDisplayTarget);

const formTarget = `              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ระดับชั้น</label>
                <select 
                  value={editingSubject.gradeLevel || ''} 
                  onChange={e => setEditingSubject({...editingSubject, gradeLevel: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  {BASE_GRADE_LEVELS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>`;
              
const newFormTarget = `              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">ระดับชั้น (เลือกได้มากกว่า 1)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BASE_GRADE_LEVELS.map(g => {
                    const isSelected = (editingSubject.gradeLevels || (editingSubject.gradeLevel ? [editingSubject.gradeLevel] : [])).includes(g);
                    return (
                      <label key={g} className={\`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors \${isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}\`}>
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            let currentGrades = editingSubject.gradeLevels || (editingSubject.gradeLevel ? [editingSubject.gradeLevel] : []);
                            if (e.target.checked) {
                              if (!currentGrades.includes(g)) {
                                currentGrades = [...currentGrades, g];
                              }
                            } else {
                              currentGrades = currentGrades.filter(grade => grade !== g);
                            }
                            
                            // Keep them sorted according to BASE_GRADE_LEVELS order
                            currentGrades.sort((a, b) => BASE_GRADE_LEVELS.indexOf(a) - BASE_GRADE_LEVELS.indexOf(b));
                            
                            setEditingSubject({
                              ...editingSubject, 
                              gradeLevels: currentGrades,
                              gradeLevel: currentGrades.length > 0 ? currentGrades[0] : ''
                            });
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4"
                        />
                        <span className="text-sm font-medium">{g}</span>
                      </label>
                    );
                  })}
                </div>
                {(!editingSubject.gradeLevels || editingSubject.gradeLevels.length === 0) && !editingSubject.gradeLevel && (
                  <p className="text-rose-500 text-[10px] mt-1">* กรุณาเลือกระดับชั้นอย่างน้อย 1 ระดับ</p>
                )}
              </div>`;

content = content.replace(formTarget, newFormTarget);

fs.writeFileSync('src/components/CurriculumManager.tsx', content);
console.log("Patched CurriculumManager form with checkboxes");
