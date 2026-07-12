import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

# 1. State
state_target = """  const [otherTypeDetail, setOtherTypeDetail] = useState('');
  const [accidentDetail, setAccidentDetail] = useState('');
  const [otherAccidentDetail, setOtherAccidentDetail] = useState('');"""
state_replacement = """  const [otherTypeDetail, setOtherTypeDetail] = useState('');
  const [accidentDetail, setAccidentDetail] = useState('');
  const [otherAccidentDetail, setOtherAccidentDetail] = useState('');
  const [illnessDetail, setIllnessDetail] = useState('');
  const [otherIllnessDetail, setOtherIllnessDetail] = useState('');"""
content = content.replace(state_target, state_replacement)

# 2. Reset form
reset_target = """      setOtherTypeDetail('');
      setAccidentDetail('');
      setOtherAccidentDetail('');"""
reset_replacement = """      setOtherTypeDetail('');
      setAccidentDetail('');
      setOtherAccidentDetail('');
      setIllnessDetail('');
      setOtherIllnessDetail('');"""
content = content.replace(reset_target, reset_replacement)

# 3. AddDoc
submit_target = """        otherTypeDetail: type === 'other' ? otherTypeDetail : '',
        accidentDetail: type === 'accident' ? (accidentDetail === 'other' ? otherAccidentDetail : accidentDetail) : '',"""
submit_replacement = """        otherTypeDetail: type === 'other' ? otherTypeDetail : '',
        accidentDetail: type === 'accident' ? (accidentDetail === 'other' ? otherAccidentDetail : accidentDetail) : '',
        illnessDetail: type === 'illness' ? (illnessDetail === 'other' ? otherIllnessDetail : illnessDetail) : '',"""
content = content.replace(submit_target, submit_replacement)

# 4. Accident options
accident_opt_target = """                        <option value="เลือดกำเดาไหล">เลือดกำเดาไหล</option>
                        <option value="ถูกของมีคมบาด">ถูกของมีคมบาด</option>
                        <option value="other">อื่นๆ (ระบุเอง)</option>"""
accident_opt_replacement = """                        <option value="เลือดกำเดาไหล">เลือดกำเดาไหล</option>
                        <option value="ถูกของมีคมบาด">ถูกของมีคมบาด</option>
                        <option value="ประตู/หน้าต่าง/โต๊ะหนีบ">ประตู/หน้าต่าง/โต๊ะหนีบ</option>
                        <option value="other">อื่นๆ (ระบุเอง)</option>"""
content = content.replace(accident_opt_target, accident_opt_replacement)

# 5. Form options for illness
illness_ui_target = """                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">"""
illness_ui_replacement = """                    </div>
                  )}
                  {type === 'illness' && (
                    <div className="mt-2 space-y-2">
                      <select
                        value={illnessDetail}
                        onChange={(e) => setIllnessDetail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="">-- เลือกลักษณะอาการเจ็บป่วย --</option>
                        <option value="ปวดท้อง">ปวดท้อง</option>
                        <option value="ปวดหัว">ปวดหัว</option>
                        <option value="มีไข้ ตัวร้อน">มีไข้ ตัวร้อน</option>
                        <option value="อาการแพ้อาหาร">อาการแพ้อาหาร</option>
                        <option value="other">อื่นๆ (ระบุเอง)</option>
                      </select>
                      {illnessDetail === 'other' && (
                        <input
                          type="text"
                          placeholder="ระบุลักษณะอาการเจ็บป่วยเพิ่มเติม..."
                          value={otherIllnessDetail}
                          onChange={(e) => setOtherIllnessDetail(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">"""
content = content.replace(illness_ui_target, illness_ui_replacement)


# 6. getTypeLabel
label_target = """  const getTypeLabel = (type: string, otherDetail?: string, accidentDetail?: string) => {
    switch (type) {
      case 'fight': return { label: 'ทะเลาะวิวาท / ทำร้ายร่างกาย', color: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'bullying': return { label: 'ความบาดหมาง / กลั่นแกล้ง', color: 'bg-orange-100 text-orange-700 border-orange-200' };
      case 'disruption': return { label: 'ความเข้าใจผิด / ก่อความวุ่นวาย', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'accident': return { label: `อุบัติเหตุ${accidentDetail ? `: ${accidentDetail}` : ''}`, color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'illness': return { label: 'เจ็บป่วยกะทันหัน', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };"""
label_replacement = """  const getTypeLabel = (type: string, otherDetail?: string, accidentDetail?: string, illnessDetail?: string) => {
    switch (type) {
      case 'fight': return { label: 'ทะเลาะวิวาท / ทำร้ายร่างกาย', color: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'bullying': return { label: 'ความบาดหมาง / กลั่นแกล้ง', color: 'bg-orange-100 text-orange-700 border-orange-200' };
      case 'disruption': return { label: 'ความเข้าใจผิด / ก่อความวุ่นวาย', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'accident': return { label: `อุบัติเหตุ${accidentDetail ? `: ${accidentDetail}` : ''}`, color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'illness': return { label: `เจ็บป่วยกะทันหัน${illnessDetail ? `: ${illnessDetail}` : ''}`, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };"""
content = content.replace(label_target, label_replacement)

# 7. getTypeLabel call
type_call_target = """const typeInfo = getTypeLabel(incident.type, incident.otherTypeDetail, incident.accidentDetail);"""
type_call_replacement = """const typeInfo = getTypeLabel(incident.type, incident.otherTypeDetail, incident.accidentDetail, incident.illnessDetail);"""
content = content.replace(type_call_target, type_call_replacement)


# 8. Form validate
submit_btn_target = """(type === 'accident' && (!accidentDetail.trim() || (accidentDetail === 'other' && !otherAccidentDetail.trim()))) || (actionTaken === 'other' && !actionTakenDetail.trim())}"""
submit_btn_replacement = """(type === 'accident' && (!accidentDetail.trim() || (accidentDetail === 'other' && !otherAccidentDetail.trim()))) || (type === 'illness' && (!illnessDetail.trim() || (illnessDetail === 'other' && !otherIllnessDetail.trim()))) || (actionTaken === 'other' && !actionTakenDetail.trim())}"""
content = content.replace(submit_btn_target, submit_btn_replacement)

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
