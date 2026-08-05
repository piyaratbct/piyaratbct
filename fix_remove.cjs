const fs = require('fs');
let code = fs.readFileSync('src/components/AcademicModule.tsx', 'utf8');

code = code.replace(
  /\s*\{activeTab === "grading" && \([\s\S]*?<GradingManager \/>\s*\)\}/,
  ''
);

fs.writeFileSync('src/components/AcademicModule.tsx', code, 'utf8');
