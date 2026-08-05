const fs = require('fs');
let code = fs.readFileSync('src/components/AcademicModule.tsx', 'utf8');

// Update type
code = code.replace(
  'useState<"calendar" | "settings" | "staff" | "schedule" | "promotion" | "learning_hours" | "curriculum">("calendar");',
  'useState<"calendar" | "settings" | "staff" | "schedule" | "promotion" | "curriculum">("calendar");'
);

// Remove import
code = code.replace(
  'import { LearningHoursReport } from "./LearningHoursReport";\n',
  ''
);

// Remove button
code = code.replace(
  /\s*<button\s*onClick=\{\(\) => setActiveTab\("learning_hours"\)\}[\s\S]*?<\/button>/,
  ''
);

// Remove content
code = code.replace(
  /\s*\{activeTab === "learning_hours" && \([\s\S]*?<\/LearningHoursReport>\s*\)\}/,
  ''
);

// Additional remove content fallback just in case
code = code.replace(
  /      \{activeTab === "learning_hours" && \(\s*<LearningHoursReport\s*systemAcademicYear=\{systemAcademicYear\}\s*systemSemester=\{systemSemester\}\s*students=\{students\}\s*\/>\s*\)\}/,
  ''
);


fs.writeFileSync('src/components/AcademicModule.tsx', code, 'utf8');
