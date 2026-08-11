const fs = require('fs');

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  code = code.replace(/text-slate-900 focus:ring-blue-500/g, 'text-indigo-600 focus:ring-indigo-500');

  // PBL form backgrounds were changed to bg-white. Let's revert back to bg-emerald-50/50
  code = code.replace(/<div className="col-span-1 md:col-span-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-4">/g, '<div className="col-span-1 md:col-span-full bg-emerald-50/50 p-6 rounded-2xl border border-emerald-200 shadow-sm mt-4">');

  fs.writeFileSync(file, code, 'utf8');
}

processFile('src/components/PBLLessonPlanForm.tsx');
processFile('src/components/PBLLessonLogForm.tsx');
