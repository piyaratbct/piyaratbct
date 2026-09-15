const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionPrintTemplate.tsx', 'utf8');

// The issue is likely the outer container wrappers around the content that are adding space
// or the way the main content div is structured.
// Let's remove any margins or flex properties from the outer wrapper that might cause it to push down.
// Current outer wrapper: <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/90 backdrop-blur-sm print:static print:h-auto print:bg-white print:block print:overflow-visible">
// The `print:block` is good, but `flex-1` and `overflow-auto p-8` on the inner might cause issues.

code = code.replace(
  /<div className="flex-1 overflow-auto p-8 custom-scrollbar print:p-0 print:h-auto print:overflow-visible">/g,
  `<div className="flex-1 overflow-auto p-8 custom-scrollbar print:p-0 print:block print:h-auto print:overflow-visible print:w-full print:m-0">`
);

// Remove the `max-w-[210mm] mx-auto space-y-8` which might add space.
code = code.replace(
  /<div className="max-w-\[210mm\] mx-auto space-y-8 print:max-w-none print:m-0 print:space-y-0">/g,
  `<div className="max-w-[210mm] mx-auto space-y-8 print:w-full print:max-w-none print:m-0 print:p-0 print:space-y-0">`
);

// On Page 1, remove `origin-top mx-auto relative` and `style={{ width: '210mm', minHeight: '297mm', padding: '12mm 15mm' }}`
// Actually, using fixed mm sizes on screen is fine, but on print, it's better to let the browser handle it and just use 100% width.
code = code.replace(
  /<div ref=\{contentRef\} className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative" style=\{\{ width: '210mm', minHeight: '297mm', padding: '12mm 15mm' \}\}>/g,
  `<div ref={contentRef} className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative print:w-full print:h-auto print:min-h-0 print:m-0" style={{ width: '210mm', minHeight: '297mm', padding: '12mm 15mm' }}>`
);

// Also Page 2
code = code.replace(
  /<div className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative mt-8 print:mt-0 print:break-before-page" style=\{\{ width: '210mm', minHeight: '297mm', padding: '12mm 15mm' \}\}>/g,
  `<div className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative mt-8 print:mt-0 print:break-before-page print:w-full print:h-auto print:min-h-0 print:m-0" style={{ width: '210mm', minHeight: '297mm', padding: '12mm 15mm' }}>`
);

// Another potential issue is the outer modal `fixed inset-0 ...` which has `print:static`.
// Sometimes `absolute` or `fixed` positioning from other elements bleed into print.
// Let's add `print:absolute print:inset-0` instead of `print:static` so it starts at the very top.
code = code.replace(
  /print:static/g,
  `print:absolute print:left-0 print:top-0`
);


fs.writeFileSync('src/components/AdmissionPrintTemplate.tsx', code);
console.log('Patched print container CSS');
