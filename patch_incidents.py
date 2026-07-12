import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

# 1. Icons import
content = content.replace("from 'lucide-react';", "from 'lucide-react';") # no change but check if we need clock

# 2. Form state
state_target = """  const [otherTypeDetail, setOtherTypeDetail] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);"""
state_replacement = """  const [otherTypeDetail, setOtherTypeDetail] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
  const [severity, setSeverity] = useState<DisciplineIncident['severity']>('medium');
  const [actionTaken, setActionTaken] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);"""
content = content.replace(state_target, state_replacement)

# 3. Handle Submit
submit_target = """        otherTypeDetail: type === 'other' ? otherTypeDetail : '',
        teacherId: currentTeacher.id,
        teacherName: currentTeacher.thaiName || currentTeacher.displayName,
        date,
        semester: systemSemester,"""
submit_replacement = """        otherTypeDetail: type === 'other' ? otherTypeDetail : '',
        time,
        severity,
        actionTaken,
        teacherId: currentTeacher.id,
        teacherName: currentTeacher.thaiName || currentTeacher.displayName,
        date,
        semester: systemSemester,"""
content = content.replace(submit_target, submit_replacement)

reset_target = """      setType('fight');
      setOtherTypeDetail('');
      setDescription('');
      setSelectedStudentIds([]);"""
reset_replacement = """      setType('fight');
      setOtherTypeDetail('');
      setDescription('');
      setTime(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
      setSeverity('medium');
      setActionTaken('');
      setSelectedStudentIds([]);"""
content = content.replace(reset_target, reset_replacement)

# 4. Severity labels
gettype_target = """  const getTypeLabel = (type: string, otherDetail?: string) => {"""
gettype_replacement = """  const getSeverityLabel = (severity?: string) => {
    switch (severity) {
      case 'low': return { label: 'เล็กน้อย', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
      case 'medium': return { label: 'ปานกลาง', color: 'bg-amber-50 text-amber-600 border-amber-200' };
      case 'high': return { label: 'รุนแรง', color: 'bg-orange-50 text-orange-600 border-orange-200' };
      case 'critical': return { label: 'วิกฤต', color: 'bg-rose-50 text-rose-600 border-rose-200' };
      default: return { label: 'ไม่ระบุ', color: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  const getTypeLabel = (type: string, otherDetail?: string) => {"""
content = content.replace(gettype_target, gettype_replacement)

# 5. Incident card headers
card_target = """                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    <div className="flex gap-2">
                      <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                        {incident.date}
                      </span>"""
card_replacement = """                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      {incident.severity && (
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ml-2 inline-block mt-1 sm:mt-0 ${getSeverityLabel(incident.severity).color}`}>
                          {getSeverityLabel(incident.severity).label}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg whitespace-nowrap">
                        {incident.date} {incident.time && `เวลา ${incident.time} น.`}
                      </span>"""
content = content.replace(card_target, card_replacement)

# 6. Incident card actions
cardaction_target = """                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 mb-1">รายละเอียดเหตุการณ์:</p>
                        <p className="text-sm text-slate-600 line-clamp-3">{incident.description}</p>
                      </div>
                    </div>
                  </div>"""
cardaction_replacement = """                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 mb-1">รายละเอียดเหตุการณ์:</p>
                        <p className="text-sm text-slate-600 line-clamp-3">{incident.description}</p>
                      </div>
                    </div>
                    
                    {incident.actionTaken && (
                      <div className="flex items-start gap-2">
                        <ShieldAlert className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-500 mb-1">การปฐมพยาบาล/การแก้ปัญหา:</p>
                          <p className="text-sm text-slate-600 line-clamp-2">{incident.actionTaken}</p>
                        </div>
                      </div>
                    )}
                  </div>"""
content = content.replace(cardaction_target, cardaction_replacement)

# 7. Form - date/time
formdate_target = """                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">วันที่เกิดเหตุ</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>"""
formdate_replacement = """                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">วันและเวลาที่เกิดเหตุ</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div className="relative w-28 sm:w-32">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                </div>"""
content = content.replace(formdate_target, formdate_replacement)

# 8. Form - type select
formtype_target = """                  </select>
                  {type === 'other' && (
                    <input
                      type="text"
                      placeholder="ระบุเพิ่มเติม..."
                      value={otherTypeDetail}
                      onChange={(e) => setOtherTypeDetail(e.target.value)}
                      className="w-full mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  )}
                </div>
              </div>"""
formtype_replacement = """                  </select>
                  {type === 'other' && (
                    <input
                      type="text"
                      placeholder="ระบุเพิ่มเติม..."
                      value={otherTypeDetail}
                      onChange={(e) => setOtherTypeDetail(e.target.value)}
                      className="w-full mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">ระดับความรุนแรง</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'low', label: 'เล็กน้อย', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
                    { value: 'medium', label: 'ปานกลาง', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
                    { value: 'high', label: 'รุนแรง', color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
                    { value: 'critical', label: 'วิกฤต', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' }
                  ].map(sev => (
                    <button
                      key={sev.value}
                      type="button"
                      onClick={() => setSeverity(sev.value as any)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition-colors text-center
                        ${severity === sev.value ? sev.color : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                    >
                      {sev.label}
                    </button>
                  ))}
                </div>
              </div>"""
content = content.replace(formtype_target, formtype_replacement)


# 9. Form - actionTaken
formaction_target = """              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">รายละเอียดเหตุการณ์ <span className="text-rose-500">*</span></label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="บรรยายเหตุการณ์ที่เกิดขึ้น สาเหตุ และการดำเนินการเบื้องต้น..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[120px]"
                ></textarea>
              </div>
              
            </div>"""
formaction_replacement = """              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">รายละเอียดเหตุการณ์ <span className="text-rose-500">*</span></label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="บรรยายเหตุการณ์ที่เกิดขึ้น สาเหตุ..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[80px]"
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">การปฐมพยาบาล / การแก้ปัญหา</label>
                <textarea
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="ระบุการปฐมพยาบาลเบื้องต้น, การนำส่งห้องพยาบาล, หรือการแก้ปัญหาที่ได้ดำเนินการไปแล้ว..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
                ></textarea>
              </div>
              
            </div>"""
content = content.replace(formaction_target, formaction_replacement)

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
