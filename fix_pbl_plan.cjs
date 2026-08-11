const fs = require('fs');
let code = fs.readFileSync('src/components/PBLLessonPlanForm.tsx', 'utf8');

// Remove the garbage at the top
code = code.replace(/^\s*subject: "บูรณาการ \(PBL\)",/, '');

// Make sure `isIntegrated` doesn't throw errors if it's undefined
// We removed `const [isIntegrated, setIsIntegrated] = useState(...)` but we might have missed some references.
code = code.replace(/isIntegrated: true,/g, 'isIntegrated: true,'); // Just a check
code = code.replace(/isIntegrated \? 'md:col-span-full' : 'sm:col-span-2'/g, "'md:col-span-full'");

fs.writeFileSync('src/components/PBLLessonPlanForm.tsx', code.trim(), 'utf8');
