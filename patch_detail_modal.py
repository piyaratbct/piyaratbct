import re

with open('src/components/StudentDetailModal.tsx', 'r') as f:
    content = f.read()

target = """          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-bold">วันเกิด</span>
              </div>
              <p className="font-semibold text-slate-800">{formatThaiDate(student.dob)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <User className="h-4 w-4" />
                <span className="text-xs font-bold">สถานภาพครอบครัว</span>
              </div>"""

replacement = """          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 md:col-span-2">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <User className="h-4 w-4" />
                <span className="text-xs font-bold">เลขประจำตัวประชาชน</span>
              </div>
              <p className="font-semibold text-slate-800 font-mono">{student.nationalId || '-'}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-bold">วันเกิด</span>
              </div>
              <p className="font-semibold text-slate-800">{formatThaiDate(student.dob)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <User className="h-4 w-4" />
                <span className="text-xs font-bold">สถานภาพครอบครัว</span>
              </div>"""

content = content.replace(target, replacement)

with open('src/components/StudentDetailModal.tsx', 'w') as f:
    f.write(content)
