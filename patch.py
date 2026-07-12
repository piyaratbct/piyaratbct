import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

# 1. State
state_target = """  const [type, setType] = useState<DisciplineIncident['type']>('fight');
  const [otherTypeDetail, setOtherTypeDetail] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
  const [severity, setSeverity] = useState<DisciplineIncident['severity']>('medium');
  const [actionTaken, setActionTaken] = useState('');"""
state_replacement = """  const [type, setType] = useState<DisciplineIncident['type']>('fight');
  const [otherTypeDetail, setOtherTypeDetail] = useState('');
  const [accidentDetail, setAccidentDetail] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
  const [severity, setSeverity] = useState<DisciplineIncident['severity']>('none');
  const [actionTaken, setActionTaken] = useState<DisciplineIncident['actionTaken']>('none');
  const [actionTakenDetail, setActionTakenDetail] = useState('');"""
content = content.replace(state_target, state_replacement)

# 2. Reset form
reset_target = """      setType('fight');
      setOtherTypeDetail('');
      setDescription('');
      setTime(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
      setSeverity('medium');
      setActionTaken('');"""
reset_replacement = """      setType('fight');
      setOtherTypeDetail('');
      setAccidentDetail('');
      setDescription('');
      setTime(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
      setSeverity('none');
      setActionTaken('none');
      setActionTakenDetail('');"""
content = content.replace(reset_target, reset_replacement)

# 3. Handle Submit
submit_target = """        type,
        otherTypeDetail: type === 'other' ? otherTypeDetail : '',
        time,
        severity,
        actionTaken,"""
submit_replacement = """        type,
        otherTypeDetail: type === 'other' ? otherTypeDetail : '',
        accidentDetail: type === 'accident' ? accidentDetail : '',
        time,
        severity,
        actionTaken,
        actionTakenDetail: actionTaken === 'other' ? actionTakenDetail : '',"""
content = content.replace(submit_target, submit_replacement)


# 4. Severity Label
sev_label_target = """  const getSeverityLabel = (severity?: string) => {
    switch (severity) {
      case 'low': return { label: 'เล็กน้อย', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
      case 'medium': return { label: 'ปานกลาง', color: 'bg-amber-50 text-amber-600 border-amber-200' };
      case 'high': return { label: 'รุนแรง', color: 'bg-orange-50 text-orange-600 border-orange-200' };
      case 'critical': return { label: 'วิกฤต', color: 'bg-rose-50 text-rose-600 border-rose-200' };
      default: return { label: 'ไม่ระบุ', color: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };"""
sev_label_replacement = """  const getSeverityLabel = (severity?: string) => {
    switch (severity) {
      case 'none': return { label: 'ไม่ได้รับผลกระทบ', color: 'bg-slate-50 text-slate-600 border-slate-200' };
      case 'low': return { label: 'เล็กน้อย', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
      case 'medium': return { label: 'ปานกลาง', color: 'bg-amber-50 text-amber-600 border-amber-200' };
      case 'high': return { label: 'รุนแรง', color: 'bg-orange-50 text-orange-600 border-orange-200' };
      case 'critical': return { label: 'วิกฤต', color: 'bg-rose-50 text-rose-600 border-rose-200' };
      default: return { label: 'ไม่ระบุ', color: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };
  
  const getActionTakenLabel = (actionTaken?: string, detail?: string) => {
    switch (actionTaken) {
      case 'none': return 'ไม่ต้องรับการรักษา';
      case 'first_aid': return 'ปฐมพยาบาลเบื้องต้น';
      case 'hospital': return 'นำส่งโรงพยาบาล';
      case 'other': return `อื่นๆ: ${detail || ''}`;
      default: return actionTaken || '';
    }
  };"""
content = content.replace(sev_label_target, sev_label_replacement)

# 5. Incident card actions
cardaction_target = """                    {incident.actionTaken && (
                      <div className="flex items-start gap-2">
                        <ShieldAlert className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-500 mb-1">การปฐมพยาบาล/การแก้ปัญหา:</p>
                          <p className="text-sm text-slate-600 line-clamp-2">{incident.actionTaken}</p>
                        </div>
                      </div>
                    )}"""
