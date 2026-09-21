import React, { useState, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Printer, X } from "lucide-react";
import { SchoolLogo } from "./PrintTemplate";

interface PDFPrintHelperProps {
  layout?: 'portrait' | 'landscape';
  children: ReactNode;
  onClose: () => void;
  documentTitle?: string;
  hideControls?: boolean;
  isCompact?: boolean;
  onToggleCompact?: () => void;
}

export const PDFPrintHelper: React.FC<PDFPrintHelperProps> = ({
  children,
  onClose,
  documentTitle = "พิมพ์เอกสาร",
  hideControls = false,
  isCompact = false,
  onToggleCompact,
  layout = 'portrait',
}) => {
  useEffect(() => {
    document.body.classList.add("print-mode-active");

    const originalTitle = document.title;
    if (documentTitle) {
      document.title = documentTitle;
    }

    return () => {
      document.body.classList.remove("print-mode-active");
      document.title = originalTitle;
    };
  }, [documentTitle]);

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn(
        "window.print() is blocked or unsupported in this sandbox:",
        e,
      );
      window.alert(
        "ไม่สามารถเปิดระบบพิมพ์เอกสารได้เนื่องจากข้อจำกัดความปลอดภัยของเบราว์เซอร์ในโหมดพรีวิว กรุณากดเปิดแท็บใหม่ (Open in new tab) เพื่อพิมพ์",
      );
    }
  };

  const content = (
    <div className="print-root-wrap fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-sm overflow-y-auto cursor-default print:p-0 print:absolute print:inset-0 print:bg-white print:backdrop-blur-none">
      <style>{`
        @media print {
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
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
          }
          @page {
            size: A4 ${layout};
            margin: ${isCompact ? "6mm" : "8mm"} !important;
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
            break-inside: avoid !important;
            page-break-inside: avoid !important;
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
        <div className="sticky top-0 w-full bg-white border-b border-slate-200 p-3 sm:p-4 shadow-sm print:hidden z-10 mx-auto space-y-2">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex flex-col">
              <h2 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
                <Printer className="h-5 w-5 text-indigo-600" />
                ตัวอย่างก่อนพิมพ์: {documentTitle}
              </h2>
              <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                หากปุ่มพิมพ์ไม่ทำงาน กรุณาเปิดแอปในแท็บใหม่ (Open in new tab)
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onToggleCompact && (
                <button
                  onClick={onToggleCompact}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all duration-200 cursor-pointer ${
                    isCompact
                      ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm border border-emerald-500"
                      : "bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white border border-slate-600"
                  }`}
                  title="บีบอัดช่องว่างและขนาดตัวอักษรเพื่อจัดให้รายงานรูปเล่มยาวทั้งหมดจบสวยในกระดาษ A4 แผ่นเดียว"
                >
                  <span>
                    {isCompact
                      ? "✓ บีบพอดีหน้าเดียว: เปิด"
                      : "📋 บีบพอดีหน้าเดียว: ปิด"}
                  </span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-2 transition-colors border border-slate-300 shadow-sm text-xs sm:text-sm"
              >
                <X className="w-4 h-4" />
                ปิดหน้าต่าง
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm text-xs sm:text-sm"
              >
                <Printer className="w-4 h-4" />
                พิมพ์ / บันทึก PDF
              </button>
            </div>
          </div>

          {/* Quick tips for printing to match preview */}
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 text-xs text-amber-900 space-y-1 shadow-xs">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <span>💡 ตั้งค่าหน้าต่างพิมพ์ของบราวเซอร์ (Ctrl+P / ⌘+P) ให้ตรงกับตัวอย่างพรีวิว:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-[11px] sm:text-xs">
              <div className="flex items-start gap-1">
                <span className="text-emerald-700 font-bold">✓</span>
                <span><strong>กราฟิกพื้นหลัง:</strong> ต้อง<strong className="text-emerald-800">ติ๊กถูก</strong> (เพื่อให้สีหัวตารางและเส้นขอบไม่หาย)</span>
              </div>
              <div className="flex items-start gap-1">
                <span className="text-emerald-700 font-bold">✓</span>
                <span><strong>การวางแนว:</strong> เลือก <strong>{layout === 'landscape' ? 'แนวนอน (Landscape)' : 'แนวตั้ง (Portrait)'}</strong></span>
              </div>
              <div className="flex items-start gap-1">
                <span className="text-emerald-700 font-bold">✓</span>
                <span><strong>ระยะขอบ:</strong> เลือก <strong>"ไม่มี (None)"</strong> หรือ <strong>"ต่ำสุด"</strong></span>
              </div>
              <div className="flex items-start gap-1">
                <span className="text-emerald-700 font-bold">✓</span>
                <span><strong>ส่วนหัวและส่วนท้าย:</strong> เอาติ๊กถูก<strong>ออก</strong> (ตัด URL/วันที่)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Body */}
      <div className="py-8 px-4 print:p-0 flex flex-col items-center pb-24 print:block">
        {children}
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(content, document.body)
    : content;
};

