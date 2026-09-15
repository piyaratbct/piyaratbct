const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionPrintTemplate.tsx', 'utf8');

// The marker for end of Page 1
const page1EndMarker = `
            <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] text-center text-xs text-slate-400">
              เอกสารแผ่นที่ 1/2
            </div>
          </div>`;

// The marker for start of Page 2 content (Part 4)
const page2StartMarker = `
          {/* Page 2 */}
          <div className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative" style={{ width: '210mm', minHeight: '297mm', padding: '20mm', pageBreakAfter: 'always', breakAfter: 'page' }}>
            
            {/* Part 4: Family Info */}`;

// The marker for end of Part 4 (Before Part 5)
const part5StartMarker = `
            {/* Part 5: Survey & Expectations */}`;

// Extract Part 4 content
const part4Regex = /\{\/\* Part 4: Family Info \*\/\}[\s\S]*?(?=\{\/\* Part 5: Survey & Expectations \*\/|\{\/\* Emergency Contacts \*\/)/g;
// Actually let's just use string splitting to safely move the whole Part 4 into Page 1.

// Wait, the emergency contacts is inside part 4?
// Let's use simple string replacement.

// Remove Page 2 wrapper start since we are bringing everything up? No, Part 5 goes to Page 2.
// Actually, let's just make it a continuous flowing document on A4, rather than hardcoding two separate divs.
// Wait, the structure is two fixed 210mm x 297mm divs. If we move Part 4 into Page 1, it might overflow 297mm if there's too much data.
// But the user requested: "ย้ายข้อ 4 ข้อมูลครอบครัว ขึ้นไปที่หน้า 1 (แต่ไม่ให้ล้นหน้า)"
// To fit Part 4 into Page 1, we need to reduce the margins and paddings on Page 1, or just combine the divs and let the browser's native print pagination handle page breaks!
// Let's combine the two pages into one continuous A4 container and let the browser handle page breaks naturally.
// We can use a single continuous div: `<div className="bg-white print:shadow-none shadow-xl mx-auto relative" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>`
// We will remove the explicit page 2 div and just let the content flow.

// Let's modify the code to reduce spacing on Page 1 so it fits Part 4.
