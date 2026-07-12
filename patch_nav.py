import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """          {currentTeacher.role === "admin" && (
            <button
              onClick={() => setActiveModule("admin" as any)}"""

replacement = """          <button
            onClick={() => setActiveModule("discipline")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 ${
              activeModule === "discipline"
                ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <ShieldAlert className="h-4.5 w-4.5" />
            <span>5. การบริหารงาน<br />ปกครอง (Discipline)</span>
          </button>
          
          {currentTeacher.role === "admin" && (
            <button
              onClick={() => setActiveModule("admin" as any)}"""

if target in content:
    content = content.replace(target, replacement)
    print("Replaced nav successfully")
else:
    print("Target nav not found")
    
with open('src/App.tsx', 'w') as f:
    f.write(content)
