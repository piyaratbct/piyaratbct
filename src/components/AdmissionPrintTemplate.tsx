import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X } from 'lucide-react';
import { AdmissionRecord } from '../types';
import { SchoolLogo } from './PrintTemplate';
import { formatThaiDateTime } from '../lib/dateUtils';

export const AdmissionPrintTemplate: React.FC<{ record: AdmissionRecord, onClose: () => void }> = ({ record, onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.add('print-mode-active');
    return () => {
      document.body.classList.remove('print-mode-active');
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const formatAddress = (addrObj?: any) => {
    if (!addrObj || (!addrObj.houseNumber && !addrObj.houseNo)) return null;
    const hNo = addrObj.houseNumber || addrObj.houseNo || '-';
    const prov = addrObj.province === 'กรุงเทพมหานคร' ? addrObj.province : (addrObj.province ? `จ.${addrObj.province}` : '-');
    return `${hNo} ม.${addrObj.moo || '-'} หมู่บ้าน${addrObj.village || '-'} ซ.${addrObj.soi || '-'} ถ.${addrObj.road || '-'} ต.${addrObj.subDistrict || '-'} อ.${addrObj.district || '-'} ${prov} ${addrObj.zipCode || '-'}`;
  };

  const formatWorkplaceProvince = (prov?: string) => {
    if (!prov) return '';
    return prov === 'กรุงเทพมหานคร' ? `(${prov})` : `(จ.${prov})`;
  };

  const getParentNationality = (firstName?: string, lastName?: string, name?: string, nationality?: string, ethnicity?: string) => {
    const hasData = firstName || lastName || name;
    if (!hasData) return '-';
    return nationality || '-';
  };

  const getParentAddress = (parentAddr?: any) => {
    if (!parentAddr || (!parentAddr.houseNumber && !parentAddr.houseNo)) return '-';
    const studentHNo = record.addressObj?.houseNumber || record.addressObj?.houseNo;
    const parentHNo = parentAddr.houseNumber || parentAddr.houseNo;
    if (studentHNo && parentHNo && studentHNo === parentHNo && record.addressObj?.subDistrict === parentAddr.subDistrict) {
      return 'ใช้ที่อยู่เดียวกันกับนักเรียน';
    }
    return formatAddress(parentAddr) || '-';
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let years = today.getFullYear() - birthDateObj.getFullYear();
    let months = today.getMonth() - birthDateObj.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birthDateObj.getDate())) {
      years--;
      months += 12;
    }
    if (years < 0) return '-';
    return `${years} ปี ${months} เดือน`;
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/90 backdrop-blur-sm print:absolute print:left-0 print:top-0 print:h-auto print:bg-white print:block print:overflow-visible">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 print:hidden shadow-sm z-10">
        <h2 className="text-xl font-black text-slate-800">ตัวอย่างก่อนพิมพ์: ใบสมัครเข้าเรียน</h2>
        <div className="flex items-center space-x-3">
          <button onClick={handlePrint} className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors">
            <Printer className="h-4 w-4" />
            <span>พิมพ์เอกสาร</span>
          </button>
          <button onClick={onClose} className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 custom-scrollbar print:p-0 print:block print:h-auto print:overflow-visible print:w-full print:m-0">
        <div className="max-w-[210mm] mx-auto space-y-8 print:w-full print:max-w-none print:m-0 print:p-0 print:space-y-0">
          
          <div ref={contentRef} className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative print:w-full print:h-auto print:min-h-0 print:m-0 print:p-0" style={{ maxWidth: '210mm', minHeight: '297mm', padding: '12mm 15mm' }}>
            {/* Header */}
            <div className="flex justify-between items-start mb-2 border-b-2 border-slate-800 pb-4">
              <SchoolLogo className="h-16 w-16" />
              <div className="text-right">
                <h1 className="text-2xl font-black text-slate-900 mb-1">ใบสมัครเข้าเรียน</h1>
                <p className="text-slate-600 font-bold mb-2">เอกสารสำหรับการรับนักเรียนใหม่</p>
                <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded text-sm font-bold text-slate-700">
                  ประจำปีการศึกษา {record.academicYear}
                </div>
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <div className="text-sm font-bold text-slate-600">
                วันที่สมัคร: <span className="text-slate-900 font-medium">{record.appliedAt ? formatThaiDateTime(record.appliedAt) : 'ไม่ได้ระบุ'}</span>
              </div>
            </div>

            {/* Part 1: Student Data */}
            <h2 className="text-base font-black text-slate-800 mb-1.5 bg-slate-100 p-1.5 border-l-4 border-indigo-600 flex items-center">
              <span className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">1</span> ข้อมูลผู้สมัคร
            </h2>
            <div className="grid grid-cols-2 gap-y-1.5 gap-x-8 text-sm mb-2 px-4">
              <div className="col-span-2">
                <span className="font-bold text-slate-600">ชื่อ-นามสกุล: </span>
                <span className="font-medium text-slate-900 border-b border-dotted border-slate-400 pb-0.5">
                  {record.firstName} {record.lastName} {record.nickname ? `(ชื่อเล่น: ${record.nickname})` : ''}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-600">ระดับชั้นที่สมัคร: </span>
                <span className="font-medium text-slate-900">{record.applyForGrade}</span>
              </div>
              <div>
                <span className="font-bold text-slate-600">เพศ: </span>
                <span className="font-medium text-slate-900">{record.gender === 'male' ? 'ชาย' : 'หญิง'}</span>
              </div>
              <div className="col-span-2">
                <span className="font-bold text-slate-600">วัน/เดือน/ปีเกิด: </span>
                <span className="font-medium text-slate-900">{record.birthDate || '-'}</span>
                {record.birthDate && <span className="ml-2 text-slate-600">(อายุ: <span className="font-medium text-slate-900">{calculateAge(record.birthDate)}</span>)</span>}
              </div>
              <div>
                <span className="font-bold text-slate-600">เลขประจำตัวประชาชน: </span>
                <span className="font-medium text-slate-900">{record.nationalId || '-'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-600">สัญชาติ: </span>
                <span className="font-medium text-slate-900">{record.nationality || '-'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-600">ศาสนา: </span>
                <span className="font-medium text-slate-900">{record.religion || '-'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-600">โรงพยาบาลที่เกิด: </span>
                <span className="font-medium text-slate-900">{record.birthHospital || '-'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-600">จังหวัดที่เกิด: </span>
                <span className="font-medium text-slate-900">{record.birthProvince || '-'}</span>
              </div>
            </div>

            {/* Part 2: Health Info */}
            <h2 className="text-base font-black text-slate-800 mb-1.5 bg-slate-100 p-1.5 border-l-4 border-indigo-600 flex items-center">
              <span className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">2</span> ข้อมูลสุขภาพและอื่นๆ
            </h2>
            <div className="grid grid-cols-2 gap-y-1.5 gap-x-8 text-sm mb-2 px-4">
              <div>
                <span className="font-bold text-slate-600">หมู่เลือด: </span>
                <span className="font-medium text-slate-900">{record.bloodGroup || '-'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-600">โรคประจำตัว: </span>
                <span className="font-medium text-slate-900">{record.underlyingDisease || '-'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-600">น้ำหนัก: </span>
                <span className="font-medium text-slate-900">{record.weight ? `${record.weight} กก.` : '-'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-600">ส่วนสูง: </span>
                <span className="font-medium text-slate-900">{record.height ? `${record.height} ซม.` : '-'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-600">ประวัติแพ้ยา/อาหาร: </span>
                <span className="font-medium text-slate-900">
                  {record.drugAllergy ? `ยา: ${record.drugAllergy} ` : ''}
                  {record.foodAllergy ? `อาหาร: ${record.foodAllergy}` : ''}
                  {!record.drugAllergy && !record.foodAllergy && '-'}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-600">โรงเรียนเดิม: </span>
                <span className="font-medium text-slate-900">{record.previousSchool || '-'}</span>
              </div>
            </div>

            {/* Part 3: Address */}
            <h2 className="text-base font-black text-slate-800 mb-1.5 bg-slate-100 p-1.5 border-l-4 border-indigo-600 flex items-center">
              <span className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">3</span> ที่อยู่ปัจจุบัน
            </h2>
            <div className="grid grid-cols-1 gap-y-1.5 gap-x-8 text-sm mb-2 px-4">
              <div>
                <span className="font-medium text-slate-900">
                  {formatAddress(record.addressObj) || record.address || '-'}
                </span>
              </div>
            </div>

            {/* Part 4 moved up */}
            {/* Part 4: Family Info */}
            <h2 className="text-base font-black text-slate-800 mb-1.5 bg-slate-100 p-1.5 border-l-4 border-indigo-600 flex items-center">
              <span className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">4</span> ข้อมูลครอบครัว
            </h2>
            <div className="grid grid-cols-2 gap-y-1.5 gap-x-8 text-sm mb-2 px-4">
              <div>
                <span className="font-bold text-slate-600">สถานภาพครอบครัว: </span>
                <span className="font-medium text-slate-900">{record.familyStatus || '-'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-600">นักเรียนอาศัยอยู่กับ: </span>
                <span className="font-medium text-slate-900">{record.livingWith || '-'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-600">จำนวนพี่น้องทั้งหมด: </span>
                <span className="font-medium text-slate-900">{record.siblingCount ? `${record.siblingCount} คน` : '-'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-600">นักเรียนเป็นบุตรลำดับที่: </span>
                <span className="font-medium text-slate-900">{record.siblingOrder || '-'}</span>
              </div>
            </div>
            
            <div className="space-y-6 px-4 mb-2">
              {/* Father */}
              <div>
                <h3 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">ข้อมูลบิดา</h3>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-8 text-sm">
                  <div className="col-span-2">
                    <span className="font-bold text-slate-600">ชื่อ-นามสกุล: </span>
                    <span className="font-medium text-slate-900">{record.fatherName || `${record.fatherFirstName || ''} ${record.fatherLastName || ''}`.trim() || '-'}</span>
                    {record.fatherBirthDate && <span className="ml-4 text-slate-600">(อายุ: <span className="font-medium text-slate-900">{calculateAge(record.fatherBirthDate)}</span>)</span>}
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">สัญชาติ: </span>
                    <span className="font-medium text-slate-900">{getParentNationality(record.fatherFirstName, record.fatherLastName, record.fatherName, record.fatherNationality, record.fatherEthnicity)}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">ศาสนา: </span>
                    <span className="font-medium text-slate-900">{record.fatherReligion || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">อาชีพ: </span>
                    <span className="font-medium text-slate-900">{record.fatherOccupation || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">รายได้ต่อปี: </span>
                    <span className="font-medium text-slate-900">{record.fatherIncome || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-bold text-slate-600">สถานที่ทำงาน: </span>
                    <span className="font-medium text-slate-900">{record.fatherWorkplace || '-'} {formatWorkplaceProvince(record.fatherWorkplaceProvince)}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">เบอร์โทรศัพท์: </span>
                    <span className="font-medium text-slate-900">{record.fatherPhone || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">Line ID: </span>
                    <span className="font-medium text-slate-900">{record.fatherLineId || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-bold text-slate-600">ที่อยู่: </span>
                    <span className="font-medium text-slate-900">{getParentAddress(record.fatherAddressObj)}</span>
                  </div>
                </div>
              </div>
            </div> {/* Close Father's space-y-6 wrapper */}
            
            <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] text-center text-xs text-slate-400">
              เอกสารแผ่นที่ 1/2
            </div>
          </div>

          {/* Page 2 */}
          <div className="bg-white print:shadow-none shadow-xl origin-top mx-auto relative mt-8 print:mt-0 print:break-before-page print:w-full print:h-auto print:min-h-0 print:m-0 print:p-0" style={{ maxWidth: '210mm', minHeight: '297mm', padding: '12mm 15mm' }}>
            <div className="space-y-6 px-4 mb-2 pt-4">
              {/* Mother */}
              <div>
                <h3 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">ข้อมูลมารดา</h3>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-8 text-sm">
                  <div className="col-span-2">
                    <span className="font-bold text-slate-600">ชื่อ-นามสกุล: </span>
                    <span className="font-medium text-slate-900">{record.motherName || `${record.motherPrefix || ''} ${record.motherFirstName || ''} ${record.motherLastName || ''}`.trim() || '-'}</span>
                    {record.motherBirthDate && <span className="ml-4 text-slate-600">(อายุ: <span className="font-medium text-slate-900">{calculateAge(record.motherBirthDate)}</span>)</span>}
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">สัญชาติ: </span>
                    <span className="font-medium text-slate-900">{getParentNationality(record.motherFirstName, record.motherLastName, record.motherName, record.motherNationality, record.motherEthnicity)}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">ศาสนา: </span>
                    <span className="font-medium text-slate-900">{record.motherReligion || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">อาชีพ: </span>
                    <span className="font-medium text-slate-900">{record.motherOccupation || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">รายได้ต่อปี: </span>
                    <span className="font-medium text-slate-900">{record.motherIncome || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-bold text-slate-600">สถานที่ทำงาน: </span>
                    <span className="font-medium text-slate-900">{record.motherWorkplace || '-'} {formatWorkplaceProvince(record.motherWorkplaceProvince)}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">เบอร์โทรศัพท์: </span>
                    <span className="font-medium text-slate-900">{record.motherPhone || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">Line ID: </span>
                    <span className="font-medium text-slate-900">{record.motherLineId || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-bold text-slate-600">ที่อยู่: </span>
                    <span className="font-medium text-slate-900">{getParentAddress(record.motherAddressObj)}</span>
                  </div>
                </div>
              </div>

              {/* Guardian */}
              <div>
                <h3 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">ข้อมูลผู้ปกครอง (กรณีไม่ใช่บิดา-มารดา)</h3>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-8 text-sm">
                  <div className="col-span-2">
                    <span className="font-bold text-slate-600">ชื่อ-นามสกุล: </span>
                    <span className="font-medium text-slate-900">{record.guardianName || `${record.guardianFirstName || ''} ${record.guardianLastName || ''}`.trim() || '-'}</span>
                    {record.guardianBirthDate && <span className="ml-4 text-slate-600">(อายุ: <span className="font-medium text-slate-900">{calculateAge(record.guardianBirthDate)}</span>)</span>}
                  </div>
                  <div className="col-span-2">
                    <span className="font-bold text-slate-600">ความเกี่ยวข้อง: </span>
                    <span className="font-medium text-slate-900">{record.guardianRelation || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">สัญชาติ: </span>
                    <span className="font-medium text-slate-900">{getParentNationality(record.guardianFirstName, record.guardianLastName, record.guardianName, record.guardianNationality, record.guardianEthnicity)}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">ศาสนา: </span>
                    <span className="font-medium text-slate-900">{record.guardianReligion || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">อาชีพ: </span>
                    <span className="font-medium text-slate-900">{record.guardianOccupation || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">รายได้ต่อปี: </span>
                    <span className="font-medium text-slate-900">{record.guardianIncome || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-bold text-slate-600">สถานที่ทำงาน: </span>
                    <span className="font-medium text-slate-900">{record.guardianWorkplace || '-'} {formatWorkplaceProvince(record.guardianWorkplaceProvince)}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">เบอร์โทรศัพท์: </span>
                    <span className="font-medium text-slate-900">{record.guardianPhone || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">Line ID: </span>
                    <span className="font-medium text-slate-900">{record.guardianLineId || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-bold text-slate-600">ที่อยู่: </span>
                    <span className="font-medium text-slate-900">{getParentAddress(record.guardianAddressObj)}</span>
                  </div>
                </div>
              </div>
              
              {/* Emergency Contacts */}
              <div>
                <h3 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1 text-red-600">บุคคลที่ติดต่อได้กรณีฉุกเฉิน</h3>
                <div className="grid grid-cols-1 gap-y-2 text-sm pl-2">
                  {record.fatherPhone && (
                    <div>
                      <span className="font-medium text-slate-900 mr-2">• บิดา ({record.fatherName || `${record.fatherFirstName || ''} ${record.fatherLastName || ''}`.trim() || '-'}):</span>
                      <span className="font-bold text-red-600">{record.fatherPhone}</span>
                    </div>
                  )}
                  {record.motherPhone && (
                    <div>
                      <span className="font-medium text-slate-900 mr-2">• มารดา ({record.motherName || `${record.motherPrefix || ''} ${record.motherFirstName || ''} ${record.motherLastName || ''}`.trim() || '-'}):</span>
                      <span className="font-bold text-red-600">{record.motherPhone}</span>
                    </div>
                  )}
                  {record.guardianPhone && (
                    <div>
                      <span className="font-medium text-slate-900 mr-2">• ผู้ปกครอง ({record.guardianName || `${record.guardianFirstName || ''} ${record.guardianLastName || ''}`.trim() || '-'}):</span>
                      <span className="font-bold text-red-600">{record.guardianPhone}</span>
                    </div>
                  )}
                  {record.emergencyContactName && (
                    <div>
                      <span className="font-medium text-slate-900 mr-2">• {record.emergencyContactRelation || 'อื่นๆ'} ({record.emergencyContactName}):</span>
                      <span className="font-bold text-red-600">{record.emergencyContactPhone || '-'}</span>
                    </div>
                  )}
                  {(!record.fatherPhone && !record.motherPhone && !record.guardianPhone && !record.emergencyContactName) && (
                    <div className="text-slate-500 italic">- ไม่มีข้อมูลเบอร์โทรศัพท์ติดต่อฉุกเฉิน -</div>
                  )}
                </div>
              </div>
            </div>
            {/* Part 5: Survey & Expectations */}
              {(record.surveySource?.length > 0 || record.surveyReasons?.length > 0 || record.surveyExpectations?.length > 0 || record.surveyPlan || record.additionalNotes) && (
                <div className="mt-4">
                  <h2 className="text-base font-black text-slate-800 mb-1.5 bg-slate-100 p-1.5 border-l-4 border-indigo-600 flex items-center">
                    <span className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">5</span> ข้อมูลเพิ่มเติมและแบบสำรวจ
                  </h2>
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-8 text-sm px-4">
                    {record.surveySource && record.surveySource.length > 0 && (
                      <div className="col-span-2">
                        <span className="font-bold text-slate-600">ทราบข่าวการรับสมัครจาก: </span>
                        <span className="font-medium text-slate-900">
                          {record.surveySource.map(s => s === 'อื่นๆ' && record.surveySourceOther ? `อื่นๆ (${record.surveySourceOther})` : s).join(', ')}
                        </span>
                      </div>
                    )}
                    {record.surveyReasons && record.surveyReasons.length > 0 && (
                      <div className="col-span-2">
                        <span className="font-bold text-slate-600">เหตุผลที่สนใจ: </span>
                        <span className="font-medium text-slate-900">{record.surveyReasons.join(', ')}</span>
                      </div>
                    )}
                    {record.surveyExpectations && record.surveyExpectations.length > 0 && (
                      <div className="col-span-2">
                        <span className="font-bold text-slate-600">ความคาดหวัง: </span>
                        <span className="font-medium text-slate-900">{record.surveyExpectations.join(', ')}</span>
                      </div>
                    )}
                    {record.surveyPlan && (
                      <div className="col-span-2">
                        <span className="font-bold text-slate-600">แผนการศึกษาต่อ: </span>
                        <span className="font-medium text-slate-900">{record.surveyPlan}</span>
                      </div>
                    )}
                    {record.additionalNotes && (
                      <div className="col-span-2">
                        <span className="font-bold text-slate-600">หมายเหตุเพิ่มเติม: </span>
                        <span className="font-medium text-slate-900">{record.additionalNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-8">
              <p className="text-sm font-bold text-slate-800 mb-8 px-4 leading-relaxed">
                ข้าพเจ้าขอรับรองว่าข้อความข้างต้นเป็นความจริงทุกประการ หากมีข้อความใดเป็นเท็จ ข้าพเจ้ายินยอมให้ทางโรงเรียนพิจารณายกเลิกสิทธิ์การเข้าเรียน
              </p>

              <div className="flex justify-around mt-16">
                <div className="text-center">
                  <div className="text-sm font-bold text-slate-600 mb-2">(ลงชื่อ) ..............................................................</div>
                  <div className="text-sm font-medium text-slate-900 mb-1">(..............................................................)</div>
                  <div className="text-sm font-bold text-slate-500">ผู้ปกครอง / ผู้สมัคร</div>
                  <div className="text-xs text-slate-400 mt-2">วันที่ ....... / ..................... / ...........</div>
                </div>

                <div className="text-center">
                  <div className="text-sm font-bold text-slate-600 mb-2">(ลงชื่อ) ..............................................................</div>
                  <div className="text-sm font-medium text-slate-900 mb-1">(..............................................................)</div>
                  <div className="text-sm font-bold text-slate-500">เจ้าหน้าที่รับสมัคร</div>
                  <div className="text-xs text-slate-400 mt-2">วันที่ ....... / ..................... / ...........</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] text-center text-xs text-slate-400">
              เอกสารแผ่นที่ 2/2
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
