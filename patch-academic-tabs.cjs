const fs = require('fs');
let content = fs.readFileSync('src/components/AcademicModule.tsx', 'utf8');

// 1. Add import
if (!content.includes('SubjectAggregationManager')) {
  content = content.replace("import { AcademicSettings } from './AcademicSettings';", "import { AcademicSettings } from './AcademicSettings';\nimport { SubjectAggregationManager } from './SubjectAggregationManager';");
}

// 2. Add type to activeTab state
const stateRegex = /useState<"calendar" \| "settings" \| "staff" \| "schedule" \| "promotion" \| "curriculum" \| "eportfolio" \| "classrooms">/;
content = content.replace(stateRegex, 'useState<"calendar" | "settings" | "staff" | "schedule" | "promotion" | "curriculum" | "eportfolio" | "classrooms" | "aggregation">');

// 3. Add tab button
const settingsTabHtml = `        <button
          onClick={() => setActiveTab("settings")}
          className={\`flex-none flex flex-row items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap \${
            activeTab === "settings"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50"
          }\`}
        >
          <Settings className="h-4 w-4" /> ตั้งค่าระบบ
        </button>`;

const newAggregationTabHtml = `        <button
          onClick={() => setActiveTab("aggregation")}
          className={\`flex-none flex flex-row items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap \${
            activeTab === "aggregation"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50"
          }\`}
        >
          <Calculator className="h-4 w-4" /> ประมวลผลวิชารวม
        </button>
        
        <button
          onClick={() => setActiveTab("settings")}
          className={\`flex-none flex flex-row items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap \${
            activeTab === "settings"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50"
          }\`}
        >
          <Settings className="h-4 w-4" /> ตั้งค่าระบบ
        </button>`;

content = content.replace(settingsTabHtml, newAggregationTabHtml);

// 4. Add Calculator to lucide-react imports if not there
if (!content.includes('Calculator,') && !content.includes(', Calculator')) {
  content = content.replace('CalendarIcon,', 'CalendarIcon, Calculator,');
}

// 5. Add rendering component
const renderSettings = `{activeTab === "settings" && (
        <AcademicSettings 
          systemSemester={systemSemester}
          systemAcademicYear={systemAcademicYear}
        />
      )}`;

const renderAggregation = `{activeTab === "aggregation" && (
        <SubjectAggregationManager 
          systemSemester={systemSemester}
          systemAcademicYear={systemAcademicYear}
          students={students}
        />
      )}
      
      {activeTab === "settings" && (
        <AcademicSettings 
          systemSemester={systemSemester}
          systemAcademicYear={systemAcademicYear}
        />
      )}`;

content = content.replace(renderSettings, renderAggregation);

fs.writeFileSync('src/components/AcademicModule.tsx', content);
console.log("Patched AcademicModule tabs");
