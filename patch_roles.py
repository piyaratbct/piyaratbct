import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target_role_map = """        const roleMap: any = {
          teacher: "คุณครูผู้สอน",
          academic: "หัวหน้าฝ่ายวิชาการ",
          deputy: "รองผู้อำนวยการ",
          admin: "ผู้ดูแลระบบ",
        };"""
replacement_role_map = """        const roleMap: any = {
          teacher: "คุณครูผู้สอน",
          academic: "หัวหน้าฝ่ายวิชาการ",
          deputy: "รองผู้อำนวยการ",
          admin: "ผู้ดูแลระบบ",
          discipline: "หัวหน้างานปกครอง",
        };"""
content = content.replace(target_role_map, replacement_role_map)

target_role_map_2 = """              const roleMap: any = {
                teacher: "คุณครูผู้สอน",
                academic: "หัวหน้าฝ่ายวิชาการ",
                deputy: "รองผู้อำนวยการ",
                admin: "ผู้ดูแลระบบ",
              };"""
replacement_role_map_2 = """              const roleMap: any = {
                teacher: "คุณครูผู้สอน",
                academic: "หัวหน้าฝ่ายวิชาการ",
                deputy: "รองผู้อำนวยการ",
                admin: "ผู้ดูแลระบบ",
                discipline: "หัวหน้างานปกครอง",
              };"""
content = content.replace(target_role_map_2, replacement_role_map_2)

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('src/components/UserManagementModule.tsx', 'r') as f:
    content2 = f.read()

target_role_labels = """              const roleLabels: any = {
                teacher: { text: 'คุณครูผู้สอน', style: 'bg-sky-50 text-sky-600 border-sky-200' },
                academic: { text: 'หัวหน้าวิชาการ', style: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
                deputy: { text: 'รองผู้อำนวยการ', style: 'bg-pink-50 text-pink-600 border-pink-200' },
                admin: { text: 'ผู้ดูแลระบบ', style: 'bg-violet-50 text-violet-600 border-violet-200' }
              };"""
replacement_role_labels = """              const roleLabels: any = {
                teacher: { text: 'คุณครูผู้สอน', style: 'bg-sky-50 text-sky-600 border-sky-200' },
                academic: { text: 'หัวหน้าวิชาการ', style: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
                deputy: { text: 'รองผู้อำนวยการ', style: 'bg-pink-50 text-pink-600 border-pink-200' },
                admin: { text: 'ผู้ดูแลระบบ', style: 'bg-violet-50 text-violet-600 border-violet-200' },
                discipline: { text: 'หัวหน้างานปกครอง', style: 'bg-amber-50 text-amber-600 border-amber-200' }
              };"""
content2 = content2.replace(target_role_labels, replacement_role_labels)

target_stats = """          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-indigo-600">
            {teachers.filter(t => t.role === 'academic' || t.role === 'deputy').length} ท่าน
            </span>
            <span className="text-sm font-bold text-indigo-800 mt-1">ผู้บริหาร/หัวหน้างาน</span>
          </div>"""
replacement_stats = """          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-indigo-600">
            {teachers.filter(t => t.role === 'academic' || t.role === 'deputy' || t.role === 'discipline').length} ท่าน
            </span>
            <span className="text-sm font-bold text-indigo-800 mt-1">ผู้บริหาร/หัวหน้างาน</span>
          </div>"""
content2 = content2.replace(target_stats, replacement_stats)

# Also update the form <select> for roles
target_select = """                              <select 
                                value={editData.role || 'teacher'} 
                                onChange={e => setEditData({...editData, role: e.target.value as any})}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="teacher">คุณครูผู้สอน</option>
                                <option value="academic">หัวหน้าวิชาการ</option>
                                <option value="deputy">รองผู้อำนวยการ</option>
                                <option value="admin">ผู้ดูแลระบบ</option>
                              </select>"""
replacement_select = """                              <select 
                                value={editData.role || 'teacher'} 
                                onChange={e => setEditData({...editData, role: e.target.value as any})}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="teacher">คุณครูผู้สอน</option>
                                <option value="academic">หัวหน้าวิชาการ</option>
                                <option value="deputy">รองผู้อำนวยการ</option>
                                <option value="discipline">หัวหน้างานปกครอง</option>
                                <option value="admin">ผู้ดูแลระบบ</option>
                              </select>"""
content2 = content2.replace(target_select, replacement_select)

with open('src/components/UserManagementModule.tsx', 'w') as f:
    f.write(content2)

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content3 = f.read()

target_action = """{(currentTeacher.id === incident.teacherId || currentTeacher.role === 'admin') && ("""
replacement_action = """{(currentTeacher.id === incident.teacherId || currentTeacher.role === 'admin' || currentTeacher.role === 'discipline') && ("""
content3 = content3.replace(target_action, replacement_action)

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content3)
