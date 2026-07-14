import re

with open('src/components/ScheduleManager.tsx', 'r') as f:
    content = f.read()

target = """<th className="p-3 text-left font-bold text-slate-700 text-sm border-r border-slate-200 w-32">วัน / คาบ</th>"""
replacement = """<th className="p-3 text-center font-bold text-slate-700 text-sm border-r border-slate-200 w-32">วัน</th>"""
content = content.replace(target, replacement)

target2 = """                        <td className="p-3 font-bold text-slate-800 border-r border-slate-200 bg-slate-50">
                          วัน{daysOfWeek[day]}
                        </td>"""
replacement2 = """                        <td className="p-3 font-bold text-slate-800 border-r border-slate-200 bg-slate-50 text-center">
                          {daysOfWeek[day]}
                        </td>"""
content = content.replace(target2, replacement2)

with open('src/components/ScheduleManager.tsx', 'w') as f:
    f.write(content)

