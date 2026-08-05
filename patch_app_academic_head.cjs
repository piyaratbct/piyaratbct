const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `            teachers.find((t) => t.role !== "teacher") ||
            (currentTeacher?.role !== "teacher" ? currentTeacher : null)`;
const replacement1 = `            teachers.find((t) => t.role === "academic" || t.role === "deputy" || t.role === "admin") ||
            ((currentTeacher?.role === "academic" || currentTeacher?.role === "deputy" || currentTeacher?.role === "admin") ? currentTeacher : null)`;

code = code.replace(target1, replacement1);
code = code.replace(target1, replacement1); // two instances (PrintTemplate and LessonPlanPrintTemplate)

fs.writeFileSync('src/App.tsx', code, 'utf8');
