const fs = require('fs');

let code = fs.readFileSync('src/components/AttendanceTracking.tsx', 'utf8');

const regex = /  const handleSaveAllDay = async \(\) => \{[\s\S]*?    \} finally \{\n      setIsSaving\(false\);\n    \}\n  \};\n/g;

code = code.replace(regex, "");

fs.writeFileSync('src/components/AttendanceTracking.tsx', code);
console.log('handleSaveAllDay removed!');
