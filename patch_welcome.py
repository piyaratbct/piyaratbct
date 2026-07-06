import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-sky-500/10 to-pink-500/10 border border-sky-200/55 rounded-full text-slate-700 shadow-3xs">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              <span className="text-sm sm:text-base font-black tracking-wide text-indigo-950 font-sans">
                LessonLog - ระบบสารสนเทศเพื่อการจัดการสถานศึกษา
              </span>
            </div>"""

replacement = """            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-sky-500/10 to-pink-500/10 border border-sky-200/55 rounded-full text-slate-700 shadow-3xs max-w-full overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shrink-0"></span>
              <span className="text-xs sm:text-base font-black tracking-wide text-indigo-950 font-sans truncate">
                LessonLog <span className="hidden sm:inline">- ระบบสารสนเทศเพื่อการจัดการสถานศึกษา</span>
              </span>
            </div>"""

if target in content:
    content = content.replace(target, replacement)
    print("Patched welcome card")
else:
    print("Welcome card target not found")

with open('src/App.tsx', 'w') as f:
    f.write(content)
