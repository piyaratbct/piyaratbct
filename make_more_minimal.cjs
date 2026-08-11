const fs = require('fs');

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Fix header text-white
  code = code.replace(/className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center text-white shadow-xs"/g, 'className="bg-white border-b border-slate-100 px-6 py-5 flex justify-between items-center"');
  
  // Make inputs text-sm instead of text-xs
  code = code.replace(/text-xs rounded-lg border/g, 'text-sm rounded-lg border');
  code = code.replace(/text-xs rounded-xl border/g, 'text-sm rounded-lg border');
  code = code.replace(/text-xs font-semibold px-3 py-1/g, 'text-sm font-medium px-4 py-2');

  // Replace text-slate-800 with text-slate-900 for more contrast
  code = code.replace(/text-slate-800/g, 'text-slate-900');

  // Remove unnecessary background from forms sections
  code = code.replace(/bg-slate-50\/50 p-4/g, 'p-4');
  code = code.replace(/bg-slate-50\/40/g, 'bg-transparent');
  code = code.replace(/bg-blue-50/g, 'bg-slate-50');
  code = code.replace(/text-blue-600/g, 'text-slate-600');
  code = code.replace(/border-blue-100\/50/g, 'border-slate-200');

  // Button styles
  code = code.replace(/from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700/g, 'bg-slate-900 hover:bg-slate-800');
  code = code.replace(/bg-gradient-to-r/g, ''); // Remove gradients
  code = code.replace(/text-white shadow-md hover:shadow-lg/g, 'text-white shadow-sm hover:shadow');

  // Save drafts
  code = code.replace(/bg-slate-100 hover:bg-slate-200 text-slate-700/g, 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700');
  code = code.replace(/bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-800/g, 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700');

  fs.writeFileSync(file, code, 'utf8');
}

processFile('src/components/LessonPlanForm.tsx');
processFile('src/components/PBLLessonPlanForm.tsx');
processFile('src/components/LessonLogForm.tsx');
processFile('src/components/PBLLessonLogForm.tsx');
