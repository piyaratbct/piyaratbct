const fs = require('fs');
let code = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

// The string to replace is a bit complex due to previous patch.
// Let's find the whole span.
const badSpanRegex = /<span className="ml-auto text-indigo-600 font-medium">[\s\S]*?<\/span>/g;
code = code.replace(badSpanRegex, '');

fs.writeFileSync('src/components/ScheduleManager.tsx', code);
console.log("Fixed ScheduleManager.tsx child UI");
