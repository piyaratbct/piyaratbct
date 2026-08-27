const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  /<DashboardStats records={records} currentTeacher={currentTeacher} teachers={teachers} systemSemester={systemSemester} systemAcademicYear={systemAcademicYear} \/>/,
  '<TodayAttendanceWidget students={students} />\n            <DashboardStats records={records} currentTeacher={currentTeacher} teachers={teachers} systemSemester={systemSemester} systemAcademicYear={systemAcademicYear} />'
);
fs.writeFileSync('src/App.tsx', code);
