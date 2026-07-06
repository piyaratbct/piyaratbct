import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """          <div className="flex flex-wrap sm:flex-nowrap bg-white rounded-xl p-1 shadow-sm border border-slate-100 w-full xl:w-auto xl:shrink-0 overflow-x-auto custom-scrollbar">"""

replacement = """          <div className="grid grid-cols-2 md:flex md:flex-wrap bg-white rounded-xl p-1 shadow-sm border border-slate-100 w-full xl:w-auto xl:shrink-0 custom-scrollbar gap-1">"""

if target in content:
    content = content.replace(target, replacement)
    print("Patched ClassroomModule tabs")
else:
    print("ClassroomModule tabs target not found")

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
