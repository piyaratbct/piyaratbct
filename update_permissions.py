import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# Add isStudentManager
is_sm_code = "  const isStudentManager = currentTeacher?.role && ['admin', 'academic', 'deputy', 'discipline'].includes(currentTeacher.role);\n\n  useEffect(() => {"
content = content.replace("  useEffect(() => {", is_sm_code, 1)

# Now apply permissions to buttons.
import_btn_block = """                      <button
                        onClick={() => setShowImport(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                      >
                        <FileSpreadsheet className="h-4 w-4" /> นำเข้าข้อมูล
                        (Excel/CSV)
                      </button>"""

if import_btn_block in content:
    content = content.replace(import_btn_block, "{isStudentManager && (" + import_btn_block + ")}")
else:
    print("Could not find import button block")

# Delete all & add student buttons
del_add_block = """                      <button
                        onClick={() => setShowDeleteAllConfirm(true)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
                      >
                        <Trash2 className="h-4 w-4" /> ลบทั้งหมด
                      </button>
                      <button
                        onClick={() => {
                          setEditingStudent(null);
                          setShowStudentModal(true);
                        }}
                        className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
                      >
                        <UserPlus className="h-4 w-4" /> เพิ่มนักเรียน
                      </button>"""
if del_add_block in content:
    content = content.replace(del_add_block, "{isStudentManager && (\n                        <>\n" + del_add_block + "\n                        </>\n                      )}")
else:
    print("Could not find del_add block")

# Edit and Delete buttons on each student row
edit_del_row = """                              <button
                                onClick={() => {
                                  setEditingStudent(student);
                                  setShowStudentModal(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                title="แก้ไขข้อมูล"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setStudentToDelete({
                                    id: student.id,
                                    name: `${student.firstName} ${student.lastName}`,
                                  })
                                }
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="ลบนักเรียน"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>"""
if edit_del_row in content:
    content = content.replace(edit_del_row, "{isStudentManager && (\n                                <>\n" + edit_del_row + "\n                                </>\n                              )}")
else:
    print("Could not find edit_del_row")

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
