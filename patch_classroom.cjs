const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

// 1. Update useState
content = content.replace(
  /const \[activeTab, setActiveTab\] = useState<"students" \| "attendance" \| "assessments" \| "special-care" \| "health-report">/g,
  'const [activeTab, setActiveTab] = useState<"students" | "student360" | "attendance" | "assessments" | "special-care" | "health-report">'
);

// 2. Add import
if (!content.includes('import { Student360 }')) {
  content = content.replace(
    'import { StudentDetailModal } from "./StudentDetailModal";',
    'import { StudentDetailModal } from "./StudentDetailModal";\nimport { Student360 } from "./Student360";'
  );
}

// 3. Add tab button (after "ฐานข้อมูลนักเรียน")
const tabButtonCode = `
            <button
              onClick={() => setActiveTab("student360")}
              className={\`flex-1 min-w-[90px] flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-sm font-bold transition-all \${
                activeTab === "student360"
                  ? "bg-sky-100 text-sky-700"
                  : "text-slate-500 hover:bg-slate-50"
              }\`}
            >
              <UserPlus className="h-4 w-4 shrink-0" /> 
              <span className="whitespace-nowrap">Student 360°</span>
            </button>
`;
const searchTab = `<span className="whitespace-nowrap">ฐานข้อมูลนักเรียน</span>
            </button>`;
if (content.includes(searchTab) && !content.includes('activeTab === "student360"')) {
  content = content.replace(searchTab, searchTab + tabButtonCode);
}

// 4. Add rendering section
const renderCode = `
          {activeTab === "student360" && (
            <div className="p-6">
              <Student360 />
            </div>
          )}
`;
const searchRender = `{activeTab === "students" && (`;
if (content.includes(searchRender) && !content.includes('<Student360 />')) {
  content = content.replace(searchRender, renderCode + searchRender);
}

fs.writeFileSync('src/components/ClassroomModule.tsx', content, 'utf8');
console.log('ClassroomModule patched');
