const fs = require('fs');
let code = fs.readFileSync('src/components/AttendanceSummary.tsx', 'utf8');

const targetBtn = `                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="ลบ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>`;

const replacementBtn = `                    <button
                      onClick={() => setSessionToDelete(session.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="ลบ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>`;
code = code.replace(targetBtn, replacementBtn);

const targetModal = `      {editingSession && (`;
const replacementModal = `      {sessionToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">ยืนยันการลบข้อมูล</h3>
            <p className="text-sm text-slate-500 mb-6">คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลการเช็กชื่อของคาบเรียนนี้? การดำเนินการนี้ไม่สามารถเรียกคืนได้</p>
            <div className="flex gap-3">
              <button
                onClick={() => setSessionToDelete(null)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDeleteSession(sessionToDelete)}
                className="flex-1 px-4 py-2 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors"
              >
                ลบข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {editingSession && (`;
code = code.replace(targetModal, replacementModal);
fs.writeFileSync('src/components/AttendanceSummary.tsx', code, 'utf8');
