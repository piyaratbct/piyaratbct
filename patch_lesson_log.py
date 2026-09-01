import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()
        
    table_ui = """        {importedDesirable && importedDesirable.length > 0 && (
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
        
    # Find insertion point
    target = '        <div>\n          <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">\n            <Sparkles className="h-4 w-4 text-indigo-500" />\n            7. แบบประเมินการจัดการเรียนรู้'
    if target in code:
        code = code.replace(target, table_ui + '\n\n' + target)
        
    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/LessonLogForm.tsx')
fix('src/components/PBLLessonLogForm.tsx')
