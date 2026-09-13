const fs = require('fs');
let content = fs.readFileSync('src/components/AcademicModule.tsx', 'utf8');

// Remove the import of SubjectAggregationManager
content = content.replace("import { SubjectAggregationManager } from './SubjectAggregationManager';\n", "");

// Remove "aggregation" from state type
content = content.replace(/ \| "aggregation"/g, "");

// Remove the aggregation tab button (leaving only settings)
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

content = content.replace(newAggregationTabHtml, settingsTabHtml);

// Remove the rendering of SubjectAggregationManager
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

const renderSettings = `{activeTab === "settings" && (
        <AcademicSettings 
          systemSemester={systemSemester}
          systemAcademicYear={systemAcademicYear}
        />
      )}`;

content = content.replace(renderAggregation, renderSettings);

// Update CurriculumManager to pass props
const oldCmRender = `<CurriculumManager currentUserRole={currentTeacher.role} />`;
const newCmRender = `<CurriculumManager currentUserRole={currentTeacher.role} students={students} systemSemester={systemSemester} systemAcademicYear={systemAcademicYear} />`;
content = content.replace(oldCmRender, newCmRender);

fs.writeFileSync('src/components/AcademicModule.tsx', content);
console.log("Reverted AcademicModule tabs");
