import fs from 'fs';

const file = 'src/components/ClassroomModule.tsx';
let content = fs.readFileSync(file, 'utf8');

const startIndex = content.indexOf('<div className="overflow-x-auto w-full">');
const endIndexStr = '</table>\n              </div>';
const endIndex = content.indexOf(endIndexStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const replacementContent = `<div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm w-full">
                  {displayedStudents.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      ไม่พบข้อมูลนักเรียนในระดับชั้นนี้
                    </div>
                  ) : (
                    displayedStudents.map((student) => (
                      <div
                        key={student.id}
                        className="p-3 sm:px-4 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-4 even:bg-slate-50/30 border-b border-slate-100 last:border-0"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm shrink-0 mt-0.5">
                            {student.number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-700 text-sm truncate whitespace-normal leading-tight flex items-center gap-2 flex-wrap">
                              <span>
                                {student.firstName} {student.lastName}
                                {student.nickname && <span className="block sm:inline sm:ml-1 text-slate-500 font-normal">({student.nickname})</span>}
                              </span>
                              {student.gender === "male" ? (
                                <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">ชาย</span>
                              ) : (
                                <span className="bg-pink-50 text-pink-600 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">หญิง</span>
                              )}
                              <span
                                className={\`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 \${student.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}\`}
                              >
                                {student.status === "active" ? "ปกติ" : "ย้าย/ออก"}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5">
                              <span>รหัส: {student.studentId}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                              <span>ชั้น: {student.gradeLevel || '-'}</span>
                            </div>
                            
                            {/* Health Tags */}
                            {(student.allergicFood || student.congenitalDisease || student.allergicMedicine || student.medicalInfo) && (
                              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                {student.allergicFood && (
                                  <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[10px] font-bold" title={\`แพ้อาหาร: \${student.allergicFood}\`}>
                                    <AlertTriangle className="h-3 w-3" /> แพ้อาหาร
                                  </span>
                                )}
                                {student.congenitalDisease && (
                                  <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-bold" title={\`โรคประจำตัว: \${student.congenitalDisease}\`}>
                                    <AlertTriangle className="h-3 w-3" /> โรคประจำตัว
                                  </span>
                                )}
                                {student.allergicMedicine && (
                                  <span className="flex items-center gap-1 bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-bold" title={\`แพ้ยา: \${student.allergicMedicine}\`}>
                                    <AlertTriangle className="h-3 w-3" /> แพ้ยา
                                  </span>
                                )}
                                {student.medicalInfo && (
                                  <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold" title={\`อื่นๆ: \${student.medicalInfo}\`}>
                                    <AlertTriangle className="h-3 w-3" /> อื่นๆ
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-row items-center justify-end md:justify-center gap-1 sm:gap-2 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-0 border-slate-100">
                          {(isStudentManager || currentTeacher?.role === 'staff' || (currentTeacher && (currentTeacher.homeroomClass === student.gradeLevel || currentTeacher.coHomeroomClass === student.gradeLevel))) && (
                            <button
                              onClick={() => setViewingStudent(student)}
                              className="flex items-center justify-center gap-1 flex-1 md:flex-none p-1.5 sm:px-3 text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-colors text-xs font-bold"
                              title="ดูข้อมูลนักเรียน"
                            >
                              <Search className="h-3.5 w-3.5" /> <span className="md:hidden lg:inline">ดูข้อมูล</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedStudent360(student);
                              setActiveTab("student360");
                            }}
                            className="flex items-center justify-center gap-1 flex-1 md:flex-none p-1.5 sm:px-3 text-slate-500 hover:text-fuchsia-600 bg-slate-50 hover:bg-fuchsia-50 border border-slate-200 hover:border-fuchsia-200 rounded-lg transition-colors text-xs font-bold"
                            title="ดูข้อมูล Student 360°"
                          >
                            <span className="text-[12px] font-black leading-none px-0.5 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-500">360&deg;</span>
                            <span className="md:hidden lg:inline">มุมมองรอบด้าน</span>
                          </button>
                          
                          {isStudentManager && (
                            <div className="flex gap-1 ml-auto md:ml-0">
                              <button
                                onClick={() => {
                                  setEditingStudent(student);
                                  setShowStudentModal(true);
                                }}
                                className="p-1.5 sm:p-2 text-slate-400 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 rounded-lg transition-colors"
                                title="แก้ไขข้อมูล"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              {canDeleteStudent && (
                                <button
                                  onClick={() =>
                                    setStudentToDelete({
                                      id: student.id,
                                      name: \`\${student.firstName} \${student.lastName}\`,
                                    })
                                  }
                                  className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors"
                                  title="ลบนักเรียน"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>`;

  const newContent = content.substring(0, startIndex) + replacementContent + content.substring(endIndex + endIndexStr.length);
  fs.writeFileSync(file, newContent);
  console.log("Successfully replaced!");
} else {
  console.error("Target block not found. startIndex:", startIndex, "endIndex:", endIndex);
}
