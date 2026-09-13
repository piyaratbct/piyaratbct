import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { Settings, Save, AlertCircle, Plus, Trash2, Calendar } from "lucide-react";
import { Teacher, SchoolHoliday } from "../types";
import { useAvailableSubjects } from "../hooks/useAvailableSubjects";

interface AcademicSettingsProps {
  currentTeacher: Teacher;
}

export const AcademicSettings: React.FC<AcademicSettingsProps> = ({ currentTeacher }) => {
  const [academicYear, setAcademicYear] = useState<string>("2569");
  const [semester, setSemester] = useState<string>("1");
  const [totalLearningDays, setTotalLearningDays] = useState<number>(100);
  const [termStartDate, setTermStartDate] = useState<string>("");
  const [termEndDate, setTermEndDate] = useState<string>("");
  const [passingGrade, setPassingGrade] = useState<number>(50);
  const [holidays, setHolidays] = useState<SchoolHoliday[]>([]);
  const [schoolName, setSchoolName] = useState<string>("");
  const [schoolSubDistrict, setSchoolSubDistrict] = useState<string>("");
  const [schoolDistrict, setSchoolDistrict] = useState<string>("");
  const [schoolProvince, setSchoolProvince] = useState<string>("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const availableSubjects = useAvailableSubjects();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const canEdit = currentTeacher.role === "admin" || currentTeacher.role === "academic";

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "school"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.systemAcademicYear) setAcademicYear(data.systemAcademicYear);
        if (data.systemSemester) setSemester(data.systemSemester);
        if (data.totalLearningDays) setTotalLearningDays(data.totalLearningDays);
        if (data.termStartDate) setTermStartDate(data.termStartDate);
        if (data.termEndDate) setTermEndDate(data.termEndDate);
        if (data.passingGrade) setPassingGrade(data.passingGrade);
      }
    });

    // Separately load holidays from schoolCalendar
    const calendarDocId = `${academicYear}_${semester}`;
    const unsubCalendar = onSnapshot(doc(db, "schoolCalendar", calendarDocId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.holidays) {
          setHolidays(data.holidays);
        } else {
          setHolidays([]);
        }
      } else {
        setHolidays([]);
      }
    });

    return () => {
      unsub();
      unsubCalendar();
    };
  }, [academicYear, semester]);

  
    const calculateLearningDays = () => {
    if (!termStartDate || !termEndDate) {
      alert("กรุณาระบุวันเปิดและวันปิดภาคเรียนให้ครบถ้วนก่อนคำนวณ");
      return;
    }
    
    // Create dates explicitly in local time by parsing YYYY-MM-DD
    const [startYear, startMonth, startDay] = termStartDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = termEndDate.split('-').map(Number);
    
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    
    if (start > end) {
      alert("วันเปิดภาคเรียนต้องอยู่ก่อนวันปิดภาคเรียน");
      return;
    }

    let count = 0;
    let cur = new Date(start);

    while (cur <= end) {
      const dayOfWeek = cur.getDay(); // 0 = Sunday, 6 = Saturday
      
      const year = cur.getFullYear();
      const month = String(cur.getMonth() + 1).padStart(2, '0');
      const day = String(cur.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      const isHoliday = holidays.find(h => h.date === dateString);
      const shouldSkip = isHoliday && (isHoliday.type === 'holiday' || isHoliday.type === 'activity_no_class');
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !shouldSkip) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    setTotalLearningDays(count);
    setMessage({ type: 'success', text: 'คำนวณจำนวนวันเรียนอัตโนมัติเรียบร้อยแล้ว (ไม่รวมเสาร์-อาทิตย์ และวันหยุดพิเศษ)' });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSave = async () => {
    if (!canEdit) return;
    
    try {
      setIsProcessing(true);
      setMessage(null);
      
      await setDoc(doc(db, "config", "school"), {
        schoolName,
        schoolSubDistrict,
        schoolDistrict,
        schoolProvince,
        systemAcademicYear: academicYear,
        systemSemester: semester,
        totalLearningDays: totalLearningDays,
        termStartDate: termStartDate,
        termEndDate: termEndDate,
        passingGrade: passingGrade
      }, { merge: true });
      
      const calendarDocId = `${academicYear}_${semester}`;
      await setDoc(doc(db, "schoolCalendar", calendarDocId), {
        academicYear: academicYear,
        semester: semester,
        holidays: holidays,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setMessage({ type: 'success', text: 'บันทึกการตั้งค่าระบบเรียบร้อยแล้ว' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error saving config:", error);
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-w-4xl mx-auto">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
        <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">ตั้งค่าระบบและวันเปิด-ปิดภาคเรียน</h2>
          <p className="text-sm text-slate-500 mt-1">กำหนดปีการศึกษา ภาคเรียน และเกณฑ์การประเมินผลกลางของโรงเรียน</p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="font-bold">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b border-slate-100 pb-8">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อโรงเรียน</label>
              <input
                type="text"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                disabled={!canEdit || isProcessing}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 disabled:bg-slate-50"
                placeholder="ระบุชื่อโรงเรียน"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">แขวง/ตำบล</label>
              <input
                type="text"
                value={schoolSubDistrict}
                onChange={e => setSchoolSubDistrict(e.target.value)}
                disabled={!canEdit || isProcessing}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 disabled:bg-slate-50"
                placeholder="ระบุแขวงหรือตำบล"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">เขต/อำเภอ</label>
              <input
                type="text"
                value={schoolDistrict}
                onChange={e => setSchoolDistrict(e.target.value)}
                disabled={!canEdit || isProcessing}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 disabled:bg-slate-50"
                placeholder="ระบุเขตหรืออำเภอ"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">จังหวัด</label>
              <input
                type="text"
                value={schoolProvince}
                onChange={e => setSchoolProvince(e.target.value)}
                disabled={!canEdit || isProcessing}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 disabled:bg-slate-50"
                placeholder="ระบุจังหวัด"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="h-6 w-1 bg-indigo-500 rounded-full"></span>
                ข้อมูลปีการศึกษาปัจจุบัน
              </h3>
              
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">ปีการศึกษา</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    disabled={!canEdit}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="เช่น 2567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">ภาคเรียนที่</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    disabled={!canEdit}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    <option value="1">ภาคเรียนที่ 1</option>
                    <option value="2">ภาคเรียนที่ 2</option>
                    <option value="3">ภาคเรียนฤดูร้อน</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="h-6 w-1 bg-sky-500 rounded-full"></span>
                กำหนดการเปิด-ปิดภาคเรียน
              </h3>
              
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">วันเปิดภาคเรียน</label>
                  <input
                    type="date"
                    value={termStartDate}
                    onChange={(e) => setTermStartDate(e.target.value)}
                    disabled={!canEdit}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">วันปิดภาคเรียน</label>
                  <input
                    type="date"
                    value={termEndDate}
                    onChange={(e) => setTermEndDate(e.target.value)}
                    disabled={!canEdit}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="h-6 w-1 bg-emerald-500 rounded-full"></span>
                เกณฑ์การประเมินและเวลาเรียน
              </h3>
              
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-sm font-bold text-slate-700">
                      จำนวนวันเรียนทั้งหมด (วัน)
                      <span className="text-xs text-slate-400 font-normal ml-2">ใช้คำนวณร้อยละการเข้าเรียน</span>
                    </label>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={calculateLearningDays}
                        className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold rounded hover:bg-emerald-200 transition-colors flex items-center gap-1 shadow-sm whitespace-nowrap"
                      >
                        <Calendar className="h-3 w-3" />
                        คำนวณจากปฏิทิน
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    value={totalLearningDays}
                    onChange={(e) => setTotalLearningDays(parseInt(e.target.value) || 0)}
                    disabled={!canEdit}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="เช่น 100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    จำนวนเวลาขั้นต่ำ (%)
                  </label>
                  <input
                    type="number"
                    value={passingGrade}
                    onChange={(e) => setPassingGrade(parseInt(e.target.value) || 0)}
                    disabled={!canEdit}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="เช่น 80"
                  />
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
              <h4 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> ข้อควรระวัง
              </h4>
              <p className="text-sm text-amber-700 mb-2">
                การเปลี่ยนแปลงปีการศึกษาและภาคเรียน จะส่งผลกระทบต่อ:
              </p>
              <ul className="list-disc list-inside text-sm text-amber-700 space-y-1 ml-2">
                <li>การแสดงผลข้อมูลชั้นเรียนทั้งหมด</li>
                <li>การบันทึกแผนการสอนและการเช็คชื่อ</li>
                <li>การประเมินผลและการเลื่อนชั้น</li>
              </ul>
              <p className="text-sm text-amber-800 font-bold mt-3">
                ควรเปลี่ยนเมื่อสิ้นสุดภาคเรียนเท่านั้น
              </p>
            </div>
          </div>
        </div>

        
        <div className="pt-6 border-t border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <span className="h-6 w-1 bg-rose-500 rounded-full"></span>
              วันหยุดตามปฏิทิน / วันหยุดพิเศษ (สำหรับภาคเรียนนี้)
            </h3>
            {canEdit && (
              <button
                onClick={() => setHolidays([...holidays, { id: Date.now().toString(), date: '', description: '', type: 'holiday', integratedSubjects: [] }])}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Plus className="h-4 w-4" /> เพิ่มวันหยุด
              </button>
            )}
          </div>
          
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
            {holidays.length === 0 ? (
              <div className="text-center py-6 text-slate-400 flex flex-col items-center">
                <Calendar className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">ยังไม่มีการกำหนดวันหยุดพิเศษ</p>
              </div>
            ) : (
              <div className="space-y-3">
                {holidays.map((holiday, index) => (
                  <div key={holiday.id} className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex flex-wrap items-start sm:items-center gap-3">
                      <input
                        type="date"
                        value={holiday.date}
                        onChange={(e) => {
                          const newHolidays = [...holidays];
                          newHolidays[index].date = e.target.value;
                          setHolidays(newHolidays);
                        }}
                        disabled={!canEdit}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-slate-100"
                      />
                      
                      <select
                        value={holiday.type || 'holiday'}
                        onChange={(e) => {
                          const newHolidays = [...holidays];
                          newHolidays[index].type = e.target.value as any;
                          if (e.target.value !== 'activity_integrated') {
                            newHolidays[index].integratedSubjects = [];
                          }
                          setHolidays(newHolidays);
                        }}
                        disabled={!canEdit}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 min-w-[180px]"
                      >
                        <option value="holiday">วันหยุดราชการ / หยุดพิเศษ</option>
                        <option value="activity_no_class">กิจกรรมโรงเรียน (งดเรียน)</option>
                        <option value="activity_integrated">กิจกรรมบูรณาการ (นับชั่วโมง)</option>
                      </select>

                      <input
                        type="text"
                        value={holiday.description}
                        onChange={(e) => {
                          const newHolidays = [...holidays];
                          newHolidays[index].description = e.target.value;
                          setHolidays(newHolidays);
                        }}
                        disabled={!canEdit}
                        placeholder="รายละเอียด (เช่น วันวิสาขบูชา, วันกีฬาสี)"
                        className="flex-1 min-w-[200px] border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-slate-100"
                      />
                      
                      {canEdit && (
                        <button
                          onClick={() => {
                            const newHolidays = holidays.filter(h => h.id !== holiday.id);
                            setHolidays(newHolidays);
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto sm:ml-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    {holiday.type === 'activity_integrated' && (
                      <div className="pl-0 sm:pl-[380px]">
                        <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                          <label className="block text-xs font-bold text-indigo-800 mb-2">
                            บูรณาการเพื่อคิดชั่วโมงให้วิชาต่อไปนี้ (เลือกได้มากกว่า 1 วิชา)
                          </label>
                          <div className="w-full text-xs p-2 border border-slate-200 rounded-lg max-h-32 overflow-y-auto bg-white flex flex-col gap-1.5">
                            {availableSubjects.flatMap((s: any) => typeof s === 'string' ? [s] : s.type === 'single' ? [s.name] : s.subjects).filter((s: string) => s !== 'อื่นๆ' && s !== 'อื่น ๆ').map((subj: string) => {
                                const isChecked = (holiday.integratedSubjects || []).includes(subj);
                                return (
                                  <label key={subj} className="flex items-start gap-1.5 cursor-pointer hover:bg-slate-50 p-1 rounded">
                                    <input 
                                      type="checkbox" 
                                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (!canEdit) return;
                                        const newHolidays = [...holidays];
                                        const currSubs = newHolidays[index].integratedSubjects || [];
                                        if (e.target.checked) {
                                          newHolidays[index].integratedSubjects = [...currSubs, subj];
                                        } else {
                                          newHolidays[index].integratedSubjects = currSubs.filter((s: string) => s !== subj);
                                        }
                                        setHolidays(newHolidays);
                                      }}
                                      disabled={!canEdit}
                                    />
                                    <span className={isChecked ? 'text-indigo-700 font-medium' : 'text-slate-600'}>{subj}</span>
                                  </label>
                                );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {canEdit ? (
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm whitespace-nowrap"
            >
              {isProcessing ? (
                <>กำลังบันทึก...</>
              ) : (
                <>
                  <Save className="h-4 w-4" /> บันทึกการตั้งค่า
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-sm text-rose-500 font-bold">คุณไม่มีสิทธิ์แก้ไขการตั้งค่าระบบ กรุณาติดต่อผู้ดูแลระบบ (Admin) หรือ ฝ่ายวิชาการ</p>
          </div>
        )}
      </div>
    </div>
  );
};
