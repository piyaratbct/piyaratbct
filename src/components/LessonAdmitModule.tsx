import React, { useState, useEffect } from 'react';
import { UserPlus, Settings, CheckCircle, Search, ArrowRight, UserCheck, GraduationCap, X, ChevronRight, UserMinus, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Student, AdmissionRecord, GRADE_LEVELS, Teacher } from '../types';
import { collection, query, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface LessonAdmitModuleProps {
  systemAcademicYear: string;
  systemSemester: string;
  students: Student[];
  currentTeacher: Teacher;
}

export const LessonAdmitModule: React.FC<LessonAdmitModuleProps> = ({ 
  systemAcademicYear, 
  students,
  currentTeacher
}) => {
  const [activeTab, setActiveTab] = useState<'admission' | 'promotion'>('admission');
  const [showForm, setShowForm] = useState(false);
  const [applicants, setApplicants] = useState<AdmissionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const targetAcademicYear = String(Number(systemAcademicYear) + 1);

  useEffect(() => {
    fetchApplicants();
  }, [targetAcademicYear]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'admissions'));
      const snapshot = await getDocs(q);
      const fetched: AdmissionRecord[] = [];
      snapshot.forEach(doc => {
        fetched.push({ id: doc.id, ...doc.data() } as AdmissionRecord);
      });
      // Filter for target year
      setApplicants(fetched.filter(a => a.academicYear === targetAcademicYear));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl p-6 shadow-md flex flex-col lg:flex-row items-center justify-between gap-6 text-white relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-300 opacity-20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>

        <div className="flex items-center gap-5 relative z-10 w-full lg:w-auto">
          <div className="h-16 w-16 bg-white/20 backdrop-blur-md text-white rounded-2xl flex-shrink-0 flex items-center justify-center shadow-inner border border-white/30">
            <UserPlus className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">
              การรับสมัครนักเรียน (LessonAdmit)
            </h2>
            <p className="text-indigo-100 font-medium mt-1">
              ระบบรับสมัครและจัดการสถานะผู้เรียน
            </p>
          </div>
        </div>
        
        <div className="relative z-10 flex bg-white/20 backdrop-blur-md rounded-xl p-1 shadow-inner border border-white/20 w-full lg:w-auto">
          <button
            onClick={() => {
              if (currentTeacher.role === 'teacher') {
                alert('คุณไม่มีสิทธิ์ในการบันทึกหรือแก้ไขข้อมูลการรับสมัคร');
                return;
              }
              setShowForm(!showForm);
            }}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 py-2 px-6 rounded-lg text-sm font-bold transition-all bg-white text-indigo-600 shadow-sm hover:bg-indigo-50 hover:shadow-md`}
          >
            <UserPlus className="h-4 w-4" /> รับสมัครเรียนใหม่
          </button>
        </div>
      </div>

      {activeTab === 'admission' && (
        <AdmissionManager 
          targetAcademicYear={targetAcademicYear} 
          applicants={applicants}
          refreshApplicants={fetchApplicants}
          showForm={showForm}
          setShowForm={setShowForm}
          currentTeacher={currentTeacher}
          students={students}
        />
      )}


    </div>
  );
};



const CapacityModal = ({ isOpen, onClose, initialCapacities, onSave, isSaving }: { isOpen: boolean, onClose: () => void, initialCapacities: Record<string, number>, onSave: (caps: Record<string, number>) => void, isSaving: boolean }) => {
  const [caps, setCaps] = useState<Record<string, number>>({});
  
  useEffect(() => {
    if (isOpen) {
      setCaps({ ...initialCapacities });
    }
  }, [isOpen, initialCapacities]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg">ตั้งค่าจำนวนรับสมัคร</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {GRADE_LEVELS.filter(g => !g.includes('/')).map(grade => (
            <div key={grade} className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700">{grade}</label>
              <input 
                type="number" 
                min="0"
                value={caps[grade] || ''} 
                onChange={(e) => setCaps({...caps, [grade]: parseInt(e.target.value) || 0})}
                className="w-24 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-right"
                placeholder="ไม่จำกัด"
              />
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100">
            ยกเลิก
          </button>
          <button onClick={() => onSave(caps)} disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50">
            {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
};

const NationalIdInput = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return;
    let newVal = (value || '').padEnd(13, ' ').split('');
    newVal[index] = char.slice(-1);
    
    // Replace all trailing spaces with empty string to not mess up length, but keep inner spaces? 
    // Actually, padEnd is bad if they jump.
    let arr = (value || '').split('');
    arr[index] = char.slice(-1);
    // join and remove undefined
    const joined = Array.from({length: 13}).map((_, i) => arr[i] || ' ').join('');
    // remove trailing spaces
    onChange(joined.trimEnd());
    
    if (char && index < 12) {
      document.getElementById(`nid-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !(value || '')[index] && index > 0) {
      document.getElementById(`nid-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {Array.from({ length: 13 }).map((_, i) => (
        <React.Fragment key={i}>
          <input
            id={`nid-${i}`}
            type="text"
            required
            maxLength={1}
            value={(value || '')[i] || ''}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-7 h-10 border border-slate-300 rounded text-center text-sm font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
          {(i === 0 || i === 4 || i === 9 || i === 11) && <span className="text-slate-400 font-bold">-</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

const InputOrSelect = ({ options, value, onChange, placeholder }: any) => {
  const isOtherSelected = value === 'other' || (value && !options.some((o:any) => o.value === value));
  if (isOtherSelected) {
    return (
      <div className="flex gap-2">
        <input type="text" value={value === 'other' ? '' : value} onChange={e => onChange(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder={placeholder} autoFocus />
        <button type="button" onClick={() => onChange('')} className="text-xs text-rose-500 hover:text-white hover:bg-rose-500 px-2 py-1 rounded shadow-sm hover:shadow-md font-bold whitespace-nowrap transition-all">ยกเลิก</button>
      </div>
    );
  }
  return (
    <select value={value || ''} onChange={e => onChange(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
      {options.map((o:any) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
};

const AdmissionManager: React.FC<{
  targetAcademicYear: string;
  applicants: AdmissionRecord[];
  refreshApplicants: () => void;
  showForm: boolean;
  setShowForm: (val: boolean) => void;
  currentTeacher: Teacher;
  students: Student[];
}> = ({ targetAcademicYear, applicants, refreshApplicants, showForm, setShowForm, currentTeacher, students }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [gradeCapacities, setGradeCapacities] = useState<Record<string, number>>({});
  const [isSavingCapacity, setIsSavingCapacity] = useState(false);

  useEffect(() => {
    const fetchCapacities = async () => {
      try {
        const docRef = doc(db, 'settings', `admission_capacity_${targetAcademicYear}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setGradeCapacities(docSnap.data().capacities || {});
        }
      } catch (err) {
        console.error('Failed to load capacities', err);
      }
    };
    fetchCapacities();
  }, [targetAcademicYear]);

  const saveCapacities = async (newCapacities: Record<string, number>) => {
    try {
      setIsSavingCapacity(true);
      await setDoc(doc(db, 'settings', `admission_capacity_${targetAcademicYear}`), { capacities: newCapacities }, { merge: true });
      setGradeCapacities(newCapacities);
      setShowCapacityModal(false);
    } catch (err) {
      console.error('Failed to save capacities', err);
      alert('บันทึกข้อมูลไม่สำเร็จ');
    } finally {
      setIsSavingCapacity(false);
    }
  };

  
  const [thaiDb, setThaiDb] = useState<any[]>([]);
  const activeStudents = React.useMemo(() => {
    return students.filter(s => s.status === 'active' || !s.status);
  }, [students]);

  const formatAddress = (addr: any) => {
    if (!addr) return '-';
    const parts = [];
    if (addr.houseNumber) parts.push(`เลขที่ ${addr.houseNumber}`);
    if (addr.moo) parts.push(`ม.${addr.moo}`);
    if (addr.village) parts.push(`หมู่บ้าน${addr.village}`);
    if (addr.soi) parts.push(`ซ.${addr.soi}`);
    if (addr.road) parts.push(`ถ.${addr.road}`);
    if (addr.subDistrict) parts.push(`ต.${addr.subDistrict}`);
    if (addr.district) parts.push(`อ.${addr.district}`);
    if (addr.province) parts.push(`จ.${addr.province}`);
    if (addr.zipCode) parts.push(`${addr.zipCode}`);
    return parts.join(' ') || '-';
  };

  const [viewingApplicant, setViewingApplicant] = useState<AdmissionRecord | null>(null);
  useEffect(() => {
    fetch('/thai_address.json')
      .then(res => res.json())
      .then(data => setThaiDb(data))
      .catch(err => console.error('Failed to load thai address', err));
  }, []);

  
  const provinces = Array.from(new Set(thaiDb.map(t => t.province))).sort();
  const emptyAddress = {
    houseNumber: '', moo: '', village: '', soi: '', road: '', subDistrict: '', district: '', province: '', zipCode: ''
  };

  const [formData, setFormData] = useState<Partial<AdmissionRecord>>({
    academicYear: targetAcademicYear,
    applyForGrade: 'ประถมศึกษาปีที่ 1',
    gender: 'male',
    status: 'pending',
    firstName: 'เด็กชาย ',
    nickname: 'น้อง ',
    ethnicity: 'ไทย',
    fatherFirstName: 'นาย ',
    motherPrefix: 'นาง',
    nationality: 'ไทย',
    fatherEthnicity: 'ไทย',
    fatherNationality: 'ไทย',
    motherEthnicity: 'ไทย',
    motherNationality: 'ไทย',
    guardianEthnicity: 'ไทย',
    guardianNationality: 'ไทย',
    addressObj: { ...emptyAddress },
    fatherAddressObj: { ...emptyAddress },
    motherAddressObj: { ...emptyAddress },
    guardianAddressObj: { ...emptyAddress }
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, academicYear: targetAcademicYear }));
  }, [targetAcademicYear]);

  const handleGenderChange = (newGender: 'male' | 'female') => {
    let currentName = formData.firstName || '';
    currentName = currentName.replace(/^เด็กชาย\s*/, '').replace(/^เด็กหญิง\s*/, '');
    const prefix = newGender === 'male' ? 'เด็กชาย ' : 'เด็กหญิง ';
    
    setFormData({
      ...formData,
      gender: newGender,
      firstName: prefix + currentName
    });
  };

  const handleNicknameChange = (val: string) => {
    let newVal = val;
    if (newVal && !newVal.startsWith('น้อง')) {
      newVal = 'น้อง' + (newVal.startsWith(' ') ? '' : ' ') + newVal;
    }
    setFormData({...formData, nickname: newVal});
  };

  const handleSiblingCountChange = (val: string) => {
    const count = parseInt(val);
    if (isNaN(count)) {
      setFormData({...formData, siblingCount: undefined, siblingOrder: undefined});
    } else {
      setFormData({
        ...formData, 
        siblingCount: count, 
        ...(count === 1 ? { siblingOrder: 1 } : {})
      });
    }
  };

  // Calculate Age (Years and Months)
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let years = today.getFullYear() - birthDateObj.getFullYear();
    let months = today.getMonth() - birthDateObj.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birthDateObj.getDate())) {
      years--;
      months += 12;
    }
    if (today.getDate() < birthDateObj.getDate()) {
        months--;
        if (months < 0) {
            months += 12;
        }
    }
    
    if (years < 0) return '';
    return `${years} ปี ${months} เดือน`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTeacher.role === 'teacher') {
      alert('คุณไม่มีสิทธิ์ในการบันทึกหรือแก้ไขข้อมูลการรับสมัคร');
      return;
    }
    if (!formData.firstName || !formData.lastName || !formData.nationalId || formData.nationalId.length !== 13) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน รวมถึงเลขประจำตัวประชาชน 13 หลัก');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const payload: Omit<AdmissionRecord, 'id'> = {
        ...(formData as Omit<AdmissionRecord, 'id'>),
        appliedAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'admissions'), payload);
      setShowForm(false);
      setFormData({
        academicYear: targetAcademicYear,
        applyForGrade: 'อนุบาล 1',
        gender: 'male',
        status: 'pending',
        addressObj: { ...emptyAddress },
        fatherAddressObj: { ...emptyAddress },
        motherAddressObj: { ...emptyAddress },
        guardianAddressObj: { ...emptyAddress }
      });
      refreshApplicants();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: AdmissionRecord['status'], applicant: AdmissionRecord) => {
    if (currentTeacher.role === 'teacher') {
      alert('คุณไม่มีสิทธิ์ในการบันทึกหรือแก้ไขข้อมูลการรับสมัคร');
      return;
    }
    
    if ((newStatus === 'approved' || newStatus === 'enrolled') && !['approved', 'enrolled'].includes(applicant.status)) {
      const grade = applicant.applyForGrade;
      const cap = gradeCapacities[grade] || 0;
      if (cap > 0) {
        const currentStudentsInGrade = activeStudents.filter(s => {
          const g = (s.gradeLevel || '').trim();
          return g === grade || g.startsWith(grade + '/');
        }).length;
        const newlyApproved = applicants.filter(a => a.applyForGrade === grade && a.status === 'approved').length;
        const totalOccupied = currentStudentsInGrade + newlyApproved;
        
        if (totalOccupied >= cap) {
          const confirmExceed = window.confirm(`ระดับชั้น ${grade} เต็มความจุแล้ว (รวมนร.เดิมและใหม่ ${totalOccupied}/${cap} คน)\n\nคุณต้องการยืนยันรับนักเรียนใหม่เกินขนาดห้องหรือไม่?`);
          if (!confirmExceed) {
            return;
          }
        }
      }
    }
    
    let finalGrade = applicant.applyForGrade;
    if (newStatus === 'enrolled') {
      const userChoice = window.prompt(
        "กรุณาระบุห้องเรียนที่ต้องการให้เข้าศึกษา (เช่น ประถมศึกษาปีที่ 1/1, ประถมศึกษาปีที่ 1/2)\nหากมีเพียงห้องเดียว สามารถกดยืนยันได้เลย",
        applicant.applyForGrade
      );
      if (userChoice === null) return; // cancelled
      finalGrade = userChoice.trim() || applicant.applyForGrade;
    }
    
    try {
      await updateDoc(doc(db, 'admissions', id), { status: newStatus });
      
      if (newStatus === 'enrolled') {
        const studentPayload: Omit<Student, 'id'> = {
          studentId: `NEW${Date.now().toString().slice(-5)}`,
          firstName: applicant.firstName,
          lastName: applicant.lastName,
          nickname: applicant.nickname,
          gradeLevel: finalGrade,
          gender: applicant.gender,
          nationalId: applicant.nationalId,
          number: 99,
          status: 'active',
          dob: applicant.birthDate || '',
          fatherFirstName: applicant.fatherFirstName || '',
          fatherLastName: applicant.fatherLastName || '',
          fatherPhone: applicant.fatherPhone || '',
          motherFirstName: applicant.motherFirstName || '',
          motherLastName: applicant.motherLastName || '',
          motherPhone: applicant.motherPhone || '',
          guardianFirstName: applicant.guardianFirstName || '',
          guardianLastName: applicant.guardianLastName || '',
          additionalNotes: applicant.underlyingDisease ? `โรคประจำตัว: ${applicant.underlyingDisease}` : '',
        };
        await addDoc(collection(db, 'students'), studentPayload);
        alert('เพิ่มข้อมูลลงในฐานข้อมูลนักเรียนเรียบร้อยแล้ว');
      }
      refreshApplicants();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const pendingCount = applicants.filter(a => a.status === 'pending').length;

  const gradeStats = React.useMemo(() => {
    const stats: Record<string, number> = {};
    applicants.forEach(app => {
      const grade = app.applyForGrade || 'ไม่ระบุ';
      stats[grade] = (stats[grade] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [applicants]);

  const schoolStats = React.useMemo(() => {
    const stats: Record<string, number> = {};
    applicants.forEach(app => {
      const school = app.previousSchool || 'ไม่ระบุโรงเรียนเดิม';
      stats[school] = (stats[school] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [applicants]);

  const COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#6366f1'];




  const relationOptions = [
    { value: '', label: 'เลือกความเกี่ยวข้อง' },
    { value: 'ปู่', label: 'ปู่' },
    { value: 'ตา', label: 'ตา' },
    { value: 'ย่า', label: 'ย่า' },
    { value: 'ยาย', label: 'ยาย' },
    { value: 'ลุง', label: 'ลุง' },
    { value: 'ป้า', label: 'ป้า' },
    { value: 'น้า', label: 'น้า' },
    { value: 'อา', label: 'อา' },
    { value: 'พี่ชาย', label: 'พี่ชาย' },
    { value: 'พี่สาว', label: 'พี่สาว' },
    { value: 'other', label: 'อื่นๆ (ระบุเอง)' },
  ];


  const familyStatusOptions = [
    { value: '', label: 'เลือกสถานภาพ' },
    { value: 'สมรส', label: 'สมรส' },
    { value: 'บิดามารดาแยกกันอยู่เนื่องจากอาชีพ', label: 'บิดามารดาแยกกันอยู่เนื่องจากอาชีพ' },
    { value: 'หย่าร้าง', label: 'หย่าร้าง' },
    { value: 'บิดาเสียชีวิต', label: 'บิดาเสียชีวิต' },
    { value: 'มารดาเสียชีวิต', label: 'มารดาเสียชีวิต' },
    { value: 'other', label: 'อื่นๆ (ระบุ)' },
  ];

  const livingWithOptions = [
    { value: '', label: 'เลือกการอยู่อาศัย' },
    { value: 'บิดาและมารดา', label: 'บิดาและมารดา' },
    { value: 'บิดา', label: 'บิดา' },
    { value: 'มารดา', label: 'มารดา' },
    { value: 'ผู้ปกครอง', label: 'ผู้ปกครอง' },
  ];

  const underlyingDiseaseOptions = [
    { value: 'ไม่มี', label: 'ไม่มี' },
    { value: 'other', label: 'มี (ระบุ)' },
  ];

  const allergyOptions = [
    { value: 'ไม่มี', label: 'ไม่มี' },
    { value: 'other', label: 'มี (ระบุ)' },
  ];

  const occupationOptions = [
    { value: '', label: 'เลือกอาชีพ' },
    { value: 'ข้าราชการ/พนักงานรัฐวิสาหกิจ', label: 'ข้าราชการ/พนักงานรัฐวิสาหกิจ' },
    { value: 'พนักงานราชการ/ลูกจ้างหน่วยงานรัฐ', label: 'พนักงานราชการ/ลูกจ้างหน่วยงานรัฐ' },
    { value: 'พนักงานบริษัทเอกชน', label: 'พนักงานบริษัทเอกชน' },
    { value: 'ประกอบธุรกิจส่วนตัว/ค้าขาย', label: 'ประกอบธุรกิจส่วนตัว/ค้าขาย' },
    { value: 'รับจ้างทั่วไป', label: 'รับจ้างทั่วไป' },
    { value: 'เกษตรกร', label: 'เกษตรกร' },
    { value: 'พ่อบ้าน/แม่บ้าน (ไม่ได้ประกอบอาชีพ)', label: 'พ่อบ้าน/แม่บ้าน (ไม่ได้ประกอบอาชีพ)' },
    { value: 'other', label: 'อื่นๆ (ระบุ)' },
  ];



  const handleAddressChange = (person: 'addressObj' | 'fatherAddressObj' | 'motherAddressObj' | 'guardianAddressObj', field: string, value: string) => {
    setFormData(prev => {
      const currentAddr = prev[person as keyof AdmissionRecord] as any || emptyAddress;
      const newAddr = { ...currentAddr, [field]: value };
      
      // Auto-fill and cascade logic
      if (field === 'province') {
        newAddr.district = '';
        newAddr.subDistrict = '';
        newAddr.zipCode = '';
      } else if (field === 'district') {
        newAddr.subDistrict = '';
        newAddr.zipCode = '';
      } else if (field === 'subDistrict') {
        // Auto fill zipcode if matched exactly
        const match = thaiDb.find(t => t.province === newAddr.province && t.amphoe === newAddr.district && t.district === value);
        if (match) newAddr.zipCode = match.zipcode.toString();
      }
      
      return {
        ...prev,
        [person]: newAddr
      };
    });
  };


  const handleEmergencyRelationChange = (rel: string) => {
    let name = formData.emergencyContactName || '';
    let phone = formData.emergencyContactPhone || '';
    
    if (rel === 'บิดา') {
      name = `${formData.fatherFirstName || ''} ${formData.fatherLastName || ''}`.trim();
      phone = formData.fatherPhone || '';
    } else if (rel === 'มารดา') {
      name = `${formData.motherPrefix || ''}${formData.motherFirstName || ''} ${formData.motherLastName || ''}`.trim();
      phone = formData.motherPhone || '';
    } else if (rel === 'ผู้ปกครอง') {
      name = `${formData.guardianFirstName || ''} ${formData.guardianLastName || ''}`.trim();
      phone = formData.guardianPhone || '';
    }
    
    setFormData(prev => ({
      ...prev,
      emergencyContactRelation: rel,
      emergencyContactName: name,
      emergencyContactPhone: phone
    }));
  };

  const emergencyRelationOptions = [
    { value: '', label: 'เลือกความเกี่ยวข้อง' },
    { value: 'บิดา', label: 'บิดา' },
    { value: 'มารดา', label: 'มารดา' },
    { value: 'ผู้ปกครอง', label: 'ผู้ปกครอง' },
    { value: 'ปู่', label: 'ปู่' },
    { value: 'ตา', label: 'ตา' },
    { value: 'ย่า', label: 'ย่า' },
    { value: 'ยาย', label: 'ยาย' },
    { value: 'ลุง', label: 'ลุง' },
    { value: 'ป้า', label: 'ป้า' },
    { value: 'น้า', label: 'น้า' },
    { value: 'อา', label: 'อา' },
    { value: 'พี่ชาย', label: 'พี่ชาย' },
    { value: 'พี่สาว', label: 'พี่สาว' },
    { value: 'other', label: 'อื่นๆ (ระบุเอง)' },
  ];

  const copyStudentAddress = (target: 'fatherAddressObj' | 'motherAddressObj' | 'guardianAddressObj') => {
    if (formData.addressObj) {
      setFormData(prev => ({
        ...prev,
        [target]: { ...formData.addressObj }
      }));
    }
  };

  const renderAddressFields = (person: 'addressObj' | 'fatherAddressObj' | 'motherAddressObj' | 'guardianAddressObj', label: string) => {
    const address = (formData[person as keyof AdmissionRecord] as any) || emptyAddress;
    
    // Calculate options from ThaiDB

    let districts: string[] = [];
    if (address.province) {
      districts = Array.from<string>(new Set(thaiDb.filter(t => t.province === address.province).map(t => t.amphoe as string))).sort();
    }
    
    let subDistricts: string[] = [];
    if (address.district) {
      subDistricts = Array.from<string>(new Set(thaiDb.filter(t => t.province === address.province && t.amphoe === address.district).map(t => t.district as string))).sort();
    }
    
    return (
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2 space-y-3">
        <div className="flex justify-between items-center mb-2">
          <h5 className="font-bold text-slate-700 text-sm">{label}</h5>
          {person !== 'addressObj' && (
            <button type="button" onClick={() => copyStudentAddress(person)} className="text-xs text-indigo-600 hover:text-white font-bold bg-indigo-50 hover:bg-indigo-500 shadow-sm hover:shadow-md px-2 py-1 rounded transition-all">
              + ใช้ที่อยู่เดียวกับนักเรียน
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">บ้านเลขที่</label>
            <input type="text" value={address.houseNumber || ''} onChange={e => handleAddressChange(person, 'houseNumber', e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">หมู่ที่</label>
            <input type="text" value={address.moo || ''} onChange={e => handleAddressChange(person, 'moo', e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">หมู่บ้าน</label>
            <input type="text" value={address.village || ''} onChange={e => handleAddressChange(person, 'village', e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">ตรอก/ซอย</label>
            <input type="text" value={address.soi || ''} onChange={e => handleAddressChange(person, 'soi', e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">ถนน</label>
            <input type="text" value={address.road || ''} onChange={e => handleAddressChange(person, 'road', e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs" />
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">จังหวัด</label>
            <select value={address.province || ''} onChange={e => handleAddressChange(person, 'province', e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs bg-white">
              <option value="">เลือกจังหวัด</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">เขต/อำเภอ</label>
            <select value={address.district || ''} onChange={e => handleAddressChange(person, 'district', e.target.value)} disabled={!address.province} className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs bg-white disabled:bg-slate-100">
              <option value="">เลือกอำเภอ</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">แขวง/ตำบล</label>
            <select value={address.subDistrict || ''} onChange={e => handleAddressChange(person, 'subDistrict', e.target.value)} disabled={!address.district} className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs bg-white disabled:bg-slate-100">
              <option value="">เลือกตำบล</option>
              {subDistricts.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">รหัสไปรษณีย์</label>
            <input type="text" value={address.zipCode || ''} onChange={e => handleAddressChange(person, 'zipCode', e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs" />
          </div>
        </div>
      </div>
    );
  };

  const incomeOptions = [
    { value: '', label: 'เลือกช่วงรายได้' },
    { value: '<15000', label: 'ต่ำกว่า 15,000 บาท/เดือน' },
    { value: '15000-30000', label: '15,000 - 30,000 บาท/เดือน' },
    { value: '30001-50000', label: '30,001 - 50,000 บาท/เดือน' },
    { value: '>50000', label: 'มากกว่า 50,000 บาท/เดือน' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">ข้อมูลการรับสมัคร ปีการศึกษา {targetAcademicYear}</h3>
          <p className="text-sm text-slate-500">จัดการข้อมูลผู้สมัครเข้าเรียนใหม่ และอนุมัติเข้าสู่ระบบ</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 text-lg text-indigo-600">ข้อมูลการสมัคร</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ปีการศึกษาที่ต้องการสมัคร</label>
                <input type="text" value={targetAcademicYear} disabled className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ระดับชั้นที่ต้องการเข้าเรียน</label>
                <select 
                  value={formData.applyForGrade} 
                  onChange={(e) => setFormData({...formData, applyForGrade: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                >
                  {GRADE_LEVELS.filter(g => !g.includes('/')).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 text-lg text-indigo-600">ข้อมูลส่วนตัวนักเรียน</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อ</label>
                <input type="text" required value={formData.firstName || ''} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">นามสกุล</label>
                <input type="text" required value={formData.lastName || ''} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อเล่น</label>
                <input type="text" value={formData.nickname || ''} onChange={(e) => setFormData({...formData, nickname: e.target.value})} onBlur={(e) => handleNicknameChange(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">เพศ</label>
                <select value={formData.gender} onChange={(e) => handleGenderChange(e.target.value as 'male'|'female')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                </select>
              </div>
              <div className="md:col-span-3 overflow-x-auto pb-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">รหัสประจำตัวประชาชน (13 หลัก) <span className="text-rose-500">*</span></label>
                <NationalIdInput value={formData.nationalId || ''} onChange={(v) => setFormData({...formData, nationalId: v})} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">วัน/เดือน/ปีเกิด</label>
                <input type="date" value={formData.birthDate || ''} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">อายุ</label>
                <input type="text" value={calculateAge(formData.birthDate || '')} disabled className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 font-bold text-indigo-700" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ศาสนา</label>
                <select value={formData.religion || ''} onChange={(e) => setFormData({...formData, religion: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">เลือกศาสนา</option>
                  <option value="พุทธ">พุทธ</option>
                  <option value="คริสต์">คริสต์</option>
                  <option value="อิสลาม">อิสลาม</option>
                  <option value="ฮินดู">ฮินดู</option>
                  <option value="ซิกข์">ซิกข์</option>
                  <option value="ไม่มีศาสนา">ไม่มีศาสนา</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">เชื้อชาติ</label>
                <input type="text" value={formData.ethnicity || ''} onChange={(e) => setFormData({...formData, ethnicity: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="เช่น ไทย" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">สัญชาติ</label>
                <input type="text" value={formData.nationality || ''} onChange={(e) => setFormData({...formData, nationality: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="เช่น ไทย" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">โรงพยาบาลที่เกิด</label>
                <input type="text" value={formData.birthHospital || ''} onChange={(e) => setFormData({...formData, birthHospital: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">จังหวัดที่เกิด</label>
                <select value={formData.birthProvince || ''} onChange={(e) => setFormData({...formData, birthProvince: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">เลือกจังหวัด</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">น้ำหนัก (กก.)</label>
                <input type="number" step="0.1" value={formData.weight || ''} onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value)})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ส่วนสูง (ซม.)</label>
                <input type="number" step="0.1" value={formData.height || ''} onChange={(e) => setFormData({...formData, height: parseFloat(e.target.value)})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">หมู่โลหิต</label>
                <select value={formData.bloodGroup || ''} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">เลือกหมู่โลหิต</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="O">O</option>
                  <option value="AB">AB</option>
                  <option value="ไม่ทราบ">ไม่ทราบ</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-600 mb-1">โรคประจำตัว</label>
                <InputOrSelect options={underlyingDiseaseOptions} value={formData.underlyingDisease} onChange={(v:string) => setFormData({...formData, underlyingDisease: v})} placeholder="ระบุโรคประจำตัว" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ประวัติการแพ้ยา</label>
                <InputOrSelect options={allergyOptions} value={formData.drugAllergy} onChange={(v:string) => setFormData({...formData, drugAllergy: v})} placeholder="ระบุชื่อยาที่แพ้" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ประวัติการแพ้อาหาร</label>
                <InputOrSelect options={allergyOptions} value={formData.foodAllergy} onChange={(v:string) => setFormData({...formData, foodAllergy: v})} placeholder="ระบุอาหารที่แพ้" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">สถานภาพครอบครัว</label>
                <InputOrSelect options={familyStatusOptions} value={formData.familyStatus} onChange={(v:string) => setFormData({...formData, familyStatus: v})} placeholder="ระบุสถานภาพ" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">การอยู่อาศัยของนักเรียน</label>
                <InputOrSelect options={livingWithOptions} value={formData.livingWith} onChange={(v:string) => setFormData({...formData, livingWith: v})} placeholder="ระบุการอยู่อาศัย" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">จำนวนพี่น้องทั้งหมด (คน)</label>
                <select value={formData.siblingCount || ''} onChange={(e) => handleSiblingCountChange(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">เลือกจำนวน</option>
                  <option value="1">ลูกคนเดียว (1 คน)</option>
                  {Array.from({length: 5}, (_, i) => i + 2).map(n => <option key={n} value={n}>{n} คน</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">นักเรียนเป็นบุตรลำดับใด</label>
                <select value={formData.siblingOrder || ''} onChange={(e) => setFormData({...formData, siblingOrder: parseInt(e.target.value)})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">เลือกลำดับ</option>
                  {Array.from({length: 6}, (_, i) => i + 1).map(n => <option key={n} value={n}>คนที่ {n}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              {renderAddressFields('addressObj', 'ที่อยู่ปัจจุบันของนักเรียน')}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">สถานศึกษาเดิมของนักเรียน (ถ้ามี)</label>
                <input type="text" value={formData.previousSchool || ''} onChange={(e) => setFormData({...formData, previousSchool: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">จังหวัดสถานศึกษาเดิม</label>
                <select value={formData.previousSchoolProvince || ''} onChange={(e) => setFormData({...formData, previousSchoolProvince: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">เลือกจังหวัด</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 text-md text-blue-600">ข้อมูลบิดา</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อบิดา</label>
                    <input type="text" value={formData.fatherFirstName || ''} onChange={(e) => setFormData({...formData, fatherFirstName: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="เช่น นาย สมชาย" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">นามสกุลบิดา</label>
                    <input type="text" value={formData.fatherLastName || ''} onChange={(e) => setFormData({...formData, fatherLastName: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">เชื้อชาติ</label>
                    <input type="text" value={formData.fatherEthnicity || ''} onChange={(e) => setFormData({...formData, fatherEthnicity: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="เช่น ไทย" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">สัญชาติ</label>
                    <input type="text" value={formData.fatherNationality || ''} onChange={(e) => setFormData({...formData, fatherNationality: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="เช่น ไทย" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">วัน/เดือน/ปีเกิด</label>
                    <input type="date" value={formData.fatherBirthDate || ''} onChange={(e) => setFormData({...formData, fatherBirthDate: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">อายุ</label>
                    <input type="text" value={calculateAge(formData.fatherBirthDate || '')} disabled className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 font-bold text-indigo-700" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">อาชีพ</label>
                    <InputOrSelect options={occupationOptions} value={formData.fatherOccupation} onChange={(v: string) => setFormData({...formData, fatherOccupation: v})} placeholder="ระบุอาชีพ" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">รายได้ต่อเดือน</label>
                    <select value={formData.fatherIncome || ''} onChange={(e) => setFormData({...formData, fatherIncome: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                      {incomeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">สถานที่ทำงาน</label>
                    <input type="text" value={formData.fatherWorkplace || ''} onChange={(e) => setFormData({...formData, fatherWorkplace: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="ระบุชื่อบริษัท, หน่วยงาน หรือที่อยู่" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">จังหวัดที่ทำงาน</label>
                    <select value={formData.fatherWorkplaceProvince || ''} onChange={(e) => setFormData({...formData, fatherWorkplaceProvince: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
                      <option value="">เลือกจังหวัด</option>
                      {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">หมายเลขโทรศัพท์</label>
                    <input type="tel" value={formData.fatherPhone || ''} onChange={(e) => setFormData({...formData, fatherPhone: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Line ID</label>
                    <input type="text" value={formData.fatherLineId || ''} onChange={(e) => setFormData({...formData, fatherLineId: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
                {renderAddressFields('fatherAddressObj', 'ที่อยู่บิดา')}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 text-md text-pink-600">ข้อมูลมารดา</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-3">
                    <label className="block text-xs font-bold text-slate-600 mb-1">คำนำหน้า</label>
                    <select value={formData.motherPrefix || ''} onChange={(e) => setFormData({...formData, motherPrefix: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
                      <option value="นาง">นาง</option>
                      <option value="นางสาว">นางสาว</option>
                    </select>
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อมารดา</label>
                    <input type="text" value={formData.motherFirstName || ''} onChange={(e) => setFormData({...formData, motherFirstName: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div className="col-span-12 md:col-span-5">
                    <label className="block text-xs font-bold text-slate-600 mb-1">นามสกุลมารดา</label>
                    <input type="text" value={formData.motherLastName || ''} onChange={(e) => setFormData({...formData, motherLastName: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">เชื้อชาติ</label>
                    <input type="text" value={formData.motherEthnicity || ''} onChange={(e) => setFormData({...formData, motherEthnicity: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="เช่น ไทย" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">สัญชาติ</label>
                    <input type="text" value={formData.motherNationality || ''} onChange={(e) => setFormData({...formData, motherNationality: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="เช่น ไทย" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">วัน/เดือน/ปีเกิด</label>
                    <input type="date" value={formData.motherBirthDate || ''} onChange={(e) => setFormData({...formData, motherBirthDate: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">อายุ</label>
                    <input type="text" value={calculateAge(formData.motherBirthDate || '')} disabled className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 font-bold text-indigo-700" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">อาชีพ</label>
                    <InputOrSelect options={occupationOptions} value={formData.motherOccupation} onChange={(v: string) => setFormData({...formData, motherOccupation: v})} placeholder="ระบุอาชีพ" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">รายได้ต่อเดือน</label>
                    <select value={formData.motherIncome || ''} onChange={(e) => setFormData({...formData, motherIncome: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                      {incomeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">สถานที่ทำงาน</label>
                    <input type="text" value={formData.motherWorkplace || ''} onChange={(e) => setFormData({...formData, motherWorkplace: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="ระบุชื่อบริษัท, หน่วยงาน หรือที่อยู่" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">จังหวัดที่ทำงาน</label>
                    <select value={formData.motherWorkplaceProvince || ''} onChange={(e) => setFormData({...formData, motherWorkplaceProvince: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
                      <option value="">เลือกจังหวัด</option>
                      {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">หมายเลขโทรศัพท์</label>
                    <input type="tel" value={formData.motherPhone || ''} onChange={(e) => setFormData({...formData, motherPhone: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Line ID</label>
                    <input type="text" value={formData.motherLineId || ''} onChange={(e) => setFormData({...formData, motherLineId: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
                {renderAddressFields('motherAddressObj', 'ที่อยู่มารดา')}
              </div>
            </div>
          </div>
          
          {!['บิดาและมารดา', 'บิดา', 'มารดา'].includes(formData.livingWith || '') && (
          <div>
            <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 text-md text-amber-600">ข้อมูลผู้ปกครอง (กรณีไม่ได้อยู่กับบิดา-มารดา หรือระบุเป็นผู้ปกครองหลัก)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อผู้ปกครอง</label>
                  <input type="text" value={formData.guardianFirstName || ''} onChange={(e) => setFormData({...formData, guardianFirstName: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="คำนำหน้าและชื่อ" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">นามสกุลผู้ปกครอง</label>
                  <input type="text" value={formData.guardianLastName || ''} onChange={(e) => setFormData({...formData, guardianLastName: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">เชื้อชาติ</label>
                    <input type="text" value={formData.guardianEthnicity || ''} onChange={(e) => setFormData({...formData, guardianEthnicity: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="เช่น ไทย" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">สัญชาติ</label>
                    <input type="text" value={formData.guardianNationality || ''} onChange={(e) => setFormData({...formData, guardianNationality: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="เช่น ไทย" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">วัน/เดือน/ปีเกิด</label>
                <input type="date" value={formData.guardianBirthDate || ''} onChange={(e) => setFormData({...formData, guardianBirthDate: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">อายุ</label>
                <input type="text" value={calculateAge(formData.guardianBirthDate || '')} disabled className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 font-bold text-indigo-700" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ความเกี่ยวข้องกับนักเรียน</label>
                <InputOrSelect options={relationOptions} value={formData.guardianRelation} onChange={(v: string) => setFormData({...formData, guardianRelation: v})} placeholder="ระบุความเกี่ยวข้อง" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">อาชีพ</label>
                <InputOrSelect options={occupationOptions} value={formData.guardianOccupation} onChange={(v: string) => setFormData({...formData, guardianOccupation: v})} placeholder="ระบุอาชีพ" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">รายได้ต่อเดือน</label>
                <select value={formData.guardianIncome || ''} onChange={(e) => setFormData({...formData, guardianIncome: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  {incomeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">สถานที่ทำงาน</label>
                <input type="text" value={formData.guardianWorkplace || ''} onChange={(e) => setFormData({...formData, guardianWorkplace: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="ระบุชื่อบริษัท, หน่วยงาน หรือที่อยู่" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">จังหวัดที่ทำงาน</label>
                <select value={formData.guardianWorkplaceProvince || ''} onChange={(e) => setFormData({...formData, guardianWorkplaceProvince: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">เลือกจังหวัด</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">หมายเลขโทรศัพท์</label>
                <input type="tel" value={formData.guardianPhone || ''} onChange={(e) => setFormData({...formData, guardianPhone: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Line ID</label>
                <input type="text" value={formData.guardianLineId || ''} onChange={(e) => setFormData({...formData, guardianLineId: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            {renderAddressFields('guardianAddressObj', 'ที่อยู่ผู้ปกครอง')}
          </div>
          )}
          
          <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 mt-6">
            <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500"></span> บุคคลที่ติดต่อได้กรณีฉุกเฉิน</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อ-สกุล</label>
                <input type="text" value={formData.emergencyContactName || ''} onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ความเกี่ยวข้อง</label>
                <InputOrSelect options={emergencyRelationOptions} value={formData.emergencyContactRelation} onChange={handleEmergencyRelationChange} placeholder="ระบุความเกี่ยวข้อง" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">หมายเลขโทรศัพท์</label>
                <input type="tel" value={formData.emergencyContactPhone || ''} onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              ยกเลิก
            </button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-50 transition-colors">
              {isSubmitting ? 'กำลังบันทึกข้อมูล...' : 'บันทึกข้อมูลใบสมัคร'}
            </button>
          </div>
        </form>
      )}

      

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <h5 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500" /> สถานะการรับสมัคร / โควตา
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {GRADE_LEVELS.filter(g => !g.includes('/')).map(grade => {
                    const cap = gradeCapacities[grade] || 0;
                    const currentStudentsInGrade = activeStudents.filter(s => {
                      const g = (s.gradeLevel || '').trim();
                      return g === grade || g.startsWith(grade + '/');
                    }).length;
                    
                    const totalApplied = applicants.filter(a => a.applyForGrade === grade).length;
                    const newlyApproved = applicants.filter(a => a.applyForGrade === grade && a.status === 'approved').length;
                    const totalOccupied = currentStudentsInGrade + newlyApproved;
                    
                    const remaining = cap > 0 ? cap - totalOccupied : 'ไม่จำกัด';
                    const isFull = cap > 0 && totalOccupied >= cap;
                    
                    if (cap === 0 && totalApplied === 0 && currentStudentsInGrade === 0) return null;
                    
                    const progressPercent = cap > 0 ? Math.min(100, Math.round((totalOccupied / cap) * 100)) : (totalOccupied > 0 ? 100 : 0);
                    let progressColor = 'bg-emerald-500';
                    if (isFull) progressColor = 'bg-rose-500';
                    else if (cap > 0 && progressPercent >= 80) progressColor = 'bg-amber-500';
                    
                    return (
                      <div key={grade} className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <h6 className="font-bold text-slate-800">{grade}</h6>
                          {isFull ? (
                            <span className="text-rose-600 font-bold text-xs bg-rose-100 px-2 py-1 rounded-full">
                              {totalOccupied > cap ? `เกินขนาดห้อง ${totalOccupied - cap} ที่นั่ง` : 'เต็มแล้ว'}
                            </span>
                          ) : cap > 0 ? (
                            <span className="text-emerald-600 font-bold text-xs bg-emerald-100 px-2 py-1 rounded-full">รับเพิ่มได้ {remaining} ที่นั่ง</span>
                          ) : (
                            <span className="text-slate-600 font-bold text-xs bg-slate-200 px-2 py-1 rounded-full">ไม่จำกัด</span>
                          )}
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-600 text-[10px]">
                              เดิม <span className="font-bold text-slate-700">{currentStudentsInGrade}</span> | 
                              ใหม่ <span className="font-bold text-emerald-600">{newlyApproved}</span> | 
                              สมัคร <span className="font-bold text-indigo-600">{totalApplied}</span>
                            </span>
                            {cap > 0 ? (
                              <span className="text-slate-500 text-right text-[10px]">ความจุ {cap} คน</span>
                            ) : (
                              <span className="text-slate-500 text-right text-[10px]">ไม่จำกัด</span>
                            )}
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className={`${progressColor} h-2 rounded-full transition-all duration-500`} style={{ width: `${progressPercent}%` }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {GRADE_LEVELS.filter(g => !g.includes('/')).every(grade => {
                    const cap = gradeCapacities[grade] || 0;
                    const totalApplied = applicants.filter(a => a.applyForGrade === grade).length;
                    const currentStudentsInGrade = activeStudents.filter(s => {
                      const g = (s.gradeLevel || '').trim();
                      return g === grade || g.startsWith(grade + '/');
                    }).length;
                    return cap === 0 && totalApplied === 0 && currentStudentsInGrade === 0;
                  }) && (
                     <div className="col-span-full py-8 text-center text-slate-400">ยังไม่มีข้อมูลการตั้งค่าโควตา หรือข้อมูลผู้สมัคร</div>
                  )}
                </div>
              </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-slate-50 gap-4 sm:gap-0">
          <div className="flex items-center gap-4">
            <h4 className="font-bold text-slate-800">รายชื่อผู้สมัคร ({applicants.length} คน)</h4>
            {pendingCount > 0 && (
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                รอดำเนินการ {pendingCount} รายการ
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowCapacityModal(true)} 
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Settings className="h-4 w-4" />
              ตั้งค่าจำนวนรับ
            </button>
            <button 
              onClick={() => setShowStats(!showStats)} 
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${showStats ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
              {showStats ? <BarChart3 className="h-4 w-4" /> : <PieChartIcon className="h-4 w-4" />}
              {showStats ? 'ซ่อนสถิติ' : 'ดูสถิติ'}
            </button>
          </div>
        </div>
        {showStats && (
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h5 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-indigo-500" /> จำนวนนักเรียนจำแนกตามระดับชั้น
                </h5>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} name="จำนวนนักเรียน (คน)">
                        {gradeStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h5 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm">
                  <PieChartIcon className="h-4 w-4 text-pink-500" /> สถิติโรงเรียนเดิม (10 อันดับแรก)
                </h5>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={schoolStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => percent > 0.05 ? `${name.substring(0,10)}${name.length > 10 ? '...' : ''} ${(percent * 100).toFixed(0)}%` : ''}
                        labelLine={false}
                      >
                        {schoolStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-slate-500 text-xs uppercase border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 font-bold">ชื่อ - สกุล</th>
                <th className="px-4 py-3 font-bold">ระดับชั้น</th>
                <th className="px-4 py-3 font-bold">สถานะ</th>
                <th className="px-4 py-3 font-bold text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applicants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-medium">ยังไม่มีข้อมูลผู้สมัครในปีการศึกษานี้</td>
                </tr>
              ) : (
                applicants.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{app.firstName} {app.lastName}</div>
                      {app.nickname && <div className="text-xs text-slate-500">ชื่อเล่น: {app.nickname}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{app.applyForGrade}</td>
                    <td className="px-4 py-3">
                      {app.status === 'pending' && <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">รอตรวจสอบ</span>}
                      {app.status === 'approved' && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">ผ่านการคัดเลือก</span>}
                      {app.status === 'rejected' && <span className="px-2 py-1 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full">ไม่ผ่าน</span>}
                      {app.status === 'enrolled' && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">ขึ้นทะเบียนแล้ว</span>}
                    </td>
                    <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setViewingApplicant(app)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
                        title="ดูข้อมูล"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                      <select 
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as any, app)}
                        disabled={app.status === 'enrolled' || currentTeacher.role === 'teacher'}
                        className="border border-slate-200 rounded text-xs px-2 py-1 bg-white outline-none focus:border-indigo-500"
                      >
                        <option value="pending">รอตรวจสอบ</option>
                        <option value="approved">ผ่านการคัดเลือก</option>
                        <option value="rejected">ไม่ผ่าน</option>
                        <option value="enrolled">รับเข้าศึกษา (เพิ่มในฐานข้อมูล)</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      {viewingApplicant && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">ข้อมูลใบสมัคร: {viewingApplicant.firstName} {viewingApplicant.lastName}</h3>
              <button onClick={() => setViewingApplicant(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
              
              {/* Row 1: Personal & Health */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-indigo-600 mb-3 border-b pb-2 flex items-center gap-2">
                    <UserCheck className="h-4 w-4" /> ข้อมูลส่วนตัว
                  </h4>
                  <ul className="space-y-2 text-sm grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                    <li className="col-span-2"><span className="text-slate-500 w-28 inline-block">ชื่อ-นามสกุล:</span> {viewingApplicant.firstName} {viewingApplicant.lastName}</li>
                    <li><span className="text-slate-500 w-28 inline-block">ชื่อเล่น:</span> {viewingApplicant.nickname || '-'}</li>
                    <li><span className="text-slate-500 w-28 inline-block">เพศ:</span> {viewingApplicant.gender === 'male' ? 'ชาย' : 'หญิง'}</li>
                    <li><span className="text-slate-500 w-28 inline-block">ชั้นที่สมัคร:</span> {viewingApplicant.applyForGrade}</li>
                    <li className="col-span-2"><span className="text-slate-500 w-28 inline-block">เลข ปชช:</span> {viewingApplicant.nationalId || '-'}</li>
                    <li><span className="text-slate-500 w-28 inline-block">วันเกิด:</span> {viewingApplicant.birthDate || '-'}</li>
                    <li><span className="text-slate-500 w-28 inline-block">ที่อยู่:</span> <span className="text-xs">{formatAddress(viewingApplicant.addressObj)}</span></li>
                    <li><span className="text-slate-500 w-28 inline-block">รพ.ที่เกิด:</span> {viewingApplicant.birthHospital || '-'}</li>
                    <li><span className="text-slate-500 w-28 inline-block">จังหวัดที่เกิด:</span> {viewingApplicant.birthProvince || '-'}</li>
                    <li><span className="text-slate-500 w-28 inline-block">สัญชาติ/เชื้อชาติ:</span> {viewingApplicant.nationality || '-'}/{viewingApplicant.ethnicity || '-'}</li>
                    <li><span className="text-slate-500 w-28 inline-block">ศาสนา:</span> {viewingApplicant.religion || '-'}</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <h4 className="font-bold text-rose-600 mb-3 border-b pb-2 flex items-center gap-2">
                      <Settings className="h-4 w-4" /> ข้อมูลสุขภาพ
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li><span className="text-slate-500 w-28 inline-block">หมู่เลือด:</span> {viewingApplicant.bloodGroup || '-'}</li>
                      <li><span className="text-slate-500 w-28 inline-block">น้ำหนัก/ส่วนสูง:</span> {viewingApplicant.weight ? viewingApplicant.weight + ' กก.' : '-'} / {viewingApplicant.height ? viewingApplicant.height + ' ซม.' : '-'}</li>
                      <li><span className="text-slate-500 w-28 inline-block">โรคประจำตัว:</span> {viewingApplicant.underlyingDisease || '-'}</li>
                      <li><span className="text-slate-500 w-28 inline-block">แพ้ยา:</span> {viewingApplicant.drugAllergy || '-'}</li>
                      <li><span className="text-slate-500 w-28 inline-block">แพ้อาหาร:</span> {viewingApplicant.foodAllergy || '-'}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-600 mb-3 border-b pb-2 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" /> ประวัติการศึกษา
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li><span className="text-slate-500 w-32 inline-block">โรงเรียนเดิม:</span> {viewingApplicant.previousSchool || '-'}</li>
                      <li><span className="text-slate-500 w-32 inline-block">จังหวัดโรงเรียนเดิม:</span> {viewingApplicant.previousSchoolProvince || '-'}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Row 2: Parents */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-blue-600 mb-3 border-b pb-2 flex items-center gap-2">
                    <UserCheck className="h-4 w-4" /> ข้อมูลบิดา
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li><span className="text-slate-500 w-28 inline-block">ชื่อ-นามสกุล:</span> {viewingApplicant.fatherFirstName || ''} {viewingApplicant.fatherLastName || '-'}</li>
                    
                    <li><span className="text-slate-500 w-28 inline-block">สัญชาติ/เชื้อชาติ:</span> {viewingApplicant.fatherNationality || '-'}/{viewingApplicant.fatherEthnicity || '-'}</li>
                    <li><span className="text-slate-500 w-28 inline-block">อาชีพ:</span> {viewingApplicant.fatherOccupation || '-'}</li>
                    <li><span className="text-slate-500 w-28 inline-block">รายได้:</span> {viewingApplicant.fatherIncome || '-'}</li>
                    <li><span className="text-slate-500 w-28 inline-block">เบอร์โทรศัพท์:</span> {viewingApplicant.fatherPhone || '-'}</li>
                    <li><span className="text-slate-500 w-28 inline-block">ที่อยู่:</span> <span className="text-xs">{formatAddress(viewingApplicant.fatherAddressObj)}</span></li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-pink-600 mb-3 border-b pb-2 flex items-center gap-2">
                    <UserCheck className="h-4 w-4" /> ข้อมูลมารดา
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li><span className="text-slate-500 w-28 inline-block">ชื่อ-นามสกุล:</span> {viewingApplicant.motherPrefix || ''}{viewingApplicant.motherFirstName || ''} {viewingApplicant.motherLastName || '-'}</li>
                    
                    <li><span className="text-slate-500 w-28 inline-block">สัญชาติ/เชื้อชาติ:</span> {viewingApplicant.motherNationality || '-'}/{viewingApplicant.motherEthnicity || '-'}</li>
                    <li><span className="text-slate-500 w-28 inline-block">อาชีพ:</span> {viewingApplicant.motherOccupation || '-'}</li>
                    <li><span className="text-slate-500 w-28 inline-block">รายได้:</span> {viewingApplicant.motherIncome || '-'}</li>
                    <li><span className="text-slate-500 w-28 inline-block">เบอร์โทรศัพท์:</span> {viewingApplicant.motherPhone || '-'}</li>
                    <li><span className="text-slate-500 w-28 inline-block">ที่อยู่:</span> <span className="text-xs">{formatAddress(viewingApplicant.motherAddressObj)}</span></li>
                  </ul>
                </div>
              </div>

              {/* Row 3: Guardian & Family */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-purple-600 mb-3 border-b pb-2 flex items-center gap-2">
                    <UserCheck className="h-4 w-4" /> ข้อมูลผู้ปกครอง
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li><span className="text-slate-500 w-28 inline-block">ชื่อ-นามสกุล:</span> {viewingApplicant.guardianFirstName || ''} {viewingApplicant.guardianLastName || '-'}</li>
                    <li><span className="text-slate-500 w-28 inline-block">เกี่ยวข้องเป็น:</span> {viewingApplicant.guardianRelation || '-'}</li>
                    
                    <li><span className="text-slate-500 w-28 inline-block">อาชีพ:</span> {viewingApplicant.guardianOccupation || '-'}</li>
                    <li><span className="text-slate-500 w-28 inline-block">เบอร์โทรศัพท์:</span> {viewingApplicant.guardianPhone || '-'}</li>
                    <li><span className="text-slate-500 w-28 inline-block">ที่อยู่:</span> <span className="text-xs">{formatAddress(viewingApplicant.guardianAddressObj)}</span></li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-amber-600 mb-3 border-b pb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4" /> ข้อมูลครอบครัว
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li><span className="text-slate-500 w-36 inline-block">สถานภาพครอบครัว:</span> {viewingApplicant.familyStatus || '-'}</li>
                    <li><span className="text-slate-500 w-36 inline-block">นักเรียนอาศัยอยู่กับ:</span> {viewingApplicant.livingWith || '-'}</li>
                    <li><span className="text-slate-500 w-36 inline-block">จำนวนพี่น้องร่วมบิดามารดา:</span> {viewingApplicant.siblingCount || '0'} คน</li>
                    <li><span className="text-slate-500 w-36 inline-block">นักเรียนเป็นบุตรคนที่:</span> {viewingApplicant.siblingOrder || '1'}</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-red-600 mb-3 border-b pb-2 flex items-center gap-2">
                  <UserPlus className="h-4 w-4" /> ผู้ติดต่อฉุกเฉิน
                </h4>
                <ul className="space-y-2 text-sm">
                  <li><span className="text-slate-500 w-28 inline-block">ชื่อ-นามสกุล:</span> {viewingApplicant.emergencyContactName || '-'}</li>
                  <li><span className="text-slate-500 w-28 inline-block">ความสัมพันธ์:</span> {viewingApplicant.emergencyContactRelation || '-'}</li>
                  <li><span className="text-slate-500 w-28 inline-block">เบอร์โทร:</span> {viewingApplicant.emergencyContactPhone || '-'}</li>
                </ul>
              </div>

            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button onClick={() => setViewingApplicant(null)} className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}


      <CapacityModal 
        isOpen={showCapacityModal} 
        onClose={() => setShowCapacityModal(false)} 
        initialCapacities={gradeCapacities}
        onSave={saveCapacities}
        isSaving={isSavingCapacity}
      />
    </div>
  );
};

