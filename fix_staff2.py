import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_bad = """                  const isEditing = editingId === teacher.id;
                     
                  const canView = currentTeacher.role === "admin" || currentTeacher.role === "academic" || currentTeacher.role === "deputy";

  if (!canView) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center max-w-2xl mx-auto mt-12">
        <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
        <p className="text-slate-500 mb-6">คุณไม่มีสิทธิ์ในการเข้าถึงระบบจัดการบุคลากร (เฉพาะผู้ดูแลระบบ, รองผู้อำนวยการ, และฝ่ายวิชาการเท่านั้น)</p>
      </div>
    );
  }

  return ("""

    new_good = """                  const isEditing = editingId === teacher.id;
                  return ("""

    if old_bad in code:
        code = code.replace(old_bad, new_good)
        with open(filename, 'w') as f:
            f.write(code)
        print("Fixed map logic in StaffManager")
    else:
        print("Not found")

fix('src/components/StaffManager.tsx')
