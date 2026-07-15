import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target1 = """                          <th rowSpan={2} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center border-r border-slate-200">เลขที่</th>
                          <th rowSpan={2} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase border-r border-slate-200">ชื่อ-สกุล</th>"""

replacement1 = """                          <th rowSpan={2} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center border-r border-slate-200">เลขที่</th>
                          <th rowSpan={2} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase border-r border-slate-200">ชื่อ-สกุล</th>
                          <th rowSpan={2} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center border-r border-slate-200">อายุ (ปี)</th>"""

content = content.replace(target1, replacement1)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
