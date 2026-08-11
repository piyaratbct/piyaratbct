const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add types
code = code.replace(
  /"form" \| "dashboard" \| "plan-form" \| "plan-list"/g,
  `"form" | "dashboard" | "plan-form" | "plan-list" | "pbl-plan-form" | "pbl-log-form"`
);

// Add buttons
const pblButtons = `
                  <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block"></div>
                  <button
                    onClick={() => setActiveTab("pbl-plan-form")}
                    className={\`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all \${
                      activeTab === "pbl-plan-form"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/50 border border-emerald-200"
                    }\`}
                  >
                    <FileText className="h-4 w-4" />
                    สร้างแผนการสอน (PBL)
                  </button>
                  <button
                    onClick={() => setActiveTab("pbl-log-form")}
                    className={\`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all \${
                      activeTab === "pbl-log-form"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/50 border border-emerald-200"
                    }\`}
                  >
                    <BookOpen className="h-4 w-4" />
                    บันทึกหลังสอน (PBL)
                  </button>
`;

code = code.replace(
  /<History className="h-4 w-4" \/>\n                    คลังแผนการสอน\n                  <\/button>/,
  `<History className="h-4 w-4" />\n                    คลังแผนการสอน\n                  </button>${pblButtons}`
);

// Add renders
const pblRenders = `
              {activeTab === "pbl-plan-form" && (
                <PBLLessonPlanForm
                  teacherId={currentTeacher.id}
                  onSave={handleSavePlan}
                  initialPlan={editingPlan}
                  onCancel={
                    editingPlan ? () => setEditingPlan(null) : undefined
                  }
                  currentUserRole={currentTeacher.role}
                  currentUserName={currentTeacher.name}
                  systemAcademicYear={systemAcademicYear}
                  systemSemester={systemSemester}
                />
              )}
              {activeTab === "pbl-log-form" && (
                <PBLLessonLogForm
                  teacherId={currentTeacher.id}
                  onSave={handleSaveRecord}
                  initialRecord={editingRecord}
                  onCancel={
                    editingRecord ? () => setEditingRecord(null) : undefined
                  }
                  currentUserRole={currentTeacher.role}
                  currentUserName={currentTeacher.name}
                  systemAcademicYear={systemAcademicYear}
                  systemSemester={systemSemester}
                />
              )}
`;

code = code.replace(
  /\{activeTab === "plan-list" && \(/,
  `${pblRenders}\n              {activeTab === "plan-list" && (`
);

fs.writeFileSync('src/App.tsx', code, 'utf8');
