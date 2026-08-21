const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `        ) : activeModule === "teaching" ? (
          <div className="space-y-6 animate-in fade-in duration-300 relative">`;

const replace1 = `        ) : activeModule === "teaching" ? (
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

const target2 = `              )}
            </div>
          </div>
        ) : activeModule === "classroom" ? (`;

const replace2 = `              )}
            </div>
          </div>
          )
        ) : activeModule === "classroom" ? (`;

if (content.includes(target1) && content.includes(target2)) {
  content = content.replace(target1, replace1);
  content = content.replace(target2, replace2);
  fs.writeFileSync(file, content);
  console.log("Success");
} else {
  console.log("Targets not found");
}
