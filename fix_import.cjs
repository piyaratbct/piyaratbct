const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  /import { DashboardStats }\nimport { TodayAttendanceWidget } from "\.\/components\/DashboardStats";/,
  'import { DashboardStats } from "./components/DashboardStats";\nimport { TodayAttendanceWidget } from "./components/TodayAttendanceWidget";'
);
fs.writeFileSync('src/App.tsx', code);
