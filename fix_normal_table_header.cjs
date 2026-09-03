const fs = require('fs');
let code = fs.readFileSync('src/components/SubjectScorePrintTemplate.tsx', 'utf-8');

const targetHeader = `<th rowSpan={2} className="border border-slate-900 px-4 py-2 text-left whitespace-nowrap">ชื่อ-นามสกุล</th>
                  <th colSpan={4} className="border border-slate-900 px-2 py-2 text-center">คะแนนระหว่างเรียน (60)</th>`;

const newHeader = `<th rowSpan={2} className="border border-slate-900 px-4 py-2 text-left whitespace-nowrap">ชื่อ-นามสกุล</th>
                  <th rowSpan={2} className="border border-slate-900 px-2 py-2 text-center w-12 text-[10px] leading-tight">เวลาเรียน<br/>(%)</th>
                  <th colSpan={4} className="border border-slate-900 px-2 py-2 text-center">คะแนนระหว่างเรียน (60)</th>`;

if (code.includes(targetHeader)) {
    code = code.replace(targetHeader, newHeader);
    fs.writeFileSync('src/components/SubjectScorePrintTemplate.tsx', code, 'utf-8');
    console.log("Fixed normal table header");
} else {
    console.log("Could not find target header!");
}
