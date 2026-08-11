const fs = require('fs');

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  code = code.replace(/className="flex items-center gap-2  from-sky-500 to-sky-600 text-white px-8 py-2.5 rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all font-semibold shadow-sm hover:shadow"/g, 'className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-2.5 rounded-lg hover:bg-slate-800 transition-all font-medium shadow-sm"');
  
  code = code.replace(/className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-lg transition-colors font-semibold"/g, 'className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-lg transition-colors font-medium"');
  
  code = code.replace(/className="flex items-center gap-2 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 px-6 py-2.5 rounded-lg transition-colors font-semibold"/g, 'className="flex items-center justify-center gap-2 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 px-6 py-2.5 rounded-lg transition-colors font-medium"');
  
  fs.writeFileSync(file, code, 'utf8');
}

processFile('src/components/LessonPlanForm.tsx');
processFile('src/components/PBLLessonPlanForm.tsx');
processFile('src/components/LessonLogForm.tsx');
processFile('src/components/PBLLessonLogForm.tsx');
