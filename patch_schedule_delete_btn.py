import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # Change the button onClick
    code = code.replace("onClick={() => handleDeleteSchedule(schedule.id)}", "onClick={() => setScheduleToDelete(schedule.id)}")

    # Add the modal at the end of the return statement
    modal_code = """
      {/* Delete Confirmation Modal */}
      {scheduleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">ยืนยันการลบ?</h3>
              <p className="text-sm text-slate-500 mb-6">คุณแน่ใจหรือไม่ที่จะลบตารางสอนคาบนี้? การกระทำนี้ไม่สามารถกู้คืนได้</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setScheduleToDelete(null)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors"
                >
                  ลบข้อมูล
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}"""
    code = re.sub(r'    </div>\n  \);\n}\s*$', modal_code, code)

    with open(filename, 'w') as f:
        f.write(code)
    print("Success patching ScheduleManager delete UI")

fix('src/components/ScheduleManager.tsx')
