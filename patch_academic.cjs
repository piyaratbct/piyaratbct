const fs = require('fs');
let code = fs.readFileSync('src/components/AcademicModule.tsx', 'utf8');

// Add new imports
const importStatement = `import { CurriculumManager } from "./CurriculumManager";\nimport { GradingManager } from "./GradingManager";\nimport { FileSpreadsheet, FileText } from "lucide-react";\n`;
if (!code.includes('CurriculumManager')) {
  code = code.replace('import { LearningHoursReport } from "./LearningHoursReport";', 'import { LearningHoursReport } from "./LearningHoursReport";\n' + importStatement);
}

// Update state type
code = code.replace(
  `useState<"calendar" | "settings" | "staff" | "schedule" | "promotion" | "learning_hours">("calendar");`,
  `useState<"calendar" | "settings" | "staff" | "schedule" | "promotion" | "learning_hours" | "curriculum" | "grading" | "lesson_plan">("calendar");`
);

// Add buttons to tabs
const newButtons = `
        <button
          onClick={() => setActiveTab("curriculum")}
          className={\`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all min-w-[150px] \${
            activeTab === "curriculum"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50"
          }\`}
        >
          <BookOpen className="h-4 w-4" /> จัดการหลักสูตร
        </button>
        <button
          onClick={() => setActiveTab("grading")}
          className={\`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all min-w-[150px] \${
            activeTab === "grading"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50"
          }\`}
        >
          <FileSpreadsheet className="h-4 w-4" /> ระบบ ปพ.5
        </button>
        <button
          onClick={() => setActiveTab("lesson_plan")}
          className={\`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all min-w-[150px] \${
            activeTab === "lesson_plan"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50"
          }\`}
        >
          <FileText className="h-4 w-4" /> ระบบแผนการสอน
        </button>
`;

if (!code.includes('setActiveTab("curriculum")')) {
  code = code.replace(
    `        <button\n          onClick={() => setActiveTab("learning_hours")}`,
    newButtons + `        <button\n          onClick={() => setActiveTab("learning_hours")}`
  );
}

// Add content wrappers
const newContent = `
      {activeTab === "curriculum" && (
        <CurriculumManager />
      )}

      {activeTab === "grading" && (
        <GradingManager />
      )}

      {activeTab === "lesson_plan" && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[40vh] text-center">
          <div className="h-20 w-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-2">ระบบแผนการสอน (ส่วนกลาง)</h3>
          <p className="text-slate-500 max-w-md">
            ตรวจสอบและจัดการแผนการสอนของบุคลากรในโรงเรียน 
            (การสร้างและจัดการแผนการสอนส่วนบุคคลสามารถเข้าถึงได้จากเมนู "1. การจัดการผู้สอน")
          </p>
          <p className="text-indigo-600 mt-4 text-sm font-bold bg-indigo-50 px-4 py-2 rounded-lg">
            ระบบกำลังอยู่ระหว่างการพัฒนา
          </p>
        </div>
      )}
`;

if (!code.includes('activeTab === "curriculum"')) {
  code = code.replace(
    `      {activeTab === "learning_hours" && (`,
    newContent + `      {activeTab === "learning_hours" && (`
  );
}

fs.writeFileSync('src/components/AcademicModule.tsx', code, 'utf8');
