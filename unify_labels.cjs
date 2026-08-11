const fs = require('fs');

let codePlan = fs.readFileSync('src/components/PBLLessonPlanForm.tsx', 'utf8');
codePlan = codePlan.replace(/<label className="block text-xs font-semibold text-indigo-700 mb-1">รายวิชา\/สาระการเรียนรู้ที่บูรณาการ \(เลือกได้มากกว่า 1\)<\/label>/, '<label className="block text-xs font-bold text-slate-700 mb-1">รายวิชา / สาระการเรียนรู้ที่บูรณาการ (เลือกได้มากกว่า 1)</label>');
fs.writeFileSync('src/components/PBLLessonPlanForm.tsx', codePlan, 'utf8');


let codeLog = fs.readFileSync('src/components/PBLLessonLogForm.tsx', 'utf8');
codeLog = codeLog.replace(/<label className="block text-xs font-semibold text-indigo-700 mb-1">บูรณาการร่วมกับวิชา\/สาระการเรียนรู้อื่น \(เลือกได้มากกว่า 1\)<\/label>/, '<label className="block text-xs font-bold text-slate-700 mb-1">รายวิชา / สาระการเรียนรู้ที่บูรณาการ (เลือกได้มากกว่า 1)</label>');
codeLog = codeLog.replace(/<span className="block text-sm font-bold text-slate-900 mb-2">จัดการเรียนรู้แบบบูรณาการ \(Integrated Learning\)<\/span>/, '');
fs.writeFileSync('src/components/PBLLessonLogForm.tsx', codeLog, 'utf8');

