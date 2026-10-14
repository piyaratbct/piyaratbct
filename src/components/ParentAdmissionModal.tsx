import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  UserPlus, 
  GraduationCap, 
  FileText, 
  HeartHandshake, 
  Phone, 
  AlertCircle, 
  Printer, 
  Download,
  Building2, 
  Users, 
  User, 
  MapPin, 
  Calendar,
  Sparkles,
  Loader2
} from 'lucide-react';
import { AdmissionRecord, Address } from '../types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AdmissionPrintTemplate } from './AdmissionPrintTemplate';

interface ParentAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemAcademicYear?: string;
  customLogo?: string | null;
}

const emptyAddress: Address = {
  houseNumber: '',
  moo: '',
  village: '',
  soi: '',
  road: '',
  subDistrict: '',
  district: '',
  province: '',
  zipCode: ''
};

const GRADE_OPTIONS = [
  'อนุบาล 1',
  'อนุบาล 2',
  'อนุบาล 3',
  'ประถมศึกษาปีที่ 1',
  'ประถมศึกษาปีที่ 2',
  'ประถมศึกษาปีที่ 3',
  'ประถมศึกษาปีที่ 4',
  'ประถมศึกษาปีที่ 5',
  'ประถมศึกษาปีที่ 6'
];

export const ParentAdmissionModal: React.FC<ParentAdmissionModalProps> = ({
  isOpen,
  onClose,
  systemAcademicYear = '2569',
  customLogo
}) => {
  const targetYear = String(Number(systemAcademicYear) + 1);

  const [thaiDb, setThaiDb] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedRecord, setSubmittedRecord] = useState<AdmissionRecord | null>(null);
  const [showPrintView, setShowPrintView] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<AdmissionRecord>>({
    academicYear: targetYear,
    applyForGrade: 'ประถมศึกษาปีที่ 1',
    gender: 'male',
    status: 'pending',
    firstName: 'เด็กชาย ',
    lastName: '',
    nickname: 'น้อง ',
    nationalId: '',
    ethnicity: 'ไทย',
    nationality: 'ไทย',
    religion: 'พุทธ',
    familyStatus: 'อยู่ด้วยกัน',
    livingWith: 'บิดาและมารดา',
    fatherFirstName: 'นาย ',
    fatherLastName: '',
    fatherEthnicity: 'ไทย',
    fatherNationality: 'ไทย',
    fatherReligion: 'พุทธ',
    motherPrefix: 'นาง',
    motherFirstName: '',
    motherLastName: '',
    motherEthnicity: 'ไทย',
    motherNationality: 'ไทย',
    motherReligion: 'พุทธ',
    guardianEthnicity: 'ไทย',
    guardianNationality: 'ไทย',
    guardianReligion: 'พุทธ',
    addressObj: { ...emptyAddress },
    fatherAddressObj: { ...emptyAddress },
    motherAddressObj: { ...emptyAddress },
    guardianAddressObj: { ...emptyAddress },
    surveySource: [],
    surveyReasons: [],
    surveyExpectations: []
  });

  // Load Thai address cascade data
  useEffect(() => {
    fetch('/thai_address.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => setThaiDb(data))
      .catch(err => {
        console.warn('Failed to load thai address json, trying fallback', err);
        fetch('thai_address.json')
          .then(res => res.json())
          .then(data => setThaiDb(data))
          .catch(e => console.error('Address load failed:', e));
      });
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSubmittedRecord(null);
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const provinces = Array.from(new Set(thaiDb.map(t => t.province))).filter(Boolean).sort();

  // Helper options
  const familyStatusOptions = [
    { value: 'อยู่ด้วยกัน', label: 'อยู่ด้วยกัน' },
    { value: 'แยกกันอยู่', label: 'แยกกันอยู่' },
    { value: 'หย่าร้าง', label: 'หย่าร้าง' },
    { value: 'บิดาถึงแก่กรรม', label: 'บิดาถึงแก่กรรม' },
    { value: 'มารดาถึงแก่กรรม', label: 'มารดาถึงแก่กรรม' },
    { value: 'บิดาและมารดาถึงแก่กรรม', label: 'บิดาและมารดาถึงแก่กรรม' },
    { value: 'other', label: 'อื่นๆ (ระบุ)' },
  ];

  const livingWithOptions = [
    { value: 'บิดาและมารดา', label: 'บิดาและมารดา' },
    { value: 'บิดา', label: 'บิดา' },
    { value: 'มารดา', label: 'มารดา' },
    { value: 'ปู่ ย่า ตา ยาย', label: 'ปู่ ย่า ตา ยาย' },
    { value: 'ญาติ', label: 'ญาติ' },
    { value: 'other', label: 'อื่นๆ (ระบุ)' },
  ];

  const allergyOptions = [
    { value: 'ไม่มี', label: 'ไม่มี' },
    { value: 'other', label: 'มี (ระบุ)' },
  ];

  const underlyingDiseaseOptions = [
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

  const incomeOptions = [
    { value: '', label: 'เลือกช่วงรายได้' },
    { value: 'ต่ำกว่า 150,000 บาท', label: 'ต่ำกว่า 150,000 บาท' },
    { value: '150,000 - 300,000 บาท', label: '150,000 - 300,000 บาท' },
    { value: 'มากกว่า 300,000 บาท', label: 'มากกว่า 300,000 บาท' },
  ];

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
    { value: 'other', label: 'อื่นๆ (ระบุเอง)' },
  ];

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    if (isNaN(birthDateObj.getTime())) return '';
    let years = today.getFullYear() - birthDateObj.getFullYear();
    let months = today.getMonth() - birthDateObj.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birthDateObj.getDate())) {
      years--;
      months += 12;
    }
    if (today.getDate() < birthDateObj.getDate()) {
      months--;
      if (months < 0) months += 12;
    }
    if (years < 0) return '';
    return `${years} ปี ${months} เดือน`;
  };

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
    let newVal = val.trim();
    if (newVal && !newVal.startsWith('น้อง')) {
      newVal = 'น้อง ' + newVal;
    }
    setFormData({ ...formData, nickname: newVal });
  };

  const handleAddressChange = (
    person: 'addressObj' | 'fatherAddressObj' | 'motherAddressObj' | 'guardianAddressObj',
    field: string,
    value: string
  ) => {
    setFormData(prev => {
      const currentAddr = (prev[person as keyof AdmissionRecord] as any) || emptyAddress;
      const newAddr = { ...currentAddr, [field]: value };

      if (field === 'province') {
        newAddr.district = '';
        newAddr.subDistrict = '';
        newAddr.zipCode = '';
      } else if (field === 'district') {
        newAddr.subDistrict = '';
        newAddr.zipCode = '';
      } else if (field === 'subDistrict') {
        const match = thaiDb.find(
          t => t.province === newAddr.province && t.amphoe === newAddr.district && t.district === value
        );
        if (match) newAddr.zipCode = match.zipcode.toString();
      }

      return {
        ...prev,
        [person]: newAddr
      };
    });
  };

  const copyStudentAddress = (target: 'fatherAddressObj' | 'motherAddressObj' | 'guardianAddressObj') => {
    if (formData.addressObj) {
      setFormData(prev => ({
        ...prev,
        [target]: { ...formData.addressObj }
      }));
    }
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

  const InputOrSelect = ({ options, value, onChange, placeholder }: any) => {
    const isOtherSelected = value === 'other' || (value && !options.some((o: any) => o.value === value));
    if (isOtherSelected) {
      return (
        <div className="flex gap-2">
          <input
            type="text"
            value={value === 'other' ? '' : value}
            onChange={e => onChange(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder={placeholder}
            autoFocus
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-rose-500 hover:text-white hover:bg-rose-500 px-2 py-1 rounded shadow-xs font-bold whitespace-nowrap transition-all"
          >
            ยกเลิก
          </button>
        </div>
      );
    }
    return (
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
      >
        {options.map((o: any) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  };

  const NationalIdInput = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
    const handleChange = (index: number, char: string) => {
      if (!/^\d*$/.test(char)) return;
      let arr = (value || '').padEnd(13, ' ').split('');
      arr[index] = char.slice(-1) || ' ';
      const joined = arr.join('').replace(/\s+$/, '');
      onChange(joined);

      if (char && index < 12) {
        document.getElementById(`parent-nid-${index + 1}`)?.focus();
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !(value || '')[index] && index > 0) {
        document.getElementById(`parent-nid-${index - 1}`)?.focus();
      }
    };

    return (
      <div className="flex flex-wrap gap-1 items-center">
        {Array.from({ length: 13 }).map((_, i) => (
          <React.Fragment key={i}>
            <input
              id={`parent-nid-${i}`}
              type="text"
              maxLength={1}
              inputMode="numeric"
              value={(value || '')[i] || ''}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="w-7 h-10 border border-slate-300 rounded text-center text-sm font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
            />
            {(i === 0 || i === 4 || i === 9 || i === 11) && (
              <span className="text-slate-400 font-bold">-</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderAddressFields = (
    person: 'addressObj' | 'fatherAddressObj' | 'motherAddressObj' | 'guardianAddressObj',
    label: string
  ) => {
    const address = (formData[person as keyof AdmissionRecord] as any) || emptyAddress;

    let districts: string[] = [];
    if (address.province) {
      districts = Array.from<string>(
        new Set(thaiDb.filter(t => t.province === address.province).map(t => t.amphoe as string))
      ).sort();
    }

    let subDistricts: string[] = [];
    if (address.district) {
      subDistricts = Array.from<string>(
        new Set(
          thaiDb
            .filter(t => t.province === address.province && t.amphoe === address.district)
            .map(t => t.district as string)
        )
      ).sort();
    }

    return (
      <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 mt-2 space-y-3">
        <div className="flex justify-between items-center mb-2">
          <h5 className="font-bold text-slate-700 text-xs sm:text-sm flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            {label}
          </h5>
          {person !== 'addressObj' && (
            <button
              type="button"
              onClick={() => copyStudentAddress(person)}
              className="text-xs text-emerald-700 hover:text-white font-bold bg-emerald-100/70 hover:bg-emerald-600 shadow-2xs px-2.5 py-1 rounded-lg transition-all"
            >
              + ใช้ที่อยู่เดียวกับนักเรียน
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">บ้านเลขที่</label>
            <input
              type="text"
              value={address.houseNumber || ''}
              onChange={e => handleAddressChange(person, 'houseNumber', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">หมู่ที่</label>
            <input
              type="text"
              value={address.moo || ''}
              onChange={e => handleAddressChange(person, 'moo', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">หมู่บ้าน</label>
            <input
              type="text"
              value={address.village || ''}
              onChange={e => handleAddressChange(person, 'village', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">ตรอก/ซอย</label>
            <input
              type="text"
              value={address.soi || ''}
              onChange={e => handleAddressChange(person, 'soi', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">ถนน</label>
            <input
              type="text"
              value={address.road || ''}
              onChange={e => handleAddressChange(person, 'road', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">จังหวัด</label>
            <select
              value={address.province || ''}
              onChange={e => handleAddressChange(person, 'province', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">เลือกจังหวัด</option>
              {provinces.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">เขต/อำเภอ</label>
            <select
              value={address.district || ''}
              onChange={e => handleAddressChange(person, 'district', e.target.value)}
              disabled={!address.province}
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs bg-white disabled:bg-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">เลือกอำเภอ</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">แขวง/ตำบล</label>
            <select
              value={address.subDistrict || ''}
              onChange={e => handleAddressChange(person, 'subDistrict', e.target.value)}
              disabled={!address.district}
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs bg-white disabled:bg-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">เลือกตำบล</option>
              {subDistricts.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">รหัสไปรษณีย์</label>
            <input
              type="text"
              value={address.zipCode || ''}
              onChange={e => handleAddressChange(person, 'zipCode', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
      setErrorMessage('กรุณากรอกชื่อและนามสกุลของนักเรียนให้ครบถ้วน');
      return;
    }

    const cleanNid = (formData.nationalId || '').trim();
    if (!cleanNid || cleanNid.length !== 13) {
      setErrorMessage('กรุณากรอกเลขประจำตัวประชาชน 13 หลักให้ครบถ้วน');
      return;
    }

    if (!formData.birthDate) {
      setErrorMessage('กรุณาระบุวัน/เดือน/ปีเกิดของนักเรียน');
      return;
    }

    const hasContact = formData.fatherPhone || formData.motherPhone || formData.guardianPhone || formData.emergencyContactPhone;
    if (!hasContact) {
      setErrorMessage('กรุณาระบุหมายเลขโทรศัพท์ติดต่ออย่างน้อย 1 หมายเลข (บิดา, มารดา, หรือผู้ปกครอง) เพื่อให้ทางโรงเรียนติดต่อกลับ');
      return;
    }

    try {
      setIsSubmitting(true);
      const appliedAt = new Date().toISOString();
      const payload: Omit<AdmissionRecord, 'id'> = {
        ...(formData as Omit<AdmissionRecord, 'id'>),
        nationalId: cleanNid,
        status: 'pending',
        appliedAt
      };

      const docRef = await addDoc(collection(db, 'admissions'), payload);
      const savedRecord: AdmissionRecord = {
        id: docRef.id,
        ...payload
      };

      setSubmittedRecord(savedRecord);
    } catch (err: any) {
      console.error('Failed to submit admission:', err);
      setErrorMessage(`เกิดข้อผิดพลาดในการส่งใบสมัคร: ${err.message || 'โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-5 sm:p-6 shrink-0 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            {customLogo ? (
              <div className="h-14 w-14 rounded-2xl bg-white p-1 shadow-md flex items-center justify-center shrink-0">
                <img src={customLogo} alt="School Logo" className="h-full w-full object-contain" />
              </div>
            ) : (
              <div className="h-13 w-13 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner shrink-0">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white/20 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-white/20">
                  ระบบรับสมัครออนไลน์
                </span>
                <span className="text-emerald-100 text-xs font-medium">ปีการศึกษา {formData.academicYear || targetYear}</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white mt-1">
                ใบสมัครเข้าเรียนออนไลน์ (สำหรับผู้ปกครอง)
              </h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                โรงเรียนศิริมงคลศึกษา บางบัวทอง — กรอกข้อมูลได้ทันทีโดยไม่ต้องสมัครสมาชิก
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors relative z-10 shrink-0"
            title="ปิดหน้าต่าง"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
          
          {/* Success Screen State */}
          {submittedRecord ? (
            <div className="py-8 px-4 text-center space-y-6 max-w-xl mx-auto">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  ส่งใบสมัครสำเร็จเรียบร้อย
                </span>
                <h3 className="text-2xl font-black text-slate-800 mt-2">
                  ขอขอบพระคุณท่านผู้ปกครอง
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  ระบบได้บันทึกใบสมัครของ <strong className="text-slate-900">{submittedRecord.firstName} {submittedRecord.lastName}</strong> เข้าสู่ระบบเรียบร้อยแล้ว
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs text-slate-700">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">รหัสอ้างอิงใบสมัคร:</span>
                  <span className="font-mono font-bold text-slate-900">{submittedRecord.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">ระดับชั้นที่สมัคร:</span>
                  <span className="font-bold text-emerald-700">{submittedRecord.applyForGrade}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">ปีการศึกษา:</span>
                  <span className="font-bold text-slate-800">{submittedRecord.academicYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">สถานะใบสมัคร:</span>
                  <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    รอการตรวจสอบจากฝ่ายวิชาการ/ธุรการ
                  </span>
                </div>
              </div>

              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 text-left text-xs text-sky-800 leading-relaxed">
                <p className="font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  ขั้นตอนถัดไปสำหรับท่านผู้ปกครอง:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>ท่านสามารถกดปุ่ม <strong>"ดาวน์โหลดไฟล์ PDF / พิมพ์ใบสมัคร"</strong> ด้านล่างเพื่อดาวน์โหลดไฟล์ PDF ลงเครื่องหรือสั่งพิมพ์เก็บไว้เป็นหลักฐานได้ทันที</li>
                  <li>เจ้าหน้าที่ฝ่ายวิชาการหรือธุรการของโรงเรียนจะติดต่อกลับตามหมายเลขโทรศัพท์ที่ระบุไว้ เพื่อแจ้งกำหนดการและเอกสารประกอบ</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrintView(true)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <Printer className="w-4 h-4" />
                  <span>ดาวน์โหลดไฟล์ PDF / พิมพ์ใบสมัคร</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-6 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all cursor-pointer"
                >
                  เสร็จสิ้นและปิดหน้าต่าง
                </button>
              </div>

              {showPrintView && submittedRecord && (
                <AdmissionPrintTemplate
                  record={submittedRecord}
                  onClose={() => setShowPrintView(false)}
                />
              )}
            </div>
          ) : (
            /* Admission Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {errorMessage && (
                <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-xl text-rose-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง</p>
                    <p className="mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* 1. Academic & Grade Info */}
              <div className="bg-emerald-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-100 space-y-4">
                <h4 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-2 text-emerald-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">1</span>
                  ข้อมูลระดับชั้นและปีการศึกษาที่สมัคร
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ปีการศึกษาที่ต้องการสมัคร</label>
                    <input
                      type="text"
                      value={formData.academicYear}
                      onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                      className="w-full border border-slate-300 bg-white rounded-xl px-3 py-2 text-sm font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ระดับชั้นที่ต้องการเข้าเรียน <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.applyForGrade}
                      onChange={e => setFormData({ ...formData, applyForGrade: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {GRADE_OPTIONS.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Student Info */}
              <div className="border border-slate-200 p-4 sm:p-5 rounded-2xl space-y-4">
                <h4 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-2 text-indigo-700">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
                  ข้อมูลส่วนตัวนักเรียน
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">เพศ</label>
                    <select
                      value={formData.gender}
                      onChange={e => handleGenderChange(e.target.value as 'male' | 'female')}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                    >
                      <option value="male">ชาย</option>
                      <option value="female">หญิง</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      รหัสประจำตัวประชาชน (13 หลัก) <span className="text-rose-500">*</span>
                    </label>
                    <NationalIdInput
                      value={formData.nationalId || ''}
                      onChange={v => setFormData({ ...formData, nationalId: v })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ชื่อ (ภาษาไทย) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName || ''}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="เช่น เด็กชาย สมศักดิ์"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      นามสกุล <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName || ''}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อเล่น</label>
                    <input
                      type="text"
                      value={formData.nickname || ''}
                      onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                      onBlur={e => handleNicknameChange(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="เช่น น้อง กานต์"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="col-span-2 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      วัน/เดือน/ปีเกิด <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.birthDate || ''}
                      onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">อายุคำนวณ</label>
                    <input
                      type="text"
                      disabled
                      value={calculateAge(formData.birthDate || '')}
                      className="w-full border border-slate-200 bg-slate-100 rounded-xl px-3 py-2 text-sm font-bold text-emerald-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ศาสนา</label>
                    <select
                      value={formData.religion || ''}
                      onChange={e => setFormData({ ...formData, religion: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                    >
                      <option value="พุทธ">พุทธ</option>
                      <option value="คริสต์">คริสต์</option>
                      <option value="อิสลาม">อิสลาม</option>
                      <option value="ฮินดู">ฮินดู</option>
                      <option value="ซิกข์">ซิกข์</option>
                      <option value="ไม่มีศาสนา">ไม่มีศาสนา</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">สัญชาติ</label>
                    <input
                      type="text"
                      value={formData.nationality || ''}
                      onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">หมู่โลหิต</label>
                    <select
                      value={formData.bloodGroup || ''}
                      onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                    >
                      <option value="">เลือกหมู่โลหิต</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="O">O</option>
                      <option value="AB">AB</option>
                      <option value="ไม่ทราบ">ไม่ทราบ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">น้ำหนัก (กก.)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weight || ''}
                      onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ส่วนสูง (ซม.)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.height || ''}
                      onChange={e => setFormData({ ...formData, height: parseFloat(e.target.value) })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">จังหวัดที่เกิด</label>
                    <select
                      value={formData.birthProvince || ''}
                      onChange={e => setFormData({ ...formData, birthProvince: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                    >
                      <option value="">เลือกจังหวัด</option>
                      {provinces.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">โรคประจำตัว</label>
                    <InputOrSelect
                      options={underlyingDiseaseOptions}
                      value={formData.underlyingDisease}
                      onChange={(v: string) => setFormData({ ...formData, underlyingDisease: v })}
                      placeholder="ระบุโรคประจำตัว"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ประวัติการแพ้ยา / แพ้อาหาร</label>
                    <InputOrSelect
                      options={allergyOptions}
                      value={formData.drugAllergy}
                      onChange={(v: string) => setFormData({ ...formData, drugAllergy: v })}
                      placeholder="ระบุชื่อยาหรืออาหารที่แพ้"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">สถานภาพครอบครัว</label>
                    <InputOrSelect
                      options={familyStatusOptions}
                      value={formData.familyStatus}
                      onChange={(v: string) => setFormData({ ...formData, familyStatus: v })}
                      placeholder="ระบุสถานภาพ"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">การอยู่อาศัยของนักเรียน</label>
                    <InputOrSelect
                      options={livingWithOptions}
                      value={formData.livingWith}
                      onChange={(v: string) => setFormData({ ...formData, livingWith: v })}
                      placeholder="ระบุการอยู่อาศัย"
                    />
                  </div>
                </div>

                {/* Student Address */}
                {renderAddressFields('addressObj', 'ที่อยู่ปัจจุบันของนักเรียน')}
              </div>

              {/* 3. Father & Mother Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Father */}
                <div className="border border-blue-200 p-4 sm:p-5 rounded-2xl space-y-4 bg-blue-50/20">
                  <h4 className="font-black text-blue-800 text-sm sm:text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    ข้อมูลบิดา
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อบิดา</label>
                      <input
                        type="text"
                        value={formData.fatherFirstName || ''}
                        onChange={e => setFormData({ ...formData, fatherFirstName: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                        placeholder="เช่น นาย สมชาย"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">นามสกุลบิดา</label>
                      <input
                        type="text"
                        value={formData.fatherLastName || ''}
                        onChange={e => setFormData({ ...formData, fatherLastName: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์บิดา</label>
                      <input
                        type="tel"
                        value={formData.fatherPhone || ''}
                        onChange={e => setFormData({ ...formData, fatherPhone: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                        placeholder="เช่น 081-234-5678"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Line ID</label>
                      <input
                        type="text"
                        value={formData.fatherLineId || ''}
                        onChange={e => setFormData({ ...formData, fatherLineId: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">อาชีพ</label>
                      <InputOrSelect
                        options={occupationOptions}
                        value={formData.fatherOccupation}
                        onChange={(v: string) => setFormData({ ...formData, fatherOccupation: v })}
                        placeholder="ระบุอาชีพ"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">รายได้ต่อปี</label>
                      <select
                        value={formData.fatherIncome || ''}
                        onChange={e => setFormData({ ...formData, fatherIncome: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                      >
                        {incomeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {renderAddressFields('fatherAddressObj', 'ที่อยู่บิดา')}
                </div>

                {/* Mother */}
                <div className="border border-pink-200 p-4 sm:p-5 rounded-2xl space-y-4 bg-pink-50/20">
                  <h4 className="font-black text-pink-800 text-sm sm:text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-pink-600" />
                    ข้อมูลมารดา
                  </h4>
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-4">
                      <label className="block text-xs font-bold text-slate-700 mb-1">คำนำหน้า</label>
                      <select
                        value={formData.motherPrefix || 'นาง'}
                        onChange={e => setFormData({ ...formData, motherPrefix: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                      >
                        <option value="นาง">นาง</option>
                        <option value="นางสาว">นางสาว</option>
                      </select>
                    </div>
                    <div className="col-span-4">
                      <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อมารดา</label>
                      <input
                        type="text"
                        value={formData.motherFirstName || ''}
                        onChange={e => setFormData({ ...formData, motherFirstName: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-xs font-bold text-slate-700 mb-1">นามสกุล</label>
                      <input
                        type="text"
                        value={formData.motherLastName || ''}
                        onChange={e => setFormData({ ...formData, motherLastName: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์มารดา</label>
                      <input
                        type="tel"
                        value={formData.motherPhone || ''}
                        onChange={e => setFormData({ ...formData, motherPhone: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                        placeholder="เช่น 089-123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Line ID</label>
                      <input
                        type="text"
                        value={formData.motherLineId || ''}
                        onChange={e => setFormData({ ...formData, motherLineId: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">อาชีพ</label>
                      <InputOrSelect
                        options={occupationOptions}
                        value={formData.motherOccupation}
                        onChange={(v: string) => setFormData({ ...formData, motherOccupation: v })}
                        placeholder="ระบุอาชีพ"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">รายได้ต่อปี</label>
                      <select
                        value={formData.motherIncome || ''}
                        onChange={e => setFormData({ ...formData, motherIncome: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                      >
                        {incomeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {renderAddressFields('motherAddressObj', 'ที่อยู่มารดา')}
                </div>
              </div>

              {/* 4. Guardian (If applicable) */}
              {!['บิดาและมารดา', 'บิดา', 'มารดา'].includes(formData.livingWith || '') && (
                <div className="border border-amber-200 p-4 sm:p-5 rounded-2xl space-y-4 bg-amber-50/20">
                  <h4 className="font-black text-amber-800 text-sm sm:text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-600" />
                    ข้อมูลผู้ปกครอง (กรณีไม่ได้อยู่กับบิดา-มารดา หรือระบุเป็นผู้ปกครองหลัก)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อผู้ปกครอง</label>
                      <input
                        type="text"
                        value={formData.guardianFirstName || ''}
                        onChange={e => setFormData({ ...formData, guardianFirstName: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                        placeholder="คำนำหน้าและชื่อ"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">นามสกุล</label>
                      <input
                        type="text"
                        value={formData.guardianLastName || ''}
                        onChange={e => setFormData({ ...formData, guardianLastName: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ความเกี่ยวข้อง</label>
                      <input
                        type="text"
                        value={formData.guardianRelation || ''}
                        onChange={e => setFormData({ ...formData, guardianRelation: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                        placeholder="เช่น ปู่, ย่า, ตา, ยาย, ป้า"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ผู้ปกครอง</label>
                      <input
                        type="tel"
                        value={formData.guardianPhone || ''}
                        onChange={e => setFormData({ ...formData, guardianPhone: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Line ID</label>
                      <input
                        type="text"
                        value={formData.guardianLineId || ''}
                        onChange={e => setFormData({ ...formData, guardianLineId: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                      />
                    </div>
                  </div>
                  {renderAddressFields('guardianAddressObj', 'ที่อยู่ผู้ปกครอง')}
                </div>
              )}

              {/* 5. Emergency Contact */}
              <div className="bg-rose-50/70 p-4 sm:p-5 rounded-2xl border border-rose-200 space-y-4">
                <h4 className="font-black text-rose-800 text-sm sm:text-base flex items-center gap-2">
                  <Phone className="w-4 h-4 text-rose-600" />
                  บุคคลที่ติดต่อได้กรณีฉุกเฉิน
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ความเกี่ยวข้อง</label>
                    <InputOrSelect
                      options={emergencyRelationOptions}
                      value={formData.emergencyContactRelation}
                      onChange={handleEmergencyRelationChange}
                      placeholder="ระบุความเกี่ยวข้อง"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อ-สกุล ผู้ติดต่อฉุกเฉิน</label>
                    <input
                      type="text"
                      value={formData.emergencyContactName || ''}
                      onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      หมายเลขโทรศัพท์ฉุกเฉิน <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.emergencyContactPhone || ''}
                      onChange={e => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white font-bold"
                      placeholder="เช่น 08x-xxx-xxxx"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Survey Section */}
              <div className="bg-indigo-50/60 p-4 sm:p-5 rounded-2xl border border-indigo-200 space-y-4">
                <h4 className="font-black text-indigo-900 text-sm sm:text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  แบบสำรวจความสนใจและความคาดหวังของผู้ปกครอง
                </h4>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 mb-2">
                      1. ท่านรู้จักโรงเรียนของเราผ่านช่องทางใด?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        'แฟนเพจ Facebook / Social Media',
                        'เว็บไซต์ของโรงเรียน',
                        'คนรู้จัก / ญาติ / ผู้ปกครองศิษย์เก่าแนะนำมา',
                        'ป้ายประชาสัมพันธ์ / แผ่นพับ',
                        'ขับรถผ่าน / อยู่ใกล้บ้าน',
                      ].map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={formData.surveySource?.includes(opt) || false}
                            onChange={e => {
                              const curr = formData.surveySource || [];
                              setFormData({
                                ...formData,
                                surveySource: e.target.checked ? [...curr, opt] : curr.filter(x => x !== opt)
                              });
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-2">
                      2. เหตุผลสำคัญที่ท่านสนใจให้บุตรหลานเข้าศึกษาที่โรงเรียนของเราคืออะไร?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        'ชื่อเสียงและมาตรฐานทางวิชาการ',
                        'สภาพแวดล้อม อาคารสถานที่ และความปลอดภัย',
                        'หลักสูตรเฉพาะทาง / โปรแกรมพิเศษ',
                        'การดูแลเอาใจใส่ของครู / จำนวนนักเรียนต่อห้องที่เหมาะสม',
                        'ทำเลที่ตั้งและการเดินทางสะดวก',
                        'อัตราค่าธรรมเนียมการศึกษาเหมาะสม',
                        'กิจกรรมเสริมทักษะและดนตรี/กีฬา'
                      ].map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={formData.surveyReasons?.includes(opt) || false}
                            onChange={e => {
                              const curr = formData.surveyReasons || [];
                              setFormData({
                                ...formData,
                                surveyReasons: e.target.checked ? [...curr, opt] : curr.filter(x => x !== opt)
                              });
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-2">
                      3. ท่านคาดหวังให้โรงเรียนพัฒนาบุตรหลานของท่านในด้านใดเป็นพิเศษ?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        'ความเป็นเลิศทางวิชาการ (เตรียมพร้อมสู่การแข่งขัน/สอบเข้า)',
                        'ทักษะชีวิตและการช่วยเหลือตัวเอง (ความรับผิดชอบ, ระเบียบวินัย)',
                        'ทักษะภาษาต่างประเทศและการสื่อสาร',
                        'ความสุขในการเรียนรู้ / สุขภาพจิตที่ดี / ไม่เครียดจนเกินไป',
                        'คุณธรรม จริยธรรม และมารยาททางสังคม'
                      ].map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={formData.surveyExpectations?.includes(opt) || false}
                            onChange={e => {
                              const curr = formData.surveyExpectations || [];
                              setFormData({
                                ...formData,
                                surveyExpectations: e.target.checked ? [...curr, opt] : curr.filter(x => x !== opt)
                              });
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onClose}
                  className="px-6 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังส่งใบสมัคร...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ยืนยันและส่งใบสมัครเรียน</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
