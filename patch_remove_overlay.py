import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """        ) : activeModule === "academic" ? (
          <div className="relative animate-in fade-in duration-300">
            {currentTeacher.role === 'teacher' && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-2xl min-h-[60vh]">
                <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center text-center max-w-sm border border-slate-100 animate-in zoom-in-95 duration-300">
                  <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">
                    สงวนสิทธิ์การเข้าถึงข้อมูล
                  </h3>
                  <p className="text-slate-500 mt-2 text-sm font-medium">
                    เฉพาะเจ้าหน้าที่วิชาการและผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเข้าถึงการบริหารงานวิชาการได้
                  </p>
                  <button
                    onClick={() => setActiveModule("home")}
                    className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-bold shadow-sm transition-colors"
                  >
                    กลับสู่หน้าหลัก
                  </button>
                </div>
              </div>
            )}
            <AcademicModule
              currentTeacher={currentTeacher}
              systemAcademicYear={systemAcademicYear}
              systemSemester={systemSemester}
            />
          </div>"""

replacement = """        ) : activeModule === "academic" ? (
          <div className="relative animate-in fade-in duration-300">
            <AcademicModule
              currentTeacher={currentTeacher}
              systemAcademicYear={systemAcademicYear}
              systemSemester={systemSemester}
            />
          </div>"""
content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
