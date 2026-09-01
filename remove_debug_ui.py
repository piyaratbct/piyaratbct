import re

def fix(filename):
    with open(filename, 'r') as f:
        code = f.read()

    # Find the yellow debug box and remove it
    ui_remove = """<div className="p-4 bg-yellow-100 border border-yellow-300 text-xs text-yellow-900 rounded-lg w-full mb-3 shadow-inner">
                  <strong>🔧 ข้อมูลสำหรับตรวจสอบ (DEBUG INFO)</strong><br/>
                  - วิชาที่เลือก: "{subject === 'อื่นๆ' ? customSubject : subject}"<br/>
                  - ชั้นที่เลือก: "{selectedGrades.join(', ')}"<br/>
                  - จำนวนหลักสูตรในฐานข้อมูลทั้งหมด: {curriculums.length > 0 ? 'เจอข้อมูลแล้ว' : 'ไม่เจอข้อมูลเลย (0)'}<br/>
                  {/* We cannot access fetchedCurriculums here easily without state, so let's just show basic info */}
                  <div className="mt-2 text-[10px] text-yellow-800 bg-yellow-50 p-2 rounded">
                    <em>(กรุณาแคปหน้าจอกล่องสีเหลืองนี้ส่งให้ผู้พัฒนา หากท่านแน่ใจว่าเลือกวิชาและชั้นเรียนถูกต้องแล้วแต่ยังไม่พบตัวชี้วัด)</em>
                  </div>
                </div>"""
                
    if ui_remove in code:
        code = code.replace(ui_remove, "")
        
    with open(filename, 'w') as f:
        f.write(code)

fix('src/components/LessonPlanForm.tsx')
fix('src/components/PBLLessonPlanForm.tsx')
