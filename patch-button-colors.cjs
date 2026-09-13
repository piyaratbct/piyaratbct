const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherSubjectsDashboard.tsx', 'utf8');

// Replace Gradebook (fuchsia -> emerald)
const oldGradebook = `className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-700 rounded-lg text-xs font-bold transition-colors border border-fuchsia-100"`;
const newGradebook = `className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors border border-emerald-100"`;
content = content.replace(oldGradebook, newGradebook);

// Replace Attendance (blue -> pink)
const oldAttendance = `className="flex items-center justify-center gap-1.5 px-2 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors border border-blue-100"`;
const newAttendance = `className="flex items-center justify-center gap-1.5 px-2 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg text-xs font-bold transition-colors border border-pink-100"`;
content = content.replace(oldAttendance, newAttendance);

// Replace Plans (indigo -> blue)
const oldPlans = `className="flex items-center justify-center gap-1.5 px-2 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors border border-indigo-100"`;
const newPlans = `className="flex items-center justify-center gap-1.5 px-2 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors border border-blue-100"`;
content = content.replace(oldPlans, newPlans);

// Replace Logs (emerald -> purple)
const oldLogs = `className="flex items-center justify-center gap-1.5 px-2 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors border border-emerald-100"`;
const newLogs = `className="flex items-center justify-center gap-1.5 px-2 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold transition-colors border border-purple-100"`;
content = content.replace(oldLogs, newLogs);

fs.writeFileSync('src/components/TeacherSubjectsDashboard.tsx', content);
console.log("Patched button colors successfully!");
