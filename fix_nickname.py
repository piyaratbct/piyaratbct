import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """                                <td className="px-4 py-3 text-center">
                                  {student.nickname ? (
                                    <span className="bg-sky-50 text-sky-700 px-2 py-1 rounded-md text-xs font-bold border border-sky-100">
                                      {student.nickname}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>"""

replacement = """                                <td className="px-4 py-3 text-center whitespace-nowrap">
                                  {student.nickname ? (
                                    <span className="bg-sky-50 text-sky-700 px-2 py-1 rounded-md text-xs font-bold border border-sky-100 whitespace-nowrap">
                                      {student.nickname}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
