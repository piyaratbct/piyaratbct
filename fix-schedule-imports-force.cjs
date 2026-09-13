const fs = require('fs');
let content = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

// The regex might have failed due to whitespace/line breaks. Let's do a more robust replace.

if (!content.includes('AlertCircle')) {
  content = "import { AlertCircle } from 'lucide-react';\n" + content;
}
if (!content.includes('onSnapshot')) {
  content = "import { onSnapshot } from 'firebase/firestore';\n" + content;
}

fs.writeFileSync('src/components/ScheduleManager.tsx', content);
console.log("Forced import fixes");
