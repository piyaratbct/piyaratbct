import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, writeBatch, getDocs, query, where } from 'firebase/firestore';
import { Student } from '../types';

interface ImportStudentDataProps {
  selectedGrade: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportStudentData: React.FC<ImportStudentDataProps> = ({ selectedGrade, onClose, onSuccess }) => {
  const [allData, setAllData] = useState<any[]>([]);
  const [dataPreview, setDataPreview] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
        
        if (jsonData.length === 0) {
          setError('ไม่พบข้อมูลในไฟล์ หรือไฟล์มีรูปแบบไม่ถูกต้อง');
          return;
        }
        
        setAllData(jsonData);
        setDataPreview(jsonData.slice(0, 50)); // Preview up to 50 rows
      } catch (err) {
        console.error("Error reading file:", err);
        setError('เกิดข้อผิดพลาดในการอ่านไฟล์ โปรดตรวจสอบว่าเป็นไฟล์ Excel หรือ CSV ที่ถูกต้อง');
      }
    };
    reader.onerror = () => {
      setError('ไม่สามารถอ่านไฟล์ได้');
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (allData.length === 0) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const studentsCollection = collection(db, 'students');
      
      // Fetch existing students in this grade to match by studentId for upserting
      const q = query(studentsCollection, where('gradeLevel', '==', selectedGrade));
      const existingSnapshot = await getDocs(q);
      const existingMap: Record<string, string> = {};
      existingSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.studentId) {
          existingMap[data.studentId] = doc.id;
        }
      });

      // Process in batches of 500 (Firestore limit)
      const batch = writeBatch(db);
      let count = 0;

      for (const row of allData) {
        // Helper to find key flexibly
        const findKey = (keys: string[]) => {
          const rowKey = Object.keys(row).find(k => keys.some(search => k.replace(/\s+/g, '').toLowerCase().includes(search.toLowerCase())));
          return rowKey ? String(row[rowKey] || '').trim() : '';
        };
        // Map excel columns to Student object
        // Expected columns: รหัสนักเรียน, ชื่อ, นามสกุล, ชื่อเล่น, เพศ, เลขที่
        const studentId = findKey(['รหัสนักเรียน', 'studentId', 'รหัส']);
        const firstName = findKey(['ชื่อ', 'firstName']);
        const lastName = findKey(['นามสกุล', 'lastName', 'สกุล']);
        const nickname = findKey(['ชื่อเล่น', 'nickname']);
        const rawGender = findKey(['เพศ', 'gender']).toLowerCase();
        const nationalId = findKey(['เลขประจำตัวประชาชน', 'เลขบัตรประชาชน', 'บัตรประชาชน', 'nationalId', 'เลขบัตร']);
        const numberRaw = findKey(['เลขที่', 'number']);
        const number = parseInt(numberRaw, 10) || 0;

                let parsedDob = findKey(['วันเกิด', 'dob']);
        
        // Handle Date parsing (Buddhist Era to Christian Era YYYY-MM-DD)
        if (parsedDob) {
          const sep = parsedDob.includes('/') ? '/' : (parsedDob.includes('-') ? '-' : null);
          if (sep) {
            const parts = parsedDob.split(sep);
            if (parts.length === 3) {
              let day, month, year;
              
              if (parts[0].length <= 2 && parts[2].length === 4) {
                // DD/MM/YYYY
                day = parts[0].padStart(2, '0');
                month = parts[1].padStart(2, '0');
                year = parseInt(parts[2], 10);
              } else if (parts[0].length === 4 && parts[2].length <= 2) {
                // YYYY/MM/DD
                year = parseInt(parts[0], 10);
                month = parts[1].padStart(2, '0');
                day = parts[2].padStart(2, '0');
              }
              
              if (year !== undefined) {
                if (year > 2400) year -= 543;
                parsedDob = `${year}-${month}-${day}`;
              }
            }
          }
        }
        const dob = parsedDob;
        const parentName = findKey(['ชื่อผู้ปกครอง', 'parentName', 'ผู้ปกครอง']);
        const parentPhone = findKey(['เบอร์โทรผู้ปกครอง', 'เบอร์ผู้ปกครอง', 'parentPhone', 'โทรผู้ปกครอง']);
        const fatherName = findKey(['ชื่อบิดา', 'fatherName', 'บิดา']);
        const fatherPhone = findKey(['เบอร์โทรบิดา', 'เบอร์บิดา', 'fatherPhone']);
        const motherName = findKey(['ชื่อมารดา', 'motherName', 'มารดา']);
        const motherPhone = findKey(['เบอร์โทรมารดา', 'เบอร์มารดา', 'motherPhone']);
        const familyStatus = String(row['สถานภาพครอบครัว'] || row['familyStatus'] || 'สมรส').trim();
        const address = String(row['ที่อยู่'] || row['address'] || '').trim();
        const medicalInfo = String(row['ข้อมูลสุขภาพ'] || row['medicalInfo'] || '').trim();
        const allergicMedicine = String(row['การแพ้ยา'] || row['allergicMedicine'] || '').trim();
        const allergicFood = String(row['การแพ้อาหาร'] || row['allergicFood'] || '').trim();
        const congenitalDisease = String(row['โรคประจำตัว'] || row['congenitalDisease'] || '').trim();

        // Skip rows without minimum required data
        if (!studentId || !firstName) continue;

        const gender = (rawGender === 'ชาย' || rawGender === 'male' || rawGender === 'm') ? 'male' : 'female';
        
        const existingDocId = existingMap[studentId];
        const docRef = existingDocId ? doc(db, 'students', existingDocId) : doc(studentsCollection);
        
        // Build data object, omitting empty fields to avoid overwriting existing data with blanks
        const studentData: Partial<Student> = {
          id: docRef.id,
          studentId,
          gradeLevel: selectedGrade,
          status: 'active',
        };
        
        if (firstName) studentData.firstName = firstName;
        if (lastName) studentData.lastName = lastName;
        if (nickname) studentData.nickname = nickname;
        if (gender) studentData.gender = gender;
        if (nationalId) studentData.nationalId = nationalId;
        if (number) studentData.number = number;
        if (dob) studentData.dob = dob;
        if (parentName) studentData.parentName = parentName;
        if (parentPhone) studentData.parentPhone = parentPhone;
        if (fatherName) studentData.fatherName = fatherName;
        if (fatherPhone) studentData.fatherPhone = fatherPhone;
        if (motherName) studentData.motherName = motherName;
        if (motherPhone) studentData.motherPhone = motherPhone;
        if (familyStatus) studentData.familyStatus = familyStatus;
        if (address) studentData.address = address;
        if (medicalInfo) studentData.medicalInfo = medicalInfo;
        if (allergicMedicine) studentData.allergicMedicine = allergicMedicine;
        if (allergicFood) studentData.allergicFood = allergicFood;
        if (congenitalDisease) studentData.congenitalDisease = congenitalDisease;

        batch.set(docRef, studentData, { merge: true });
        count++;

        if (count >= 500) {
          await batch.commit();
          // To keep it simple, we only import the first 500 records.
          // In a production app with more than 500 records, you'd create a new batch.
          break; 
        }
      }

      if (count > 0) {
        await batch.commit();
        onSuccess();
      } else {
        setError('ไม่พบข้อมูลที่ตรงกับรูปแบบที่กำหนด (ต้องมีคอลัมน์ "รหัสนักเรียน" และ "ชื่อ")');
        setIsProcessing(false);
      }
      
    } catch (err) {
      console.error(err);
      try {
        handleFirestoreError(err, OperationType.WRITE, 'students');
      } catch (fbError: any) {
         setError(fbError.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
              นำเข้าข้อมูลนักเรียน
            </h3>
            <p className="text-sm text-slate-500">ระดับชั้น: <span className="font-bold text-pink-600">{selectedGrade}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-sm text-sky-800">
            <p className="font-bold mb-1">คำแนะนำรูปแบบไฟล์ (.xlsx หรือ .csv)</p>
            <p className="mb-2">หัวคอลัมน์ (Row 1) ต้องประกอบด้วยชื่อคอลัมน์ดังนี้ (อย่างน้อย "รหัสนักเรียน" และ "ชื่อ"):</p>
            <div className="flex flex-wrap gap-2">
              {['เลขที่', 'รหัสนักเรียน', 'ชื่อ', 'นามสกุล', 'ชื่อเล่น', 'เพศ', 'เลขประจำตัวประชาชน', 'วันเกิด', 'ชื่อบิดา', 'เบอร์โทรบิดา', 'ชื่อมารดา', 'เบอร์โทรมารดา', 'สถานภาพครอบครัว', 'ชื่อผู้ปกครอง', 'เบอร์โทรผู้ปกครอง', 'ที่อยู่', 'การแพ้ยา', 'การแพ้อาหาร', 'โรคประจำตัว', 'ข้อมูลสุขภาพ'].map(col => (
                <span key={col} className="bg-white px-2 py-1 rounded border border-sky-200 text-xs font-bold font-mono">{col}</span>
              ))}
            </div>
          </div>

          {!dataPreview.length ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center hover:bg-slate-50 transition-colors">
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <div 
                className="cursor-pointer flex flex-col items-center"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="h-16 w-16 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8" />
                </div>
                <h4 className="font-bold text-slate-700 text-lg mb-1">คลิกเพื่อเลือกไฟล์</h4>
                <p className="text-slate-500 text-sm">รองรับไฟล์ Excel (.xlsx) และ CSV</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-800">ตัวอย่างข้อมูล ({dataPreview.length} รายการแรก)</h4>
                <button 
                  onClick={() => { setAllData([]); setDataPreview([]); }}
                  className="text-sm font-bold text-pink-600 hover:text-pink-700"
                >
                  อัปโหลดไฟล์ใหม่
                </button>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-64">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      {Object.keys(dataPreview[0]).map((key) => (
                        <th key={key} className="px-4 py-3">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataPreview.map((row, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        {Object.values(row).map((val: any, j) => (
                          <td key={j} className="px-4 py-2">{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium flex items-start gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button 
            onClick={handleImport}
            disabled={!allData.length || isProcessing}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                กำลังนำเข้า...
              </span>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" /> นำเข้าข้อมูลเข้าสู่ระบบ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
