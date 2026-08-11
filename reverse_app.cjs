const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/g, 'bg-white text-purple-700 shadow-sm ring-1 ring-slate-200');
code = code.replace(/text-slate-500 hover:text-slate-900 hover:bg-slate-200\/50/g, 'text-slate-500 hover:text-purple-700 hover:bg-purple-50');

// Reverting the Teaching module header
code = code.replace(/bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-900 relative overflow-hidden print:hidden/g, 'bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 text-white relative overflow-hidden print:hidden');

// Reverting header styles
code = code.replace(/bg-slate-100 text-slate-700/g, 'bg-white/20 backdrop-blur-md text-white');
// The border replace might be tricky, let's see if we can just target the exact element
// <div className="h-16 w-16 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center border border-slate-200">
code = code.replace(/border border-slate-200">\n\s*<Presentation/g, 'shadow-inner border border-white/30">\n                    <Presentation');
code = code.replace(/text-slate-500 font-medium mt-1/g, 'text-violet-100 font-medium mt-1');

// Adding the decorations back
code = code.replace(
  /<div className="flex items-center gap-5 relative z-10">/,
  `<div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-300 opacity-20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
                
                <div className="flex items-center gap-5 relative z-10">`
);

fs.writeFileSync('src/App.tsx', code, 'utf8');
