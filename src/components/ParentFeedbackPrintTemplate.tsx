import React, { useState } from "react";
import { Teacher } from "../types";
import { PDFPrintHelper, PrintPageContainer } from "./PDFPrintHelper";

interface ParentFeedbackPrintTemplateProps {
  teacher: Teacher;
  academicYear: string;
  semester: string;
  onClose: () => void;
}

export const ParentFeedbackPrintTemplate: React.FC<
  ParentFeedbackPrintTemplateProps
> = ({ teacher, academicYear, semester, onClose }) => {
  const [isCompact, setIsCompact] = useState(false);

  const documentTitle = `แบบตอบกลับจากผู้ปกครอง_ฟอร์มเปล่า_${academicYear}_${semester}`;

  const FeedbackForm = () => (
    <div
      className={`flex flex-col flex-1 justify-center ${isCompact ? "py-2" : "py-4"}`}
    >
      {/* Header */}
      <div className="text-center mb-6 border-b border-slate-800 pb-4">
        <h2
          className={`font-black text-slate-800 ${isCompact ? "text-lg mb-1" : "text-xl mb-2"}`}
        >
          แบบตอบกลับจากผู้ปกครอง (ส่วนที่ 2)
        </h2>
        <h3
          className={`font-bold text-slate-600 ${isCompact ? "text-sm" : "text-base"}`}
        >
          รับทราบผลการประเมินพัฒนาการนักเรียน
        </h3>
      </div>

      {/* Generic Student Info */}
      <div
        className={`bg-slate-50 border border-slate-200 rounded-xl ${isCompact ? "p-3 mb-4" : "p-5 mb-6"}`}
      >
        <div className="grid grid-cols-2 gap-y-6 gap-x-8">
          <div className="flex items-end border-b border-dotted border-slate-400 pb-1">
            <span
              className={`text-slate-500 font-bold mr-2 whitespace-nowrap ${isCompact ? "text-xs" : "text-sm"}`}
            >
              ชื่อ-นามสกุลนักเรียน:
            </span>
          </div>
          <div className="flex items-end border-b border-dotted border-slate-400 pb-1">
            <span
              className={`text-slate-500 font-bold mr-2 whitespace-nowrap ${isCompact ? "text-xs" : "text-sm"}`}
            >
              รหัสนักเรียน:
            </span>
          </div>
          <div className="flex items-end border-b border-dotted border-slate-400 pb-1">
            <span
              className={`text-slate-500 font-bold mr-2 whitespace-nowrap ${isCompact ? "text-xs" : "text-sm"}`}
            >
              ชั้นเรียน:
            </span>
          </div>
          <div className="flex items-end border-b border-dotted border-slate-400 pb-1">
            <span
              className={`text-slate-500 font-bold mr-2 whitespace-nowrap ${isCompact ? "text-xs" : "text-sm"}`}
            >
              เลขที่:
            </span>
          </div>
        </div>
      </div>

      {/* Parent Feedback */}
      <div
        className={`border border-slate-300 rounded-xl bg-slate-50/30 flex-1 ${isCompact ? "p-4" : "p-6"}`}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-4 h-4 mt-1 rounded-sm border-2 border-slate-400 bg-white"></div>
            <span
              className={`text-slate-700 font-bold ${isCompact ? "text-xs" : "text-sm"}`}
            >
              รับทราบผลการประเมินพัฒนาการของนักเรียน
            </span>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-4 h-4 mt-1 rounded-sm border-2 border-slate-400 bg-white"></div>
            <div
              className={`flex-1 text-slate-700 ${isCompact ? "text-xs" : "text-sm"}`}
            >
              <p className="mb-2 font-bold">
                ความคิดเห็น / ข้อเสนอแนะเพิ่มเติม:
              </p>
              <div className="border-b border-dotted border-slate-400 h-6 w-full mt-2"></div>
              <div className="border-b border-dotted border-slate-400 h-6 w-full mt-4"></div>
              <div className="border-b border-dotted border-slate-400 h-6 w-full mt-4"></div>
            </div>
          </div>
          <div
            className={`flex justify-end pt-4 font-serif ${isCompact ? "mt-4" : "mt-8"}`}
          >
            <div className="text-center w-64">
              <div className="border-b border-dotted border-slate-400 h-6 w-full mb-2"></div>
              <p
                className={`text-slate-600 ${isCompact ? "text-xs" : "text-sm"}`}
              >
                ลงชื่อ
                (......................................................................)
              </p>
              <p
                className={`text-slate-500 mt-1 ${isCompact ? "text-[10px]" : "text-xs"}`}
              >
                ผู้ปกครองนักเรียน
              </p>
              <p
                className={`text-slate-500 mt-1 ${isCompact ? "text-[10px]" : "text-xs"}`}
              >
                วันที่ ....... / ................... / ............
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <PDFPrintHelper
      onClose={onClose}
      documentTitle={documentTitle}
      isCompact={isCompact}
      onToggleCompact={() => setIsCompact(!isCompact)}
    >
      <PrintPageContainer>
        <div className="flex flex-col h-[267mm] justify-between">
          <FeedbackForm />

          {/* Tear-off Line */}
          <div className="relative flex items-center justify-center w-full py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-dashed border-slate-300"></div>
            </div>
            <div className="relative bg-white px-4 text-slate-400 text-xs flex items-center gap-2 font-medium">
              <span className="text-sm">✂️</span>
              <span>สำหรับตัดแบ่ง 2 ส่วน</span>
            </div>
          </div>

          <FeedbackForm />
        </div>
      </PrintPageContainer>
    </PDFPrintHelper>
  );
};
