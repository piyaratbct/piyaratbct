import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()
        
    # First, add the states to LessonLogForm and PBLLessonLogForm
    state_search = "  const [importedDesirable, setImportedDesirable] = useState<string[]>(initialRecord?.importedDesirable || []);\n  const [studentDesirableScores, setStudentDesirableScores] = useState<Record<string, Record<string, number>>>(initialRecord?.studentDesirableScores || {});"
    state_replace = """  const [importedDesirable, setImportedDesirable] = useState<string[]>(initialRecord?.importedDesirable || []);
  const [studentDesirableScores, setStudentDesirableScores] = useState<Record<string, Record<string, number>>>(initialRecord?.studentDesirableScores || {});
  const [importedIndicators, setImportedIndicators] = useState<string[]>(initialRecord?.importedIndicators || []);
  const [studentIndicatorScores, setStudentIndicatorScores] = useState<Record<string, Record<string, number>>>(initialRecord?.studentIndicatorScores || {});
  const [importedCompetencies, setImportedCompetencies] = useState<string[]>(initialRecord?.importedCompetencies || []);
  const [studentCompetencyScores, setStudentCompetencyScores] = useState<Record<string, Record<string, number>>>(initialRecord?.studentCompetencyScores || {});"""
    
    code = code.replace(state_search, state_replace)
    
    # Second, modify handleImportPlan
    import_search = "setImportedDesirable(plan.desirableCharacteristics || []);"
    import_replace = """setImportedDesirable(plan.desirableCharacteristics || []);
    
    const indicators = [];
    if (plan.coreIndicators) indicators.push(...plan.coreIndicators.split('\\n').filter(s => s.trim()));
    if (plan.targetIndicators) indicators.push(...plan.targetIndicators.split('\\n').filter(s => s.trim()));
    setImportedIndicators(indicators);
    
    const comps = [];
    if (plan.competencies) comps.push(...plan.competencies.split('\\n').filter(s => s.trim()));
    setImportedCompetencies(comps);"""
    
    code = code.replace(import_search, import_replace)
    
    # Third, add to payload
    payload_search = """      importedDesirable,
      studentDesirableScores,"""
    payload_replace = """      importedDesirable,
      studentDesirableScores,
      importedIndicators,
      studentIndicatorScores,
      importedCompetencies,
      studentCompetencyScores,"""
      
    code = code.replace(payload_search, payload_replace)
    
    # Fourth, render tables
    # I'll create a generic component-like string to replace the current table
    # It's easier to just find the current table and replace it with 3 tables
    table_search = """        {importedDesirable && importedDesirable.length > 0 && (
          <div className="mb-8">
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-emerald-500" />
              ตารางประเมินผลรายบุคคล (คุณลักษณะอันพึงประสงค์จากแผนการสอน)
            </label>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-700 w-16">เลขที่</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700 min-w-[150px] sticky left-0 bg-slate-50 z-10 shadow-[1px_0_0_#e2e8f0]">ชื่อ - สกุล</th>
                      {importedDesirable.map((char, idx) => (
                        <th key={idx} className="px-4 py-3 text-center font-bold text-slate-700 min-w-[120px]">
                          {char}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.length > 0 ? (
                      students.map(student => (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-600 font-medium">{student.number}</td>
                          <td className="px-4 py-3 text-slate-800 font-medium sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-[1px_0_0_#e2e8f0]">
                            {student.firstName} {student.lastName}
                          </td>
                          {importedDesirable.map((char, idx) => (
                            <td key={idx} className="px-4 py-2 text-center">
                              <select
                                className="w-16 p-1.5 text-center border border-slate-200 rounded-lg text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer bg-slate-50 hover:bg-white"
                                value={studentDesirableScores[student.id]?.[char] ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? null : Number(e.target.value);
                                  setStudentDesirableScores(prev => {
                                    const next = { ...prev };
                                    if (!next[student.id]) next[student.id] = {};
                                    if (val === null) {
                                      delete next[student.id][char];
                                    } else {
                                      next[student.id][char] = val;
                                    }
                                    return next;
                                  });
                                }}
                              >
                                <option value="">-</option>
                                <option value="3">3 (ดีเยี่ยม)</option>
                                <option value="2">2 (ดี)</option>
                                <option value="1">1 (ผ่าน)</option>
                                <option value="0">0 (ไม่ผ่าน)</option>
                              </select>
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={importedDesirable.length + 2} className="px-4 py-8 text-center text-slate-500">
                          {isLoadingStudents ? 'กำลังโหลดข้อมูลนักเรียน...' : 'ไม่พบข้อมูลนักเรียน กรุณาเลือกชั้นเรียนให้ถูกต้อง'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-50 px-4 py-2 text-[10px] text-slate-500 border-t border-slate-200">
                ระดับคะแนน: 3 = ดีเยี่ยม, 2 = ดี, 1 = ผ่าน, 0 = ไม่ผ่าน
              </div>
            </div>
          </div>
        )}"""
        
    def generate_table(title, items_var, scores_var, set_scores_var, color):
        return f"""
        {{{items_var} && {items_var}.length > 0 && (
          <div className="mb-8">
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-{color}-500" />
              {title}
            </label>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-700 w-16">เลขที่</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700 min-w-[150px] sticky left-0 bg-slate-50 z-10 shadow-[1px_0_0_#e2e8f0]">ชื่อ - สกุล</th>
                      {{{items_var}.map((char, idx) => (
                        <th key={{idx}} className="px-4 py-3 text-center font-bold text-slate-700 min-w-[120px] max-w-[200px] whitespace-normal">
                          {{char}}
                        </th>
                      ))}}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {{students.length > 0 ? (
                      students.map(student => (
                        <tr key={{student.id}} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-600 font-medium">{{student.number}}</td>
                          <td className="px-4 py-3 text-slate-800 font-medium sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-[1px_0_0_#e2e8f0]">
                            {{student.firstName}} {{student.lastName}}
                          </td>
                          {{{items_var}.map((char, idx) => (
                            <td key={{idx}} className="px-4 py-2 text-center">
                              <select
                                className="w-16 p-1.5 text-center border border-slate-200 rounded-lg text-slate-700 outline-none focus:ring-2 focus:ring-{color}-500 appearance-none cursor-pointer bg-slate-50 hover:bg-white"
                                value={{{scores_var}[student.id]?.[char] ?? ''}}
                                onChange={{(e) => {{
                                  const val = e.target.value === '' ? null : Number(e.target.value);
                                  {set_scores_var}(prev => {{
                                    const next = {{ ...prev }};
                                    if (!next[student.id]) next[student.id] = {{}};
                                    if (val === null) {{
                                      delete next[student.id][char];
                                    }} else {{
                                      next[student.id][char] = val;
                                    }}
                                    return next;
                                  }});
                                }}}}
                              >
                                <option value="">-</option>
                                <option value="3">3 (ดีเยี่ยม)</option>
                                <option value="2">2 (ดี)</option>
                                <option value="1">1 (ผ่าน)</option>
                                <option value="0">0 (ไม่ผ่าน)</option>
                              </select>
                            </td>
                          ))}}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={{{items_var}.length + 2}} className="px-4 py-8 text-center text-slate-500">
                          {{isLoadingStudents ? 'กำลังโหลดข้อมูลนักเรียน...' : 'ไม่พบข้อมูลนักเรียน กรุณาเลือกชั้นเรียนให้ถูกต้อง'}}
                        </td>
                      </tr>
                    )}}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-50 px-4 py-2 text-[10px] text-slate-500 border-t border-slate-200">
                ระดับคะแนน: 3 = ดีเยี่ยม, 2 = ดี, 1 = ผ่าน, 0 = ไม่ผ่าน
              </div>
            </div>
          </div>
        )}}"""

    tables = (
      generate_table('ตารางประเมินผลรายบุคคล (ตัวชี้วัด / จุดประสงค์)', 'importedIndicators', 'studentIndicatorScores', 'setStudentIndicatorScores', 'blue') + "\n" +
      generate_table('ตารางประเมินผลรายบุคคล (สมรรถนะสำคัญของผู้เรียน)', 'importedCompetencies', 'studentCompetencyScores', 'setStudentCompetencyScores', 'violet') + "\n" +
      generate_table('ตารางประเมินผลรายบุคคล (คุณลักษณะอันพึงประสงค์)', 'importedDesirable', 'studentDesirableScores', 'setStudentDesirableScores', 'emerald')
    )
    
    code = code.replace(table_search, tables)
    
    # Make sure resetForm clears them
    reset_search = """    setEvaluations(DEFAULT_EVALUATIONS);
    setAttachments([]);"""
    reset_replace = """    setEvaluations(DEFAULT_EVALUATIONS);
    setAttachments([]);
    setImportedDesirable([]);
    setStudentDesirableScores({});
    setImportedIndicators([]);
    setStudentIndicatorScores({});
    setImportedCompetencies([]);
    setStudentCompetencyScores({});"""
    code = code.replace(reset_search, reset_replace)
    
    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/LessonLogForm.tsx')
fix('src/components/PBLLessonLogForm.tsx')
