import React, { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Student, KindergartenAssessment } from "../types";

interface KindergartenAssessmentModalProps {
  student: Student;
  existingAssessment: KindergartenAssessment;
  onClose: () => void;
  onSave: (assessment: KindergartenAssessment, weight?: number, height?: number) => void;
}

export const KindergartenAssessmentModal: React.FC<KindergartenAssessmentModalProps> = ({
  student,
  existingAssessment,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<KindergartenAssessment>(existingAssessment);
  const [weight, setWeight] = useState<number | ''>((existingAssessment as any).weight !== undefined ? (existingAssessment as any).weight : (student.weight || ''));
  const [height, setHeight] = useState<number | ''>((existingAssessment as any).height !== undefined ? (existingAssessment as any).height : (student.height || ''));

  const handleStandardChange = (standard: keyof KindergartenAssessment, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [standard]: value,
    }));
  };

  const getScoreColor = (score: number) => {
    if (score === 3) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (score === 2) return "bg-blue-100 text-blue-700 border-blue-200";
    if (score === 1) return "bg-rose-100 text-rose-700 border-rose-200";
    return "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100";
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4 print:hidden">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-black text-slate-800 text-lg">
              แบบประเมินพัฒนาการเด็กปฐมวัย
            </h3>
            <p className="text-sm text-slate-500">
              นักเรียน: {student.firstName} {student.lastName} (เลขที่ {student.number})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:bg-slate-200 hover:text-slate-600 p-2 rounded-full transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-8">
          {/* Health Data Section */}
          <section>
            <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
              ข้อมูลน้ำหนักและส่วนสูง (สำหรับการคำนวณ BMI ในหน้าข้อมูลสุขภาพ)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  น้ำหนัก (กิโลกรัม)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="150"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-pink-500"
                  placeholder="เช่น 15.5"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  ส่วนสูง (เซนติเมตร)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="80"
                  max="200"
                  value={height}
                  onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-pink-500"
                  placeholder="เช่น 110"
                />
              </div>
            </div>
          </section>

          {/* Legend */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex flex-wrap gap-4 items-center justify-center text-sm font-medium">
            <span className="text-slate-600 mr-2">เกณฑ์การประเมิน:</span>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-200"></div> 3 = ดี</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div> 2 = พอใช้</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-rose-100 border border-rose-200"></div> 1 = ควรส่งเสริม</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ร่างกาย */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 pb-2 border-b-2 border-pink-100 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                ด้านร่างกาย
              </h4>
              <StandardRow
                title="มาตรฐานที่ 1"
                desc="ร่างกายเจริญเติบโตตามวัยและมีสุขนิสัยที่ดี"
                value={formData.standard1}
                onChange={(val) => handleStandardChange('standard1', val)}
                getScoreColor={getScoreColor}
              />
              <StandardRow
                title="มาตรฐานที่ 2"
                desc="กล้ามเนื้อใหญ่และกล้ามเนื้อเล็กแข็งแรงใช้ได้อย่างคล่องแคล่วและประสานสัมพันธ์กัน"
                value={formData.standard2}
                onChange={(val) => handleStandardChange('standard2', val)}
                getScoreColor={getScoreColor}
              />
            </div>

            {/* อารมณ์ จิตใจ */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 pb-2 border-b-2 border-amber-100 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                ด้านอารมณ์ จิตใจ
              </h4>
              <StandardRow
                title="มาตรฐานที่ 3"
                desc="มีสุขภาพจิตดีและมีความสุข"
                value={formData.standard3}
                onChange={(val) => handleStandardChange('standard3', val)}
                getScoreColor={getScoreColor}
              />
              <StandardRow
                title="มาตรฐานที่ 4"
                desc="ชื่นชมและแสดงออกทางศิลปะ ดนตรี และการเคลื่อนไหว"
                value={formData.standard4}
                onChange={(val) => handleStandardChange('standard4', val)}
                getScoreColor={getScoreColor}
              />
              <StandardRow
                title="มาตรฐานที่ 5"
                desc="มีคุณธรรม จริยธรรมและมีจิตใจที่ดีงาม"
                value={formData.standard5}
                onChange={(val) => handleStandardChange('standard5', val)}
                getScoreColor={getScoreColor}
              />
            </div>

            {/* สังคม */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 pb-2 border-b-2 border-emerald-100 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                ด้านสังคม
              </h4>
              <StandardRow
                title="มาตรฐานที่ 6"
                desc="มีทักษะชีวิตและปฏิบัติตนตามหลักปรัชญาของเศรษฐกิจพอเพียง"
                value={formData.standard6}
                onChange={(val) => handleStandardChange('standard6', val)}
                getScoreColor={getScoreColor}
              />
              <StandardRow
                title="มาตรฐานที่ 7"
                desc="รักธรรมชาติ สิ่งแวดล้อม วัฒนธรรม และความเป็นไทย"
                value={formData.standard7}
                onChange={(val) => handleStandardChange('standard7', val)}
                getScoreColor={getScoreColor}
              />
              <StandardRow
                title="มาตรฐานที่ 8"
                desc="อยู่ร่วมกับผู้อื่นได้อย่างมีความสุขและปฏิบัติตนเป็นสมาชิกที่ดีของสังคมในระบอบประชาธิปไตย อันมีพระมหากษัตริย์ทรงเป็นประมุข"
                value={formData.standard8}
                onChange={(val) => handleStandardChange('standard8', val)}
                getScoreColor={getScoreColor}
              />
            </div>

            {/* สติปัญญา */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 pb-2 border-b-2 border-blue-100 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                ด้านสติปัญญา
              </h4>
              <StandardRow
                title="มาตรฐานที่ 9"
                desc="ใช้ภาษาสื่อสารได้เหมาะสมกับวัย"
                value={formData.standard9}
                onChange={(val) => handleStandardChange('standard9', val)}
                getScoreColor={getScoreColor}
              />
              <StandardRow
                title="มาตรฐานที่ 10"
                desc="มีความสามารถในการคิดที่เป็นพื้นฐานในการเรียนรู้"
                value={formData.standard10}
                onChange={(val) => handleStandardChange('standard10', val)}
                getScoreColor={getScoreColor}
              />
              <StandardRow
                title="มาตรฐานที่ 11"
                desc="มีจินตนาการและความคิดสร้างสรรค์"
                value={formData.standard11}
                onChange={(val) => handleStandardChange('standard11', val)}
                getScoreColor={getScoreColor}
              />
              <StandardRow
                title="มาตรฐานที่ 12"
                desc="มีเจตคติที่ดีต่อการเรียนรู้และมีความสามารถในการแสวงหาความรู้ได้เหมาะสมกับวัย"
                value={formData.standard12}
                onChange={(val) => handleStandardChange('standard12', val)}
                getScoreColor={getScoreColor}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 block">
              ข้อเสนอแนะเพิ่มเติมจากครูประจำชั้น
            </label>
            <textarea
              value={formData.teacherNotes || ""}
              onChange={(e) =>
                setFormData({ ...formData, teacherNotes: e.target.value })
              }
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
              rows={3}
              placeholder="ระบุข้อเสนอแนะ พฤติกรรมที่ควรส่งเสริม..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => {
              const saveWeight = weight === '' ? undefined : weight;
              const saveHeight = height === '' ? undefined : height;
              onSave(
                {...formData, weight: saveWeight, height: saveHeight} as any, 
                saveWeight, 
                saveHeight
              );
            }}
            className="px-6 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <CheckCircle className="h-4 w-4" />
            บันทึกการประเมิน
          </button>
        </div>
      </div>
    </div>
  );
};

const StandardRow = ({ 
  title, 
  desc, 
  value, 
  onChange, 
  getScoreColor 
}: { 
  title: string; 
  desc: string; 
  value: number; 
  onChange: (val: number) => void;
  getScoreColor: (val: number) => string;
}) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
    <div className="flex-1 pr-4 mb-2 sm:mb-0">
      <div className="text-xs font-bold text-slate-700">{title}</div>
      <div className="text-[11px] text-slate-500 leading-snug">{desc}</div>
    </div>
    <div className="flex gap-1">
      {[3, 2, 1].map((score) => (
        <button
          key={score}
          onClick={() => onChange(score)}
          className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
            value === score ? getScoreColor(score) : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
          }`}
        >
          {score}
        </button>
      ))}
    </div>
  </div>
);
