import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """              {currentTeacher.role === "admin" && (
                <button
                  onClick={() => setActiveModule("admin" as any)}"""

replacement = """              <button
                onClick={() => setActiveModule("discipline")}
                className="bg-white p-8 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md hover:border-rose-300 hover:-translate-y-1 transition-all text-left flex flex-col items-center text-center group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2">
                  5. การบริหารงานปกครอง (LessonDiscipline)
                </h3>
                <p className="text-sm text-slate-500">
                  บันทึกเหตุการณ์ ทะเลาะวิวาท อุบัติเหตุ และความประพฤติ
                </p>
                <div className="mt-4 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                  เปิดใช้งาน
                </div>
              </button>
              {currentTeacher.role === "admin" && (
                <button
                  onClick={() => setActiveModule("admin" as any)}"""

if target in content:
    content = content.replace(target, replacement)
    print("Replaced module card successfully")
else:
    print("Target module card not found")
    
with open('src/App.tsx', 'w') as f:
    f.write(content)
