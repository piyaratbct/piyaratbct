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
          {/* Assessment Month Section */}
          <section>
            <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
              การประเมินประจำเดือน
            </h4>
            <div className="w-full max-w-xs">
              <input
                type="month"
                value={formData.month || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, month: e.target.value }))
                }
                className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-pink-500 bg-white"
              />
            </div>
          </section>

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
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-pink-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  ส่วนสูง (เซนติเมตร)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="50"
                  max="250"
                  value={height}
                  onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-pink-500 bg-white"
                />
              </div>
            </div>
          </section>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
              ผลการประเมินพัฒนาการ (คำบรรยาย)
            </h4>
            
            <div className="space-y-5">
              {/* 1. ด้านสุขภาวะทางกาย */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <label className="text-sm font-bold text-slate-800">1. ด้านสุขภาวะทางกาย</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-500 mr-1">ระดับคุณภาพ:</span>
                    {([3, 2, 1] as const).map(score => {
                      const isSelected = formData.physicalScore === score;
                      const label = score === 3 ? '3 ดี' : score === 2 ? '2 พอใช้' : '1 ควรส่งเสริม';
                      const colorClass = score === 3 
                        ? (isSelected ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200')
                        : score === 2 
                        ? (isSelected ? 'bg-sky-600 text-white font-bold shadow-sm' : 'bg-white text-sky-700 hover:bg-sky-50 border border-sky-200')
                        : (isSelected ? 'bg-rose-600 text-white font-bold shadow-sm' : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200');
                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, physicalScore: score }))}
                          className={`px-2.5 py-1 text-xs rounded-lg transition-all ${colorClass}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <textarea
                  value={formData.physicalDev || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, physicalDev: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none bg-white"
                  rows={2}
                  placeholder="เช่น มีน้ำหนักและส่วนสูงตามเกณฑ์มาตรฐาน ใช้กล้ามเนื้อมัดเล็กมัดใหญ่ได้ดี..."
                />
              </div>

              {/* 2. ด้านอารมณ์ จิตใจ และสังคม */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <label className="text-sm font-bold text-slate-800">2. ด้านอารมณ์ จิตใจ และสังคม</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-500 mr-1">ระดับคุณภาพ:</span>
                    {([3, 2, 1] as const).map(score => {
                      const isSelected = formData.emotionalScore === score;
                      const label = score === 3 ? '3 ดี' : score === 2 ? '2 พอใช้' : '1 ควรส่งเสริม';
                      const colorClass = score === 3 
                        ? (isSelected ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200')
                        : score === 2 
                        ? (isSelected ? 'bg-sky-600 text-white font-bold shadow-sm' : 'bg-white text-sky-700 hover:bg-sky-50 border border-sky-200')
                        : (isSelected ? 'bg-rose-600 text-white font-bold shadow-sm' : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200');
                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, emotionalScore: score }))}
                          className={`px-2.5 py-1 text-xs rounded-lg transition-all ${colorClass}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <textarea
                  value={formData.emotionalDev || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, emotionalDev: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none bg-white"
                  rows={2}
                  placeholder="เช่น ร่าเริงแจ่มใส ช่วยเหลือตนเองและแบ่งปันผู้อื่นได้ดี..."
                />
              </div>

              {/* 3. ด้านความเป็นพลเมืองและความเป็นไทย */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <label className="text-sm font-bold text-slate-800">3. ด้านความเป็นพลเมืองและความเป็นไทย</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-500 mr-1">ระดับคุณภาพ:</span>
                    {([3, 2, 1] as const).map(score => {
                      const isSelected = formData.citizenshipScore === score;
                      const label = score === 3 ? '3 ดี' : score === 2 ? '2 พอใช้' : '1 ควรส่งเสริม';
                      const colorClass = score === 3 
                        ? (isSelected ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200')
                        : score === 2 
                        ? (isSelected ? 'bg-sky-600 text-white font-bold shadow-sm' : 'bg-white text-sky-700 hover:bg-sky-50 border border-sky-200')
                        : (isSelected ? 'bg-rose-600 text-white font-bold shadow-sm' : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200');
                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, citizenshipScore: score }))}
                          className={`px-2.5 py-1 text-xs rounded-lg transition-all ${colorClass}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <textarea
                  value={formData.citizenshipDev || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, citizenshipDev: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none bg-white"
                  rows={2}
                  placeholder="เช่น ปฏิบัติตามข้อตกลงของห้องเรียน ไหว้สวยและมีสัมมาคารวะ..."
                />
              </div>

              {/* 4. ด้านสติปัญญา */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <label className="text-sm font-bold text-slate-800">4. ด้านสติปัญญาและการเรียนรู้</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-500 mr-1">ระดับคุณภาพ:</span>
                    {([3, 2, 1] as const).map(score => {
                      const isSelected = formData.intellectualScore === score;
                      const label = score === 3 ? '3 ดี' : score === 2 ? '2 พอใช้' : '1 ควรส่งเสริม';
                      const colorClass = score === 3 
                        ? (isSelected ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200')
                        : score === 2 
                        ? (isSelected ? 'bg-sky-600 text-white font-bold shadow-sm' : 'bg-white text-sky-700 hover:bg-sky-50 border border-sky-200')
                        : (isSelected ? 'bg-rose-600 text-white font-bold shadow-sm' : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200');
                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, intellectualScore: score }))}
                          className={`px-2.5 py-1 text-xs rounded-lg transition-all ${colorClass}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <textarea
                  value={formData.intellectualDev || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, intellectualDev: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none bg-white"
                  rows={2}
                  placeholder="เช่น สนใจเรียนรู้สิ่งใหม่ๆ สื่อสารได้ชัดเจน มีจินตนาการสร้างสรรค์..."
                />
              </div>
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
            <label className="flex items-center gap-2 mt-2 cursor-pointer group w-fit">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.publishNotesToStudent360 ? 'bg-pink-500 border-pink-500' : 'bg-white border-slate-300 group-hover:border-pink-400'}`}>
                {formData.publishNotesToStudent360 && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={!!formData.publishNotesToStudent360}
                onChange={(e) => setFormData(prev => ({ ...prev, publishNotesToStudent360: e.target.checked }))}
              />
              <span className="text-xs text-slate-600 font-medium group-hover:text-pink-600 transition-colors">ลิงก์ข้อมูลนี้ไปแสดงในหน้าพัฒนาการและพฤติกรรม (Student 360°)</span>
            </label>
          </div>
          
          {/* ผลงานและความภาคภูมิใจ */}
          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer group w-fit mb-2">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.hasAchievement ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}>
                {formData.hasAchievement && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={!!formData.hasAchievement}
                onChange={(e) => setFormData(prev => ({ ...prev, hasAchievement: e.target.checked }))}
              />
              <span className="text-sm text-slate-800 font-bold group-hover:text-indigo-600 transition-colors">บันทึกผลงานและความภาคภูมิใจ (ลิงก์ไป Student 360°)</span>
            </label>
            {formData.hasAchievement && (
              <textarea
                value={formData.achievementContent || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, achievementContent: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm min-h-[80px] outline-none focus:border-indigo-500 mt-1 animate-in slide-in-from-top-2 fade-in duration-200"
                placeholder="ระบุผลงาน, รางวัล, หรือความภาคภูมิใจที่โดดเด่น..."
              />
            )}
          </div>

          {/* การดูแลช่วยเหลือนักเรียน */}
          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer group w-fit mb-2">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.hasPastoralCare ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300 group-hover:border-emerald-400'}`}>
                {formData.hasPastoralCare && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={!!formData.hasPastoralCare}
                onChange={(e) => setFormData(prev => ({ ...prev, hasPastoralCare: e.target.checked }))}
              />
              <span className="text-sm text-slate-800 font-bold group-hover:text-emerald-600 transition-colors">บันทึกการดูแลช่วยเหลือนักเรียน (ลิงก์ไป Student 360°)</span>
            </label>
            {formData.hasPastoralCare && (
              <textarea
                value={formData.pastoralCareContent || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, pastoralCareContent: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm min-h-[80px] outline-none focus:border-emerald-500 mt-1 animate-in slide-in-from-top-2 fade-in duration-200"
                placeholder="ระบุการให้คำปรึกษา, การเยี่ยมบ้าน, หรือการดูแลช่วยเหลือต่างๆ..."
              />
            )}
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
