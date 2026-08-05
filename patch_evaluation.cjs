const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

// Add import
code = code.replace(
  "import { AttendanceSummary } from './AttendanceSummary';",
  "import { AttendanceSummary } from './AttendanceSummary';\nimport { LearningHoursReport } from './LearningHoursReport';"
);

// Update type
code = code.replace(
  "useState<'overview' | 'grades' | 'kindergarten' | 'attendance'>('overview')",
  "useState<'overview' | 'grades' | 'kindergarten' | 'attendance' | 'learning_hours'>('overview')"
);

// Add button
const button = `
            <button
              onClick={() => setActiveTab('learning_hours')}
              className={\`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all \${
                activeTab === 'learning_hours' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'
              }\`}
            >
              <BookOpen className="h-4 w-4" /> รายงานเวลาเรียน
            </button>
`;

code = code.replace(
  "            </button>\n          </div>\n\n          {/* Tab Content */}",
  "            </button>" + button + "          </div>\n\n          {/* Tab Content */}"
);

// Add content
const content = `
          {activeTab === 'learning_hours' && (
            <div className="p-6 bg-slate-50">
              <LearningHoursReport 
                systemAcademicYear={systemAcademicYear}
                systemSemester={systemSemester}
                students={students}
              />
            </div>
          )}
`;

code = code.replace(
  "          {activeTab === 'attendance' && (",
  content + "\n          {activeTab === 'attendance' && ("
);

fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf8');
