import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """        {studentToDelete && ("""

replacement = """        {showDeleteAllConfirm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-rose-600" />
              </div>
              <h3 className="font-black text-slate-800 text-lg mb-2">
                ยืนยันการลบนักเรียนทั้งหมด
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                คุณต้องการลบข้อมูลนักเรียนทั้งหมดใน "{selectedGrade}" ใช่หรือไม่?<br/>
                มีนักเรียนทั้งหมด {students.filter(s => s.gradeLevel === selectedGrade).length} คน<br/>
                <span className="text-rose-600 font-bold mt-2 block">การดำเนินการนี้ไม่สามารถกู้คืนได้!</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteAllConfirm(false)}
                  disabled={isDeletingAll}
                  className="flex-1 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleDeleteAllStudents}
                  disabled={isDeletingAll}
                  className="flex-1 py-2 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isDeletingAll ? 'กำลังลบ...' : 'ลบข้อมูลทั้งหมด'}
                </button>
              </div>
            </div>
          </div>
        )}

        {studentToDelete && ("""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
