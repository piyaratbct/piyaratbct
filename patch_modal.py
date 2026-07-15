import re

with open('src/components/StudentModal.tsx', 'r') as f:
    content = f.read()

target1 = """    medicalInfo: '',
    allergicMedicine: '',
    allergicFood: '',
    congenitalDisease: ''"""

replacement1 = """    medicalInfo: '',
    allergicMedicine: '',
    allergicFood: '',
    congenitalDisease: '',
    weight: '',
    height: ''"""
content = content.replace(target1, replacement1)

target2 = """        medicalInfo: student.medicalInfo || '',
        allergicMedicine: student.allergicMedicine || '',
        allergicFood: student.allergicFood || '',
        congenitalDisease: student.congenitalDisease || ''"""

replacement2 = """        medicalInfo: student.medicalInfo || '',
        allergicMedicine: student.allergicMedicine || '',
        allergicFood: student.allergicFood || '',
        congenitalDisease: student.congenitalDisease || '',
        weight: student.weight || '',
        height: student.height || ''"""
content = content.replace(target2, replacement2)

target3 = """          {/* Medical Info */}
          <div className="bg-rose-50 p-4 rounded-xl space-y-4 border border-rose-100">"""

replacement3 = """          {/* Medical Info */}
          <div className="bg-rose-50 p-4 rounded-xl space-y-4 border border-rose-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-rose-700 mb-1">น้ำหนัก (กก.)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: e.target.value ? parseFloat(e.target.value) : '' })}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none placeholder-rose-300"
                  placeholder="เช่น 45.5"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-rose-700 mb-1">ส่วนสูง (ซม.)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={e => setFormData({ ...formData, height: e.target.value ? parseFloat(e.target.value) : '' })}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none placeholder-rose-300"
                  placeholder="เช่น 150"
                />
              </div>
            </div>"""
content = content.replace(target3, replacement3)

with open('src/components/StudentModal.tsx', 'w') as f:
    f.write(content)
