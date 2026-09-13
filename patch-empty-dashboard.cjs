const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherSubjectsDashboard.tsx', 'utf8');

const oldLogic = `  if (subjectCards.length === 0) {
    return null; // Don't show anything if no subjects assigned
  }`;

const newLogic = `  if (subjectCards.length === 0) {
    return (
      <div className="bg-white/60 p-6 rounded-3xl border border-dashed border-slate-300 shadow-sm mb-6 relative overflow-hidden backdrop-blur-sm flex flex-col items-center justify-center text-center py-12">
        <div className="h-16 w-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-slate-700 mb-2">รายวิชาที่ฉันสอน (My Subjects)</h2>
        <p className="text-sm font-medium text-slate-500 max-w-md mx-auto">
          ไม่พบข้อมูลรายวิชาที่คุณรับผิดชอบในภาคเรียนที่ {systemSemester}/{systemAcademicYear} 
          <br/>(ระบบจะแสดงการ์ดรายวิชาที่นี่อัตโนมัติ เมื่อฝ่ายวิชาการจัดตารางสอนให้คุณแล้ว)
        </p>
      </div>
    );
  }`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/TeacherSubjectsDashboard.tsx', content);
console.log("Updated empty state");
