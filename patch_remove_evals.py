import re

def remove_evals(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # We want to remove the sections that render the tables.
    # Searching for: {importedIndicators && importedIndicators.length > 0 && (
    
    # We can use regex to remove the divs containing the tables.
    # Wait, it's safer to just replace them with a notice.
    
    notice = """        {/* Evaluation tables have been moved to a standalone popup for better UX */}
        {(importedIndicators.length > 0 || importedCompetencies.length > 0 || importedDesirable.length > 0) && (
          <div className="mb-8 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center justify-center text-center">
             <ClipboardList className="w-10 h-10 text-emerald-500 mb-3" />
             <h3 className="text-emerald-800 font-bold text-lg mb-1">ตารางประเมินผลรายบุคคล</h3>
             <p className="text-emerald-600 text-sm mb-4">คุณสามารถให้คะแนนตัวชี้วัด, สมรรถนะ, และคุณลักษณะอันพึงประสงค์ได้สะดวกและรวดเร็วขึ้น<br/>ผ่านปุ่ม <b>"ประเมินผล"</b> ที่หน้ารายการบันทึกหลังสอน</p>
          </div>
        )}"""
        
    start_str = "{importedIndicators && importedIndicators.length > 0 && ("
    end_str = "{importedDesirable && importedDesirable.length > 0 && ("
    
    # Find start and end to replace the whole block
    start_idx = code.find(start_str)
    
    if start_idx != -1:
        # We need to find where the importedDesirable block ends.
        # It's followed by `</form>` or something? No, it's followed by attachments or something.
        
        # Let's just find the exact text using regex or splitting
        part1 = code[:start_idx]
        
        # Where does importedDesirable block end?
        # It ends right before `<div className="mt-8 flex justify-end gap-3">` usually.
        # Let's find `<div className="mt-8 flex justify-end`
        end_idx = code.find('<div className="mt-8 flex justify-end', start_idx)
        
        if end_idx != -1:
            code = part1 + notice + "\n\n        " + code[end_idx:]
            
            with open(filename, 'w') as f:
                f.write(code)
            return "Replaced evaluation tables with notice."
    return "Could not find start_str."

print(remove_evals('src/components/PBLLessonLogForm.tsx'))
