const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionPrintTemplate.tsx', 'utf8');

// 1. Move Part 4 to Page 1
const page1End = `            <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] text-center text-xs text-slate-400">
              เอกสารแผ่นที่ 1/2
            </div>
          </div>

          {/* Page 2 */}
          <div className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative" style={{ width: '210mm', minHeight: '297mm', padding: '20mm', pageBreakAfter: 'always', breakAfter: 'page' }}>
            
            {/* Part 4: Family Info */}`;

const replaceWithPage1End = `            {/* Part 4 moved up */}
            {/* Part 4: Family Info */}`;

code = code.replace(page1End, replaceWithPage1End);

// Now we need to insert the Page 2 wrapper before Part 5
const part5Start = `{/* Part 5: Survey & Expectations */}`;
const page2Wrapper = `            <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] text-center text-xs text-slate-400">
              เอกสารแผ่นที่ 1/2
            </div>
          </div>

          {/* Page 2 */}
          <div className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative mt-8 print:mt-0" style={{ width: '210mm', minHeight: '297mm', padding: '20mm', pageBreakAfter: 'always', breakAfter: 'page' }}>
            {/* Part 5: Survey & Expectations */}`;

code = code.replace(part5Start, page2Wrapper);

// 2. Reduce paddings/margins in Page 1 so it doesn't overflow
code = code.replace(/mb-6/g, 'mb-2'); // Reduce bottom margins of sections
code = code.replace(/gap-y-4/g, 'gap-y-1.5'); // Reduce row gaps
code = code.replace(/gap-y-3/g, 'gap-y-1.5');
code = code.replace(/p-2 border-l-4/g, 'p-1.5 border-l-4'); // Reduce padding in headers
code = code.replace(/mb-3 bg-slate-100/g, 'mb-1.5 bg-slate-100'); // Reduce margin below headers
code = code.replace(/h-24 w-24/g, 'h-16 w-16'); // Slightly smaller logo
code = code.replace(/text-3xl/g, 'text-2xl'); // Slightly smaller main title
code = code.replace(/padding: '20mm'/g, "padding: '12mm 15mm'"); // Reduce page padding from 20mm to 12mm top/bottom, 15mm sides

fs.writeFileSync('src/components/AdmissionPrintTemplate.tsx', code);
console.log('Patched layout');
