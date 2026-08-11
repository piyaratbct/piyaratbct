const fs = require('fs');

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Header
  code = code.replace(/className="bg-white border-b border-slate-100 px-6 py-5 flex justify-between items-center"/g, 'className="bg-gradient-to-r from-sky-400 via-sky-500 to-pink-400 px-6 py-4 flex justify-between items-center text-white shadow-xs"');
  code = code.replace(/className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center text-white shadow-xs"/g, 'className="bg-gradient-to-r from-sky-400 via-sky-500 to-pink-400 px-6 py-4 flex justify-between items-center text-white shadow-xs"');
  
  // Header text colors
  code = code.replace(/<h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">\n\s*<BookOpen className="h-5 w-5 text-slate-700" \/>/g, '<h3 className="font-extrabold text-base flex items-center gap-2">\n            <BookOpen className="h-5 w-5 animate-pulse text-white" />');
  
  code = code.replace(/<p className="text-sm text-slate-500 mt-1">/g, '<p className="text-[11px] text-white/95 mt-0.5">');
  
  code = code.replace(/className="text-sm font-medium px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 transition-colors"/g, 'className="text-xs font-semibold px-3 py-1 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"');

  // PBL Header fixes
  code = code.replace(/<FileText className="h-5 w-5 text-slate-700" \/>/g, '<FileText className="h-5 w-5 text-emerald-600" />');
  code = code.replace(/<BookOpen className="h-5 w-5 text-slate-700" \/>/g, '<BookOpen className="h-5 w-5 text-emerald-600" />');
  code = code.replace(/<h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">/g, '<h3 className="text-lg font-black text-slate-800 flex items-center gap-2">');

  // General text classes
  code = code.replace(/text-sm font-medium/g, 'text-xs font-semibold');
  code = code.replace(/text-slate-900/g, 'text-slate-800'); // Note: Reverses inputs focus border too, which is okay

  // Inputs - Reversing text-sm back to text-xs
  code = code.replace(/text-sm rounded-lg border/g, 'text-xs rounded-xl border');
  
  code = code.replace(/focus:ring-slate-800/g, 'focus:ring-blue-500');
  code = code.replace(/focus:border-slate-800/g, 'focus:border-blue-500');

  // Indigo elements (Integrated learning box)
  code = code.replace(/bg-slate-50\/50 p-4 rounded-lg border border-slate-200/g, 'bg-indigo-50/50 p-4 rounded-xl border border-indigo-100');
  code = code.replace(/text-slate-800 focus:ring-slate-800 border-slate-300/g, 'text-indigo-600 focus:ring-indigo-500 border-indigo-300');
  code = code.replace(/text-xs font-semibold text-slate-800/g, 'text-sm font-bold text-indigo-900');
  code = code.replace(/text-xs font-semibold text-slate-700 mb-1">บูรณาการ/g, 'text-xs font-semibold text-indigo-700 mb-1">บูรณาการ');
  code = code.replace(/bg-slate-100 text-slate-700 font-semibold'/g, 'bg-indigo-50 text-indigo-700 font-medium\'');

  // Emerald elements (PBL Box)
  code = code.replace(/border border-slate-200 shadow-sm mt-4/g, 'border-2 border-emerald-500/20 shadow-sm mt-4');
  code = code.replace(/border-b border-slate-100 pb-3/g, 'border-b border-emerald-200/50 pb-3');
  code = code.replace(/bg-slate-100 rounded-lg flex items-center/g, 'bg-emerald-100 rounded-xl flex items-center');
  
  // Undo specific buttons
  code = code.replace(/className="flex items-center justify-center gap-2 bg-slate-800 text-white px-8 py-2.5 rounded-lg hover:bg-slate-800 transition-all font-semibold shadow-sm"/g, 'className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-8 py-2.5 rounded-xl hover:from-sky-600 hover:to-sky-700 transition-all font-bold shadow-md hover:shadow-lg"');
  code = code.replace(/className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-lg transition-colors font-semibold"/g, 'className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl transition-colors font-bold"');
  code = code.replace(/className="flex items-center justify-center gap-2 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 px-6 py-2.5 rounded-lg transition-colors font-semibold"/g, 'className="flex items-center gap-2 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 px-6 py-2.5 rounded-xl transition-colors font-bold"');
  code = code.replace(/className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-2\.5 rounded-lg hover:bg-slate-800 transition-all font-medium shadow-sm"/g, 'className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-8 py-2.5 rounded-xl hover:from-sky-600 hover:to-sky-700 transition-all font-bold shadow-md hover:shadow-lg"');

  // Undo border colors
  code = code.replace(/border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800/g, 'border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500');

  // Change rounded-lg -> rounded-xl and rounded-xl -> rounded-2xl roughly
  code = code.replace(/rounded-xl/g, 'rounded-2xl');
  code = code.replace(/rounded-lg/g, 'rounded-xl');

  fs.writeFileSync(file, code, 'utf8');
}

processFile('src/components/LessonPlanForm.tsx');
processFile('src/components/PBLLessonPlanForm.tsx');
processFile('src/components/LessonLogForm.tsx');
processFile('src/components/PBLLessonLogForm.tsx');
