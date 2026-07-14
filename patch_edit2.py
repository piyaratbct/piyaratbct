import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

# 1. State
state_target = """  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');"""
state_replacement = """  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');"""
# Already done but let's re-apply it properly if needed.

# 2. handleEdit function
handleedit = """
  const resetForm = () => {
    setType('fight');
    setOtherTypeDetail('');
    setAccidentDetail('');
    setOtherAccidentDetail('');
    setIllnessDetail('');
    setOtherIllnessDetail('');
    setFightDetail('');
    setOtherFightDetail('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
    setSeverity('none');
    setActionTaken('none');
    setActionTakenDetail('');
    setSelectedStudentIds([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (incident: DisciplineIncident) => {
    setEditingId(incident.id);
    setType(incident.type as any);
    
    // Parse complex fields
    if (incident.type === 'other') setOtherTypeDetail(incident.otherTypeDetail || '');
    else setOtherTypeDetail('');
    
    if (incident.type === 'accident') {
      const predefinedAccidents = ['หกล้ม / ลื่นล้ม', 'วิ่งชน / วิ่งปะทะ', 'อุบัติเหตุจากการทำกิจกรรม เช่น เล่นกีฬา', 'ถูกของมีคมบาด', 'ประตู/หน้าต่าง/โต๊ะหนีบ'];
      if (incident.accidentDetail && !predefinedAccidents.includes(incident.accidentDetail)) {
        setAccidentDetail('other');
        setOtherAccidentDetail(incident.accidentDetail);
      } else {
        setAccidentDetail(incident.accidentDetail || '');
        setOtherAccidentDetail('');
      }
    } else {
      setAccidentDetail('');
      setOtherAccidentDetail('');
    }

    if (incident.type === 'illness') {
      const predefinedIllness = ['ปวดท้อง', 'ปวดหัว', 'มีไข้ ตัวร้อน', 'อาการแพ้อาหาร'];
      if (incident.illnessDetail && !predefinedIllness.includes(incident.illnessDetail)) {
        setIllnessDetail('other');
        setOtherIllnessDetail(incident.illnessDetail);
      } else {
        setIllnessDetail(incident.illnessDetail || '');
        setOtherIllnessDetail('');
      }
    } else {
      setIllnessDetail('');
      setOtherIllnessDetail('');
    }

    if (incident.type === 'fight') {
      const predefinedFights = ['ทะเลาะวิวาทด้วยวาจา (ด่าทอ)', 'ชกต่อย / ตบตี', 'รุมทำร้าย', 'ใช้อาวุธ'];
      if (incident.fightDetail && !predefinedFights.includes(incident.fightDetail)) {
        setFightDetail('other');
        setOtherFightDetail(incident.fightDetail);
      } else {
        setFightDetail(incident.fightDetail || '');
        setOtherFightDetail('');
      }
    } else {
      setFightDetail('');
      setOtherFightDetail('');
    }

    setDescription(incident.description);
    setDate(incident.date);
    setTime(incident.time || '');
    setSeverity(incident.severity || 'none');
    
    const predefinedActions = ['none', 'first_aid', 'hospital'];
    if (incident.actionTaken && !predefinedActions.includes(incident.actionTaken)) {
      setActionTaken('other');
      setActionTakenDetail(incident.actionTakenDetail || '');
    } else {
      setActionTaken(incident.actionTaken as any || 'none');
      setActionTakenDetail('');
    }
    
    setSelectedStudentIds(incident.studentIds || []);
    setShowForm(true);
  };
"""

target_delete = """  const handleDelete = async (id: string) => {"""
content = content.replace(target_delete, handleedit + target_delete)

# 3. Modify handleSubmit
submit_target = """      const selectedStudents = students.filter(s => selectedStudentIds.includes(s.id));
      const studentNames = selectedStudents.map(s => `${s.firstName} ${s.lastName} ${s.nickname ? `(${s.nickname})` : ''} - ${s.gradeLevel}`);

      await addDoc(collection(db, 'disciplineIncidents'), {"""
