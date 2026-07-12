import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

# 1. State
state_target = """  const [type, setType] = useState<DisciplineIncident['type']>('fight');
  const [description, setDescription] = useState('');"""
state_replacement = """  const [type, setType] = useState<DisciplineIncident['type']>('fight');
  const [otherTypeDetail, setOtherTypeDetail] = useState('');
  const [description, setDescription] = useState('');"""
content = content.replace(state_target, state_replacement)

# 2. Reset form
reset_target = """      // Reset form
      setType('fight');
      setDescription('');"""
reset_replacement = """      // Reset form
      setType('fight');
      setOtherTypeDetail('');
      setDescription('');"""
content = content.replace(reset_target, reset_replacement)

# 3. AddDoc
add_target = """        type,
        teacherId: currentTeacher.id,"""
add_replacement = """        type,
        otherTypeDetail: type === 'other' ? otherTypeDetail : '',
        teacherId: currentTeacher.id,"""
content = content.replace(add_target, add_replacement)

# 4. getTypeLabel
get_label_target = """  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'fight': return { label: 'ทะเลาะวิวาท', color: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'conflict': return { label: 'ความบาดหมาง', color: 'bg-orange-100 text-orange-700 border-orange-200' };
      case 'misunderstanding': return { label: 'ความเข้าใจผิด', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'accident': return { label: 'อุบัติเหตุ', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'other': return { label: 'อื่นๆ', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      default: return { label: 'ไม่ระบุ', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };"""
get_label_replacement = """  const getTypeLabel = (type: string, otherDetail?: string) => {
    switch (type) {
      case 'fight': return { label: 'ทะเลาะวิวาท / ทำร้ายร่างกาย', color: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'bullying': return { label: 'ความบาดหมาง / กลั่นแกล้ง', color: 'bg-orange-100 text-orange-700 border-orange-200' };
      case 'disruption': return { label: 'ความเข้าใจผิด / ก่อความวุ่นวาย', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'accident': return { label: 'อุบัติเหตุ', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'illness': return { label: 'เจ็บป่วยกะทันหัน', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'vandalism': return { label: 'ทำลายทรัพย์สิน', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'other': return { label: `อื่นๆ: ${otherDetail || ''}`, color: 'bg-slate-100 text-slate-700 border-slate-200' };
      default: return { label: 'ไม่ระบุ', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };"""
content = content.replace(get_label_target, get_label_replacement)

# 5. typeInfo
type_info_target = "const typeInfo = getTypeLabel(incident.type);"
type_info_replacement = "const typeInfo = getTypeLabel(incident.type, incident.otherTypeDetail);"
content = content.replace(type_info_target, type_info_replacement)

# 6. Options and extra input
options_target = """                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="fight">ทะเลาะวิวาท</option>
                    <option value="conflict">ความบาดหมาง</option>
                    <option value="misunderstanding">ความเข้าใจผิด</option>
                    <option value="accident">อุบัติเหตุ</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>"""
options_replacement = """                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="fight">ทะเลาะวิวาท / ทำร้ายร่างกาย</option>
                    <option value="bullying">ความบาดหมาง / กลั่นแกล้ง</option>
                    <option value="disruption">ความเข้าใจผิด / ก่อความวุ่นวาย</option>
                    <option value="accident">อุบัติเหตุ</option>
                    <option value="illness">เจ็บป่วยกะทันหัน</option>
                    <option value="vandalism">ทำลายทรัพย์สิน</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                  {type === 'other' && (
                    <input
                      type="text"
                      placeholder="ระบุเพิ่มเติม..."
                      value={otherTypeDetail}
                      onChange={(e) => setOtherTypeDetail(e.target.value)}
                      className="w-full mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  )}
                </div>"""
content = content.replace(options_target, options_replacement)

submit_target = "disabled={isSubmitting || selectedStudentIds.length === 0 || !description.trim()}"
submit_replacement = "disabled={isSubmitting || selectedStudentIds.length === 0 || !description.trim() || (type === 'other' && !otherTypeDetail.trim())}"
content = content.replace(submit_target, submit_replacement)

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
print("Patched DisciplineModule")
