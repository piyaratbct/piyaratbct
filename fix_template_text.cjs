const fs = require('fs');
let code = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

code = code.replace(
  "'ประเภท': 'ต้องรู้ (Core)'",
  "'ประเภท': 'ตัวชี้วัดระหว่างทาง'"
);

code = code.replace(
  "'ประเภท': 'ควรรู้ (Terminal)'",
  "'ประเภท': 'ตัวชี้วัดปลายทาง'"
);

// We should also update the logic that parses it to accept this new wording
code = code.replace(
  "if (indicatorTypeRaw.includes('ควรรู้') || indicatorTypeRaw.toLowerCase().includes('terminal')) {",
  "if (indicatorTypeRaw.includes('ควรรู้') || indicatorTypeRaw.toLowerCase().includes('terminal') || indicatorTypeRaw.includes('ปลายทาง')) {"
);

fs.writeFileSync('src/components/CurriculumManager.tsx', code, 'utf8');
