import React, { useState, useEffect } from 'react';
import { UserPlus, Settings, CheckCircle, Search, ArrowRight, UserCheck, GraduationCap, X, ChevronRight, UserMinus } from 'lucide-react';
import { Student, AdmissionRecord, GRADE_LEVELS } from '../types';
import { collection, query, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface LessonAdmitModuleProps {
  systemAcademicYear: string;
  systemSemester: string;
  students: Student[];
}

export const LessonAdmitModule: React.FC<LessonAdmitModuleProps> = ({ 
  systemAcademicYear, 
  students 
}) => {
  const [activeTab, setActiveTab] = useState<'admission' | 'promotion'>('admission');
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
              งานรับนักเรียน (LessonAdmit)
            </h2>
            <p className="text-indigo-100 font-medium mt-1">
              ระบบรับสมัครและจัดการสถานะผู้เรียน
            </p>
          </div>
        </div>
        
        <div className="relative z-10 flex bg-white/20 backdrop-blur-md rounded-xl p-1 shadow-inner border border-white/20 w-full lg:w-auto">
          <button
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 py-2 px-6 rounded-lg text-sm font-bold transition-all bg-white text-indigo-600 shadow-sm`}
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
        />
      )}


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

const AdmissionManager: React.FC<{

  targetAcademicYear: string;
  applicants: AdmissionRecord[];
  refreshApplicants: () => void;
}> = ({ targetAcademicYear, applicants, refreshApplicants }) => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [thaiDb, setThaiDb] = useState<any[]>([]);
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
    applyForGrade: 'ประถมศึกษาปีที่ 1/1',
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
    try {
      await updateDoc(doc(db, 'admissions', id), { status: newStatus });
      
      if (newStatus === 'enrolled') {
        const studentPayload: Omit<Student, 'id'> = {
          studentId: `NEW${Date.now().toString().slice(-5)}`,
          firstName: applicant.firstName,
          lastName: applicant.lastName,
          nickname: applicant.nickname,
          gradeLevel: applicant.applyForGrade,
          gender: applicant.gender,
          nationalId: applicant.nationalId,
          number: 99,
          status: 'active'
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

  const InputOrSelect = ({ options, value, onChange, placeholder }: any) => {
    const isOtherSelected = value === 'other' || (value && !options.some((o:any) => o.value === value));
    if (isOtherSelected) {
      return (
        <div className="flex gap-2">
          <input type="text" value={value === 'other' ? '' : value} onChange={e => onChange(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder={placeholder} autoFocus />
          <button type="button" onClick={() => onChange('')} className="text-xs text-rose-500 font-bold px-2 whitespace-nowrap">ยกเลิก</button>
        </div>
      );
    }
    return (
      <select value={value || ''} onChange={e => onChange(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
        {options.map((o:any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  };

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
            <button type="button" onClick={() => copyStudentAddress(person)} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-2 py-1 rounded">
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
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm flex items-center gap-2"
        >
          {showForm ? <X className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          {showForm ? 'ปิดแบบฟอร์ม' : 'กรอกใบสมัคร'}
        </button>
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
                  {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
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

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h4 className="font-bold text-slate-800">รายชื่อผู้สมัคร ({applicants.length} คน)</h4>
          {pendingCount > 0 && (
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
              รอดำเนินการ {pendingCount} รายการ
            </span>
          )}
        </div>
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
                    <td className="px-4 py-3 text-right">
                      <select 
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as any, app)}
                        disabled={app.status === 'enrolled'}
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
    </div>
  );
};

