const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionPrintTemplate.tsx', 'utf8');

// Replace standard tailwind print break class with inline style page-break-after: always
// Tailwind print:break-after-page sometimes doesn't work well across all browsers
code = code.replace(
  /<div ref=\{contentRef\} className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative print:break-after-page" style=\{\{ width: '210mm', minHeight: '297mm', padding: '20mm' \}\}>/g,
  `<div ref={contentRef} className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative" style={{ width: '210mm', minHeight: '297mm', padding: '20mm', pageBreakAfter: 'always', breakAfter: 'page' }}>`
);

code = code.replace(
  /<div className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative print:break-after-page" style=\{\{ width: '210mm', minHeight: '297mm', padding: '20mm' \}\}>/g,
  `<div className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative" style={{ width: '210mm', minHeight: '297mm', padding: '20mm', pageBreakAfter: 'always', breakAfter: 'page' }}>`
);

// We should also check index.css to ensure we don't have overflow hidden on print
fs.writeFileSync('src/components/AdmissionPrintTemplate.tsx', code);
console.log('Patched');
