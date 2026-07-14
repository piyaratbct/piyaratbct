import React, { useState, useEffect } from 'react';
import { Teacher, Student, DisciplineIncident } from '../types';
import { Edit, ShieldAlert, PlusCircle, Search, FileText, UserX, AlertTriangle, User, Calendar, Save, Trash2, X, Clock } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { db } from '../lib/firebase';

const formatThaiDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-');
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    return `${parseInt(day)} ${months[parseInt(month) - 1]} ${parseInt(year) + 543}`;
  } catch (e) {
    return dateString;
  }
};



interface DisciplineModuleProps {
  currentTeacher: Teacher;
  systemSemester: string;
  systemAcademicYear: string;
  students: Student[];
}

export function DisciplineModule({
  currentTeacher,
  systemSemester,
  systemAcademicYear,
  students
}: DisciplineModuleProps) {
  const [incidents, setIncidents] = useState<DisciplineIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [type, setType] = useState<DisciplineIncident['type']>('fight');
  const [otherTypeDetail, setOtherTypeDetail] = useState('');
  const [accidentDetail, setAccidentDetail] = useState('');
  const [otherAccidentDetail, setOtherAccidentDetail] = useState('');
  const [illnessDetail, setIllnessDetail] = useState('');
  const [otherIllnessDetail, setOtherIllnessDetail] = useState('');
  const [fightDetail, setFightDetail] = useState('');
  const [otherFightDetail, setOtherFightDetail] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
  const [severity, setSeverity] = useState<DisciplineIncident['severity']>('none');
  const [actionTaken, setActionTaken] = useState<DisciplineIncident['actionTaken']>('none');
  const [actionTakenDetail, setActionTakenDetail] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'disciplineIncidents'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records: DisciplineIncident[] = [];
      snapshot.forEach((docSnap) => {
        records.push({ id: docSnap.id, ...docSnap.data() } as DisciplineIncident);
      });
      setIncidents(records);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) {
      alert("กรุณาเลือกนักเรียนที่เกี่ยวข้อง");
      return;
    }
    if (!description.trim()) {
      alert("กรุณาระบุรายละเอียดเหตุการณ์");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedStudents = students.filter(s => selectedStudentIds.includes(s.id));
      const studentNames = selectedStudents.map(s => `${s.firstName} ${s.lastName} ${s.nickname ? `(${s.nickname})` : ''} - ${s.gradeLevel}`);

      const dataToSave = {
        studentIds: selectedStudentIds,
        studentNames,
        description,
        type,
        otherTypeDetail: type === 'other' ? otherTypeDetail : '',
        accidentDetail: type === 'accident' ? (accidentDetail === 'other' ? otherAccidentDetail : accidentDetail) : '',
        illnessDetail: type === 'illness' ? (illnessDetail === 'other' ? otherIllnessDetail : illnessDetail) : '',
        fightDetail: (type === 'fight' || type === 'assault') ? (fightDetail === 'other' ? otherFightDetail : fightDetail) : '',
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
      }


      resetForm();
    } catch (err) {
      console.error("Error adding incident:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };


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
      const predefinedIllness = ['เลือดกำเดาไหล', 'ปวดท้อง', 'ปวดหัว', 'มีไข้ ตัวร้อน', 'อาการแพ้อาหาร'];
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

    if (incident.type === 'fight' || incident.type === 'assault') {
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
  const handleDelete = async (id: string) => {
    if (window.confirm("คุณต้องการลบข้อมูลนี้ใช่หรือไม่?")) {
      try {
        await deleteDoc(doc(db, 'disciplineIncidents', id));
      } catch (err) {
        console.error("Error deleting incident:", err);
      }
    }
  };

  const getSeverityLabel = (severity?: string) => {
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
  };

  const getTypeLabel = (type: string, otherDetail?: string, accidentDetail?: string, illnessDetail?: string, fightDetail?: string) => {
    switch (type) {
      case 'fight': return { label: `ทะเลาะวิวาท${fightDetail ? `: ${fightDetail}` : ''}`, color: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'assault': return { label: `ทำร้ายร่างกาย${fightDetail ? `: ${fightDetail}` : ''}`, color: 'bg-red-100 text-red-700 border-red-200' };
      case 'feud': return { label: 'ความบาดหมาง', color: 'bg-orange-100 text-orange-700 border-orange-200' };
      case 'bullying': return { label: 'กลั่นแกล้ง', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      case 'misunderstanding': return { label: 'ความเข้าใจผิด', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'disruption': return { label: 'ก่อความวุ่นวาย', color: 'bg-lime-100 text-lime-700 border-lime-200' };
      case 'accident': return { label: `อุบัติเหตุ${accidentDetail ? `: ${accidentDetail}` : ''}`, color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'illness': return { label: `เจ็บป่วยกะทันหัน${illnessDetail ? `: ${illnessDetail}` : ''}`, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'vandalism': return { label: 'ทำลายทรัพย์สิน', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'other': return { label: `อื่นๆ: ${otherDetail || ''}`, color: 'bg-slate-100 text-slate-700 border-slate-200' };
      default: return { label: 'ไม่ระบุ', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const stats = incidents.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const COLORS = {
    fight: '#f43f5e', // rose-500
    assault: '#ef4444', // red-500
    feud: '#f97316', // orange-500
    bullying: '#eab308', // yellow-500
    misunderstanding: '#f59e0b', // amber-500
    disruption: '#84cc16', // lime-500
    accident: '#3b82f6', // blue-500
    illness: '#10b981', // emerald-500
    vandalism: '#a855f7', // purple-500
    other: '#64748b', // slate-500
  };

  const chartData = Object.keys(stats).map(type => {
    const label = getTypeLabel(type).label;
    const shortLabel = label.split('/')[0].split(':')[0].trim();
    return {
      name: shortLabel,
      fullName: label,
      value: stats[type],
      fill: COLORS[type as keyof typeof COLORS] || COLORS.other
    };
  }).sort((a, b) => b.value - a.value);

  const accidentStats = incidents.filter(i => i.type === 'accident').reduce((acc, curr) => {
    const detail = curr.accidentDetail || 'ไม่ระบุ';
    acc[detail] = (acc[detail] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const accidentChartData = Object.keys(accidentStats).map((detail, index) => {
    const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#2563eb', '#1d4ed8'];
    return {
      name: detail,
      value: accidentStats[detail],
      fill: colors[index % colors.length]
    };
  }).sort((a, b) => b.value - a.value);

  const accidentGradeLevelStats = incidents.filter(i => i.type === 'accident').reduce((acc, curr) => {
    curr.studentIds?.forEach(studentId => {
      const student = students.find(s => s.id === studentId);
      if (student && student.gradeLevel) {
        acc[student.gradeLevel] = (acc[student.gradeLevel] || 0) + 1;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  const accidentGradeLevelChartData = Object.keys(accidentGradeLevelStats).map((gradeLevel, index) => {
    const colors = ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#d97706', '#b45309'];
    return {
      name: gradeLevel,
      value: accidentGradeLevelStats[gradeLevel],
      fill: colors[index % colors.length]
    };
  }).sort((a, b) => b.value - a.value);

  const filteredIncidents = incidents.filter(i => 
    i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.studentNames.some(name => name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    i.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(s => 
    !selectedStudentIds.includes(s.id) && 
    (
      s.firstName.toLowerCase().includes(studentSearch.toLowerCase()) || 
      s.lastName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.studentId.includes(studentSearch) ||
      (s.nickname && s.nickname.toLowerCase().includes(studentSearch.toLowerCase()))
    )
  ).slice(0, 5); // Limit search results to 5

  return (
    <div className="discipline-module-content space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-rose-500" />
            การบริหารงานปกครอง (LessonDiscipline)
          </h2>
          <p className="text-slate-500">บันทึกและติดตามข้อมูลเหตุการณ์ ทะเลาะวิวาท อุบัติเหตุ และความประพฤติ</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          บันทึกเหตุการณ์ใหม่
        </button>
      </div>

      {!loading && incidents.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-6">สถิติลักษณะอุบัติเหตุ (Bar Chart)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accidentChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {accidentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-6">สัดส่วนเหตุการณ์ (Pie Chart)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ fontSize: '12px', paddingLeft: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-6">สถิติอุบัติเหตุแยกตามระดับชั้น</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accidentGradeLevelChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {accidentGradeLevelChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อนักเรียน, ครู หรือรายละเอียด..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
        ) : filteredIncidents.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-slate-500 font-medium">ไม่มีข้อมูลเหตุการณ์</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIncidents.map((incident) => {
              const typeInfo = getTypeLabel(incident.type, incident.otherTypeDetail, incident.accidentDetail, incident.illnessDetail, incident.fightDetail);
              return (
                <div key={incident.id} className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-3">
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
                      {(currentTeacher.id === incident.teacherId || currentTeacher.role === 'admin' || currentTeacher.role === 'discipline') && (
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
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2">
                      <UserX className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 mb-1">นักเรียนที่เกี่ยวข้อง:</p>
                        <ul className="text-sm font-semibold text-slate-700 list-disc list-inside">
                          {incident.studentNames.map((name, i) => (
                            <li key={i}>{name}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 mb-1">รายละเอียดเหตุการณ์:</p>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{incident.description}</p>
                      </div>
                    </div>
                    
                    {incident.actionTaken && incident.actionTaken !== 'none' && (
                      <div className="flex items-start gap-2">
                        <ShieldAlert className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-500 mb-1">การปฐมพยาบาล/การแก้ปัญหา:</p>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap">{getActionTakenLabel(incident.actionTaken, incident.actionTakenDetail)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-3 border-t border-slate-50 flex flex-col gap-1.5 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        <span>บันทึกโดย: {incident.teacherName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 mt-0.5">
                      {incident.date && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatThaiDate(incident.date)}</span>
                        </div>
                      )}
                      {incident.time && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>เวลา {incident.time} น.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-rose-500" />
                {editingId ? 'แก้ไขเหตุการณ์' : 'บันทึกเหตุการณ์ใหม่'}
              </h3>
              <button onClick={resetForm} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
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
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">ประเภทเหตุการณ์</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="fight">ทะเลาะวิวาท</option>
                    <option value="assault">ทำร้ายร่างกาย</option>
                    <option value="feud">ความบาดหมาง</option>
                    <option value="bullying">กลั่นแกล้ง</option>
                    <option value="misunderstanding">ความเข้าใจผิด</option>
                    <option value="disruption">ก่อความวุ่นวาย</option>
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
                  {(type === 'fight' || type === 'assault') && (
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
                  {type === 'accident' && (
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

                        <option value="ถูกของมีคมบาด">ถูกของมีคมบาด</option>
                        <option value="ประตู/หน้าต่าง/โต๊ะหนีบ">ประตู/หน้าต่าง/โต๊ะหนีบ</option>
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
                  )}
                  {type === 'illness' && (
                    <div className="mt-2 space-y-2">
                      <select
                        value={illnessDetail}
                        onChange={(e) => setIllnessDetail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="">-- เลือกลักษณะอาการเจ็บป่วย --</option>
                        <option value="เลือดกำเดาไหล">เลือดกำเดาไหล</option>
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

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">ระดับความรุนแรง</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { value: 'none', label: 'ไม่ได้รับผลกระทบ', color: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200' },
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
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex justify-between items-center">
                  <span>นักเรียนที่เกี่ยวข้อง <span className="text-rose-500">*</span></span>
                  <span className="text-xs font-normal text-slate-500">เลือกแล้ว {selectedStudentIds.length} คน</span>
                </label>
                
                {/* Selected Students Tags */}
                {selectedStudentIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedStudentIds.map(id => {
                      const student = students.find(s => s.id === id);
                      if (!student) return null;
                      return (
                        <div key={id} className="bg-rose-50 border border-rose-100 text-rose-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                          <span className="font-semibold">{student.firstName} {student.lastName}</span>
                          <button onClick={() => setSelectedStudentIds(prev => prev.filter(sId => sId !== id))} className="text-rose-400 hover:text-rose-600">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Search & Add Students */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ หรือรหัสนักเรียน เพื่อเพิ่ม..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                
                {studentSearch && filteredStudents.length > 0 && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {filteredStudents.map(student => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => {
                          setSelectedStudentIds(prev => [...prev, student.id]);
                          setStudentSearch('');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 text-sm flex justify-between items-center"
                      >
                        <div>
                          <span className="font-semibold text-slate-800">{student.firstName} {student.lastName} {student.nickname && `(${student.nickname})`}</span>
                          <span className="text-slate-500 text-xs ml-2">{student.gradeLevel}</span>
                        </div>
                        <PlusCircle className="h-4 w-4 text-emerald-500" />
                      </button>
                    ))}
                  </div>
                )}
                {studentSearch && filteredStudents.length === 0 && (
                  <div className="text-sm text-center py-2 text-slate-500">ไม่พบนักเรียนที่ค้นหา หรือเลือกนักเรียนคนนี้ไปแล้ว</div>
                )}
              </div>
              
              <div className="space-y-1.5">
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
              </div>
              
            </div>
            
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || selectedStudentIds.length === 0 || !description.trim() || (type === 'other' && !otherTypeDetail.trim()) || (type === 'accident' && (!accidentDetail.trim() || (accidentDetail === 'other' && !otherAccidentDetail.trim()))) || (type === 'illness' && (!illnessDetail.trim() || (illnessDetail === 'other' && !otherIllnessDetail.trim()))) || ((type === 'fight' || type === 'assault') && (!fightDetail.trim() || (fightDetail === 'other' && !otherFightDetail.trim()))) || (actionTaken === 'other' && !actionTakenDetail.trim())}
                className="px-6 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                {isSubmitting ? 'กำลังบันทึก...' : (
                  <>
                    <Save className="h-4 w-4" /> บันทึกข้อมูล
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
