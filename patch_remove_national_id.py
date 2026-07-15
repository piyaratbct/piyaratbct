import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target1 = """                      <th className="px-4 py-3 text-center">ระดับชั้น</th>
                      <th className="px-4 py-3 text-center">เลขประจำตัวประชาชน</th>
                      <th className="px-4 py-3">ชื่อ-นามสกุล</th>"""

replacement1 = """                      <th className="px-4 py-3 text-center">ระดับชั้น</th>
                      <th className="px-4 py-3">ชื่อ-นามสกุล</th>"""

content = content.replace(target1, replacement1)

target3 = """                        <td
                          colSpan={8}
                          className="text-center py-8 text-slate-500"
                        >"""

replacement3 = """                        <td
                          colSpan={7}
                          className="text-center py-8 text-slate-500"
                        >"""

content = content.replace(target3, replacement3)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
