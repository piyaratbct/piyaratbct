const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanList.tsx', 'utf8');

const targetBtn = `<div className="flex gap-2">
                      {canDelete && (`;

const replacementBtn = `<div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setComparingPlan(plan)}
                        className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="เปรียบเทียบกับบันทึกหลังสอน"
                      >
                        <Columns className="h-4 w-4" />
                      </button>
                      {canDelete && (`;

code = code.replace(targetBtn, replacementBtn);

fs.writeFileSync('src/components/LessonPlanList.tsx', code, 'utf8');
