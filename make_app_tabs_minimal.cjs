const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace active/inactive tab classes for standard tabs
code = code.replace(/bg-white text-purple-700 shadow-sm ring-1 ring-slate-200/g, 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200');
code = code.replace(/text-slate-500 hover:text-purple-700 hover:bg-purple-50/g, 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50');

// Replace active/inactive tab classes for PBL tabs
code = code.replace(/bg-emerald-500 text-white shadow-sm/g, 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200');
code = code.replace(/text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100\/50 border border-emerald-200/g, 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50');

// Also remove gradient header for the Teaching module
code = code.replace(/bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 text-white relative overflow-hidden print:hidden/g, 'bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-900 relative overflow-hidden print:hidden');

code = code.replace(/<div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1\/2 translate-x-1\/3 blur-3xl"><\/div>\n\s*<div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-300 opacity-20 rounded-full translate-y-1\/2 -translate-x-1\/4 blur-2xl"><\/div>/, '');

code = code.replace(/bg-white\/20 backdrop-blur-md text-white/g, 'bg-slate-100 text-slate-700');
code = code.replace(/shadow-inner border border-white\/30/g, 'border border-slate-200');
code = code.replace(/text-violet-100/g, 'text-slate-500');

fs.writeFileSync('src/App.tsx', code, 'utf8');
