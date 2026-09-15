const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionPrintTemplate.tsx', 'utf8');

// Find the Mother section to split before it
const motherStart = `                            {/* Mother */}`;

// What does the part just before motherStart look like?
//                    <span className="font-bold text-slate-600">ที่อยู่: </span>
//                    <span className="font-medium text-slate-900">{getParentAddress(record.fatherAddressObj)}</span>
//                  </div>
//                </div>
//              </div>
//                            {/* Mother */}

// We will replace `                            {/* Mother */}` with the closing tags of Page 1 and opening tags of Page 2, and then the start of Mother

const splitReplacement = `
            </div>
            <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] text-center text-xs text-slate-400">
              เอกสารแผ่นที่ 1/2
            </div>
          </div>

          {/* Page 2 */}
          <div className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative mt-8 print:mt-0" style={{ width: '210mm', minHeight: '297mm', padding: '12mm 15mm', pageBreakAfter: 'always', breakAfter: 'page' }}>
            <div className="space-y-6 px-4 mb-2">
                            {/* Mother */}`;

code = code.replace(motherStart, splitReplacement);

// Now we need to remove the OLD Page 1 ending and Page 2 starting that was placed before Part 5.

const oldPageSplit = `            <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] text-center text-xs text-slate-400">
              เอกสารแผ่นที่ 1/2
            </div>
          </div>

          {/* Page 2 */}
          <div className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative mt-8 print:mt-0" style={{ width: '210mm', minHeight: '297mm', padding: '12mm 15mm', pageBreakAfter: 'always', breakAfter: 'page' }}>
            {/* Part 5: Survey & Expectations */}`;

const newPart5Start = `            </div>
            {/* Part 5: Survey & Expectations */}`; // We need to close the `space-y-6 px-4 mb-2` div for mother/guardian/emergency contacts. Wait, is it already closed?

// Let's check where the emergency contacts ends currently.