submit_replacement = """      const selectedStudents = students.filter(s => selectedStudentIds.includes(s.id));
      const studentNames = selectedStudents.map(s => `${s.firstName} ${s.lastName} ${s.nickname ? `(${s.nickname})` : ''} - ${s.gradeLevel}`);

      const dataToSave = {
        studentIds: selectedStudentIds,
        studentNames,
        description,
        type,
        otherTypeDetail: type === 'other' ? otherTypeDetail : '',
        accidentDetail: type === 'accident' ? (accidentDetail === 'other' ? otherAccidentDetail : accidentDetail) : '',
        illnessDetail: type === 'illness' ? (illnessDetail === 'other' ? otherIllnessDetail : illnessDetail) : '',
        fightDetail: type === 'fight' ? (fightDetail === 'other' ? otherFightDetail : fightDetail) : '',
        time,
        severity,
        actionTaken,
        actionTakenDetail: actionTaken === 'other' ? actionTakenDetail : '',
        teacherId: currentTeacher.id,
        teacherName: currentTeacher.thaiName || currentTeacher.displayName,
        date,
        semester: systemSemester,
        academicYear: systemAcademicYear,
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, 'disciplineIncidents', editingId), dataToSave);
      } else {
        await addDoc(collection(db, 'disciplineIncidents'), {
          ...dataToSave,
          createdAt: serverTimestamp(),
        });
      }"""
content = content.replace(submit_target, submit_replacement)

# Remove the rest of addDoc in handleSubmit
adddoc_rest_target = """        studentIds: selectedStudentIds,
        studentNames,
        description,
        type,
        otherTypeDetail: type === 'other' ? otherTypeDetail : '',
        accidentDetail: type === 'accident' ? (accidentDetail === 'other' ? otherAccidentDetail : accidentDetail) : '',
        illnessDetail: type === 'illness' ? (illnessDetail === 'other' ? otherIllnessDetail : illnessDetail) : '',
        fightDetail: type === 'fight' ? (fightDetail === 'other' ? otherFightDetail : fightDetail) : '',
        time,
        severity,
        actionTaken,
        actionTakenDetail: actionTaken === 'other' ? actionTakenDetail : '',
        teacherId: currentTeacher.id,
        teacherName: currentTeacher.thaiName || currentTeacher.displayName,
        date,
        semester: systemSemester,
        academicYear: systemAcademicYear,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });"""
content = content.replace(adddoc_rest_target, "")


# Use resetForm instead of inline
inline_reset_target = """      // Reset form
      setType('fight');
      setOtherTypeDetail('');
      setAccidentDetail('');
      setOtherAccidentDetail('');
      setIllnessDetail('');
      setOtherIllnessDetail('');
      setFightDetail('');
      setOtherFightDetail('');
      setDescription('');
      setTime(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
      setSeverity('none');
      setActionTaken('none');
      setActionTakenDetail('');
      setSelectedStudentIds([]);
      setShowForm(false);"""
inline_reset_replacement = """      resetForm();"""
content = content.replace(inline_reset_target, inline_reset_replacement)


# Change setShowForm(false) in cancel buttons to resetForm()
# There are two of them.
close1_target = """<button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">"""
close1_replacement = """<button onClick={resetForm} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">"""
content = content.replace(close1_target, close1_replacement)

close2_target = """              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                ยกเลิก
              </button>"""
close2_replacement = """              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                ยกเลิก
              </button>"""
content = content.replace(close2_target, close2_replacement)


# Change form title based on editingId
title_target = """                บันทึกเหตุการณ์ใหม่
              </h3>"""
title_replacement = """                {editingId ? 'แก้ไขเหตุการณ์' : 'บันทึกเหตุการณ์ใหม่'}
              </h3>"""
content = content.replace(title_target, title_replacement)

# Add Edit button in UI
card_action_target = """                      {(currentTeacher.id === incident.teacherId || currentTeacher.role === 'admin') && (
                        <button 
                          onClick={() => handleDelete(incident.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}"""
card_action_replacement = """                      {(currentTeacher.id === incident.teacherId || currentTeacher.role === 'admin') && (
                        <>
                          <button 
                            onClick={() => handleEdit(incident)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-500 transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(incident.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}"""
content = content.replace(card_action_target, card_action_replacement)

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
