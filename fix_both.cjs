const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// --- Revert Module 1 (teaching) to use the Blur Overlay ---

const targetTeachingStart = `        ) : activeModule === "teaching" ? (
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

const replaceTeachingStart = `        ) : activeModule === "teaching" ? (
          <div className="space-y-6 animate-in fade-in duration-300 relative">
            {(currentTeacher.role !== 'admin' && currentTeacher.role !== 'academic' && currentTeacher.role !== 'deputy') && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-2xl min-h-[60vh] -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center text-center max-w-sm border border-slate-100 animate-in zoom-in-95 duration-300">
                  <div className="h-16 w-16 bg-violet-50 text-violet-500 rounded-full flex items-center justify-center mb-4">
                    <Wrench className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">
                    ปิดปรับปรุงชั่วคราว
                  </h3>
                  <p className="text-slate-500 mt-2 text-sm font-medium">
                    โมดูล "1. จัดการผู้สอน" กำลังอยู่ระหว่างการพัฒนาและปรับปรุงระบบ ขออภัยในความไม่สะดวก
                  </p>
                  <button
                    onClick={() => setActiveModule("home")}
                    className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-bold shadow-sm transition-colors"
                  >
                    กลับสู่หน้าหลัก
                  </button>
                </div>
              </div>
            )}`;

const targetTeachingEnd = `              )}
            </div>
          </div>
          )
        ) : activeModule === "classroom" ? (`;

const replaceTeachingEnd = `              )}
            </div>
          </div>
        ) : activeModule === "classroom" ? (`;


// --- Revert Module 3 (analytics) to its original Blur Overlay ---

const targetAnalytics = `        ) : activeModule === "analytics" ? (
          (currentTeacher.role !== 'admin' && currentTeacher.role !== 'academic' && currentTeacher.role !== 'deputy') ? (
            <div className="bg-white p-12 rounded-2xl border border-amber-100 text-center animate-in fade-in duration-300 shadow-sm mt-8">
              <div className="mx-auto w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
                <Wrench className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">ปิดปรับปรุงโมดูลชั่วคราว</h2>
              <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                โมดูล "3. วัดและประเมินผล" กำลังอยู่ระหว่างการปรับปรุงระบบและเพิ่มฟีเจอร์ใหม่<br/>
                เพื่อไม่ให้กระทบต่อการใช้งานของคุณครู จึงขอปิดปรับปรุงชั่วคราวนะครับ
              </p>
            </div>
          ) : (
            <div className="relative animate-in fade-in duration-300">
              <EvaluationModule 
                systemAcademicYear={systemAcademicYear}
                systemSemester={systemSemester}
                students={students}
              />
            </div>
          )`;

const replaceAnalytics = `        ) : activeModule === "analytics" ? (
          <div className="relative animate-in fade-in duration-300">
            {(currentTeacher.role === 'teacher' || currentTeacher.role === 'academic') && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-2xl min-h-[60vh]">
                <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center text-center max-w-sm border border-slate-100 animate-in zoom-in-95 duration-300">
                  <div className="h-16 w-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
                    <Wrench className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">
                    ปิดปรับปรุงชั่วคราว
                  </h3>
                  <p className="text-slate-500 mt-2 text-sm font-medium">
                    โมดูลการวัดและประเมินผลผู้เรียนกำลังอยู่ระหว่างการพัฒนาและปรับปรุงระบบ ขออภัยในความไม่สะดวก
                  </p>
                  <button
                    onClick={() => setActiveModule("home")}
                    className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-bold shadow-sm transition-colors"
                  >
                    กลับสู่หน้าหลัก
                  </button>
                </div>
              </div>
            )}
            <EvaluationModule 
              systemAcademicYear={systemAcademicYear}
              systemSemester={systemSemester}
              students={students}
            />
          </div>`;

if (content.includes(targetTeachingStart)) content = content.replace(targetTeachingStart, replaceTeachingStart);
if (content.includes(targetTeachingEnd)) content = content.replace(targetTeachingEnd, replaceTeachingEnd);
if (content.includes(targetAnalytics)) content = content.replace(targetAnalytics, replaceAnalytics);

fs.writeFileSync(file, content);
console.log('Fixes applied successfully.');
