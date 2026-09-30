import React, { useState } from 'react';
import { Student } from '../types';
import {
  PDFPrintHelper,
  PrintPageContainer,
  PrintHeader,
  PrintSignatureBox,
} from "./PDFPrintHelper";
import { Settings2 } from 'lucide-react';

export type RosterType = 
  | 'attendance_grid'     // ตารางเช็คชื่อ/จดคะแนน 10 ช่อง
  | 'attendance_monthly'  // ตารางเช็คชื่อทั้งเดือน 20-30 ช่อง
  | 'signature'           // ใบลงลายมือชื่อ (ประชุมผู้ปกครอง / รับเงิน)
  | 'money_check'         // ใบเช็คจ่ายเงิน/ค่าอุปกรณ์/เงินอุดหนุน
  | 'simple';             // รายชื่อพื้นฐาน พร้อมข้อมูลติดต่อ/เลขประจำตัว

interface StudentRosterPrintTemplateProps {
  students: Student[];
  gradeLevel: string;
  academicYear: string;
  semester: string;
  homeroomTeachers?: any[];
  onClose: () => void;
}

export const StudentRosterPrintTemplate: React.FC<StudentRosterPrintTemplateProps> = ({
  students,
  gradeLevel,
  academicYear,
  semester,
  homeroomTeachers = [],
  onClose,
}) => {
  const [rosterType, setRosterType] = useState<RosterType>('attendance_grid');
  const [customTitle, setCustomTitle] = useState('แบบบันทึกและตรวจเช็ครายชื่อนักเรียน');
  const [columnCount, setColumnCount] = useState(10);
  const [purposeNote, setPurposeNote] = useState('');
  const [layout, setLayout] = useState<'portrait' | 'landscape'>('portrait');
  const [signatureCount, setSignatureCount] = useState<number>(homeroomTeachers?.length >= 2 ? 2 : 1);

  // Filter & sort active students by number
  const activeStudents = students
    .filter(s => s.status === 'active' || !s.status)
    .sort((a, b) => (Number(a.number || '999') - Number(b.number || '999')));

  const STUDENTS_PER_PAGE = layout === 'landscape' ? 22 : 28;
  const pages: Student[][] = [];
  for (let i = 0; i < activeStudents.length; i += STUDENTS_PER_PAGE) {
    pages.push(activeStudents.slice(i, i + STUDENTS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  // Homeroom Teachers parsing
  const teachersList = homeroomTeachers && homeroomTeachers.length > 0 
    ? homeroomTeachers.map(t => ({
        name: t.thaiName || t.displayName || `${t.firstName || ''} ${t.lastName || ''}`.trim(),
        signature: t.signature || t.signatureUrl || undefined,
      })).filter(t => Boolean(t.name))
    : [];

  return (
    <PDFPrintHelper
      onClose={onClose}
      layout={layout}
      documentTitle={`ใบรายชื่อ_${gradeLevel}_ปีการศึกษา_${academicYear}`}
    >
      {/* Control Bar for Print Customization (hidden during print) */}
      <div className="print:hidden max-w-4xl mx-auto my-4 p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 text-slate-800 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Settings2 className="h-5 w-5 text-indigo-600" />
          <h4 className="font-black text-sm text-slate-800">ตั้งค่ารูปแบบใบรายชื่อ (Student Roster)</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">รูปแบบเอกสาร:</label>
            <select
              value={rosterType}
              onChange={(e) => {
                const val = e.target.value as RosterType;
                setRosterType(val);
                if (val === 'attendance_grid') {
                  setCustomTitle('แบบบันทึกและตรวจเช็ครายชื่อนักเรียน');
                  setLayout('portrait');
                } else if (val === 'attendance_monthly') {
                  setCustomTitle('แบบบันทึกการมาเรียน / ตรวจเช็คประจำเดือน');
                  setLayout('landscape');
                } else if (val === 'signature') {
                  setCustomTitle('ใบลงลายมือชื่อผู้เข้าร่วมประชุม / รับทราบข้อมูล');
                  setLayout('portrait');
                } else if (val === 'money_check') {
                  setCustomTitle('หลักฐานการจ่ายเงิน / ค่าอุปกรณ์การเรียน / เงินอุดหนุน');
                  setLayout('portrait');
                } else {
                  setCustomTitle('บัญชีรายชื่อนักเรียน');
                  setLayout('portrait');
                }
              }}
              className="w-full border border-slate-200 rounded-lg p-2 font-semibold bg-slate-50 focus:bg-white outline-none"
            >
              <option value="attendance_grid">ตารางเช็คชื่อ/จดคะแนน (5-10 ช่อง)</option>
              <option value="attendance_monthly">ตารางเช็คชื่อประจำเดือน (แนวนอน)</option>
              <option value="signature">ใบลงลายมือชื่อ (ประชุม/กิจกรรม)</option>
              <option value="money_check">ใบจ่ายเงิน/รับเงินอุดหนุน</option>
              <option value="simple">บัญชีรายชื่อนักเรียนทั่วไป</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">หัวเรื่องเอกสาร:</label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 font-semibold bg-slate-50 focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">หมายเหตุ/กิจกรรม (ระบุเพิ่มเติม):</label>
            <input
              type="text"
              placeholder="เช่น ประจำวิชา..., งวดที่ 1/..."
              value={purposeNote}
              onChange={(e) => setPurposeNote(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 font-semibold bg-slate-50 focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">การจัดหน้ากระดาษ:</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLayout('portrait')}
                className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${layout === 'portrait' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
              >
                แนวตั้ง
              </button>
              <button
                type="button"
                onClick={() => setLayout('landscape')}
                className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${layout === 'landscape' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
              >
                แนวนอน
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
          {rosterType === 'attendance_grid' ? (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">จำนวนช่องตาราง:</span>
              {[5, 8, 10, 12, 15].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setColumnCount(cnt)}
                  className={`px-3 py-1 rounded-md font-bold transition-all ${columnCount === cnt ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-slate-100 text-slate-600'}`}
                >
                  {cnt} ช่อง
                </button>
              ))}
            </div>
          ) : <div />}

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">จุดลงลายมือชื่อครูประจำชั้น:</span>
            <button
              type="button"
              onClick={() => setSignatureCount(1)}
              className={`px-3 py-1 rounded-md font-bold transition-all ${signatureCount === 1 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              1 จุด (ครูประจำชั้นเดี่ยว)
            </button>
            <button
              type="button"
              onClick={() => setSignatureCount(2)}
              className={`px-3 py-1 rounded-md font-bold transition-all ${signatureCount === 2 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              2 จุด (ครูประจำชั้น 2 ท่าน)
            </button>
          </div>
        </div>
      </div>

      {/* Pages to Print */}
      {pages.map((pageStudents, pageIdx) => (
        <PrintPageContainer key={pageIdx} layout={layout}>
          {/* Header */}
          <PrintHeader
            title={customTitle}
            subtitle={
              <div className="space-y-1 text-slate-700 text-xs sm:text-sm mt-1">
                <div className="flex justify-center items-center flex-wrap gap-x-6 gap-y-1 font-semibold">
                  <span><strong>ระดับชั้น:</strong> {gradeLevel}</span>
                  <span><strong>ภาคเรียนที่:</strong> {semester}</span>
                  <span><strong>ปีการศึกษา:</strong> {academicYear}</span>
                  <span><strong>จำนวนนักเรียน:</strong> {activeStudents.length} คน (ชาย {activeStudents.filter(s => s.gender === 'male').length} / หญิง {activeStudents.filter(s => s.gender === 'female').length})</span>
                </div>
                {purposeNote && (
                  <p className="text-center font-bold text-indigo-900 mt-1">
                    {purposeNote}
                  </p>
                )}
              </div>
            }
          />

          {/* Table Container */}
          <div className="mt-4 flex-1">
            <table className="w-full border-collapse border border-black text-black text-xs">
              <thead>
                <tr className="bg-slate-100/70">
                  <th className="border border-black py-1.5 px-2 text-center w-12 font-bold">
                    เลขที่
                  </th>
                  <th className="border border-black py-1.5 px-2 text-center w-24 font-bold">
                    เลขประจำตัว
                  </th>
                  <th className="border border-black py-1.5 px-3 text-left font-bold min-w-[150px]">
                    ชื่อ - นามสกุล
                  </th>

                  {/* Dynamic Columns based on Roster Type */}
                  {rosterType === 'attendance_grid' && (
                    <>
                      {Array.from({ length: columnCount }).map((_, cIdx) => (
                        <th key={cIdx} className="border border-black py-1.5 px-1 text-center font-normal w-10 text-[10px]">
                          {cIdx + 1}
                        </th>
                      ))}
                      <th className="border border-black py-1.5 px-2 text-center font-bold w-16">
                        รวม
                      </th>
                      <th className="border border-black py-1.5 px-2 text-center font-bold w-20">
                        หมายเหตุ
                      </th>
                    </>
                  )}

                  {rosterType === 'attendance_monthly' && (
                    <>
                      {Array.from({ length: 24 }).map((_, cIdx) => (
                        <th key={cIdx} className="border border-black py-1 px-0.5 text-center font-normal text-[9px] w-6">
                          {cIdx + 1}
                        </th>
                      ))}
                      <th className="border border-black py-1 px-1 text-center font-bold text-[10px] w-10">มา</th>
                      <th className="border border-black py-1 px-1 text-center font-bold text-[10px] w-10">ขาด</th>
                      <th className="border border-black py-1 px-1 text-center font-bold text-[10px] w-10">ลา</th>
                      <th className="border border-black py-1 px-1 text-center font-bold text-[10px] w-12">หมายเหตุ</th>
                    </>
                  )}

                  {rosterType === 'signature' && (
                    <>
                      <th className="border border-black py-1.5 px-3 text-center font-bold min-w-[140px]">
                        ลายมือชื่อ
                      </th>
                      <th className="border border-black py-1.5 px-3 text-center font-bold w-28">
                        วัน/เดือน/ปี
                      </th>
                      <th className="border border-black py-1.5 px-3 text-center font-bold min-w-[120px]">
                        หมายเหตุ / เบอร์ติดต่อ
                      </th>
                    </>
                  )}

                  {rosterType === 'money_check' && (
                    <>
                      <th className="border border-black py-1.5 px-2 text-center font-bold w-24">
                        จำนวนเงิน (บาท)
                      </th>
                      <th className="border border-black py-1.5 px-3 text-center font-bold min-w-[140px]">
                        ลายมือชื่อผู้รับเงิน
                      </th>
                      <th className="border border-black py-1.5 px-2 text-center font-bold w-24">
                        วัน/เดือน/ปี
                      </th>
                      <th className="border border-black py-1.5 px-2 text-center font-bold w-28">
                        ความสัมพันธ์
                      </th>
                    </>
                  )}

                  {rosterType === 'simple' && (
                    <>
                      <th className="border border-black py-1.5 px-2 text-center font-bold w-20">
                        เพศ
                      </th>
                      <th className="border border-black py-1.5 px-3 text-left font-bold min-w-[120px]">
                        ชื่อผู้ปกครอง
                      </th>
                      <th className="border border-black py-1.5 px-3 text-center font-bold w-32">
                        เบอร์โทรศัพท์
                      </th>
                      <th className="border border-black py-1.5 px-3 text-center font-bold min-w-[120px]">
                        หมายเหตุ
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {pageStudents.map((student, sIdx) => {
                  const globalIndex = pageIdx * STUDENTS_PER_PAGE + sIdx + 1;
                  return (
                    <tr key={student.id} className="h-7 hover:bg-slate-50">
                      <td className="border border-black py-1 px-2 text-center font-bold">
                        {student.number || globalIndex}
                      </td>
                      <td className="border border-black py-1 px-2 text-center">
                        {student.studentId || '-'}
                      </td>
                      <td className="border border-black py-1 px-3 whitespace-nowrap font-medium">
                        {student.firstName} {student.lastName}
                        {student.nickname && <span className="text-[10px] text-slate-500 ml-1">({student.nickname})</span>}
                      </td>

                      {/* Dynamic Cells */}
                      {rosterType === 'attendance_grid' && (
                        <>
                          {Array.from({ length: columnCount }).map((_, cIdx) => (
                            <td key={cIdx} className="border border-black text-center"></td>
                          ))}
                          <td className="border border-black text-center"></td>
                          <td className="border border-black text-center"></td>
                        </>
                      )}

                      {rosterType === 'attendance_monthly' && (
                        <>
                          {Array.from({ length: 24 }).map((_, cIdx) => (
                            <td key={cIdx} className="border border-black text-center"></td>
                          ))}
                          <td className="border border-black text-center"></td>
                          <td className="border border-black text-center"></td>
                          <td className="border border-black text-center"></td>
                          <td className="border border-black text-center"></td>
                        </>
                      )}

                      {rosterType === 'signature' && (
                        <>
                          <td className="border border-black text-center"></td>
                          <td className="border border-black text-center"></td>
                          <td className="border border-black text-center"></td>
                        </>
                      )}

                      {rosterType === 'money_check' && (
                        <>
                          <td className="border border-black text-center"></td>
                          <td className="border border-black text-center"></td>
                          <td className="border border-black text-center"></td>
                          <td className="border border-black text-center"></td>
                        </>
                      )}

                      {rosterType === 'simple' && (
                        <>
                          <td className="border border-black text-center">
                            {student.gender === 'male' ? 'ชาย' : student.gender === 'female' ? 'หญิง' : '-'}
                          </td>
                          <td className="border border-black py-1 px-3 text-slate-700">
                            {student.guardianFirstName 
                              ? `${student.guardianFirstName} ${student.guardianLastName || ''}`
                              : (student.fatherName || student.motherName || '-')}
                          </td>
                          <td className="border border-black text-center text-slate-700">
                            {student.parentPhone || student.fatherPhone || student.motherPhone || '-'}
                          </td>
                          <td className="border border-black text-center"></td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer & Signature (shown on the last page) */}
          {pageIdx === pages.length - 1 && (
            <div className="mt-8 pt-2 border-t border-slate-200 text-xs text-black">
              <div className="flex justify-between items-start mb-6">
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <p>พิมพ์จากระบบบริหารจัดการสถานศึกษา • วันที่พิมพ์: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p>จำนวนนักเรียนทั้งหมดในห้อง: {activeStudents.length} คน (ชาย {activeStudents.filter(s => s.gender === 'male').length} / หญิง {activeStudents.filter(s => s.gender === 'female').length})</p>
                </div>
              </div>

              {/* Dynamic Homeroom Teacher Signature Boxes based on user selection and teacher data */}
              {signatureCount === 2 ? (
                <div className="grid grid-cols-2 gap-10 max-w-3xl mx-auto pt-2">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-end justify-center mb-6">
                      <span className="text-xs text-slate-800 mr-2 whitespace-nowrap">ลงชื่อ</span>
                      <div className="w-48 border-b border-dotted border-slate-700 h-6"></div>
                    </div>
                    <p className="font-semibold text-sm text-slate-900 mb-1">
                      ({teachersList[0]?.name || "..........................................................."})
                    </p>
                    <p className="text-xs text-slate-700 mb-1">ครูประจำชั้นคนที่ 1</p>
                    <p className="text-[11px] text-slate-500 whitespace-nowrap">วันที่ .......... เดือน .......................... พ.ศ. ...............</p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-end justify-center mb-6">
                      <span className="text-xs text-slate-800 mr-2 whitespace-nowrap">ลงชื่อ</span>
                      <div className="w-48 border-b border-dotted border-slate-700 h-6"></div>
                    </div>
                    <p className="font-semibold text-sm text-slate-900 mb-1">
                      ({teachersList[1]?.name || "..........................................................."})
                    </p>
                    <p className="text-xs text-slate-700 mb-1">ครูประจำชั้นคนที่ 2</p>
                    <p className="text-[11px] text-slate-500 whitespace-nowrap">วันที่ .......... เดือน .......................... พ.ศ. ...............</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end pr-8 pt-2">
                  <div className="flex flex-col items-center text-center min-w-[280px]">
                    <div className="flex items-end justify-center mb-6">
                      <span className="text-xs text-slate-800 mr-2 whitespace-nowrap">ลงชื่อ</span>
                      <div className="w-52 border-b border-dotted border-slate-700 h-6"></div>
                    </div>
                    <p className="font-semibold text-sm text-slate-900 mb-1">
                      ({teachersList[0]?.name || "..........................................................."})
                    </p>
                    <p className="text-xs text-slate-700 mb-1">ครูประจำชั้น</p>
                    <p className="text-[11px] text-slate-500 whitespace-nowrap">วันที่ .......... เดือน .......................... พ.ศ. ...............</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Page number */}
          <div className="text-right text-[10px] text-slate-500 mt-2">
            หน้า {pageIdx + 1} จาก {pages.length}
          </div>
        </PrintPageContainer>
      ))}
    </PDFPrintHelper>
  );
};
