import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target1 = """            const allSpecialCareStudents = students.filter(
              s => s.allergicFood || s.congenitalDisease || s.allergicMedicine || s.medicalInfo
            ).sort((a, b) => {"""

replacement1 = """            const allSpecialCareStudents = students.filter(
              s => s.allergicFood || s.congenitalDisease || s.allergicMedicine || s.medicalInfo || s.weight || s.height
            ).sort((a, b) => {"""

content = content.replace(target1, replacement1)

target2 = """                              <th className="px-4 py-3 text-center w-24 whitespace-nowrap">ระดับชั้น</th>
                              <th className="px-4 py-3 text-center w-16 whitespace-nowrap">เลขที่</th>
                              <th className="px-4 py-3 whitespace-nowrap">ชื่อ-สกุล</th>
                              <th className="px-4 py-3 text-center w-24 whitespace-nowrap">ชื่อเล่น</th>
                              <th className="px-4 py-3 whitespace-nowrap">ข้อมูลสุขภาพที่ต้องระวัง</th>"""

replacement2 = """                              <th className="px-4 py-3 text-center w-24 whitespace-nowrap">ระดับชั้น</th>
                              <th className="px-4 py-3 text-center w-16 whitespace-nowrap">เลขที่</th>
                              <th className="px-4 py-3 whitespace-nowrap">ชื่อ-สกุล</th>
                              <th className="px-4 py-3 text-center w-24 whitespace-nowrap">น้ำหนัก/ส่วนสูง</th>
                              <th className="px-4 py-3 whitespace-nowrap">ข้อมูลสุขภาพที่ต้องระวัง</th>"""

content = content.replace(target2, replacement2)

target3 = """                                <td className="px-4 py-3 text-center whitespace-nowrap">
                                  {student.nickname ? (
                                    <span className="bg-sky-50 text-sky-700 px-2 py-1 rounded-md text-xs font-bold border border-sky-100 whitespace-nowrap">
                                      {student.nickname}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>"""

replacement3 = """                                <td className="px-4 py-3 text-center whitespace-nowrap text-xs">
                                  {student.weight && student.height ? (() => {
                                    const h = student.height / 100;
                                    const bmi = student.weight / (h * h);
                                    let label = '';
                                    let color = '';
                                    if (bmi < 18.5) { label = 'น้ำหนักน้อย'; color = 'text-blue-600 bg-blue-50 border-blue-100'; }
                                    else if (bmi < 23) { label = 'สมส่วน'; color = 'text-green-600 bg-green-50 border-green-100'; }
                                    else if (bmi < 25) { label = 'น้ำหนักเกิน'; color = 'text-yellow-600 bg-yellow-50 border-yellow-100'; }
                                    else if (bmi < 30) { label = 'อ้วนระดับ 1'; color = 'text-orange-600 bg-orange-50 border-orange-100'; }
                                    else { label = 'อ้วนระดับ 2'; color = 'text-red-600 bg-red-50 border-red-100'; }
                                    return (
                                      <div className="flex flex-col items-center gap-1">
                                        <div className="text-slate-500">{student.weight} กก. / {student.height} ซม.</div>
                                        <span className={`px-2 py-0.5 rounded-md font-bold border ${color}`}>
                                          BMI: {bmi.toFixed(1)} {label}
                                        </span>
                                      </div>
                                    );
                                  })() : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>"""

content = content.replace(target3, replacement3)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
