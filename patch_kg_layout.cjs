const fs = require('fs');
let code = fs.readFileSync('src/components/KindergartenPrintTemplate.tsx', 'utf-8');

code = code.replace(
  /<div className="col-span-2 sm:col-span-1">\n\s*<span className="font-bold text-sky-900">ชื่อ-นามสกุล:<\/span>/g,
  '<div className="col-span-2">\n                  <span className="font-bold text-sky-900">ชื่อ-นามสกุล:</span>'
);

code = code.replace(
  /<div className="col-span-2 sm:col-span-1 flex gap-4">/g,
  '<div className="col-span-2 flex gap-4">'
);

fs.writeFileSync('src/components/KindergartenPrintTemplate.tsx', code, 'utf-8');
console.log("Patched KindergartenPrintTemplate layout");
