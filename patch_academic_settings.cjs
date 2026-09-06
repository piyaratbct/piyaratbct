const fs = require('fs');
let code = fs.readFileSync('src/components/AcademicSettings.tsx', 'utf-8');

code = code.replace(/const \[academicYear, setAcademicYear\] = useState<string>\("2567"\);/, 'const [academicYear, setAcademicYear] = useState<string>("2569");');

fs.writeFileSync('src/components/AcademicSettings.tsx', code, 'utf-8');
console.log('Patched AcademicSettings.tsx initial state');
