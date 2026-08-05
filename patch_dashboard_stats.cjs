const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardStats.tsx', 'utf8');

const target1 = `  const isAcademic = currentTeacher?.role && currentTeacher.role !== 'teacher';`;
const replacement1 = `  const isAcademic = currentTeacher?.role && (currentTeacher.role === 'admin' || currentTeacher.role === 'academic' || currentTeacher.role === 'deputy');`;

code = code.replace(target1, replacement1);
fs.writeFileSync('src/components/DashboardStats.tsx', code, 'utf8');
