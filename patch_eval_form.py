import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # Create available subjects logic inside the render function? No, we can just define it inline.
    
    # We want to replace the `evalItem.autoGenerateColumn && (` block with one that includes a <select> if `isIntegrated` is true.
    
    old_logic = """                    <div className="flex flex-col gap-2 w-full">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={evalItem.autoGenerateColumn}
                          onChange={(e) => setStructuredEvaluations(prev => prev.map(p => p.id === evalItem.id ? { ...p, autoGenerateColumn: e.target.checked } : p))}
                          className="rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                        />
                        <span>สร้างช่องบันทึกคะแนนใน LessonAchieve อัตโนมัติ</span>
                      </label>
                      
                      {evalItem.autoGenerateColumn && (
                        <div className="flex items-center gap-4 ml-6">
                          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                            <input 
                              type="radio" 
                              name={`scorePeriod_${evalItem.id}`}
                              checked={evalItem.scorePeriod !== 'after_mid'}
                              onChange={() => setStructuredEvaluations(prev => prev.map(p => p.id === evalItem.id ? { ...p, scorePeriod: 'before_mid' } : p))}
                              className="text-rose-500 focus:ring-rose-500"
                            />
                            ก่อนกลางภาค
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                            <input 
                              type="radio" 
                              name={`scorePeriod_${evalItem.id}`}
                              checked={evalItem.scorePeriod === 'after_mid'}
                              onChange={() => setStructuredEvaluations(prev => prev.map(p => p.id === evalItem.id ? { ...p, scorePeriod: 'after_mid' } : p))}
                              className="text-rose-500 focus:ring-rose-500"
                            />
                            หลังกลางภาค
                          </label>
                        </div>
                      )}
                    </div>"""

    new_logic = """                    <div className="flex flex-col gap-2 w-full">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={evalItem.autoGenerateColumn}
                          onChange={(e) => setStructuredEvaluations(prev => prev.map(p => p.id === evalItem.id ? { ...p, autoGenerateColumn: e.target.checked } : p))}
                          className="rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                        />
                        <span>สร้างช่องบันทึกคะแนนใน LessonAchieve อัตโนมัติ</span>
                      </label>
                      
                      {evalItem.autoGenerateColumn && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 ml-6">
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                              <input 
                                type="radio" 
                                name={`scorePeriod_${evalItem.id}`}
                                checked={evalItem.scorePeriod !== 'after_mid'}
                                onChange={() => setStructuredEvaluations(prev => prev.map(p => p.id === evalItem.id ? { ...p, scorePeriod: 'before_mid' } : p))}
                                className="text-rose-500 focus:ring-rose-500"
                              />
                              ก่อนกลางภาค
                            </label>
                            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                              <input 
                                type="radio" 
                                name={`scorePeriod_${evalItem.id}`}
                                checked={evalItem.scorePeriod === 'after_mid'}
                                onChange={() => setStructuredEvaluations(prev => prev.map(p => p.id === evalItem.id ? { ...p, scorePeriod: 'after_mid' } : p))}
                                className="text-rose-500 focus:ring-rose-500"
                              />
                              หลังกลางภาค
                            </label>
                          </div>
                          
                          {isIntegrated && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">บันทึกลงวิชา:</span>
                              <select
                                value={evalItem.targetSubject || ''}
                                onChange={(e) => setStructuredEvaluations(prev => prev.map(p => p.id === evalItem.id ? { ...p, targetSubject: e.target.value } : p))}
                                className="text-xs border border-slate-200 rounded p-1 focus:ring-rose-500 focus:border-rose-500"
                              >
                                <option value="">วิชาหลัก ({subject === 'อื่นๆ' ? customSubject : subject})</option>
                                {integratedSubjects.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      )}
                    </div>"""

    if old_logic in code:
        code = code.replace(old_logic, new_logic)
        with open(filename, 'w') as f:
            f.write(code)
        print(f"Success patching {filename}")
    else:
        print(f"Pattern not found in {filename}")

fix('src/components/LessonPlanForm.tsx')
fix('src/components/PBLLessonPlanForm.tsx')
