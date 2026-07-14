import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """  const femaleCount = countSource.filter((s) => s.gender === "female").length;

  const homeroomTeachers = teachers.filter(
    (t) => t.homeroomClass === selectedGrade || t.coHomeroomClass === selectedGrade
  );"""

replacement = """  const femaleCount = countSource.filter((s) => s.gender === "female").length;
  
  const allergicFoodStudents = countSource.filter((s) => s.allergicFood);
  const congenitalDiseaseStudents = countSource.filter((s) => s.congenitalDisease);

  const homeroomTeachers = teachers.filter(
    (t) => t.homeroomClass === selectedGrade || t.coHomeroomClass === selectedGrade
  );"""
content = content.replace(target, replacement)

target2 = """                    <span className="bg-pink-50 px-3 py-1 rounded-lg text-pink-700">
                      หญิง: <span className="font-bold">{femaleCount}</span> คน
                    </span>
                  </div>"""

replacement2 = """                    <span className="bg-pink-50 px-3 py-1 rounded-lg text-pink-700">
                      หญิง: <span className="font-bold">{femaleCount}</span> คน
                    </span>
                    {(allergicFoodStudents.length > 0 || congenitalDiseaseStudents.length > 0) && (
                      <div className="flex gap-2 items-center">
                        <span className="text-slate-300">|</span>
                        {allergicFoodStudents.length > 0 && (
                          <span className="bg-orange-50 px-3 py-1 rounded-lg text-orange-700 flex items-center gap-1" title={allergicFoodStudents.map(s => `${s.firstName}: ${s.allergicFood}`).join(', ')}>
                            <AlertTriangle className="h-3 w-3" />
                            แพ้อาหาร: <span className="font-bold">{allergicFoodStudents.length}</span> คน
                          </span>
                        )}
                        {congenitalDiseaseStudents.length > 0 && (
                          <span className="bg-purple-50 px-3 py-1 rounded-lg text-purple-700 flex items-center gap-1" title={congenitalDiseaseStudents.map(s => `${s.firstName}: ${s.congenitalDisease}`).join(', ')}>
                            <AlertTriangle className="h-3 w-3" />
                            โรคประจำตัว: <span className="font-bold">{congenitalDiseaseStudents.length}</span> คน
                          </span>
                        )}
                      </div>
                    )}
                  </div>"""
content = content.replace(target2, replacement2)


target3 = """                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold ${student.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                              >
                                {student.status === "active"
                                  ? "ปกติ"
                                  : "ย้าย/ออก"}
                              </span>
                              {(student.medicalInfo || student.allergicMedicine || student.allergicFood || student.congenitalDisease) && (
                                <span 
                                  className="flex items-center gap-1 bg-rose-100 text-rose-600 px-2 py-1 rounded-full text-[10px] font-bold"
                                  title={[
                                    student.allergicMedicine ? `แพ้ยา: ${student.allergicMedicine}` : '',
                                    student.allergicFood ? `แพ้อาหาร: ${student.allergicFood}` : '',
                                    student.congenitalDisease ? `โรคประจำตัว: ${student.congenitalDisease}` : '',
                                    student.medicalInfo ? `อื่นๆ: ${student.medicalInfo}` : ''
                                  ].filter(Boolean).join(' | ')}
                                >
                                  <AlertTriangle className="h-3 w-3" /> แจ้งเตือน
                                </span>
                              )}
                            </div>
                          </td>"""

replacement3 = """                          <td className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-bold ${student.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                                >
                                  {student.status === "active"
                                    ? "ปกติ"
                                    : "ย้าย/ออก"}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center justify-center gap-1 max-w-[150px]">
                                {student.allergicFood && (
                                  <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[10px] font-bold" title={`แพ้อาหาร: ${student.allergicFood}`}>
                                    <AlertTriangle className="h-3 w-3" /> แพ้อาหาร
                                  </span>
                                )}
                                {student.congenitalDisease && (
                                  <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-bold" title={`โรคประจำตัว: ${student.congenitalDisease}`}>
                                    <AlertTriangle className="h-3 w-3" /> โรคประจำตัว
                                  </span>
                                )}
                                {student.allergicMedicine && (
                                  <span className="flex items-center gap-1 bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-bold" title={`แพ้ยา: ${student.allergicMedicine}`}>
                                    <AlertTriangle className="h-3 w-3" /> แพ้ยา
                                  </span>
                                )}
                                {student.medicalInfo && (
                                  <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold" title={`อื่นๆ: ${student.medicalInfo}`}>
                                    <AlertTriangle className="h-3 w-3" /> อื่นๆ
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>"""
content = content.replace(target3, replacement3)


with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
