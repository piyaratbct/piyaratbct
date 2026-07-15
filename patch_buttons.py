import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """                  <button
                    onClick={() => setShowImport(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4" /> นำเข้าข้อมูล
                    (Excel/CSV)
                  </button>
                  {currentTeacher?.role === 'admin' && (
                    <button
                      onClick={() => setShowBatchPromotion(true)}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                      <GraduationCap className="h-4 w-4" /> เลื่อนชั้นแบบกลุ่ม
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingStudent(null);
                      setShowStudentModal(true);
                    }}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" /> เพิ่มนักเรียน
                  </button>"""

replacement = """                  {GRADE_LEVELS.includes(selectedGrade) && (
                    <>
                      <button
                        onClick={() => setShowImport(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                      >
                        <FileSpreadsheet className="h-4 w-4" /> นำเข้าข้อมูล
                        (Excel/CSV)
                      </button>
                      {currentTeacher?.role === 'admin' && (
                        <button
                          onClick={() => setShowBatchPromotion(true)}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                        >
                          <GraduationCap className="h-4 w-4" /> เลื่อนชั้นแบบกลุ่ม
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingStudent(null);
                          setShowStudentModal(true);
                        }}
                        className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                      >
                        <UserPlus className="h-4 w-4" /> เพิ่มนักเรียน
                      </button>
                    </>
                  )}"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
