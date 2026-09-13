const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import
if (!content.includes('TeacherSubjectsDashboard')) {
  content = content.replace(
    /import { DashboardStats } from "\.\/components\/DashboardStats";/,
    `import { DashboardStats } from "./components/DashboardStats";\nimport { TeacherSubjectsDashboard } from "./components/TeacherSubjectsDashboard";`
  );
}

// 2. Add component to activeModule === "home"
const oldHeroBanner = `<div className="bg-white rounded-2xl border border-violet-100 p-8 shadow-sm hidden sm:flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400"></div>
              <div className="h-16 w-16 bg-violet-50 text-violet-500 rounded-full flex items-center justify-center mb-4">
                <LayoutDashboard className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
                ภาพรวมระบบ LessonLog - ระบบสารสนเทศเพื่อการจัดการสถานศึกษา
              </h2>
              <p className="text-slate-500 text-sm max-w-lg mx-auto mb-4">
                ยินดีต้อนรับเข้าสู่ระบบจัดการข้อมูลการสอนและชั้นเรียน
                ข้อมูลสรุปสถิติภาพรวมทั้งหมด
              </p>
            </div>`;

const newHeroBanner = `<div className="bg-white rounded-2xl border border-violet-100 p-8 shadow-sm hidden sm:flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400"></div>
              <div className="h-16 w-16 bg-violet-50 text-violet-500 rounded-full flex items-center justify-center mb-4">
                <LayoutDashboard className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
                ภาพรวมระบบ LessonLog - ระบบสารสนเทศเพื่อการจัดการสถานศึกษา
              </h2>
              <p className="text-slate-500 text-sm max-w-lg mx-auto mb-4">
                ยินดีต้อนรับเข้าสู่ระบบจัดการข้อมูลการสอนและชั้นเรียน
                ข้อมูลสรุปสถิติภาพรวมทั้งหมด
              </p>
            </div>
            
            <TeacherSubjectsDashboard 
              currentTeacher={currentTeacher} 
              systemSemester={systemSemester} 
              systemAcademicYear={systemAcademicYear} 
              onNavigateToSubject={(subject, grade) => {
                 // Future integration: Redirect to ClassroomHub
                 console.log("Navigate to", subject, grade);
                 // Fallback for now: redirect to lesson class module
                 setActiveModule("classroom");
              }}
            />`;

if (content.includes(oldHeroBanner)) {
  content = content.replace(oldHeroBanner, newHeroBanner);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Successfully injected TeacherSubjectsDashboard into App.tsx");
} else {
  console.log("Could not find hero banner to replace");
}
