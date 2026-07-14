import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target_academic_button = """          {(currentTeacher.role === "admin" || currentTeacher.role === "academic") && (
            <button
              onClick={() => setActiveModule("academic")}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 ${
                activeModule === "academic"
                  ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <BookOpen className="h-4.5 w-4.5" />
              <span>4. การบริหาร<br />งานวิชาการ (LessonAcad)</span>
            </button>
          )}"""

replacement_academic_button = """          <button
            onClick={() => setActiveModule("academic")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 ${
              activeModule === "academic"
                ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <BookOpen className="h-4.5 w-4.5" />
            <span>4. การบริหาร<br />งานวิชาการ (LessonAcad)</span>
          </button>"""

content = content.replace(target_academic_button, replacement_academic_button)

target_dashboard_button = """              {(currentTeacher.role === "admin" || currentTeacher.role === "academic") && (
                <button
                  onClick={() => setActiveModule("academic")}
                  className="bg-white p-8 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300 hover:-translate-y-1 transition-all text-left flex flex-col items-center text-center group relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-indigo-500">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-2">
                    4. การบริหาร<br />งานวิชาการ (LessonAcad)
                  </h3>
                  <p className="text-sm text-slate-500">
                    บันทึกตารางสอน ปฏิทินกิจกรรม และตั้งค่าวันเรียน
                  </p>
                  <div className="mt-4 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
                    เปิดใช้งาน
                  </div>
                </button>
              )}"""

replacement_dashboard_button = """              <button
                onClick={() => setActiveModule("academic")}
                className="bg-white p-8 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300 hover:-translate-y-1 transition-all text-left flex flex-col items-center text-center group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-indigo-500">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2">
                  4. การบริหาร<br />งานวิชาการ (LessonAcad)
                </h3>
                <p className="text-sm text-slate-500">
                  ดูตารางสอน ปฏิทินกิจกรรม และการตั้งค่าวิชาการ
                </p>
                <div className="mt-4 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
                  เปิดใช้งาน
                </div>
              </button>"""

content = content.replace(target_dashboard_button, replacement_dashboard_button)

target_app_academic = """        ) : activeModule === "academic" ? (
          <div className="relative animate-in fade-in duration-300">
            {(currentTeacher.role === 'teacher' || currentTeacher.role === 'academic') && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-2xl min-h-[60vh]">
                <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center text-center max-w-sm border border-slate-100 animate-in zoom-in-95 duration-300">
                  <div className="h-16 w-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
                    <Wrench className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">
                    ปิดปรับปรุงชั่วคราว
                  </h3>
                  <p className="text-slate-500 mt-2">
                    ระบบงานวิชาการกำลังอยู่ระหว่างการพัฒนา<br />
                    กรุณากลับมาใช้งานใหม่ในภายหลัง
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

replacement_app_academic = """        ) : activeModule === "academic" ? (
          <div className="relative animate-in fade-in duration-300">
            <AcademicModule
              currentTeacher={currentTeacher}
              systemAcademicYear={systemAcademicYear}
              systemSemester={systemSemester}
            />
          </div>"""
content = content.replace(target_app_academic, replacement_app_academic)

with open('src/App.tsx', 'w') as f:
    f.write(content)
