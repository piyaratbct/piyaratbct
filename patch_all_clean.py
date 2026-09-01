import os

def patch_file(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # 1. Imports
    code = code.replace("import { LessonRecord, SUBJECTS,", "import { LessonRecord, Student, SUBJECTS,")
    code = code.replace("import { formatThaiDate } from '../lib/dateUtils';", "import { formatThaiDate } from '../lib/dateUtils';\nimport { DESIRABLE_CHARACTERISTICS } from '../data';")

    # 2. States
    states = """
  const [importedDesirable, setImportedDesirable] = useState<string[]>(initialRecord?.importedDesirable || []);
  const [studentDesirableScores, setStudentDesirableScores] = useState<Record<string, Record<string, number>>>(initialRecord?.studentDesirableScores || {});
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedGrades.length === 0) {
        setStudents([]);
        return;
      }
      setIsLoadingStudents(true);
      try {
        const gradeLevel = selectedGrades[0];
        const q = query(collection(db, 'students'), where('gradeLevel', '==', gradeLevel), where('status', '==', 'active'));
        const snap = await getDocs(q);
        const studentList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        studentList.sort((a, b) => a.number - b.number);
        setStudents(studentList);
      } catch(e) {
        console.error(e);
      }
      setIsLoadingStudents(false);
    };
    fetchStudents();
  }, [selectedGrades]);
"""
    code = code.replace("const [errorMsg, setErrorMsg] = useState('');", "const [errorMsg, setErrorMsg] = useState('');\n" + states)

    # 3. handleImportPlan
    code = code.replace("setLessonPlanId(plan.id);", "setLessonPlanId(plan.id);\n    setImportedDesirable(plan.desirableCharacteristics || []);")

    # 4. handleSave
    # Find the handleSave function
    handle_save_idx = code.find("const handleSave")
    payload_idx = code.find("evaluations,", handle_save_idx)
    code = code[:payload_idx] + "evaluations,\n      importedDesirable,\n      studentDesirableScores," + code[payload_idx + len("evaluations,"):]

    # 5. UI
    ui = """
        {/* Quick Grading for Desirable Characteristics */}
        {importedDesirable.length > 0 && selectedGrades.some(g => g.includes('ประถม')) && (
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                4. ประเมินคุณลักษณะอันพึงประสงค์ (อ้างอิงจากแผนการสอน)
              </label>
            </div>
            <p className="text-[11px] text-amber-700">สามารถให้คะแนน 0 (ไม่ผ่าน), 1 (ผ่าน), 2 (ดี), 3 (ดีเยี่ยม) เป็นรายบุคคลได้ทันที</p>
            {isLoadingStudents ? (
              <div className="text-xs text-amber-600">กำลังโหลดรายชื่อนักเรียน...</div>
            ) : students.length === 0 ? (
              <div className="text-xs text-amber-600">ไม่พบรายชื่อนักเรียนในระดับชั้นนี้</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-amber-100">
                <table className="w-full text-xs text-left whitespace-nowrap bg-white">
                  <thead>
                    <tr className="bg-amber-100 text-amber-900 border-b border-amber-200">
                      <th className="px-3 py-2 rounded-tl-lg font-bold w-12 text-center">เลขที่</th>
                      <th className="px-3 py-2 font-bold min-w-[120px]">ชื่อ-นามสกุล</th>
                      {importedDesirable.map(indId => (
                        <th key={indId} className="px-2 py-2 text-center font-bold" title={DESIRABLE_CHARACTERISTICS.flatMap(c => c.indicators).find(i => i.id === indId)?.text}>{indId}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id} className="border-b border-slate-50 last:border-0 hover:bg-amber-50/50 transition-colors">
                        <td className="px-3 py-2 text-center text-slate-500">{student.number}</td>
                        <td className="px-3 py-2 text-slate-700">{student.firstName} {student.lastName}</td>
                        {importedDesirable.map(indId => {
                          const currentScore = studentDesirableScores[student.id]?.[indId] ?? '';
                          return (
                            <td key={indId} className="px-2 py-1 text-center">
                              <select
                                className={`w-20 border-0 rounded-lg text-[11px] py-1 px-1.5 focus:ring-2 focus:ring-amber-400 cursor-pointer transition-colors ${
                                  currentScore === 3 ? 'bg-emerald-100 text-emerald-800 font-bold' :
                                  currentScore === 2 ? 'bg-sky-100 text-sky-800 font-semibold' :
                                  currentScore === 1 ? 'bg-amber-100 text-amber-800' :
                                  currentScore === 0 ? 'bg-rose-100 text-rose-800 font-semibold' :
                                  'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                                }`}
                                value={currentScore}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? '' : Number(e.target.value);
                                  setStudentDesirableScores(prev => ({
                                    ...prev,
                                    [student.id]: {
                                      ...(prev.hasOwnProperty(student.id) ? prev[student.id] : {}),
                                      [indId]: val
                                    }
                                  }));
                                }}
                              >
                                <option value="">-</option>
                                <option value="3">3: ดีเยี่ยม</option>
                                <option value="2">2: ดี</option>
                                <option value="1">1: ผ่าน</option>
                                <option value="0">0: ไม่ผ่าน</option>
                              </select>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
"""
    # Replace either {/* 5. แนบรูป/สื่อประกอบ */} or {/* 4. แนบรูป/สื่อประกอบ */}
    if "{/* 4. แนบรูป/สื่อประกอบ */}" in code:
        code = code.replace("{/* 4. แนบรูป/สื่อประกอบ */}", ui + "\n\n        {/* 4. แนบรูป/สื่อประกอบ */}")
    elif "{/* 5. แนบรูป/สื่อประกอบ */}" in code:
        code = code.replace("{/* 5. แนบรูป/สื่อประกอบ */}", ui + "\n\n        {/* 5. แนบรูป/สื่อประกอบ */}")

    with open(filename, 'w') as f:
        f.write(code)

patch_file('src/components/LessonLogForm.tsx')
patch_file('src/components/PBLLessonLogForm.tsx')
print("Patched both log forms successfully")
