const fs = require('fs');
let code = fs.readFileSync('src/components/AcademicModule.tsx', 'utf8');

// Remove import
code = code.replace(/import \{ GradingManager \} from "\.\/GradingManager";\n/, '');

// Fix types
code = code.replace(
  /useState<"calendar" \| "settings" \| "staff" \| "schedule" \| "promotion" \| "learning_hours" \| "curriculum" \| "grading" \| "lesson_plan">\("calendar"\);/,
  'useState<"calendar" | "settings" | "staff" | "schedule" | "promotion" | "learning_hours" | "curriculum">("calendar");'
);

// Remove buttons
code = code.replace(
  /\s*<button\s*onClick=\{\(\) => setActiveTab\("grading"\)\}[\s\S]*?<\/button>/,
  ''
);
code = code.replace(
  /\s*<button\s*onClick=\{\(\) => setActiveTab\("lesson_plan"\)\}[\s\S]*?<\/button>/,
  ''
);

// Remove contents
code = code.replace(
  /\s*\{activeTab === "grading" && \([\s\S]*?<\/GradingManager>\s*\)\}/,
  ''
);
code = code.replace(
  /\s*\{activeTab === "lesson_plan" && \([\s\S]*?<\/div>\s*\)\}/,
  ''
);

fs.writeFileSync('src/components/AcademicModule.tsx', code, 'utf8');
