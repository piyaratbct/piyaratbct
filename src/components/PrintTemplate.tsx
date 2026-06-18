import React, { useState, useRef, useEffect } from 'react';
import { LessonRecord, Teacher } from '../types';
import { Printer, X, Eye, HelpCircle, Lock, ShieldCheck, ShieldAlert, User, CheckCircle, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [isCompact, setIsCompact] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

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

  const handleDownloadPDF = async () => {
    if (isDownloadingPDF) return;
    setIsDownloadingPDF(true);

    // Helper to convert modern CSS oklch() colors to compatible hsl() format for html2canvas parser
    const replaceOklch = (cssText: string): string => {
      return cssText.replace(/oklch\(\s*([0-9.%\-+]+)\s+([0-9.%\-+]+)\s+([0-9.%\-+]+)(?:\s*\/\s*([0-9.%\-+]+))?\s*\)/gi, (match, p1, p2, p3, p4) => {
        let l_val = parseFloat(p1);
        if (p1.includes('%')) {
          l_val = l_val / 100;
        }
        const c_val = parseFloat(p2);
        const h_val = parseFloat(p3);
        
        // Approximate to standard HSL:
        const hsl_h = isNaN(h_val) ? 0 : h_val;
        // Chroma (0...0.4) maps roughly to Saturation (0...100%) by scaling up
        const hsl_s = Math.min(100, Math.max(0, (isNaN(c_val) ? 0 : c_val) * 250));
        // Lightness is directly proportional
        const hsl_l = Math.max(0, Math.min(100, l_val * 100));
        
        if (p4 !== undefined) {
          let a_val = parseFloat(p4);
          if (p4.includes('%')) {
            a_val = a_val / 100;
          }
          return `hsla(${hsl_h}, ${hsl_s.toFixed(1)}%, ${hsl_l.toFixed(1)}%, ${a_val})`;
        } else {
          return `hsl(${hsl_h}, ${hsl_s.toFixed(1)}%, ${hsl_l.toFixed(1)}%)`;
        }
      });
    };

    // Helper to convert modern CSS oklab() colors to compatible rgb() format for html2canvas parser
    const replaceOklab = (cssText: string): string => {
      return cssText.replace(/oklab\(\s*([0-9.%\-+]+)\s+([0-9.%\-+]+)\s+([0-9.%\-+]+)(?:\s*\/\s*([0-9.%\-+]+))?\s*\)/gi, (match, p1, p2, p3, p4) => {
        let l_val = parseFloat(p1);
        if (p1.includes('%')) {
          l_val = l_val / 100;
        }
        const a_val = parseFloat(p2);
        const b_val = parseFloat(p3);

        if (isNaN(l_val) || isNaN(a_val) || isNaN(b_val)) {
          return 'rgb(128, 128, 128)';
        }

        // Convert Oklab to linear LMS coordinates
        const l_ = l_val + 0.3963377774 * a_val + 0.2158037573 * b_val;
        const m_ = l_val - 0.1055613458 * a_val - 0.0638541728 * b_val;
        const s_ = l_val - 0.0894841775 * a_val - 1.2914855480 * b_val;

        // LMS are cubed to get active LMS values
        const l = l_ * l_ * l_;
        const m = m_ * m_ * m_;
        const s = s_ * s_ * s_;

        // LMS to linear RGB
        const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
        const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
        const b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

        // Apply gamma correction (sRGB)
        const f = (c: number) => {
          if (isNaN(c)) return 0;
          return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(0, c), 1 / 2.4) - 0.055;
        };
        
        const R = Math.max(0, Math.min(255, Math.round(f(r) * 255)));
        const G = Math.max(0, Math.min(255, Math.round(f(g) * 255)));
        const B = Math.max(0, Math.min(255, Math.round(f(b) * 255)));

        if (isNaN(R) || isNaN(G) || isNaN(B)) {
          return 'rgb(128, 128, 128)';
        }

        if (p4 !== undefined) {
          let alpha = parseFloat(p4);
          if (p4.includes('%')) {
            alpha = alpha / 100;
          }
          if (isNaN(alpha)) alpha = 1;
          return `rgba(${R}, ${G}, ${B}, ${alpha})`;
        } else {
          return `rgb(${R}, ${G}, ${B})`;
        }
      });
    };

    try {
      const element = document.getElementById('printable-lesson-log');
      if (!element) {
        throw new Error('Element with id printable-lesson-log not found');
      }

      // Temporarily monkeypatch window.getComputedStyle to translate oklch and oklab colors on the fly
      // so html2canvas doesn't throw parser crashes during computed styles reading.
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = function (el, pseudoElt) {
        const style = originalGetComputedStyle(el, pseudoElt);
        return new Proxy(style, {
          get(target, prop, receiver) {
            let val = Reflect.get(target, prop, receiver);
            if (typeof val === 'function') {
              return val.bind(target);
            }
            if (prop === 'getPropertyValue') {
              return (propertyName: string) => {
                let pVal = target.getPropertyValue(propertyName);
                if (typeof pVal === 'string') {
                  if (pVal.includes('oklch')) {
                    pVal = replaceOklch(pVal);
                    if (pVal.includes('oklch')) {
                      pVal = 'rgb(128, 128, 128)';
                    }
                  }
                  if (pVal.includes('oklab')) {
                    pVal = replaceOklab(pVal);
                    if (pVal.includes('oklab')) {
                      pVal = 'rgb(128, 128, 128)';
                    }
                  }
                }
                return pVal;
              };
            }
            if (typeof val === 'string') {
              if (val.includes('oklch')) {
                val = replaceOklch(val);
                if (val.includes('oklch')) {
                  val = 'rgb(128, 128, 128)';
                }
              }
              if (val.includes('oklab')) {
                val = replaceOklab(val);
                if (val.includes('oklab')) {
                  val = 'rgb(128, 128, 128)';
                }
              }
            }
            return val;
          }
        });
      };

      let canvas;
      try {
        // Generate canvas representation
        canvas = await html2canvas(element, {
          scale: 2, // High resolution for clear text/logos
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc) => {
            // 1. Convert OKLCH/Oklab colors in style tags to standard HSL/RGB colors to prevent parsing crashes
            clonedDoc.querySelectorAll('style').forEach(styleTag => {
              if (styleTag.innerHTML) {
                let html = styleTag.innerHTML;
                if (html.includes('oklch')) {
                  html = replaceOklch(html);
                  html = html.replace(/oklch\([^)]+\)/gi, 'rgb(128, 128, 128)');
                }
                if (html.includes('oklab')) {
                  html = replaceOklab(html);
                  html = html.replace(/oklab\([^)]+\)/gi, 'rgb(128, 128, 128)');
                }
                styleTag.innerHTML = html;
              }
            });

            // 2. Convert OKLCH/Oklab colors in inline styles to standard HSL/RGB colors
            clonedDoc.querySelectorAll('[style]').forEach(el => {
              const styleAttr = el.getAttribute('style');
              if (styleAttr) {
                let styleStr = styleAttr;
                if (styleStr.includes('oklch')) {
                  styleStr = replaceOklch(styleStr);
                  styleStr = styleStr.replace(/oklch\([^)]+\)/gi, 'rgb(128, 128, 128)');
                }
                if (styleStr.includes('oklab')) {
                  styleStr = replaceOklab(styleStr);
                  styleStr = styleStr.replace(/oklab\([^)]+\)/gi, 'rgb(128, 128, 128)');
                }
                el.setAttribute('style', styleStr);
              }
            });

            const clonedElement = clonedDoc.getElementById('printable-lesson-log');
            if (clonedElement) {
              clonedElement.style.boxShadow = 'none';
              clonedElement.style.borderRadius = '0';
            }
          }
        });
      } finally {
        window.getComputedStyle = originalGetComputedStyle;
      }

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Append image and split across PDF pages as required
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      // Dynamic name formatting
      const rawSubject = record.subject === 'อื่นๆ' && record.customSubject 
        ? record.customSubject 
        : record.subject;
      const subjectName = rawSubject.replace(/[\/\\:*?"<>|\s]/g, '_');
      const teacherIdentifier = (teacher.employeeId || teacher.thaiName || 'ครูผู้สอน')
        .replace(/[\/\\:*?"<>|\s]/g, '_');
      const recordDate = (record.date || '')
        .replace(/[\/\\:*?"<>|\s]/g, '_');

      const fileName = `บันทึกหลังสอน_${teacherIdentifier}_${subjectName}_${recordDate}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('ไม่สามารถดาวน์โหลด PDF โดยตรงได้ในขณะนี้ กรุณาลองใช้ปุ่มพิมพ์รายงานหรือสอบถามผู้ดูแลระบบ');
    } finally {
      setIsDownloadingPDF(false);
    }
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
    
    window.print();
    
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
              <p className="text-[10px] text-slate-300">ความปลอดภัยมาตรฐานอิเล็กทรอนิกส์ลายมือชื่อ 2 ชั้น</p>
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
        }`}>
          
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
              <span className={`font-black text-[#e54a93] tracking-wide block uppercase ${
                isCompact ? 'text-[10px]' : 'text-xs'
              }`}>โรงเรียนศิริมงคลศึกษา บางบัวทอง</span>
              <span className={`font-black text-slate-500 tracking-wider block uppercase font-mono ${
                isCompact ? 'text-[8px]' : 'text-[10px]'
              }`}>SIRIMONGKOLSUKSA BANGBUATHONG SCHOOL</span>
              <p className={`font-bold text-blue-600 bg-blue-50/60 rounded-full inline-block border border-blue-105 print:border-none print:bg-none print:p-0 print:text-black mt-0.5 ${
                isCompact ? 'text-[9px] px-2 py-0' : 'text-[10px] px-2.5 py-0.5'
              }`}>
                ฝ่ายส่งเสริมคุณภาพการศึกษาและวิชาการ<span className="print:hidden"> • (สังกัด: {teacher.affiliation})</span>
              </p>
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
                <span className={`font-bold text-slate-900 ${isCompact ? 'text-[11px]' : 'text-[11.5px]'}`}>{record.gradeLevel}</span>
              </div>

              {record.semester && (
                <div className="flex items-baseline gap-1.5">
                  <span className="font-semibold text-slate-500 font-sans whitespace-nowrap">ภาคเรียน/ปีการศึกษา:</span>
                  <span className={`font-bold text-slate-900 ${isCompact ? 'text-[11px]' : 'text-[11.5px]'}`}>{record.semester}</span>
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
                  ลงชื่อ {isDeptHeadApproved && record.deptHeadSignature ? '_________________________' : '..........................................................'} ผู้ตรวจรับรอง
                </p>
                <div>
                  <p className="font-semibold">
                    (&nbsp;&nbsp;{record.deptHeadName || academicHead?.thaiName || '..........................................................'}&nbsp;&nbsp;)
                  </p>
                  <p className={`text-slate-400 mt-1 font-sans ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>
                     {academicHead?.role === 'admin' ? 'ผู้ดูแลระบบ' : academicHead?.role === 'deputy' ? 'รองผู้อำนวยการ' : 'หัวหน้าฝ่ายวิชาการ'} {isDeptHeadApproved && record.deptHeadDate ? `(ลงนามตรวจเมื่อ: ${formatThaiDateFull(record.deptHeadDate)})` : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Timestamp for document registry */}
          <div className={`text-center text-slate-400 font-mono print:text-black ${isCompact ? 'mt-8 text-[9px]' : 'mt-16 text-[10px]'}`}>
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
