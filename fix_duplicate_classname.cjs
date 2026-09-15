const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionPrintTemplate.tsx', 'utf8');

// The error showed Duplicate "className" attribute in JSX element.
// Let's fix the replacements that caused this.
code = code.replace(
  /className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative print:w-full print:h-auto print:min-h-0 print:m-0" style=\{\{ padding: '0mm' \}\} className="\.\.\. print:w-full print:h-auto print:min-h-0 print:m-0 print:p-0"/g,
  `className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative print:w-full print:h-auto print:min-h-0 print:m-0 print:p-0" style={{ maxWidth: '210mm', minHeight: '297mm', padding: '12mm 15mm' }}`
);

code = code.replace(
  /className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative mt-8 print:mt-0 print:break-before-page print:w-full print:h-auto print:min-h-0 print:m-0" style=\{\{ padding: '0mm' \}\} className="\.\.\. print:w-full print:h-auto print:min-h-0 print:m-0 print:p-0"/g,
  `className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative mt-8 print:mt-0 print:break-before-page print:w-full print:h-auto print:min-h-0 print:m-0 print:p-0" style={{ maxWidth: '210mm', minHeight: '297mm', padding: '12mm 15mm' }}`
);

fs.writeFileSync('src/components/AdmissionPrintTemplate.tsx', code);
console.log('Fixed duplicate className error');
