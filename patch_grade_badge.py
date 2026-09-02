import re

with open('src/components/Student360.tsx', 'r') as f:
    code = f.read()

target = """                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-black text-slate-800 leading-tight">
                      {student.firstName} {student.lastName}
                    </h2>
                    <p className="text-sm font-bold text-indigo-600 mt-0.5">ชื่อเล่น: {student.nickname}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold whitespace-nowrap">
                    {student.grade}
                  </span>
                </div>"""

replacement = """                <div className="flex flex-col items-start gap-1">
                  <h2 className="text-lg font-black text-slate-800 leading-tight">
                    {student.firstName} {student.lastName}
                  </h2>
                  <p className="text-sm font-bold text-indigo-600">ชื่อเล่น: {student.nickname}</p>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold whitespace-nowrap mt-1">
                    ชั้น {student.grade}
                  </span>
                </div>"""

code = code.replace(target, replacement)

with open('src/components/Student360.tsx', 'w') as f:
    f.write(code)

print("Grade badge moved")