export const PrintPageContainer = React.forwardRef<
  HTMLDivElement,
  { children: ReactNode; className?: string; layout?: 'portrait' | 'landscape'; isCompact?: boolean }
>(({ children, className = "", layout = 'portrait', isCompact = false }, ref) => (
  <div
    ref={ref}
    className={`print-container ${layout === 'landscape' ? 'w-[297mm] min-h-[210mm]' : 'w-[210mm] min-h-[297mm]'} bg-white shadow-xl print:shadow-none print:w-full print:h-auto mx-auto mb-8 print:mb-0 relative text-black ${className}`}
    style={{
      WebkitPrintColorAdjust: "exact",
      printColorAdjust: "exact",
      padding: isCompact ? "8mm 12mm" : "12mm 16mm",
      boxSizing: "border-box",
    }}
  >
    {children}
  </div>
));

export const PrintHeader = ({
  title,
  subtitle,
  className = "",
  isCompact = false,
}: {
  title: string;
  subtitle?: ReactNode;
  className?: string;
  isCompact?: boolean;
}) => (
  <div
    className={`flex flex-col items-center text-center ${isCompact ? "mb-3" : "mb-6"} relative ${className}`}
  >
    <div className="absolute top-0 left-0 hidden sm:block print:block">
      <SchoolLogo className={`${isCompact ? "h-12 w-12" : "h-16 w-16"} text-[#e54a93] drop-shadow-sm`} />
    </div>
    <div className="sm:hidden print:hidden mb-2">
      <SchoolLogo className={`${isCompact ? "h-10 w-10" : "h-14 w-14"} text-[#e54a93] drop-shadow-sm`} />
    </div>
    <h1 className={`${isCompact ? "text-lg" : "text-xl sm:text-2xl"} font-bold font-serif mb-0.5 text-slate-900`}>
      {title}
    </h1>
    <h2 className={`${isCompact ? "text-sm" : "text-base sm:text-lg"} font-black text-slate-900 mb-0.5 tracking-wide`}>
      โรงเรียนศิริมงคลศึกษา บางบัวทอง
    </h2>
    <p className="text-[9px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-100 mb-1.5 uppercase tracking-wider inline-block">
      Sirimongkolsuksa Bangbuathong School
    </p>
    {subtitle && <div className="w-full mt-1">{subtitle}</div>}
  </div>
);

export const PrintSignatureBox = ({
  role,
  name,
  date,
  signature,
  label,
  isCompact = false,
}: {
  role: string;
  name?: string;
  date?: string;
  signature?: string;
  label?: string;
  isCompact?: boolean;
}) => (
  <div className={`flex flex-col items-center justify-end h-full ${isCompact ? "mt-2" : "mt-4"}`}>
    <div className={`flex items-end ${isCompact ? "mb-1" : "mb-2"}`}>
      <span className={`${isCompact ? "text-xs" : "text-sm"} text-slate-800 mr-2 font-medium`}>ลงชื่อ</span>
      <div className={`${isCompact ? "w-40 min-h-[16px]" : "w-48 min-h-[20px]"} border-b border-slate-500 border-dotted flex items-center justify-center relative`}>
        {signature && (
          <img
            src={signature}
            alt={`ลายเซ็น${name || ""}`}
            className={`${isCompact ? "h-8" : "h-10"} object-contain absolute bottom-0`}
            crossOrigin="anonymous"
          />
        )}
      </div>
    </div>
    <p className={`${isCompact ? "text-xs" : "text-sm"} font-medium text-slate-900 mt-0.5`}>
      ({name ? name : "............................................"})
    </p>
    <p className={`${isCompact ? "text-xs" : "text-sm"} text-slate-800 mt-0.5`}>{role}</p>
    <p className={`${isCompact ? "text-xs" : "text-sm"} text-slate-800 mt-0.5`}>
      วันที่ {date ? date : "......./......./......."}
    </p>
  </div>
);
