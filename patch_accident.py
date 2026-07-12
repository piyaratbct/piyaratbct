import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

# 1. State
state_target = """  const [otherTypeDetail, setOtherTypeDetail] = useState('');
  const [accidentDetail, setAccidentDetail] = useState('');"""
state_replacement = """  const [otherTypeDetail, setOtherTypeDetail] = useState('');
  const [accidentDetail, setAccidentDetail] = useState('');
  const [otherAccidentDetail, setOtherAccidentDetail] = useState('');"""
content = content.replace(state_target, state_replacement)

# 2. Reset form
reset_target = """      setOtherTypeDetail('');
      setAccidentDetail('');"""
reset_replacement = """      setOtherTypeDetail('');
      setAccidentDetail('');
      setOtherAccidentDetail('');"""
content = content.replace(reset_target, reset_replacement)

# 3. AddDoc
submit_target = """        otherTypeDetail: type === 'other' ? otherTypeDetail : '',
        accidentDetail: type === 'accident' ? accidentDetail : '',"""
submit_replacement = """        otherTypeDetail: type === 'other' ? otherTypeDetail : '',
        accidentDetail: type === 'accident' ? (accidentDetail === 'other' ? otherAccidentDetail : accidentDetail) : '',"""
content = content.replace(submit_target, submit_replacement)

# 4. Form options
ui_target = """                  {type === 'accident' && (
                    <input
                      type="text"
                      placeholder="ระบุลักษณะอุบัติเหตุเพิ่มเติม..."
                      value={accidentDetail}
                      onChange={(e) => setAccidentDetail(e.target.value)}
                      className="w-full mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  )}"""
ui_replacement = """                  {type === 'accident' && (
                    <div className="mt-2 space-y-2">
                      <select
                        value={accidentDetail}
                        onChange={(e) => setAccidentDetail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="">-- เลือกลักษณะอุบัติเหตุ --</option>
                        <option value="หกล้ม / ลื่นล้ม">หกล้ม / ลื่นล้ม</option>
                        <option value="วิ่งชน / วิ่งปะทะ">วิ่งชน / วิ่งปะทะ</option>
                        <option value="อุบัติเหตุจากการทำกิจกรรม เช่น เล่นกีฬา">อุบัติเหตุจากการทำกิจกรรม เช่น เล่นกีฬา</option>
                        <option value="เลือดกำเดาไหล">เลือดกำเดาไหล</option>
                        <option value="ถูกของมีคมบาด">ถูกของมีคมบาด</option>
                        <option value="other">อื่นๆ (ระบุเอง)</option>
                      </select>
                      {accidentDetail === 'other' && (
                        <input
                          type="text"
                          placeholder="ระบุลักษณะอุบัติเหตุเพิ่มเติม..."
                          value={otherAccidentDetail}
                          onChange={(e) => setOtherAccidentDetail(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      )}
                    </div>
                  )}"""
content = content.replace(ui_target, ui_replacement)

# 5. Form validate
submit_btn_target = """(type === 'accident' && !accidentDetail.trim())"""
submit_btn_replacement = """(type === 'accident' && (!accidentDetail.trim() || (accidentDetail === 'other' && !otherAccidentDetail.trim())))"""
content = content.replace(submit_btn_target, submit_btn_replacement)

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
