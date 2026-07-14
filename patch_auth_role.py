import re

with open('src/components/AuthView.tsx', 'r') as f:
    content = f.read()

target1 = "const [regRole, setRegRole] = useState<'teacher' | 'academic' | 'deputy' | 'admin'>('teacher');"
replacement1 = "const [regRole, setRegRole] = useState<'teacher' | 'academic' | 'discipline' | 'deputy' | 'admin'>('teacher');"
content = content.replace(target1, replacement1)

target2 = """      let resolvedAffiliation = affiliation.trim();
      if (regRole === 'academic') {
        resolvedAffiliation = 'หัวหน้าฝ่ายวิชาการ';
      } else if (regRole === 'deputy') {
        resolvedAffiliation = 'รองผู้อำนวยการ';
      } else if (regRole === 'admin') {
        resolvedAffiliation = 'ผู้ดูแลระบบ';
      }"""
replacement2 = """      let resolvedAffiliation = affiliation.trim();
      if (regRole === 'academic') {
        resolvedAffiliation = 'หัวหน้าฝ่ายวิชาการ';
      } else if (regRole === 'discipline') {
        resolvedAffiliation = 'หัวหน้าฝ่ายปกครอง';
      } else if (regRole === 'deputy') {
        resolvedAffiliation = 'รองผู้อำนวยการ';
      } else if (regRole === 'admin') {
        resolvedAffiliation = 'ผู้ดูแลระบบ';
      }"""
content = content.replace(target2, replacement2)

target3 = """                <select
                  disabled={isLoading}
                  value={regRole}
                  onChange={(e) => {
                    setRegRole(e.target.value as 'teacher' | 'academic' | 'deputy' | 'admin');
                    setAcademicPasscode('');
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 cursor-pointer"
                >
                  <option value="teacher">คุณครูผู้สอน (ลงประวัติ จัดเตรียมเอกสาร และเซ็นชื่อตนเอง)</option>
                  <option value="academic">หัวหน้าฝ่ายวิชาการ (ดูแลภาพรวม ตรวจสอบรับรองและลงชื่อผ่านแดชบอร์ด)</option>
                  <option value="deputy">รองผู้อำนวยการ (ดูแลฝ่ายวิชาการ ตรวจสอบรับรองลงนามรายงาน)</option>
                  <option value="admin">ผู้ดูแลระบบ (ควบคุมดูแล จัดระบบฐานข้อมูลความปลอดภัย)</option>
                </select>"""
replacement3 = """                <select
                  disabled={isLoading}
                  value={regRole}
                  onChange={(e) => {
                    setRegRole(e.target.value as 'teacher' | 'academic' | 'discipline' | 'deputy' | 'admin');
                    setAcademicPasscode('');
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 cursor-pointer"
                >
                  <option value="teacher">คุณครูผู้สอน (ลงประวัติ จัดเตรียมเอกสาร และเซ็นชื่อตนเอง)</option>
                  <option value="academic">หัวหน้าฝ่ายวิชาการ (ดูแลภาพรวม ตรวจสอบรับรองและลงชื่อผ่านแดชบอร์ด)</option>
                  <option value="discipline">หัวหน้าฝ่ายปกครอง (ดูแลภาพรวมงานปกครอง วินัยนักเรียน)</option>
                  <option value="deputy">รองผู้อำนวยการ (ดูแลฝ่ายวิชาการ ตรวจสอบรับรองลงนามรายงาน)</option>
                  <option value="admin">ผู้ดูแลระบบ (ควบคุมดูแล จัดระบบฐานข้อมูลความปลอดภัย)</option>
                </select>"""
content = content.replace(target3, replacement3)

with open('src/components/AuthView.tsx', 'w') as f:
    f.write(content)

