import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    notice = """        {/* Evaluation tables have been moved to a standalone popup for better UX */}
        <div className="mb-8 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
           <ClipboardList className="w-10 h-10 text-emerald-500 mb-3" />
           <h3 className="text-emerald-800 font-bold text-lg mb-1">ตารางประเมินผลรายบุคคล</h3>
           <p className="text-emerald-600 text-sm mb-4">เพื่อความสะดวก รวดเร็ว และเป็นระเบียบยิ่งขึ้น<br/>กรุณาให้คะแนนนักเรียนผ่านปุ่ม <b>"ประเมินผล"</b> สีเขียว ที่หน้ารายการบันทึกหลังสอน</p>
        </div>"""
        
    # We find "{/* แบบประเมินการจัดการเรียนรู้ */}" or just the start
    start_idx = code.find("{importedIndicators && importedIndicators.length > 0 && (")
    if start_idx == -1:
        return "Not found start"
        
    end_idx = code.find('<div className="mt-8 pt-6 border-t border-slate-200 flex justify-end gap-3">', start_idx)
    if end_idx == -1:
        end_idx = code.find('<div className="mt-8 flex justify-end gap-3">', start_idx)
    if end_idx == -1:
        end_idx = code.find('<div className="flex justify-end gap-3', start_idx)
    
    if end_idx != -1:
        new_code = code[:start_idx] + notice + "\n\n        " + code[end_idx:]
        with open(filename, 'w') as f:
            f.write(new_code)
        return "Success"
    return "Not found end"

print(fix('src/components/PBLLessonLogForm.tsx'))
