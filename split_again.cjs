const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionPrintTemplate.tsx', 'utf8');

// Find the Mother section to split before it
const motherStartRegex = /\s*\{\/\* Mother \*\/\}/;

const splitReplacement = `
            </div> {/* Close Father's space-y-6 wrapper */}
            
            <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] text-center text-xs text-slate-400">
              เอกสารแผ่นที่ 1/2
            </div>
          </div>

          {/* Page 2 */}
          <div className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative mt-8 print:mt-0" style={{ width: '210mm', minHeight: '297mm', padding: '12mm 15mm', pageBreakAfter: 'always', breakAfter: 'page' }}>
            <div className="space-y-6 px-4 mb-2 pt-4">
              {/* Mother */}`;

code = code.replace(motherStartRegex, splitReplacement);

fs.writeFileSync('src/components/AdmissionPrintTemplate.tsx', code);
console.log('Patched layout');
