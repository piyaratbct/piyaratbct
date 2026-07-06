import re

with open('src/components/AcademicModule.tsx', 'r') as f:
    content = f.read()

target = """      {/* Tabs */}
      <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-100 overflow-x-auto custom-scrollbar">"""

replacement = """      {/* Tabs */}
      <div className="grid grid-cols-2 md:flex md:flex-wrap bg-white rounded-xl p-1 shadow-sm border border-slate-100 custom-scrollbar gap-1">"""

if target in content:
    content = content.replace(target, replacement)
    print("Patched AcademicModule tabs")
else:
    print("AcademicModule tabs target not found")

with open('src/components/AcademicModule.tsx', 'w') as f:
    f.write(content)
