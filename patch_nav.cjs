const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const navCode = `
          <button
            onClick={() => setActiveModule("student360")}
            className={\`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all lg:min-w-[200px] flex-1 \${
              activeModule === "student360"
                ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }\`}
          >
            <User className="h-4.5 w-4.5 shrink-0" />
            <div className="flex flex-col items-center sm:items-start leading-tight">
              <span className="whitespace-nowrap">7. ข้อมูลนักเรียนรอบด้าน</span>
              <span className="text-xs font-semibold opacity-90">(Student 360°)</span>
            </div>
          </button>
`;

const insertAfter = `(LessonAdmit)</span>
            </div>
          </button>`;

if (content.includes(insertAfter)) {
  const newContent = content.replace(insertAfter, insertAfter + navCode);
  fs.writeFileSync('src/App.tsx', newContent, 'utf8');
  console.log('Nav patched');
} else {
  console.log('Target not found');
}
