import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    old_bad_logic = """      fetched.sort((a, b) => {
        const roleWeight = { admin: 1, deputy: 2, academic: 3, discipline: 4, teacher: 5, staff: 6 } as any;
        const wA = roleWeight[a.role || 'teacher'] || 99;
        const wB = roleWeight[b.role || 'teacher'] || 99;
        if (wA !== wB) return wA - wB;
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

  return (a.thaiName || "").localeCompare(b.thaiName || "");
      });
      setTeachers(fetched);
      setLoading(false);
    });
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

  return () => unsub();"""

    new_good_logic = """      fetched.sort((a, b) => {
        const roleWeight = { admin: 1, deputy: 2, academic: 3, discipline: 4, teacher: 5, staff: 6 } as any;
        const wA = roleWeight[a.role || 'teacher'] || 99;
        const wB = roleWeight[b.role || 'teacher'] || 99;
        if (wA !== wB) return wA - wB;
        return (a.thaiName || "").localeCompare(b.thaiName || "");
      });
      setTeachers(fetched);
      setLoading(false);
    });

    return () => unsub();"""

    if old_bad_logic in code:
        code = code.replace(old_bad_logic, new_good_logic)
        with open(filename, 'w') as f:
            f.write(code)
        print("Fixed StaffManager logic")
    else:
        print("Old bad logic not found in StaffManager")

fix('src/components/StaffManager.tsx')
