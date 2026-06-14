import React, { useState, useRef, useEffect } from 'react';
import { LessonRecord, Teacher } from '../types';
import { Printer, X, Eye, HelpCircle, Lock, ShieldCheck, ShieldAlert, User, CheckCircle } from 'lucide-react';

export function SchoolLogo({ className = "h-24 w-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} xmlns="http://www.w3.org/2000/svg" id="school-emblem-svg">
      <defs>
        {/* Top Arc (Clockwise sweep from left to right) */}
        <path id="topTextPath" d="M 16 60 A 44 44 0 0 1 104 60" fill="none" />
        {/* Bottom Arc (Counter-Clockwise sweep from left to right) */}
        <path id="bottomTextPath" d="M 16 60 A 44 44 0 0 0 104 60" fill="none" />
      </defs>

      {/* Outer base with smooth gray glow shadow-like border */}
      <circle cx="60" cy="60" r="59" fill="white" stroke="#000000" strokeWidth="1.2" />
      
      {/* Sky Blue Outer Ring representing school colors */}
      <circle cx="60" cy="60" r="55.5" fill="#1fc3f4" stroke="#000000" strokeWidth="1.2" />
      
      {/* Pink Inner Circle representing school colors */}
      <circle cx="60" cy="60" r="41.5" fill="#e73a98" stroke="#000000" strokeWidth="1.2" />

      {/* Top curved school name inside sky blue ring */}
      <text fill="#000000" fontSize="5.5px" className="font-extrabold" fontFamily="sans-serif">
        <textPath href="#topTextPath" startOffset="50%" textAnchor="middle">
          โรงเรียนศิริมงคลศึกษา บางบัวทอง
        </textPath>
      </text>

      {/* Bottom curved alignment inside sky blue ring */}
      <text fill="#000000" fontSize="5.5px" className="font-extrabold" fontFamily="sans-serif">
        <textPath href="#bottomTextPath" startOffset="50%" textAnchor="middle">
          อำเภอบางบัวทอง จังหวัดนนทบุรี
        </textPath>
      </text>

      {/* Core Traditional Thai Emblem Drawing (Perfectly traces the provided logo) */}
      <g transform="translate(60, 60)" stroke="#000000" strokeWidth="0.6" strokeLinejoin="round" strokeLinecap="round">
        {/* 1. Traditional Thai Naga (Serpents) flanking left and right (Supporting the sacred circle) */}
        {/* Left Naga */}
        <path d="M -13,10 C -22,10 -25,2 -21,-5 C -18,-11 -15,-15 -21,-19" fill="#ffffff" strokeWidth="0.7" />
        <path d="M -17,2 C -23,0 -21,-6 -17,-8" fill="#e73a98" strokeWidth="0.5" />
        <circle cx="-19" cy="-11" r="0.8" fill="#ff0000" stroke="none" />
        
        {/* Right Naga */}
        <path d="M 13,10 C 22,10 25,2 21,-5 C 18,-11 15,-15 21,-19" fill="#ffffff" strokeWidth="0.7" />
        <path d="M 17,2 C 23,0 21,-6 17,-8" fill="#e73a98" strokeWidth="0.5" />
        <circle cx="19" cy="-11" r="0.8" fill="#ff0000" stroke="none" />

        {/* 2. Background Golden Flame Aureole / Kanok Border */}
        <path d="M -14,-6 C -24,-15 -10,-28 0,-28 C 10,-28 24,-15 14,-6 C 11,-2 12,6 12,10 L -12,10 C -12,6 -11,-2 -14,-6 Z" fill="#ffd166" strokeWidth="0.8" />
        <path d="M -11,-6 C -18,-13 -7,-23 0,-23 C 7,-23 18,-13 11,-6 C 9,-2 10,6 10,8 L -10,8 C -10,6 -9,-2 -11,-6 Z" fill="#ffffff" strokeWidth="0.6" />

        {/* 3. Sacred Central Wheel with Pali Text Loop (representing the Dhammachakka) */}
        <circle cx="0" cy="-5" r="14.5" fill="#ffffff" strokeWidth="0.9" />
        <circle cx="0" cy="-5" r="12.5" fill="none" stroke="#000000" strokeWidth="0.5" strokeDasharray="1.5,1" />
        
        {/* Pali scripts simulated curved texts in inner ring */}
        <path id="paliPath" d="M -11,-5 A 11 11 0 0 1 11 -5" fill="none" />
        <text fontSize="2px" fill="#000000" fontWeight="bold">
          <textPath href="#paliPath" startOffset="50%" textAnchor="middle">
            ธมฺโม หเว ရကฺတိ
          </textPath>
        </text>

        {/* Inner small monogram circle */}
        <circle cx="0" cy="-5" r="8.2" fill="#ffffff" strokeWidth="0.8" />
        <circle cx="0" cy="-5" r="7.2" fill="none" stroke="#e73a98" strokeWidth="0.4" />

        {/* Stylized calligraphic Monogram "ศ.ม.ศ" aligned with the shape */}
        <path d="M -4.5,-5 C -4.5,-8 -2,-9 0,-9 C 2.5,-9 4,-7 4,-4.5 C 4,-2 1,-1.5 0,-1.5 C -1,-1.5 -3,-2 -3.5,-4" fill="none" stroke="#000000" strokeWidth="1" />
        <path d="M -1.5,-4.5 C -1.5,-6.5 1,-7 1,-5 C 1,-3 -2,-3.5 -2,-5" fill="none" stroke="#000000" strokeWidth="0.8" />
        <path d="M -3.5,-7.5 L -2,-6" stroke="#000000" strokeWidth="0.6" />
        <path d="M 2.5,-3 C 3.5,-2.5 4,-1 4,0 C 4,1 2.5,1.5 1.5,1" fill="none" stroke="#000000" strokeWidth="0.8" />

        {/* 4. Crown Pinnacle (Sacred Crown Peak on center top) */}
        <path d="M -4.5,-26 C -4.5,-32 0,-34 0,-43 C 0,-34 4.5,-32 4.5,-26 Z" fill="#ffd166" strokeWidth="0.9" />
        <path d="M -2.5,-28 C -2.5,-31 0,-33 0,-38 C 0,-33 2.5,-31 2.5,-28 Z" fill="#ffffff" stroke="none" strokeWidth="0.5" />
        {/* Tiny red gem atop the crown */}
        <circle cx="0" cy="-44.5" r="1.3" fill="#ff0000" stroke="#000000" strokeWidth="0.4" />

        {/* 5. Lotus pedestal bases support */}
        <path d="M -15,10 C -15,7 -10,5 -5,5 C -2.5,5 -1,6.5 0,6  C 1,6.5 2.5,5 5,5 C 10,5 15,7 15,10 Z" fill="#ffffff" strokeWidth="0.7" />
        <path d="M -17,14 L 17,14 L 13.5,17.5 L -13.5,17.5 Z" fill="#ffd166" strokeWidth="0.8" />
        <path d="M -13,10 L 13,10 L 17,14 L -17,14 Z" fill="#ffffff" strokeWidth="0.8" />

        {/* 6. Sacred ribbon banner (CONTAINING SCHOOL NAME AND SUBTITLE TEXTS) */}
        <path d="M -19,16 C -10,19 10,19 19,16 L 15.5,22 C 8,24.5 -8,24.5 -15.5,22 Z" fill="#ffffff" strokeWidth="0.8" />
        <path d="M -15.5,21 C -8,23.2 8,23.2 15.5,21 L 13.2,25.2 C 6,27.2 -6,27.2 -13.2,25.2 Z" fill="#ffffff" strokeWidth="0.8" />
        
        {/* Ribbon golden ears left and right */}
        <path d="M -19,16 L -21.5,19.5 L -17,21.5 Z" fill="#ffd166" strokeWidth="0.6" />
        <path d="M 19,16 L 21.5,19.5 L 17,21.5 Z" fill="#ffd166" strokeWidth="0.6" />

        {/* Texts written on the ribbon directly, perfectly legibly! */}
        <text x="0" y="19" fill="#000000" fontSize="2.8px" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">ศิริมงคลศึกษา</text>
        <text x="0" y="24.2" fill="#000000" fontSize="2.6px" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">บางบัวทอง</text>

        {/* Lotus base petals decoration */}
        <circle cx="-13" cy="11.5" r="0.8" fill="#ffd166" stroke="#000000" strokeWidth="0.4" />
        <circle cx="13" cy="11.5" r="0.8" fill="#ffd166" stroke="#000000" strokeWidth="0.4" />
      </g>
    </svg>
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

interface SignaturePadModalProps {
  role: 'teacher' | 'deptHead' | 'deputyDirector';
  defaultName: string;
  onSave: (name: string, signatureBase64: string) => void;
  onClose: () => void;
}

function SignaturePadModal({ role, defaultName, onSave, onClose }: SignaturePadModalProps) {
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

  // Status variables
  const isDeptHeadApproved = !!record.deptHeadApproved;
  const isFullyApproved = isDeptHeadApproved;

  // Format Thai dates
  const formatThaiDateFull = (dateString: string) => {
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0]) + 543;
      const month = months[parseInt(parts[1]) - 1];
      const day = parseInt(parts[2]);
      return `วันที่ ${day} เดือน ${month} พ.ศ. ${year}`;
    }
    return dateString;
  };

  const handlePrint = () => {
    window.print();
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
            margin: 1.5cm !important;
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
              <p className="text-[10px] text-slate-300">ความปลอดภัยมาตรฐานอิเล็กทรอนิกส์ลายมือชื่อ 2 ชั้น</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
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
            <div className="text-[10px] bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-xl font-bold border border-emerald-200 flex items-center gap-1">
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
            <p className="mt-0.5">ในหน้าต่างพิมพ์โปรดติ๊ก <b>"เอาส่วนหัวและส่วนท้ายออก" (Remove headers and footers)</b> และเปิด <b>"พิมพ์กราฟิกพื้นหลัง" (Background graphics)</b> เพื่อดึงสีสันให้ครบสมบูรณ์</p>
          </div>
        </div>

        {/* Formal A4 Blueprint Sheet */}
        <div className="print-container bg-white p-12 sm:p-16 rounded-b-2xl shadow-xl flex-1 print:shadow-none print:rounded-none">
          
          {/* Official Document Emblem & Header */}
          <div className="flex flex-col items-center text-center space-y-3 mb-8">
            <div className="mb-2 transition-transform duration-200 hover:scale-105 print:transform-none">
              {customLogo ? (
                <div className="relative h-28 w-28 rounded-full overflow-hidden border border-slate-300 shadow-xs flex items-center justify-center bg-white print:border-black">
                  <img src={customLogo} alt="School Logo" className="h-full w-full object-cover" />
                </div>
              ) : (
                <SchoolLogo className="h-28 w-28 drop-shadow-sm print:drop-shadow-none" />
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold font-sans tracking-tight text-slate-950">บันทึกผลการจัดการเรียนรู้และผลหลังสอนรายวิชา</h2>
              <span className="text-xs font-black text-[#e54a93] tracking-wide block uppercase">โรงเรียนศิริมงคลศึกษา บางบัวทอง</span>
              <span className="text-[10px] font-black text-slate-500 tracking-wider block uppercase font-mono">SIRIMONGKOLSUKSA BANGBUATHONG SCHOOL</span>
              <p className="text-[10px] font-bold text-blue-600 bg-blue-50/60 px-2.5 py-0.5 rounded-full inline-block border border-blue-105 print:border-none print:bg-none print:p-0 print:text-black mt-1">
                ฝ่ายส่งเสริมคุณภาพการศึกษาและวิชาการ • (สังกัด: {teacher.affiliation})
              </p>
            </div>
          </div>

          <hr className="border-t border-slate-300 my-6 print:border-black" />

          {/* Section 1: Teacher metadata - Removed Phone Number */}
          <div className="space-y-4 mb-6">
            <h3 className="text-sm font-extrabold text-pink-600 border-b-2 border-pink-100 pb-1.5 flex items-center gap-2 uppercase tracking-wider print:border-black">
              <span className="inline-block w-2.5 h-2.5 bg-pink-500 rounded-full print:border print:border-black"></span>
              ส่วนที่ 1: ข้อมูลทั่วไป
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs text-slate-800 bg-gradient-to-r from-pink-50/20 to-sky-50/20 p-4 rounded-xl border border-slate-100 print:bg-none print:border-none print:p-0">
              <div>
                <p className="font-semibold text-slate-500 font-sans">ชื่อครูผู้สอน (ไทย):</p>
                <p className="font-bold text-slate-900 mt-0.5 text-xs">{teacher.thaiName}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-500 font-sans">ชื่อครูผู้สอน (อังกฤษ):</p>
                <p className="font-bold text-slate-900 mt-0.5 text-xs">{teacher.englishName}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-500 font-sans">รหัสประจำตัวคุณครู:</p>
                <p className="font-bold text-slate-900 mt-0.5 text-xs">{teacher.employeeId}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-500 font-sans">อีเมล:</p>
                <p className="font-bold text-slate-900 mt-0.5 text-xs">{teacher.email}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-500 font-sans">ระดับชั้น:</p>
                <p className="font-bold text-slate-900 mt-0.5 text-xs">{record.gradeLevel}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-500 font-sans">วิชาที่สอน:</p>
                <p className="font-bold text-indigo-900 mt-0.5 text-xs font-sans">
                  {record.subject === 'อื่นๆ' && record.customSubject ? record.customSubject : record.subject}
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-500 font-sans">วันที่ทำการสอน:</p>
                <p className="font-bold text-slate-900 mt-0.5 text-xs font-sans">{formatThaiDateFull(record.date)}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Four distinct form points required */}
          <div className="space-y-6 mb-8 pt-2">
            <h3 className="text-sm font-extrabold text-sky-700 border-b-2 border-sky-100 pb-1.5 flex items-center gap-2 uppercase tracking-wider print:border-black">
              <span className="inline-block w-2.5 h-2.5 bg-sky-500 rounded-full print:border print:border-black"></span>
              ส่วนที่ 2: รายละเอียดบันทึกหลังสอน
            </h3>

            {/* Paragraph 1 */}
            <div className="space-y-1.5 break-inside-avoid">
              <h4 className="text-xs font-bold text-pink-700 flex items-center gap-1.5 font-sans">
                1. สาระการเรียนรู้และจุดประสงค์การสอน :
              </h4>
              <div className="p-4 bg-pink-50/20 print-bg-gray rounded-r-xl rounded-l-md text-xs text-slate-800 leading-relaxed border-y border-r border-pink-100/80 border-l-4 border-l-pink-500 print:border print:bg-none whitespace-pre-line">
                {record.content}
              </div>
            </div>

            {/* Paragraph 2 */}
            <div className="space-y-1.5 break-inside-avoid">
              <h4 className="text-xs font-bold text-sky-700 flex items-center gap-1.5 font-sans">
                2. กิจกรรมการเรียนการสอน :
              </h4>
              <div className="p-4 bg-sky-50/20 print-bg-gray rounded-r-xl rounded-l-md text-xs text-slate-800 leading-relaxed border-y border-r border-sky-100/80 border-l-4 border-l-sky-500 print:border print:bg-none whitespace-pre-line">
                {record.activities}
              </div>
            </div>

            {/* Paragraph 3 */}
            <div className="space-y-1.5 break-inside-avoid">
              <h4 className="text-xs font-bold text-amber-700 flex items-center gap-1.5 font-sans">
                3. ข้อจำกัดและปัญหาที่พบ :
              </h4>
              <div className="p-4 bg-amber-50/20 print-bg-gray rounded-r-xl rounded-l-md text-xs text-slate-800 leading-relaxed border-y border-r border-amber-100/80 border-l-4 border-l-amber-500 print:border print:bg-none whitespace-pre-line">
                {record.limitations}
              </div>
            </div>

            {/* Paragraph 4 */}
            <div className="space-y-1.5 break-inside-avoid">
              <h4 className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 font-sans">
                4. ข้อเสนอแนะและทางแก้ไข :
              </h4>
              <div className="p-4 bg-emerald-50/20 print-bg-gray rounded-r-xl rounded-l-md text-xs text-slate-800 leading-relaxed border-y border-r border-emerald-100/80 border-l-4 border-l-emerald-500 print:border print:bg-none whitespace-pre-line">
                {record.suggestions}
              </div>
            </div>
          </div>

          {/* Section 3: Official Witness Signatures */}
          <div className="pt-20 pb-4 mt-8 break-inside-avoid space-y-10">
            <h3 className="text-sm font-extrabold text-violet-700 border-b-2 border-violet-100 pb-1.5 flex items-center gap-2 uppercase tracking-wider print:border-black">
              <span className="inline-block w-2.5 h-2.5 bg-violet-500 rounded-full print:border print:border-black"></span>
              ส่วนที่ 3: การตรวจสอบและลงนามตรวจ
            </h3>
            
            <div className="grid grid-cols-2 gap-8 text-center text-xs text-slate-800 pt-6">
              {/* Left Side: Teacher Signed */}
              <div className="space-y-4 flex flex-col items-center justify-end">
                <div className="h-20 flex items-center justify-center">
                  {record.teacherSigned && (record as any).teacherSignature ? (
                    <div className="relative h-20 flex items-center justify-center">
                      <img src={(record as any).teacherSignature} alt="Teacher Electronic Signature" className="max-h-18 object-contain" referrerPolicy="no-referrer" />
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
                  <p className="text-[10px] text-slate-400 mt-1">วันที่รายงาน: {formatThaiDateFull(record.date)}</p>
                </div>
              </div>

              {/* Right Side: Academic Head */}
              <div className="space-y-4 flex flex-col items-center justify-end">
                <div className="h-20 flex items-center justify-center">
                  {isDeptHeadApproved && record.deptHeadSignature ? (
                    <div className="relative h-20 flex items-center justify-center">
                      <img src={record.deptHeadSignature} alt="Academic Supervisor Signature" className="max-h-18 object-contain" referrerPolicy="no-referrer" />
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
                  ลงชื่อ {isDeptHeadApproved && record.deptHeadSignature ? '_________________________' : '..........................................................'} ผู้ตรวจรับรอง
                </p>
                <div>
                  <p className="font-semibold">
                    (&nbsp;&nbsp;{record.deptHeadName || academicHead?.thaiName || '..........................................................'}&nbsp;&nbsp;)
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-sans">
                     {academicHead?.role === 'admin' ? 'ผู้ดูแลระบบ' : academicHead?.role === 'deputy' ? 'รองผู้อำนวยการ' : 'หัวหน้าฝ่ายวิชาการ'} {isDeptHeadApproved && record.deptHeadDate ? `(ลงนามตรวจเมื่อ: ${formatThaiDateFull(record.deptHeadDate)})` : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Timestamp for document registry */}
          <div className="text-center text-[10px] text-slate-400 mt-16 font-mono print:text-black">
            เอกสารบันทึกประเภทอิเล็กทรอนิกส์ออกตามระบบ LessonLog - เลขอ้างอิง: {record.id}
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
