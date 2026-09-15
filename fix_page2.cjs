const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionPrintTemplate.tsx', 'utf8');

// Find the section that was missed
const oldPageSplitRegex = /            <\/div>(\s*)\n\s*<div className="absolute bottom-\[20mm\] left-\[20mm\] right-\[20mm\] text-center text-xs text-slate-400">(\s*)\n\s*เอกสารแผ่นที่ 1\/2(\s*)\n\s*<\/div>(\s*)\n\s*<\/div>(\s*)\n\s*{\/\* Page 2 \*\/}(\s*)\n\s*<div className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative mt-8 print:mt-0" style=\{\{ width: '210mm', minHeight: '297mm', padding: '12mm 15mm', pageBreakAfter: 'always', breakAfter: 'page' \}\}>(\s*)\n\s*{\/\* Part 5: Survey & Expectations \*\//;

// Replace it with just closing the div
const replaceWith = `            </div>
            {/* Part 5: Survey & Expectations */}`;

code = code.replace(oldPageSplitRegex, replaceWith);

fs.writeFileSync('src/components/AdmissionPrintTemplate.tsx', code);
console.log('Fixed Page 2 start before Part 5');
