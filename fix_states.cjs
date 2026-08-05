const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

const regex1 = /const \[errorMsg, setErrorMsg\] = useState\(""\);/;
const replace1 = `const [errorMsg, setErrorMsg] = useState("");
  const [signingRole, setSigningRole] = useState<"teacher" | "deptHead" | null>(null);`;
code = code.replace(regex1, replace1);

const regex2 = /const getTodayString = \(\) => new Date\(\)\.toISOString\(\)\.slice\(0, 10\);/;
// Oh wait, getTodayString isn't defined. I'll define it.
const replace2 = `const getTodayString = () => new Date().toISOString().slice(0, 10);
  const removeAttachment`;
code = code.replace(/const removeAttachment/, replace2);

// competencies might not be in initialPlan? I'll just keep it or default to "".
const regex3 = /initialPlan\?\.competencies \|\| ""/;
code = code.replace(regex3, `(initialPlan as any)?.competencies || ""`);

fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
