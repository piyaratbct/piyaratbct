const fs = require('fs');

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Fix the inputs that I missed in the reverse script
  code = code.replace(/focus:ring-slate-900/g, 'focus:ring-blue-500');
  code = code.replace(/focus:border-slate-900/g, 'focus:border-blue-500');
  code = code.replace(/text-slate-900 focus:ring-blue-500/g, 'text-indigo-600 focus:ring-indigo-500');
  
  // Fix Integrated Learning checkbox area
  code = code.replace(/<span className="text-sm font-bold text-slate-900">จัดการเรียนรู้แบบบูรณาการ/g, '<span className="text-sm font-bold text-indigo-900">จัดการเรียนรู้แบบบูรณาการ');
  code = code.replace(/<label className="block text-xs font-semibold text-slate-700 mb-1">บูรณาการร่วมกับวิชา/g, '<label className="block text-xs font-semibold text-indigo-700 mb-1">บูรณาการร่วมกับวิชา');

  // Fix buttons that might not have matched
  code = code.replace(/className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-xl transition-colors font-medium"/g, 'className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl transition-colors font-bold"');
  code = code.replace(/className="flex items-center justify-center gap-2 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 px-6 py-2.5 rounded-xl transition-colors font-medium"/g, 'className="flex items-center gap-2 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 px-6 py-2.5 rounded-xl transition-colors font-bold"');
  
  fs.writeFileSync(file, code, 'utf8');
}

processFile('src/components/LessonPlanForm.tsx');
processFile('src/components/PBLLessonPlanForm.tsx');
processFile('src/components/LessonLogForm.tsx');
processFile('src/components/PBLLessonLogForm.tsx');
