import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black text-slate-800 tracking-tight font-sans">
                    LessonLog - ระบบสารสนเทศเพื่อการจัดการสถานศึกษา
                  </span>"""

replacement = """                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm sm:text-base font-black text-slate-800 tracking-tight font-sans">
                    LessonLog <span className="hidden sm:inline">- ระบบสารสนเทศเพื่อการจัดการสถานศึกษา</span>
                  </span>"""

if target in content:
    content = content.replace(target, replacement)
    print("Patched header")
else:
    print("Target not found")

with open('src/App.tsx', 'w') as f:
    f.write(content)
