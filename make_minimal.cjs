const fs = require('fs');

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Header
  code = code.replace(/bg-gradient-to-r from-sky-400 via-sky-500 to-pink-400/g, 'bg-white border-b border-slate-200');
  
  // Header text colors
  code = code.replace(/<h3 className="font-extrabold text-base flex items-center gap-2">\n\s*<BookOpen className="h-5 w-5 animate-pulse text-white" \/>/g, '<h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">\n            <BookOpen className="h-5 w-5 text-slate-700" />');
  
  code = code.replace(/<p className="text-\[11px\] text-white\/95 mt-0\.5">/g, '<p className="text-sm text-slate-500 mt-1">');
  
  code = code.replace(/className="text-xs font-semibold px-3 py-1 bg-white\/10 hover:bg-white\/20 rounded-lg text-white transition-colors"/g, 'className="text-sm font-medium px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 transition-colors"');

  // PBL Header fixes
  code = code.replace(/<FileText className="h-5 w-5 text-emerald-600" \/>/g, '<FileText className="h-5 w-5 text-slate-700" />');
  code = code.replace(/<BookOpen className="h-5 w-5 text-emerald-600" \/>/g, '<BookOpen className="h-5 w-5 text-slate-700" />');
  code = code.replace(/<h3 className="text-lg font-black text-slate-800 flex items-center gap-2">/g, '<h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">');

  // General text classes
  code = code.replace(/text-xs font-semibold/g, 'text-sm font-medium');
  code = code.replace(/text-slate-700/g, 'text-slate-700');
  code = code.replace(/text-slate-800/g, 'text-slate-900');
  code = code.replace(/rounded-xl/g, 'rounded-lg');
  code = code.replace(/rounded-2xl/g, 'rounded-xl');
  code = code.replace(/shadow-sm/g, 'shadow-sm');

  // Inputs
  code = code.replace(/focus:ring-blue-500/g, 'focus:ring-slate-900');
  code = code.replace(/focus:border-blue-500/g, 'focus:border-slate-900');
  code = code.replace(/focus:ring-emerald-500/g, 'focus:ring-slate-900');
  code = code.replace(/focus:border-emerald-500/g, 'focus:border-slate-900');
  code = code.replace(/focus:ring-indigo-500/g, 'focus:ring-slate-900');
  code = code.replace(/focus:border-indigo-500/g, 'focus:border-slate-900');
  
  code = code.replace(/border-blue-200/g, 'border-slate-200');
  code = code.replace(/border-emerald-200/g, 'border-slate-200');
  code = code.replace(/border-indigo-200/g, 'border-slate-200');

  // Indigo elements (Integrated learning box)
  code = code.replace(/bg-indigo-50\/50/g, 'bg-slate-50/50');
  code = code.replace(/border-indigo-100/g, 'border-slate-200');
  code = code.replace(/border-indigo-300/g, 'border-slate-300');
  code = code.replace(/text-indigo-900/g, 'text-slate-900');
  code = code.replace(/text-indigo-700/g, 'text-slate-700');
  code = code.replace(/text-indigo-600/g, 'text-slate-900');
  code = code.replace(/bg-indigo-50/g, 'bg-slate-100');
  
  // Emerald elements (PBL Box)
  code = code.replace(/bg-emerald-50\/50/g, 'bg-white');
  code = code.replace(/border-2 border-emerald-500\/20/g, 'border border-slate-200');
  code = code.replace(/border-emerald-100/g, 'border-slate-200');
  code = code.replace(/border-emerald-200\/50/g, 'border-slate-100');
  code = code.replace(/bg-emerald-100/g, 'bg-slate-100');
  code = code.replace(/text-emerald-900/g, 'text-slate-900');
  code = code.replace(/text-emerald-800/g, 'text-slate-700');
  code = code.replace(/text-emerald-700/g, 'text-slate-700');
  code = code.replace(/text-emerald-600\/80/g, 'text-slate-500');
  code = code.replace(/text-emerald-600/g, 'text-slate-700');

  // Other specific styling
  code = code.replace(/min-h-\[120px\]/g, 'min-h-[140px]');
  
  fs.writeFileSync(file, code, 'utf8');
}

processFile('src/components/LessonPlanForm.tsx');
processFile('src/components/PBLLessonPlanForm.tsx');
processFile('src/components/LessonLogForm.tsx');
processFile('src/components/PBLLessonLogForm.tsx');
