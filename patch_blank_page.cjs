const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionPrintTemplate.tsx', 'utf8');

// The issue is likely caused by the style inline `pageBreakAfter: 'always'` or `breakAfter: 'page'`
// combined with the outer div constraints, or maybe an empty container generating a blank page.
// Let's remove the forced page breaks from the main container divs since they might be creating extra blank pages at the end or beginning.

code = code.replace(
  /style=\{\{ width: '210mm', minHeight: '297mm', padding: '12mm 15mm', pageBreakAfter: 'always', breakAfter: 'page' \}\}/g,
  `style={{ width: '210mm', minHeight: '297mm', padding: '12mm 15mm' }}`
);

// We should also add a proper page break class to the Page 2 wrapper using tailwind `print:break-before-page`
code = code.replace(
  /<div className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative mt-8 print:mt-0"/g,
  `<div className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative mt-8 print:mt-0 print:break-before-page"`
);

// And remove it from Page 1 just in case it had it
code = code.replace(
  /<div ref=\{contentRef\} className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative"/g,
  `<div ref={contentRef} className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative"`
);

fs.writeFileSync('src/components/AdmissionPrintTemplate.tsx', code);
console.log('Patched print template styles');
