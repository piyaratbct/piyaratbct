const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

// Replace the two tab buttons with one
const oldButtons = `<button
              onClick={() => setActiveTab("special-care")}
              className={\`flex-1 min-w-[90px] flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-sm font-bold transition-all \${
                activeTab === "special-care"
                  ? "bg-pink-100 text-pink-700"
                  : "text-slate-500 hover:bg-slate-50"
              }\`}
            >
              <HeartPulse className="h-4 w-4 shrink-0" /> 
              <span className="whitespace-nowrap">ข้อมูลสุขภาพ</span>
            </button>
            <button
              onClick={() => setActiveTab("health-report")}
              className={\`flex-1 min-w-[90px] flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-sm font-bold transition-all \${
                activeTab === "health-report"
                  ? "bg-pink-100 text-pink-700"
                  : "text-slate-500 hover:bg-slate-50"
              }\`}
            >
              <FileSpreadsheet className="h-4 w-4 shrink-0" /> 
              <span className="whitespace-nowrap">พัฒนาการร่างกาย</span>
            </button>`;

const newButton = `<button
              onClick={() => setActiveTab("health")}
              className={\`flex-1 min-w-[90px] flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-sm font-bold transition-all \${
                activeTab === "health"
                  ? "bg-pink-100 text-pink-700"
                  : "text-slate-500 hover:bg-slate-50"
              }\`}
            >
              <HeartPulse className="h-4 w-4 shrink-0" /> 
              <span className="whitespace-nowrap">สุขภาพ & พัฒนาการ</span>
            </button>`;

content = content.replace(oldButtons, newButton);

// Update opacity transition condition
const oldOpacity = `activeTab === 'assessments' || activeTab === 'health-report'`;
const newOpacity = `activeTab === 'assessments' || activeTab === 'health'`;
content = content.replace(oldOpacity, newOpacity);

const oldCondition = `selectedMonth && activeTab === 'health-report'`;
const newCondition = `selectedMonth && activeTab === 'health'`;
content = content.replace(oldCondition, newCondition);

fs.writeFileSync('src/components/ClassroomModule.tsx', content, 'utf8');
console.log('Tab buttons patched');
