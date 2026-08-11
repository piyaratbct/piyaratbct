const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/currentTeacher\.email \? where\("collaborators", "array-contains", currentTeacher\.email\) : where\("teacherId", "==", currentTeacher\.id\) \/\/ Fallback if no email\n\s*\)/, ')');

fs.writeFileSync('src/App.tsx', code, 'utf8');
