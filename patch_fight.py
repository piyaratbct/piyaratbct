import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

# 1. State
state_target = """  const [illnessDetail, setIllnessDetail] = useState('');
  const [otherIllnessDetail, setOtherIllnessDetail] = useState('');"""
state_replacement = """  const [illnessDetail, setIllnessDetail] = useState('');
  const [otherIllnessDetail, setOtherIllnessDetail] = useState('');
  const [fightDetail, setFightDetail] = useState('');
  const [otherFightDetail, setOtherFightDetail] = useState('');"""
content = content.replace(state_target, state_replacement)

# 2. Reset form
reset_target = """      setIllnessDetail('');
      setOtherIllnessDetail('');"""
reset_replacement = """      setIllnessDetail('');
      setOtherIllnessDetail('');
      setFightDetail('');
      setOtherFightDetail('');"""
content = content.replace(reset_target, reset_replacement)

# 3. AddDoc
submit_target = """        illnessDetail: type === 'illness' ? (illnessDetail === 'other' ? otherIllnessDetail : illnessDetail) : '',"""
submit_replacement = """        illnessDetail: type === 'illness' ? (illnessDetail === 'other' ? otherIllnessDetail : illnessDetail) : '',
        fightDetail: type === 'fight' ? (fightDetail === 'other' ? otherFightDetail : fightDetail) : '',"""
content = content.replace(submit_target, submit_replacement)

# 4. Form options
ui_target = """                  {type === 'other' && (
                    <input
                      type="text"
                      placeholder="ระบุเพิ่มเติม..."
                      value={otherTypeDetail}
                      onChange={(e) => setOtherTypeDetail(e.target.value)}
                      className="w-full mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  )}
                  {type === 'accident' && ("""
ui_replacement = """                  {type === 'other' && (
                    <input
                      type="text"
                      placeholder="ระบุเพิ่มเติม..."
                      value={otherTypeDetail}
                      onChange={(e) => setOtherTypeDetail(e.target.value)}
                      className="w-full mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  )}
                  {type === 'fight' && (
                    <div className="mt-2 space-y-2">
                      <select
                        value={fightDetail}
                        onChange={(e) => setFightDetail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="">-- เลือกลักษณะการทะเลาะวิวาท --</option>
                        <option value="ทะเลาะวิวาทด้วยวาจา (ด่าทอ)">ทะเลาะวิวาทด้วยวาจา (ด่าทอ)</option>
                        <option value="ชกต่อย / ตบตี">ชกต่อย / ตบตี</option>
                        <option value="รุมทำร้าย">รุมทำร้าย</option>
                        <option value="ใช้อาวุธ">ใช้อาวุธ</option>
                        <option value="other">อื่นๆ (ระบุเอง)</option>
                      </select>
                      {fightDetail === 'other' && (
                        <input
                          type="text"
                          placeholder="ระบุลักษณะการทะเลาะวิวาทเพิ่มเติม..."
                          value={otherFightDetail}
                          onChange={(e) => setOtherFightDetail(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      )}
                    </div>
                  )}
                  {type === 'accident' && ("""
content = content.replace(ui_target, ui_replacement)

# 5. getTypeLabel
label_target = """  const getTypeLabel = (type: string, otherDetail?: string, accidentDetail?: string, illnessDetail?: string) => {
    switch (type) {
      case 'fight': return { label: 'ทะเลาะวิวาท / ทำร้ายร่างกาย', color: 'bg-rose-100 text-rose-700 border-rose-200' };"""
label_replacement = """  const getTypeLabel = (type: string, otherDetail?: string, accidentDetail?: string, illnessDetail?: string, fightDetail?: string) => {
    switch (type) {
      case 'fight': return { label: `ทะเลาะวิวาท / ทำร้ายร่างกาย${fightDetail ? `: ${fightDetail}` : ''}`, color: 'bg-rose-100 text-rose-700 border-rose-200' };"""
content = content.replace(label_target, label_replacement)

# 6. getTypeLabel call
type_call_target = """const typeInfo = getTypeLabel(incident.type, incident.otherTypeDetail, incident.accidentDetail, incident.illnessDetail);"""
type_call_replacement = """const typeInfo = getTypeLabel(incident.type, incident.otherTypeDetail, incident.accidentDetail, incident.illnessDetail, incident.fightDetail);"""
content = content.replace(type_call_target, type_call_replacement)

# 7. Form validate
submit_btn_target = """(type === 'illness' && (!illnessDetail.trim() || (illnessDetail === 'other' && !otherIllnessDetail.trim()))) || (actionTaken === 'other' && !actionTakenDetail.trim())}"""
submit_btn_replacement = """(type === 'illness' && (!illnessDetail.trim() || (illnessDetail === 'other' && !otherIllnessDetail.trim()))) || (type === 'fight' && (!fightDetail.trim() || (fightDetail === 'other' && !otherFightDetail.trim()))) || (actionTaken === 'other' && !actionTakenDetail.trim())}"""
content = content.replace(submit_btn_target, submit_btn_replacement)


with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
