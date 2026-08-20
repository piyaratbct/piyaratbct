const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const searchTopNav = `          <button
            onClick={() => setActiveModule("admission")}
            className={\`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 min-w-0 \${
              activeModule === "admission"
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }\`}
          >
            <UserPlus className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight min-w-0 w-full overflow-hidden">
              <span className="text-center sm:text-left leading-snug truncate w-full">6. รับสมัครนักเรียน</span>
              <span className="text-xs font-semibold opacity-90">(LessonAdmit)</span>
            </div>
          </button>`;

const replacementTopNav = `          {(currentTeacher.role === "admin" || currentTeacher.role === "staff") && (
            <button
              onClick={() => setActiveModule("admission")}
              className={\`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 min-w-0 \${
                activeModule === "admission"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }\`}
            >
              <UserPlus className="h-4.5 w-4.5 shrink-0" />
              <div className="flex flex-col items-center sm:items-start leading-tight min-w-0 w-full overflow-hidden">
                <span className="text-center sm:text-left leading-snug truncate w-full">6. รับสมัครนักเรียน</span>
                <span className="text-xs font-semibold opacity-90">(LessonAdmit)</span>
              </div>
            </button>
          )}`;

const searchDashboard = `              <button
                onClick={() => setActiveModule("admission")}
                className="bg-white p-8 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300 hover:-translate-y-1 transition-all text-left flex flex-col items-center text-center group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="h-16 w-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UserPlus className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2 leading-snug">
                  <span className="block text-center sm:text-left text-base sm:text-lg leading-snug">6. รับสมัครนักเรียน</span>
                  <span className="block text-sm text-slate-500 font-bold mt-0.5">(LessonAdmit)</span>
                </h3>
                <p className="text-sm text-slate-500">
                  ระบบรับสมัครเรียน เลื่อนชั้น และจบการศึกษา
                </p>
                <div className="mt-4 px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 text-xs font-bold rounded-full flex items-center gap-1">
                  <Wrench className="h-3 w-3" /> ปิดปรับปรุงฟังก์ชัน
                </div>
              </button>`;

const replacementDashboard = `              {(currentTeacher.role === "admin" || currentTeacher.role === "staff") && (
                <button
                  onClick={() => setActiveModule("admission")}
                  className="bg-white p-8 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300 hover:-translate-y-1 transition-all text-left flex flex-col items-center text-center group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="h-16 w-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UserPlus className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-2 leading-snug">
                    <span className="block text-center sm:text-left text-base sm:text-lg leading-snug">6. รับสมัครนักเรียน</span>
                    <span className="block text-sm text-slate-500 font-bold mt-0.5">(LessonAdmit)</span>
                  </h3>
                  <p className="text-sm text-slate-500">
                    ระบบรับสมัครเรียน เลื่อนชั้น และจบการศึกษา
                  </p>
                  <div className="mt-4 px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 text-xs font-bold rounded-full flex items-center gap-1">
                    <Wrench className="h-3 w-3" /> ปิดปรับปรุงฟังก์ชัน
                  </div>
                </button>
              )}`;

if (content.includes(searchTopNav)) {
    content = content.replace(searchTopNav, replacementTopNav);
    console.log("Top nav patched.");
}
if (content.includes(searchDashboard)) {
    content = content.replace(searchDashboard, replacementDashboard);
    console.log("Dashboard patched.");
}

fs.writeFileSync('src/App.tsx', content);
