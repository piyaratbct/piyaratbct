const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const missingCode = `              <button 
                onClick={() => setShowProfileModal(true)}
                className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 hover:bg-slate-100 transition-colors"
              >
                <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {currentTeacher.thaiName.charAt(0)}
                </div>
                <span className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{currentTeacher.thaiName}</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 px-3 py-2 rounded-xl transition-all border border-rose-100 shadow-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-bold">ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Page Layout Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex-1 space-y-6 print:m-0 print:p-0">
        {/* Module Selector */}
        <div className="grid grid-cols-2 lg:flex lg:flex-wrap bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 print:hidden gap-1.5">
          <button
            onClick={() => setActiveModule("home")}
            className={\`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 \${
              activeModule === "home"
                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }\`}
          >
            <LayoutDashboard className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight">
              <span className="whitespace-nowrap">หน้าแรก</span>
              <span className="text-xs font-semibold opacity-90">(Overview)</span>
            </div>
          </button>
          <button
            onClick={() => setActiveModule("teaching")}
            className={\`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 \${
              activeModule === "teaching"
                ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }\`}
          >
            <Presentation className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight">
              <span className="whitespace-nowrap">1. การจัดการผู้สอน</span>
              <span className="text-xs font-semibold opacity-90">(LessonTeach)</span>
            </div>
          </button>
          <button
            onClick={() => setActiveModule("classroom")}
            className={\`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 \${
              activeModule === "classroom"
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }\`}
          >
            <Users className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight">
              <span className="whitespace-nowrap">2. การจัดการชั้นเรียน</span>
              <span className="text-xs font-semibold opacity-90">(LessonClass)</span>
            </div>
          </button>
          <button
            onClick={() => setActiveModule("analytics")}
            className={\`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 \${
              activeModule === "analytics"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }\`}
          >
            <BarChart3 className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight">
              <span className="whitespace-nowrap">3. การวัดและประเมินผลผู้เรียน</span>
              <span className="text-xs font-semibold opacity-90">(LessonAchieve)</span>
            </div>
          </button>
          <button
            onClick={() => setActiveModule("academic")}
            className={\`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 \${
              activeModule === "academic"
                ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }\`}
          >
            <BookOpen className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight">
              <span className="whitespace-nowrap">4. การบริหารงานวิชาการ</span>
              <span className="text-xs font-semibold opacity-90">(LessonAcad)</span>
            </div>
          </button>
          <button
            onClick={() => setActiveModule("discipline")}
            className={\`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 \${
              activeModule === "discipline"
                ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }\`}
          >
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight">
              <span className="whitespace-nowrap">5. การบริหารงานปกครอง</span>
              <span className="text-xs font-semibold opacity-90">(LessonDiscipline)</span>
            </div>
          </button>
          <button
            onClick={() => setActiveModule("admission")}
            className={\`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 \${
              activeModule === "admission"
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }\`}
          >
            <UserPlus className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight">
              <span className="whitespace-nowrap">6. การรับสมัครนักเรียน</span>
              <span className="text-xs font-semibold opacity-90">(LessonAdmit)</span>
            </div>
          </button>
`;

const lines = content.split('\n');
const insertIndex = lines.findIndex(line => line.includes('{(currentTeacher.role === "admin" || currentTeacher.role === "staff") && ('));

if (insertIndex !== -1) {
  lines.splice(insertIndex, 0, missingCode);
  fs.writeFileSync('src/App.tsx', lines.join('\n'), 'utf8');
  console.log('App.tsx restored successfully by index');
} else {
  console.log('Could not find target to replace');
}
