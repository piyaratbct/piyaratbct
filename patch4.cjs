const fs = require('fs');
let code = fs.readFileSync('src/components/LessonAdmitModule.tsx', 'utf8');

// Add state
code = code.replace(
  /const \[loading, setLoading\] = useState\(false\);/,
  `const [loading, setLoading] = useState(false);\n  const [appToDelete, setAppToDelete] = useState<AdmissionRecord | null>(null);`
);

// Replace handleDeleteApplicant
const oldDeleteFunc = `  const handleDeleteApplicant = async (app: AdmissionRecord) => {
    if (currentTeacher.role === 'teacher') {
      alert('คุณไม่มีสิทธิ์ในการลบข้อมูลการรับสมัคร');
      return;
    }
    if (app.status === 'enrolled') {
      alert('ไม่สามารถลบผู้สมัครที่ขึ้นทะเบียนเป็นนักเรียนแล้วได้ หากต้องการลบ กรุณาไปลบที่ฐานข้อมูลนักเรียน');
      return;
    }
    
    if (window.confirm(\`คุณต้องการลบข้อมูลใบสมัครของ \${app.firstName} \${app.lastName} ใช่หรือไม่? ข้อมูลจะไม่สามารถกู้คืนได้\`)) {
      try {
        await deleteDoc(doc(db, 'admissions', app.id));
        refreshApplicants();
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };`;

const newDeleteFunc = `  const handleDeleteApplicant = (app: AdmissionRecord) => {
    if (currentTeacher.role === 'teacher') {
      alert('คุณไม่มีสิทธิ์ในการลบข้อมูลการรับสมัคร');
      return;
    }
    if (app.status === 'enrolled') {
      alert('ไม่สามารถลบผู้สมัครที่ขึ้นทะเบียนเป็นนักเรียนแล้วได้ หากต้องการลบ กรุณาไปลบที่ฐานข้อมูลนักเรียน');
      return;
    }
    setAppToDelete(app);
  };

  const confirmDeleteApplicant = async () => {
    if (!appToDelete) return;
    try {
      await deleteDoc(doc(db, 'admissions', appToDelete.id));
      setAppToDelete(null);
      refreshApplicants();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };`;

code = code.replace(oldDeleteFunc, newDeleteFunc);

// Update button UI
const oldButton = `<button 
                      onClick={() => handleDeleteApplicant(app)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1 p-1.5 sm:px-3 sm:py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-transparent hover:border-rose-200 rounded-md transition-colors text-xs font-semibold"
                      title="ลบข้อมูล"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>`;

const newButton = `<button 
                      onClick={() => handleDeleteApplicant(app)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1 p-1.5 sm:px-3 sm:py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-md transition-colors text-xs font-semibold"
                      title="ลบข้อมูล"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> <span className="md:hidden">ลบ</span>
                    </button>`;
code = code.replace(oldButton, newButton);

// Add Modal
const modalJSX = `
      {appToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="p-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 mb-4">
                <Trash2 className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 text-center mb-2">ยืนยันการลบข้อมูล</h3>
              <p className="text-sm text-slate-500 text-center">
                คุณต้องการลบข้อมูลใบสมัครของ <span className="font-bold text-slate-800">{appToDelete.firstName} {appToDelete.lastName}</span> ใช่หรือไม่? <br/>ข้อมูลที่ถูกลบจะไม่สามารถกู้คืนได้
              </p>
            </div>
            <div className="p-4 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setAppToDelete(null)}
                className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button 
                onClick={confirmDeleteApplicant}
                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(/<CapacityModal/, modalJSX + '\\n      <CapacityModal');

fs.writeFileSync('src/components/LessonAdmitModule.tsx', code);
