const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionPrintTemplate.tsx', 'utf8');

// Ensure we import useEffect
if (!code.includes('useEffect')) {
  code = code.replace(/import React, \{ useRef \}/, 'import React, { useRef, useEffect }');
}

// Add the useEffect to hide #root during print
const effectCode = `  useEffect(() => {
    document.body.classList.add('print-mode-active');
    return () => {
      document.body.classList.remove('print-mode-active');
    };
  }, []);`;

// Insert it after contentRef
code = code.replace(
  /const contentRef = useRef<HTMLDivElement>\(null\);/,
  `const contentRef = useRef<HTMLDivElement>(null);\n\n${effectCode}`
);

// Reset the wrapper to just static and block during print. No absolute/fixed positioning in print.
// Because we hide #root, this will be the ONLY content.
code = code.replace(
  /className="fixed inset-0 z-50 flex flex-col bg-slate-900\/90 backdrop-blur-sm print:absolute print:left-0 print:top-0 print:bg-white print:block print:overflow-visible"/g,
  `className="fixed inset-0 z-50 flex flex-col bg-slate-900/90 backdrop-blur-sm print:static print:bg-white print:block print:w-full print:h-auto print:overflow-visible"`
);

// We should also remove minHeight: 297mm and fixed width 210mm inline styles on the print pages, because @page defines the size.
// Using inline dimensions can cause the browser to force page breaks or add extra blank pages if it slightly overflows the @page size.
code = code.replace(
  /style=\{\{ width: '210mm', minHeight: '297mm', padding: '12mm 15mm' \}\}/g,
  `style={{ padding: '0mm' }} className="... print:w-full print:h-auto print:min-h-0 print:m-0 print:p-0"`
);

// Wait, the previous replace was messy. Let's just do a direct string replace for the style block.
// First page:
code = code.replace(
  /className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative print:w-full print:h-auto print:min-h-0 print:m-0" style=\{\{ width: '210mm', minHeight: '297mm', padding: '12mm 15mm' \}\}/g,
  `className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative print:w-full print:h-auto print:min-h-0 print:m-0 print:p-0" style={{ maxWidth: '210mm', minHeight: '297mm', padding: '12mm 15mm' }}`
);

// Second page:
code = code.replace(
  /className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative mt-8 print:mt-0 print:break-before-page print:w-full print:h-auto print:min-h-0 print:m-0" style=\{\{ width: '210mm', minHeight: '297mm', padding: '12mm 15mm' \}\}/g,
  `className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative mt-8 print:mt-0 print:break-before-page print:w-full print:h-auto print:min-h-0 print:m-0 print:p-0" style={{ maxWidth: '210mm', minHeight: '297mm', padding: '12mm 15mm' }}`
);

// The issue with blank pages is often margins. 
// We use @page { margin: 15mm; } in index.css. 
// If our inner content also has padding/margins, it doubles up.
// So on print, we must remove all inner padding from the page container (hence print:p-0) and let the @page margin handle it.

fs.writeFileSync('src/components/AdmissionPrintTemplate.tsx', code);
console.log('Patched print template to hide root and fix styles');
