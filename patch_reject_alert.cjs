const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

const target = `        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}`;

const replacement = `        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {initialPlan && initialPlan.status === "rejected" && initialPlan.approverComment && (
          <div className="bg-rose-50 text-rose-800 p-4 rounded-xl flex items-start gap-3 border border-rose-200 shadow-sm animate-in fade-in duration-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-rose-900 mb-1">แผนการสอนนี้ถูกตีกลับให้แก้ไข</p>
              <p className="text-sm text-rose-700 whitespace-pre-wrap">{initialPlan.approverComment}</p>
            </div>
          </div>
        )}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
