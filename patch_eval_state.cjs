const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

code = code.replace(
  "  const [showPrintScore, setShowPrintScore] = useState(false);",
  "  const [showPrintAttendance, setShowPrintAttendance] = useState(false);\n  const [showPrintScore, setShowPrintScore] = useState(false);"
);

// add import
code = code.replace(
  "import { SubjectScorePrintTemplate } from './SubjectScorePrintTemplate';",
  "import { SubjectScorePrintTemplate } from './SubjectScorePrintTemplate';\nimport { AttendancePrintTemplate } from './AttendancePrintTemplate';"
);

fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf-8');
console.log("Patched state and import");
