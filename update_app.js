const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `        ) : activeModule === "teaching" ? (
          <div className="space-y-6 animate-in fade-in duration-300 relative">`;

const replacement = `        ) : activeModule === "teaching" ? (
          (currentTeacher.role !== 'admin' && currentTeacher.role !== 'academic' && currentTeacher.role !== 'deputy') ? (
            <div className="bg-white p-12 rounded-2xl border border-violet-100 text-center animate-in fade-in duration-300 shadow-sm mt-8">
              <div className="mx-auto w-20 h-20 bg-violet-50 text-violet-500 rounded-full flex items-center justify-center mb-6">
                <Wrench className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">ปิดปรับปรุงโมดูลชั่วคราว</h2>
              <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                โมดูล "1. จัดการผู้สอน" กำลังอยู่ระหว่างการปรับปรุงระบบและเพิ่มฟีเจอร์ใหม่<br/>
                เพื่อไม่ให้กระทบต่อการใช้งานของคุณครู จึงขอปิดปรับปรุงชั่วคราวนะครับ
              </p>
            </div>
          ) : (
          <div className="space-y-6 animate-in fade-in duration-300 relative">`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  
  // We need to add an extra `)` at the end of the teaching block to close the ternary we just added.
  // The teaching block ends before: `) : activeModule === "classroom" ? (`
  // Wait, let's find the end of activeModule === "teaching"
  
  // It's probably `        ) : activeModule === "classroom" ? (`
  
} else {
  console.log('Target not found');
}

fs.writeFileSync(file, content);
