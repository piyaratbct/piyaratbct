const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionPrintTemplate.tsx', 'utf8');

// 1. Find the start of the Mother section and insert the page break wrapper.
// This splits the `space-y-6 px-4 mb-2` into two parts. The first part (Father) stays on Page 1.
// The second part starts with Mother on Page 2.

const motherStart = `                            {/* Mother */}`;
const splitReplacement = `            </div> {/* Close Father's space-y-6 wrapper */}
            
            <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] text-center text-xs text-slate-400">
              เอกสารแผ่นที่ 1/2
            </div>
          </div>

          {/* Page 2 */}
          <div className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative mt-8 print:mt-0" style={{ width: '210mm', minHeight: '297mm', padding: '12mm 15mm', pageBreakAfter: 'always', breakAfter: 'page' }}>
            <div className="space-y-6 px-4 mb-2 pt-4">
              {/* Mother */}`;

code = code.replace(motherStart, splitReplacement);

// 2. We need to remove the OLD page break that was placed right before Part 5.

const oldPageSplit = `            </div>
            
            <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] text-center text-xs text-slate-400">
              เอกสารแผ่นที่ 1/2
            </div>
          </div>

          {/* Page 2 */}
          <div className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative mt-8 print:mt-0" style={{ width: '210mm', minHeight: '297mm', padding: '12mm 15mm', pageBreakAfter: 'always', breakAfter: 'page' }}>
            {/* Part 5: Survey & Expectations */}`;

// Actually, the old code looks like this:
const oldPageSplitActual = `              </div>
            </div>
            
            <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] text-center text-xs text-slate-400">
              เอกสารแผ่นที่ 1/2
            </div>
          </div>

          {/* Page 2 */}
          <div className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative mt-8 print:mt-0" style={{ width: '210mm', minHeight: '297mm', padding: '12mm 15mm', pageBreakAfter: 'always', breakAfter: 'page' }}>
            {/* Part 5: Survey & Expectations */}`;

// Replace it with just closing the space-y-6 div for mother/emergency and starting Part 5.
const replaceOldPageSplit = `              </div>
            </div>
            {/* Part 5: Survey & Expectations */}`;

code = code.replace(oldPageSplitActual, replaceOldPageSplit);

fs.writeFileSync('src/components/AdmissionPrintTemplate.tsx', code);
console.log('Patched layout');
