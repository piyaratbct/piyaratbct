import React, { useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X } from 'lucide-react';
import { SchoolLogo } from './PrintTemplate';

interface PDFPrintHelperProps {
  children: ReactNode;
  onClose: () => void;
  documentTitle?: string;
  hideControls?: boolean;
}

export const PDFPrintHelper: React.FC<PDFPrintHelperProps> = ({ 
  children, 
  onClose, 
  documentTitle = 'พิมพ์เอกสาร',
  hideControls = false
}) => {
  useEffect(() => {
    document.body.classList.add('print-mode-active');
    
    const originalTitle = document.title;
    if (documentTitle) {
      document.title = documentTitle;
    }
    
    return () => {
      document.body.classList.remove('print-mode-active');
      document.title = originalTitle;
    };
  }, [documentTitle]);

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn("window.print() is blocked or unsupported in this sandbox:", e);
      window.alert("ไม่สามารถเปิดระบบพิมพ์เอกสารได้เนื่องจากข้อจำกัดความปลอดภัยของเบราว์เซอร์ในโหมดพรีวิว กรุณากดเปิดแท็บใหม่ (Open in new tab) เพื่อพิมพ์");
    }
  };

  const content = (
    <div className="print-root-wrap fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-sm overflow-y-auto cursor-default print:p-0 print:absolute print:inset-0 print:bg-white print:backdrop-blur-none">
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
            margin: 1cm !important;
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
            break-after: page;
            page-break-after: always;
          }
          .print-container:last-child {
             break-after: auto;
             page-break-after: auto;
          }
          .print-break-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {!hideControls && (
        <div className="sticky top-0 w-full bg-white border-b border-slate-200 p-4 flex flex-wrap gap-4 justify-between items-center shadow-sm print:hidden z-10 mx-auto">
          <div className="flex flex-col">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Printer className="h-5 w-5 text-indigo-600" />
              ตัวอย่างก่อนพิมพ์: {documentTitle}
            </h2>
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              หากปุ่มพิมพ์ไม่ทำงาน กรุณาเปิดแอปในแท็บใหม่ (Open in new tab)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-2 transition-colors border border-slate-300 shadow-sm"
            >
              <X className="w-4 h-4" />
              ปิดหน้าต่าง
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              พิมพ์ / บันทึก PDF
            </button>
          </div>
        </div>
      )}
      
      {/* Content Body */}
      <div className="py-8 px-4 print:p-0 flex flex-col items-center pb-24 print:block">
        {children}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

export const PrintPageContainer = React.forwardRef<HTMLDivElement, { children: ReactNode, className?: string }>(({ children, className = '' }, ref) => (
  <div 
    ref={ref}
    className={`print-container w-[210mm] min-h-[297mm] bg-white shadow-xl print:shadow-none print:w-full print:h-auto mx-auto mb-8 print:mb-0 relative text-black ${className}`}
    style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', padding: '15mm 20mm', boxSizing: 'border-box' }}
  >
    {children}
  </div>
));

export const PrintHeader = ({ title, subtitle, className = '' }: { title: string, subtitle?: ReactNode, className?: string }) => (
  <div className={`flex flex-col items-center text-center mb-8 relative ${className}`}>
    <div className="absolute top-0 left-0 hidden sm:block print:block">
      <SchoolLogo className="h-20 w-20 text-[#e54a93] drop-shadow-sm" />
    </div>
    <div className="sm:hidden print:hidden mb-4">
      <SchoolLogo className="h-16 w-16 text-[#e54a93] drop-shadow-sm" />
    </div>
    <h1 className="text-2xl font-bold font-serif mb-1 text-slate-900">{title}</h1>
    <h2 className="text-lg font-black text-slate-900 mb-0.5 tracking-wide">โรงเรียนศิริมงคลศึกษา บางบัวทอง</h2>
    <p className="text-[9px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-100 mb-3 uppercase tracking-wider inline-block">
      Sirimongkolsuksa Bangbuathong School
    </p>
    {subtitle && (
      <div className="w-full mt-1">
        {subtitle}
      </div>
    )}
  </div>
);

export const PrintSignatureBox = ({ role, name, date, signature, label }: { role: string, name?: string, date?: string, signature?: string, label: string }) => (
  <div className="flex flex-col items-center justify-end h-full">
    <p className="text-sm text-slate-600 mb-2">{label}</p>
    <div className="w-40 border-b border-slate-400 mb-2 flex items-center justify-center min-h-[40px] relative">
      {signature && (
         <img src={signature} alt={`ลายเซ็น${name || ''}`} className="h-10 object-contain absolute bottom-0" crossOrigin="anonymous" />
      )}
    </div>
    <p className="text-sm font-medium text-slate-900">{name ? `(${name})` : '(............................................)'}</p>
    <p className="text-xs text-slate-500 mt-1">{role}</p>
    <p className="text-xs text-slate-500 mt-1">วันที่ {date ? date : '......./......./.......'}</p>
  </div>
);
