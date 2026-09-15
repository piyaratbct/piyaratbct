const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionPrintTemplate.tsx', 'utf8');

// Replace the fixed inset-0 wrapper with one that becomes static and auto-height on print
code = code.replace(
  /<div className="fixed inset-0 z-50 flex flex-col bg-slate-900\/90 backdrop-blur-sm print:bg-white print:block">/g,
  `<div className="fixed inset-0 z-50 flex flex-col bg-slate-900/90 backdrop-blur-sm print:static print:h-auto print:bg-white print:block print:overflow-visible">`
);

code = code.replace(
  /<div className="flex-1 overflow-auto p-8 custom-scrollbar print:p-0 print:overflow-visible">/g,
  `<div className="flex-1 overflow-auto p-8 custom-scrollbar print:p-0 print:h-auto print:overflow-visible">`
);

fs.writeFileSync('src/components/AdmissionPrintTemplate.tsx', code);
console.log('Patched layout wrappers');
