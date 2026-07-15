import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """                      <button
                        onClick={() => {
                          setEditingStudent(null);
                          setShowStudentModal(true);
                        }}
                        className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                      >
                        <UserPlus className="h-4 w-4" /> เพิ่มนักเรียน
                      </button>"""

replacement = """                      <button
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

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
