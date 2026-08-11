const fs = require('fs');
let code = fs.readFileSync('src/components/PBLLessonPlanForm.tsx', 'utf8');

// Insert a dummy `subject` variable near `date` state
code = code.replace(/  const \[date, setDate\] = useState/, '  const subject = "บูรณาการ (PBL)";\n  const [date, setDate] = useState');

// Remove setSubject calls
code = code.replace(/setSubject\(initialPlan\.subject === 'อื่นๆ' && initialPlan\.customSubject \? initialPlan\.customSubject : \(initialPlan\.subject as string\)\);/g, '');

fs.writeFileSync('src/components/PBLLessonPlanForm.tsx', code, 'utf8');
