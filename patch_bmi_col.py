import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """                              <td className="px-4 py-2 border-r border-slate-200">
                                <div className="font-bold text-slate-800">{student.firstName} {student.lastName}</div>
                                <div className="text-xs text-slate-500 font-mono">{student.studentId}</div>
                              </td>"""

replacement = """                              <td className="px-4 py-2 border-r border-slate-200">
                                <div className="font-bold text-slate-800">{student.firstName} {student.lastName}</div>
                                <div className="text-xs text-slate-500 font-mono">{student.studentId}</div>
                              </td>
                              <td className="px-4 py-2 text-center text-sm font-medium text-slate-600 border-r border-slate-200">
                                {student.dob ? ageYears : '-'}
                              </td>"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
