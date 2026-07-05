import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target1 = '''                    <tr>
                      <th className="px-4 py-3 text-center">เลขที่</th>
                      <th className="px-4 py-3">รหัสนักเรียน</th>
                      <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                      <th className="px-4 py-3 text-center">เพศ</th>
                      <th className="px-4 py-3 text-center">สถานะ</th>
                      <th className="px-4 py-3 text-right">จัดการ</th>
                    </tr>'''
replacement1 = '''                    <tr>
                      <th className="px-4 py-3 text-center">เลขที่</th>
                      <th className="px-4 py-3 text-center">ระดับชั้น</th>
                      <th className="px-4 py-3">รหัสนักเรียน</th>
                      <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                      <th className="px-4 py-3 text-center">เพศ</th>
                      <th className="px-4 py-3 text-center">สถานะ</th>
                      <th className="px-4 py-3 text-right">จัดการ</th>
                    </tr>'''
content = content.replace(target1, replacement1)

target2 = '''                        <tr
                          key={student.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 text-center font-medium">
                            {student.number}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500">
                            {student.studentId}
                          </td>'''
replacement2 = '''                        <tr
                          key={student.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 text-center font-medium">
                            {student.number}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-slate-700">
                            {student.gradeLevel || '-'}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500">
                            {student.studentId}
                          </td>'''
content = content.replace(target2, replacement2)

# Also update the colspan from 6 to 7
target3 = '''                        <td
                          colSpan={6}
                          className="text-center py-8 text-slate-500"
                        >
                          ไม่พบข้อมูลนักเรียน'''
replacement3 = '''                        <td
                          colSpan={7}
                          className="text-center py-8 text-slate-500"
                        >
                          ไม่พบข้อมูลนักเรียน'''
content = content.replace(target3, replacement3)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
