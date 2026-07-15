import re

with open('src/components/StudentModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("    gender: 'male' as 'male' | 'female',", "    gender: 'male' as 'male' | 'female',\n    nationalId: '',")
content = content.replace("        gender: student.gender,", "        gender: student.gender,\n        nationalId: student.nationalId || '',")
content = content.replace("    setFormData(prev => ({ ...prev, studentId: '', firstName: '', lastName: '', nickname: '', dob: '', parentName: '', parentPhone: '', fatherName: '', fatherPhone: '', motherName: '', motherPhone: '', familyStatus: 'สมรส', address: '', medicalInfo: '', allergicMedicine: '', allergicFood: '', congenitalDisease: '', weight: '', height: '' }));", "    setFormData(prev => ({ ...prev, studentId: '', firstName: '', lastName: '', nickname: '', nationalId: '', dob: '', parentName: '', parentPhone: '', fatherName: '', fatherPhone: '', motherName: '', motherPhone: '', familyStatus: 'สมรส', address: '', medicalInfo: '', allergicMedicine: '', allergicFood: '', congenitalDisease: '', weight: '', height: '' }));")

target_input = """          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">วันเกิด</label>
            <input
              type="date"
              value={formData.dob}
              onChange={e => setFormData({ ...formData, dob: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
            />
          </div>"""

replacement_input = """          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">เลขประจำตัวประชาชน</label>
              <input
                type="text"
                value={formData.nationalId}
                onChange={e => setFormData({ ...formData, nationalId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                placeholder="เลขบัตร 13 หลัก"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">วันเกิด</label>
              <input
                type="date"
                value={formData.dob}
                onChange={e => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
          </div>"""

content = content.replace(target_input, replacement_input)

with open('src/components/StudentModal.tsx', 'w') as f:
    f.write(content)
