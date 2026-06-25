import React, { useState, useRef, useEffect } from 'react';
import { LessonRecord, Teacher } from '../types';
import { Printer, X, Eye, HelpCircle, Lock, ShieldCheck, ShieldAlert, User, CheckCircle } from 'lucide-react';


export function SchoolLogo({ className = "h-24 w-24" }: { className?: string }) {
  return (
    <img 
      src="https://lh3.googleusercontent.com/d/1D4vTEwUZf9twSndugG7kUIn30OBUR3jH" 
      alt="School Logo" 
      referrerPolicy="no-referrer"
      className={`${className} object-contain`} 
      id="school-emblem-svg"
    />
  );
}

interface PrintTemplateProps {
  record: LessonRecord;
  teacher: Teacher;
  academicHead?: Teacher | null;
  currentUser?: Teacher | null;
  customLogo?: string | null;
  allowAcademicSignature?: boolean;
  onUpdateRecord?: (record: LessonRecord) => void;
  onClose: () => void;
}

export interface SignaturePadModalProps {
  role: 'teacher' | 'deptHead' | 'deputyDirector';
  defaultName: string;
  onSave: (name: string, signatureBase64: string) => void;
  onClose: () => void;
}

export function SignaturePadModal({ role, defaultName, onSave, onClose }: SignaturePadModalProps) {
  const [name, setName] = useState(defaultName);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e3a8a'; // Blue pen color
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasDrawn) {
      alert('กรุณาวาดลายเซ็นประทับของคุณบนกระดานก่อนทำการบันทึก');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base64 = canvas.toDataURL('image/png');
    onSave(name, base64);
  };

  const roleTitle = role === 'teacher' 
    ? 'ครูผู้สอนประจำห้องเรียน' 
    : role === 'deptHead' 
      ? 'หัวหน้ากลุ่มสาระการเรียนรู้' 
      : 'รองผู้อำนวยการโรงเรียน / ฝ่ายวิชาการ';

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex justify-center items-center p-4 print:hidden">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-5">
          <h4 className="font-extrabold text-sm tracking-tight">ลงลายมือชื่อแบบอิเล็กทรอนิกส์</h4>
          <p className="text-[10px] text-indigo-100 mt-1">บทบาทผู้ตรวจประเมิน: {roleTitle}</p>
        </div>

        <form onSubmit={handleConfirm} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              ชื่อ-นามสกุล ผู้ลงนามจริง *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-slate-800"
              placeholder="เช่น นายประสิทธิ์ ตั้งสัจจะ"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-bold text-slate-700">
                เขียนลายเซ็นลงบนพื้นที่วาด (เมาส์/ทัชสกรีน) *
              </label>
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] text-red-500 font-extrabold hover:underline"
              >
                ล้างลายเซ็น
              </button>
            </div>
            <div className="border border-dashed border-slate-300 bg-slate-50 rounded-2xl overflow-hidden relative" style={{ height: '140px' }}>
              <canvas
                ref={canvasRef}
                width={400}
                height={140}
                className="w-full h-full cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!hasDrawn && (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 pointer-events-none">
                  ✍️ เซ็นชื่อของคุณตรงช่องนี้
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
            >
              บันทึกและอนุมัติ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PrintTemplate({ record, teacher, academicHead, currentUser, customLogo, allowAcademicSignature = true, onUpdateRecord, onClose }: PrintTemplateProps) {
  const [signingRole, setSigningRole] = useState<'teacher' | 'deptHead' | null>(null);
  const [isCompact, setIsCompact] = useState(false);

  // Status variables
  const isDeptHeadApproved = !!record.deptHeadApproved;
  const isFullyApproved = isDeptHeadApproved;

  // Format Thai dates to short abbreviated format e.g., "05 มิ.ย. 69"
  const formatThaiDateFull = (dateString: string) => {
    const shortMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const yearFull = parseInt(parts[0]) + 543;
      const yearTwoDigits = String(yearFull).slice(-2);
      const monthShort = shortMonths[parseInt(parts[1]) - 1];
      const day = String(parseInt(parts[2])).padStart(2, '0');
      return `${day} ${monthShort} ${yearTwoDigits}`;
    }
    return dateString;
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    
    // Format subject name safely and sanitize forbidden characters in filenames
    const rawSubject = record.subject === 'อื่นๆ' && record.customSubject 
      ? record.customSubject 
      : record.subject;
    const subjectName = rawSubject.replace(/[\/\\:*?"<>|\s]/g, '_');
      
    // Format teacher ID safely (รหัสประจำตัวคุณครู)
    const teacherIdentifier = (teacher.employeeId || teacher.thaiName || 'ครูผู้สอน')
      .replace(/[\/\\:*?"<>|\s]/g, '_');
    
    // Format teaching date
    const recordDate = (record.date || '')
      .replace(/[\/\\:*?"<>|\s]/g, '_');
    
    // Dynamic file name for printing or saving as PDF
    document.title = `บันทึกหลังสอน_${teacherIdentifier}_${subjectName}_${recordDate}`;
    
    try {
      window.print();
    } catch (e) {
      console.warn("window.print() is blocked or unsupported in this sandbox:", e);
      alert("ไม่สามารถเปิดระบบพิมพ์เอกสารได้เนื่องจากข้อจำกัดความปลอดภัยของเบราว์เซอร์ในโหมดพรีวิว กรุณากดเปิดแท็บใหม่ (Open in new tab) หรือส่งออกรายงานหลักเพื่อพิมพ์");
    }
    
    // Restore original document title after a short delay
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  };

  const handleSaveSignature = (name: string, signatureBase64: string) => {
    if (!onUpdateRecord) return;

    let updatedRecord = { ...record };
    const todayStr = new Date().toISOString().slice(0, 10);

    if (signingRole === 'deptHead') {
      updatedRecord.deptHeadApproved = true;
      updatedRecord.deptHeadName = name;
      updatedRecord.deptHeadSignature = signatureBase64;
      updatedRecord.deptHeadDate = todayStr;
    } else if (signingRole === 'teacher') {
      updatedRecord.teacherSigned = true;
      // Use helper parameter to store optional teacher signature safely
      (updatedRecord as any).teacherSignature = signatureBase64;
    }

    onUpdateRecord(updatedRecord);
    setSigningRole(null);
  };

  const handleResetSignature = (role: 'teacher' | 'deptHead') => {
    if (!onUpdateRecord) return;
    let updatedRecord = { ...record };

    if (role === 'deptHead') {
      delete updatedRecord.deptHeadApproved;
      delete updatedRecord.deptHeadName;
      delete updatedRecord.deptHeadSignature;
      delete updatedRecord.deptHeadDate;
    } else if (role === 'teacher') {
      delete updatedRecord.teacherSigned;
      delete (updatedRecord as any).teacherSignature;
    }

    onUpdateRecord(updatedRecord);
  };

  return (
    <div className="print-root-wrap fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex justify-center py-6 px-4 cursor-default print:p-0 print:absolute print:inset-0 print:bg-white print:backdrop-blur-none">
      <style>{`
        @media print {
          html, body, #root, #root > div {
            background: white !important;
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            position: relative !important;
            display: block !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: ${isCompact ? '0.7cm' : '1.5cm'} !important;
          }
          /* Hide main app containers completely for browser print */
          header, footer, main, .print-hidden {
            display: none !important;
          }
          .print-root-wrap {
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            background: white !important;
            overflow: visible !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
            overflow: visible !important;
          }
          .print-break-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>
      
      {/* Printable Sheet Wrapper */}
      <div className="flex flex-col max-w-4xl w-full">
         
        {/* Controls Overlay Bar - Hidden when printing */}
        <div className="bg-slate-800 text-white px-5 py-4 rounded-t-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 print:hidden print-hidden shadow-lg border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">พิมพ์รายงานแผน / PDF บันทึกหลังสอน</h4>
              <p className="text-[10px] text-amber-400 mt-0.5 font-bold flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                หากปุ่มพิมพ์ไม่ทำงาน กรุณาเปิดแอปในแท็บใหม่ (Open in new tab)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {/* Fit to A4 Single Page Toggle */}
            <button
              onClick={() => setIsCompact(!isCompact)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer ${
                isCompact 
                  ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-sm border border-amber-550' 
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white border border-slate-600'
              }`}
              title="บีบอัดช่องว่างและขนาดตัวอักษรเพื่อจัดให้รายงานรูปเล่มยาวทั้งหมดจบสวยในกระดาษ A4 แผ่นเดียว"
            >
              <span>{isCompact ? '📋 ปรับพอดีหน้าเดียว: เปิดอยู่' : '📋 ปรับพอดีหน้าเดียว: ปิดอยู่'}</span>
            </button>

            {isFullyApproved ? (
              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition duration-200 shadow-sm cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>พิมพ์หรือเซฟเป็น PDF</span>
              </button>
            ) : (
              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition duration-200 shadow-sm cursor-pointer animate-ping-once"
                title="คลิกเพื่อพิมพ์ข้อมูลแบบร่าง"
              >
                <Printer className="h-4 w-4 text-white" />
                <span>พิมพ์เอกสาร (แบบร่าง)</span>
              </button>
            )}


            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-700 rounded-xl hover:bg-slate-600 transition"
              title="Close Preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Status Tracker Bar - Hidden when printing */}
        <div className={`p-4 print:hidden print-hidden border-x flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs ${
          isFullyApproved 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
            : 'bg-indigo-50 border-indigo-150 text-indigo-950'
        }`}>
          <div className="flex items-start gap-2.5">
            {isFullyApproved ? (
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-extrabold flex items-center gap-1.5">
                <span>ขั้นตอนการลงนามและอนุญาตพิมพ์เอกสาร:</span>
                {!isFullyApproved && <span className="bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded text-[9px] font-black uppercase">รอตรวจสอบความพร้อม</span>}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 font-semibold text-[11px] text-slate-600">
                <span className="flex items-center gap-1.5">
                  1. ครูผู้สอน: {record.teacherSigned && (record as any).teacherSignature
                    ? <span className="text-emerald-700 font-bold">🟢 ลงลายชื่อแล้ว ({teacher.thaiName})</span> 
                    : <span className="text-slate-500">🔴 รอนามครู</span>}
                </span>
                <span className="flex items-center gap-1.5">
                  2. หัวหน้าฝ่ายวิชาการ: {isDeptHeadApproved 
                    ? <span className="text-emerald-700 font-bold">🟢 ตรวจรับรองแล้ว ({record.deptHeadName})</span> 
                    : <span className="text-slate-500">🔴 รอตรวจงาน</span>}
                </span>
              </div>
            </div>
          </div>
          
          {!isFullyApproved ? (
            <div className="text-[10px] bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-xl font-bold">
              {currentUser?.role === 'teacher' 
                ? "💡 ตรวจสอบเนื้อหาด้านล่างให้เรียบร้อย และรอหัวหน้าฝ่ายวิชาการตรวจสอบเพื่อลงชื่อตรวจรับรองหลักสูตร" 
                : "💡 เลื่อนดูด้านล่างและคลิกปุ่มแผ่นตราสีเพื่อจำลองลายมือชื่อและลงชื่อตรวจรับรองหลังสอนได้ทันที"}
            </div>
          ) : (
            <div className="text-[10px] bg-emerald-100 text-emerald-950 px-3 py-1.5 rounded-xl font-bold border border-emerald-200 flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span>เอกสารได้รับการอนุมัติอย่างเป็นทางการแล้ว พร้อมส่งพิมพ์ออก PDF</span>
            </div>
          )}
        </div>

        {/* Dynamic Tips Warn Frame */}
        <div className="bg-amber-50 border-x border-amber-100 p-4 print:hidden print-hidden flex items-start gap-2.5 text-xs text-amber-800">
          <HelpCircle className="h-4.5 w-4.5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">เคล็ดลับพิมพ์บันทึกออก PDF:</p>
            <p className="mt-0.5">ในหน้าต่างพิมพ์โปรดติ๊ก <b>"เอาส่วนหัวและส่วนท้ายออก" (Remove headers and footers)</b> และเปิด <b>"พิมพ์กราฟิกพื้นหลัง" (Background graphics)</b> เพื่อดึงสีสันให้ครบสมบูรณ์ {isCompact && <span>และคุณได้เปิด <b>"โหมดปรับพอดีหน้าเดียว"</b> ระบบจะบีบสารบัญรวมทั้งใบรับรองทั้งหมดให้อยู่ในหน้า A4 แผ่นเดียวให้โดยอัตโนมัติ</span>}</p>
          </div>
        </div>

        {/* Formal A4 Blueprint Sheet */}
        <div id="printable-lesson-log" className={`print-container bg-white rounded-b-2xl shadow-xl flex-1 print:shadow-none print:rounded-none transition-all duration-150 ${
          isCompact ? 'p-6 sm:p-8' : 'p-12 sm:p-16'
        }`} style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          
          {/* Official Document Emblem & Header */}
          <div className={`flex flex-col items-center text-center transition-all duration-150 ${
            isCompact ? 'space-y-1.5 mb-4' : 'space-y-3 mb-8'
          }`}>
            <div className="mb-1 transition-transform duration-200 hover:scale-105 print:transform-none">
              {customLogo ? (
                <div className={`relative rounded-2xl overflow-hidden border border-slate-300 shadow-xs flex items-center justify-center bg-white print:border-black ${
                  isCompact ? 'h-18 w-18' : 'h-28 w-28'
                }`}>
                  <img src={customLogo} alt="School Logo" className="h-full w-full object-contain p-1" />
                </div>
              ) : (
                <SchoolLogo className={`drop-shadow-sm print:drop-shadow-none ${
                  isCompact ? 'h-18 w-18' : 'h-28 w-28'
                }`} />
              )}
            </div>
            <div className="space-y-0.5">
              <h2 className={`font-extrabold font-sans tracking-tight text-slate-950 ${
                isCompact ? 'text-sm' : 'text-xl'
              }`}>บันทึกผลการจัดการเรียนรู้และผลหลังสอนรายวิชา</h2>
              <span className={`font-black text-slate-900 tracking-wide block ${
                isCompact ? 'text-[10px]' : 'text-xs'
              }`}>โรงเรียนศิริมงคลศึกษา บางบัวทอง</span>
              <div className="w-full mt-0.5">
                <span className={`font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-100 tracking-wider inline-block uppercase ${
                  isCompact ? 'text-[8px]' : 'text-[9px]'
                }`}>Sirimongkolsuksa Bangbuathong School</span>
              </div>
            </div>
          </div>

          <hr className={`border-t border-slate-300 print:border-black ${
            isCompact ? 'my-2' : 'my-4'
          }`} />

          {/* Section 1: Teacher metadata - Compact Single-Line Inline Grid */}
          <div className={`transition-all duration-150 ${isCompact ? 'space-y-1 mb-2' : 'space-y-2 mb-4'}`}>
            <h3 className="text-xs font-black text-pink-600 border-b border-pink-100 pb-1 flex items-center gap-1.5 uppercase tracking-wide print:border-black">
              <span className="inline-block w-2 h-2 bg-pink-500 rounded-full print:border print:border-black"></span>
              ส่วนที่ 1: ข้อมูลทั่วไป
            </h3>
            
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 print:grid-cols-3 text-slate-800 bg-gradient-to-r from-pink-50/10 to-sky-50/10 rounded-xl border border-slate-100 print:bg-none print:border-none print:p-0 ${
              isCompact ? 'p-2.5 gap-x-3 gap-y-1 text-[11px]' : 'p-3 gap-x-5 gap-y-1.5 text-xs'
            }`}>
              <div className="sm:col-span-2 md:col-span-2 print:col-span-2 flex items-baseline gap-1.5">
                <span className="font-semibold text-slate-500 font-sans whitespace-nowrap">ครูผู้สอน:</span>
                <span className={`font-bold text-slate-900 ${isCompact ? 'text-[11px]' : 'text-[11.5px]'}`}>{teacher.thaiName} ({teacher.englishName})</span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="font-semibold text-slate-500 font-sans whitespace-nowrap">รหัสประจำตัว:</span>
                <span className={`font-bold text-slate-900 ${isCompact ? 'text-[11px]' : 'text-[11.5px]'}`}>{teacher.employeeId}</span>
              </div>

              <div className="flex items-baseline gap-1.5 font-sans">
                <span className="font-semibold text-slate-500 font-sans whitespace-nowrap">วิชาที่สอน:</span>
                <span className={`font-bold text-indigo-950 ${isCompact ? 'text-[11px]' : 'text-[11.5px]'}`}>
                  {record.subject === 'อื่นๆ' && record.customSubject ? record.customSubject : record.subject}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="font-semibold text-slate-500 font-sans whitespace-nowrap">ระดับชั้น:</span>
                <span className={`font-bold text-slate-900 ${isCompact ? 'text-[11px]' : 'text-[11.5px]'}`}>{record.gradeLevel.replace(/\s*\(.*?\)/g, '')}</span>
              </div>

              {record.semester && (
                <div className="flex items-baseline gap-1.5">
                  <span className="font-semibold text-slate-500 font-sans whitespace-nowrap">ภาคเรียน/ปีการศึกษา:</span>
                  <span className={`font-bold text-slate-900 ${isCompact ? 'text-[11px]' : 'text-[11.5px]'}`}>{record.semester.replace('ภาคเรียนที่ ', '')}</span>
                </div>
              )}

              <div className="flex items-baseline gap-1.5">
                <span className="font-semibold text-slate-500 font-sans whitespace-nowrap">วันที่ทำการสอน:</span>
                <span className={`font-bold text-slate-900 ${isCompact ? 'text-[11px]' : 'text-[11.5px]'}`}>{formatThaiDateFull(record.date)}</span>
              </div>

              <div className="sm:col-span-2 md:col-span-3 print:col-span-3 flex items-baseline gap-1.5">
                <span className="font-semibold text-slate-500 font-sans whitespace-nowrap">อีเมล:</span>
                <span className={`font-bold text-slate-900 ${isCompact ? 'text-[10px]' : 'text-[11px]'}`}>{teacher.email}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Four distinct form points required */}
          <div className={`transition-all duration-150 ${isCompact ? 'space-y-2 mb-4 pt-1' : 'space-y-6 mb-8 pt-2'}`}>
            <h3 className={`font-extrabold text-sky-700 border-b-2 border-sky-100 pb-1.5 flex items-center gap-2 uppercase tracking-wider print:border-black ${
              isCompact ? 'text-xs' : 'text-sm'
            }`}>
              <span className="inline-block w-2.5 h-2.5 bg-sky-500 rounded-full print:border print:border-black"></span>
              ส่วนที่ 2: รายละเอียดบันทึกหลังสอน
            </h3>

            {/* Paragraph 1 */}
            <div className={`break-inside-avoid ${isCompact ? 'space-y-0.5' : 'space-y-1.5'}`}>
              <h4 className={`font-bold text-pink-700 flex items-center gap-1.5 font-sans ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
                1. เนื้อหา/สาระ :
              </h4>
              <div className={`bg-pink-50/20 print-bg-gray rounded-r-xl rounded-l-md text-slate-800 leading-relaxed border-y border-r border-pink-100/80 border-l-4 border-l-pink-500 print:border print:bg-none whitespace-pre-line ${
                isCompact ? 'p-2 text-[11px]' : 'p-4 text-xs'
              }`}>
                {record.content}
              </div>
            </div>

            {/* Paragraph 2 */}
            <div className={`break-inside-avoid ${isCompact ? 'space-y-0.5' : 'space-y-1.5'}`}>
              <h4 className={`font-bold text-sky-700 flex items-center gap-1.5 font-sans ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
                2. กิจกรรมการเรียนการสอน :
              </h4>
              <div className={`bg-sky-50/20 print-bg-gray rounded-r-xl rounded-l-md text-slate-800 leading-relaxed border-y border-r border-sky-100/80 border-l-4 border-l-sky-500 print:border print:bg-none whitespace-pre-line ${
                isCompact ? 'p-2 text-[11px]' : 'p-4 text-xs'
              }`}>
                {record.activities}
              </div>
            </div>

            {/* Paragraph 3 */}
            <div className={`break-inside-avoid ${isCompact ? 'space-y-0.5' : 'space-y-1.5'}`}>
              <h4 className={`font-bold text-amber-700 flex items-center gap-1.5 font-sans ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
                3. ข้อจำกัดและปัญหาที่พบ :
              </h4>
              <div className={`bg-amber-50/20 print-bg-gray rounded-r-xl rounded-l-md text-slate-800 leading-relaxed border-y border-r border-amber-100/80 border-l-4 border-l-amber-500 print:border print:bg-none whitespace-pre-line ${
                isCompact ? 'p-2 text-[11px]' : 'p-4 text-xs'
              }`}>
                {record.limitations}
              </div>
            </div>

            {/* Paragraph 4 */}
            <div className={`break-inside-avoid ${isCompact ? 'space-y-0.5' : 'space-y-1.5'}`}>
              <h4 className={`font-bold text-emerald-700 flex items-center gap-1.5 font-sans ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
                4. ความคิดเห็นของครูผู้สอน :
              </h4>
              <div className={`bg-emerald-50/20 print-bg-gray rounded-r-xl rounded-l-md text-slate-800 leading-relaxed border-y border-r border-emerald-100/80 border-l-4 border-l-emerald-500 print:border print:bg-none whitespace-pre-line ${
                isCompact ? 'p-2 text-[11px]' : 'p-4 text-xs'
              }`}>
                {record.suggestions}
              </div>
            </div>
          </div>

          {/* Section 3: Official Witness Signatures */}
          <div className={`break-inside-avoid transition-all duration-150 ${
            isCompact ? 'pt-6 pb-1 mt-4 space-y-4' : 'pt-20 pb-4 mt-8 break-inside-avoid space-y-10'
          }`}>
            <div className="border-b-2 border-violet-100 pb-1.5 print:border-black"></div>
            
            <div className={`grid grid-cols-2 text-slate-800 ${
              isCompact ? 'gap-4 text-center text-[11px] pt-2' : 'gap-8 text-center text-xs pt-6'
            }`}>
              {/* Left Side: Teacher Signed */}
              <div className={`flex flex-col items-center justify-end ${isCompact ? 'space-y-1.5' : 'space-y-4'}`}>
                <div className={`${isCompact ? 'h-14' : 'h-20'} flex items-center justify-center`}>
                  {record.teacherSigned && (record as any).teacherSignature ? (
                    <div className={`relative flex items-center justify-center ${isCompact ? 'h-14' : 'h-20'}`}>
                      <img src={(record as any).teacherSignature} alt="Teacher Electronic Signature" className={`${isCompact ? 'max-h-12' : 'max-h-18'} object-contain`} referrerPolicy="no-referrer" />
                      {currentUser?.id === record.teacherId && currentUser?.role === 'teacher' && !record.deptHeadApproved && (
                        <button 
                          type="button" 
                          onClick={() => handleResetSignature('teacher')}
                          className="absolute -top-3 -right-3 bg-red-100 hover:bg-red-200 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md print:hidden transition"
                        >
                          ล้างลายเซ็น
                        </button>
                      )}
                    </div>
                  ) : (
                    currentUser?.id === record.teacherId && currentUser?.role === 'teacher' ? (
                      <button 
                        type="button"
                        onClick={() => setSigningRole('teacher')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] border border-slate-300 shadow-xs cursor-pointer print:hidden transition"
                      >
                        ✍️ ลงชื่อครูอิเล็กทรอนิกส์
                      </button>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic bg-slate-50 px-2 py-1 rounded-md border border-slate-100 print:hidden select-none">
                        ⏳ รอครูผู้สอนลงชื่อ
                      </div>
                    )
                  )}
                </div>

                <p className="font-semibold text-slate-500">
                  ลงชื่อ {record.teacherSigned && (record as any).teacherSignature ? '_________________________' : '..........................................................'} ครูผู้สอน
                </p>
                <div>
                  <p className="font-semibold">(&nbsp;&nbsp;{teacher.thaiName}&nbsp;&nbsp;)</p>
                  <p className={`text-slate-400 mt-1 ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>วันที่รายงาน: {formatThaiDateFull(record.date)}</p>
                </div>
              </div>

              {/* Right Side: Academic Head */}
              <div className={`flex flex-col items-center justify-end ${isCompact ? 'space-y-1.5' : 'space-y-4'}`}>
                <div className={`${isCompact ? 'h-14' : 'h-20'} flex items-center justify-center`}>
                  {isDeptHeadApproved && record.deptHeadSignature ? (
                    <div className={`relative flex items-center justify-center ${isCompact ? 'h-14' : 'h-20'}`}>
                      <img src={record.deptHeadSignature} alt="Academic Supervisor Signature" className={`${isCompact ? 'max-h-12' : 'max-h-18'} object-contain`} referrerPolicy="no-referrer" />
                      {allowAcademicSignature && currentUser?.role !== 'teacher' && (
                        <button 
                          type="button" 
                          onClick={() => handleResetSignature('deptHead')}
                          className="absolute -top-3 -right-3 bg-red-100 hover:bg-red-200 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md print:hidden transition"
                        >
                          ล้างลายเซ็น
                        </button>
                      )}
                    </div>
                  ) : (
                    allowAcademicSignature && currentUser?.role !== 'teacher' ? (
                      <button 
                        type="button"
                        onClick={() => setSigningRole('deptHead')}
                        className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-150 text-indigo-700 font-bold rounded-lg text-[10px] border border-indigo-200 shadow-xs cursor-pointer print:hidden transition animate-pulse"
                      >
                        ✍️ ลงชื่อตรรวจรับรองฝ่ายวิชาการ
                      </button>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic bg-slate-50 px-2 py-1 rounded-md border border-slate-100 print:hidden select-none" title="ผู้มีสิทธิ์ตรวจรับรองสามารถตรวจสอบและอนุมัติรับรองได้ทันที">
                        ⏳ รอตรวจรับรองอนุมัติ
                      </div>
                    )
                  )}
                </div>

                <p className="font-semibold text-slate-500">
                  ลงชื่อ {isDeptHeadApproved && record.deptHeadSignature ? '_________________________' : '..........................................................'} ผู้ตรวจสอบ
                </p>
                <div>
                  <p className="font-semibold">
                    (&nbsp;&nbsp;{record.deptHeadName || academicHead?.thaiName || '..........................................................'}&nbsp;&nbsp;)
                  </p>
                  <p className={`text-slate-400 mt-1 font-sans ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>
                     หัวหน้าฝ่ายวิชาการ / ผู้ตรวจสอบ {isDeptHeadApproved && record.deptHeadDate ? `(ลงนามตรวจเมื่อ: ${formatThaiDateFull(record.deptHeadDate)})` : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Timestamp for document registry */}
          <div className={`text-center text-slate-400 font-mono print:text-black ${isCompact ? 'mt-8 text-[9px]' : 'mt-16 text-[10px]'}`}>
            เอกสารบันทึกประเภทอิเล็กทรอนิกส์ออกตามระบบ LessonLog - ระบบสารสนเทศเพื่อการจัดการสถานศึกษา - เลขอ้างอิง: {record.id}
          </div>

        </div>
      </div>

      {/* Signature Pad overlay Modal for drawings */}
      {signingRole && (
        <SignaturePadModal 
          role={signingRole}
          defaultName={
            signingRole === 'teacher' 
              ? (currentUser?.thaiName || currentUser?.displayName || teacher.thaiName) 
              : (currentUser?.thaiName || currentUser?.displayName || academicHead?.thaiName || (currentUser?.role === 'admin' ? 'ผู้ดูแลระบบ' : currentUser?.role === 'deputy' ? 'รองผู้อำนวยการ' : 'หัวหน้าฝ่ายวิชาการ'))
          }
          onSave={handleSaveSignature}
          onClose={() => setSigningRole(null)}
        />
      )}

    </div>
  );
}
