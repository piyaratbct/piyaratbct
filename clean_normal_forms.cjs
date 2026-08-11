const fs = require('fs');

// Clean LessonPlanForm
let planCode = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');
planCode = planCode.replace(/<div className="col-span-1 md:col-span-full bg-emerald-50\/50 p-4 rounded-xl border border-emerald-100 mt-2">[\s\S]*?<\/div>\n\n          <div>\n            <label className="block text-xs font-semibold text-slate-700 mb-1">/g, 
`          <div>\n            <label className="block text-xs font-semibold text-slate-700 mb-1">`);
fs.writeFileSync('src/components/LessonPlanForm.tsx', planCode, 'utf8');

// Clean LessonLogForm
let logCode = fs.readFileSync('src/components/LessonLogForm.tsx', 'utf8');
logCode = logCode.replace(/<div className="col-span-1 md:col-span-full bg-emerald-50\/50 p-4 rounded-xl border border-emerald-100 mt-2">[\s\S]*?<\/div>\n\n        \{\/\* 1\.5 Multi-grade level selection grid \*\/\}/g,
`        {/* 1.5 Multi-grade level selection grid */}`);
fs.writeFileSync('src/components/LessonLogForm.tsx', logCode, 'utf8');