cardaction_replacement = """                    {incident.actionTaken && incident.actionTaken !== 'none' && (
                      <div className="flex items-start gap-2">
                        <ShieldAlert className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-500 mb-1">การปฐมพยาบาล/การแก้ปัญหา:</p>
                          <p className="text-sm text-slate-600 line-clamp-2">{getActionTakenLabel(incident.actionTaken, incident.actionTakenDetail)}</p>
                        </div>
                      </div>
                    )}"""
content = content.replace(cardaction_target, cardaction_replacement)


# 6. Type Select (accident detail)
typeselect_target = """                  {type === 'other' && (
                    <input
                      type="text"
                      placeholder="ระบุเพิ่มเติม..."
                      value={otherTypeDetail}
                      onChange={(e) => setOtherTypeDetail(e.target.value)}
                      className="w-full mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  )}
                </div>"""
typeselect_replacement = """                  {type === 'other' && (
                    <input
                      type="text"
                      placeholder="ระบุเพิ่มเติม..."
                      value={otherTypeDetail}
                      onChange={(e) => setOtherTypeDetail(e.target.value)}
                      className="w-full mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  )}
                  {type === 'accident' && (
                    <input
                      type="text"
                      placeholder="ระบุลักษณะอุบัติเหตุเพิ่มเติม..."
                      value={accidentDetail}
                      onChange={(e) => setAccidentDetail(e.target.value)}
                      className="w-full mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  )}
                </div>"""
content = content.replace(typeselect_target, typeselect_replacement)


# 7. Severity Form 
sevform_target = """                <label className="text-sm font-bold text-slate-700">ระดับความรุนแรง</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'low', label: 'เล็กน้อย', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
                    { value: 'medium', label: 'ปานกลาง', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
                    { value: 'high', label: 'รุนแรง', color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
                    { value: 'critical', label: 'วิกฤต', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' }
                  ].map(sev => ("""
sevform_replacement = """                <label className="text-sm font-bold text-slate-700">ระดับความรุนแรง</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { value: 'none', label: 'ไม่ได้รับผลกระทบ', color: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200' },
                    { value: 'low', label: 'เล็กน้อย', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
                    { value: 'medium', label: 'ปานกลาง', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
                    { value: 'high', label: 'รุนแรง', color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
                    { value: 'critical', label: 'วิกฤต', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' }
                  ].map(sev => ("""
content = content.replace(sevform_target, sevform_replacement)


# 8. ActionTaken Form
actionform_target = """              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">การปฐมพยาบาล / การแก้ปัญหา</label>
                <textarea
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="ระบุการปฐมพยาบาลเบื้องต้น, การนำส่งห้องพยาบาล, หรือการแก้ปัญหาที่ได้ดำเนินการไปแล้ว..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
                ></textarea>
              </div>"""
actionform_replacement = """              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">การปฐมพยาบาล / การแก้ปัญหา</label>
                <select
                  value={actionTaken}
                  onChange={(e: any) => setActionTaken(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="none">ไม่ต้องรับการรักษา</option>
                  <option value="first_aid">ปฐมพยาบาลเบื้องต้น</option>
                  <option value="hospital">นำส่งโรงพยาบาล</option>
                  <option value="other">อื่นๆ</option>
                </select>
                {actionTaken === 'other' && (
                  <input
                    type="text"
                    placeholder="ระบุการดำเนินการเพิ่มเติม..."
                    value={actionTakenDetail}
                    onChange={(e) => setActionTakenDetail(e.target.value)}
                    className="w-full mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                )}
              </div>"""
content = content.replace(actionform_target, actionform_replacement)

# 9. Form validate (disabled submit)
submit_btn_target = """disabled={isSubmitting || selectedStudentIds.length === 0 || !description.trim() || (type === 'other' && !otherTypeDetail.trim())}"""
submit_btn_replacement = """disabled={isSubmitting || selectedStudentIds.length === 0 || !description.trim() || (type === 'other' && !otherTypeDetail.trim()) || (type === 'accident' && !accidentDetail.trim()) || (actionTaken === 'other' && !actionTakenDetail.trim())}"""
content = content.replace(submit_btn_target, submit_btn_replacement)


with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
