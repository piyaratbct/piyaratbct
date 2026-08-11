const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/where\("coTeachers", "array-contains", currentTeacher\.id\),\n\s*\)/, 'where("coTeachers", "array-contains", currentTeacher.id)\n          )');

fs.writeFileSync('src/App.tsx', code, 'utf8');
