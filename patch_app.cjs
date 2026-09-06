const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// The app defaults to 2567 if it hasn't successfully pulled from Firestore yet
code = code.replace(/const \[systemAcademicYear, setSystemAcademicYear\] = useState<string>\("2567"\);/, 'const [systemAcademicYear, setSystemAcademicYear] = useState<string>("2569");');

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log('Patched App.tsx initial state');
