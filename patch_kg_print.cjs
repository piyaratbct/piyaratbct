const fs = require('fs');
let code = fs.readFileSync('src/components/KindergartenPrintTemplate.tsx', 'utf-8');

code = code.replace(
  /<div className="col-span-2">\n                  <span className="font-bold text-sky-900">ชื่อ-นามสกุล:<\/span>\{" "\}\n                  \{student\.firstName\} \{student\.lastName\}\{" "\}\n                  \{student\.nickname && \(\n                    <span className="text-slate-600">\(\{student\.nickname\}\)<\/span>\n                  \)\}\n                <\/div>/g,
  `<div className="col-span-2 sm:col-span-1">
                  <span className="font-bold text-sky-900">ชื่อ-นามสกุล:</span>{" "}
                  {student.firstName} {student.lastName}{" "}
                  {student.nickname && (
                    <span className="text-slate-600">({student.nickname})</span>
                  )}
                </div>
                <div className="col-span-2 sm:col-span-1 flex gap-4">
                  <div>
                    <span className="font-bold text-sky-900">น้ำหนัก:</span>{" "}
                    {assessment.weight || student.weight || "-"} <span className="text-slate-600 text-[0.9em]">กก.</span>
                  </div>
                  <div>
                    <span className="font-bold text-sky-900">ส่วนสูง:</span>{" "}
                    {assessment.height || student.height || "-"} <span className="text-slate-600 text-[0.9em]">ซม.</span>
                  </div>
                </div>`
);

fs.writeFileSync('src/components/KindergartenPrintTemplate.tsx', code, 'utf-8');
console.log("Patched KindergartenPrintTemplate");
