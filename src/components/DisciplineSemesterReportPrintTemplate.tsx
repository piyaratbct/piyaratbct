import React, { useMemo } from "react";
import { DisciplineIncident } from "../types";
import {
  PDFPrintHelper,
  PrintPageContainer,
  PrintHeader,
  PrintSignatureBox,
} from "./PDFPrintHelper";

interface DisciplineSemesterReportPrintTemplateProps {
  incidents: DisciplineIncident[];
  academicYear: string;
  semester: string;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  fight: "ทะเลาะวิวาท",
  assault: "ทำร้ายร่างกาย",
  feud: "ชู้สาว",
  bullying: "กลั่นแกล้ง",
  misunderstanding: "เข้าใจผิด",
  disruption: "ก่อกวน",
  accident: "อุบัติเหตุ",
  illness: "เจ็บป่วย",
  vandalism: "ทำลายสิ่งของ",
  other: "อื่นๆ",
};

const SEVERITY_LABELS: Record<string, string> = {
  none: "ไม่มี/ทั่วไป",
  low: "เบาบาง",
  medium: "ปานกลาง",
  high: "รุนแรง",
  critical: "ร้ายแรงมาก",
};

export const DisciplineSemesterReportPrintTemplate: React.FC<DisciplineSemesterReportPrintTemplateProps> = ({
  incidents,
  academicYear,
  semester,
  onClose,
}) => {
  const filteredIncidents = useMemo(() => {
    return incidents.filter(
      (inc) => inc.academicYear === academicYear && inc.semester === semester
    );
  }, [incidents, academicYear, semester]);

  const stats = useMemo(() => {
    const total = filteredIncidents.length;
    
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byGrade: Record<string, number> = {};

    filteredIncidents.forEach((inc) => {
      byType[inc.type] = (byType[inc.type] || 0) + 1;
      
      const sev = inc.severity || 'none';
      bySeverity[sev] = (bySeverity[sev] || 0) + 1;

      // Extract grade level from student names (assuming format: Name - Grade)
      // Since a single incident can involve multiple students from different grades, 
      // this is a bit tricky, but let's approximate based on the first student or group them.
      inc.studentNames.forEach(name => {
        const parts = name.split('-');
        const grade = parts.length > 1 ? parts[parts.length - 1].trim() : 'ไม่ระบุ';
        byGrade[grade] = (byGrade[grade] || 0) + 1;
      });
    });

    return { total, byType, bySeverity, byGrade };
  }, [filteredIncidents]);

  return (
    <PDFPrintHelper
      onClose={onClose}
      documentTitle={`รายงานสรุปงานปกครอง_${semester}_${academicYear}`}
    >
      <PrintPageContainer>
        <PrintHeader
          title="รายงานสรุปงานปกครองนักเรียน"
          subtitle={`ภาคเรียนที่ ${semester} ปีการศึกษา ${academicYear}`}
        />

        <div className="mb-8">
          <div className="flex gap-8 mb-6">
            <div className="border border-slate-300 p-4 rounded-lg flex-1 text-center bg-slate-50">
              <div className="text-sm font-bold text-slate-500 mb-1">จำนวนเหตุการณ์ทั้งหมด</div>
              <div className="text-3xl font-black text-rose-600">{stats.total}</div>
              <div className="text-xs text-slate-500 mt-1">เหตุการณ์</div>
            </div>
            <div className="border border-slate-300 p-4 rounded-lg flex-1 text-center bg-slate-50">
              <div className="text-sm font-bold text-slate-500 mb-1">จำนวนนักเรียนที่เกี่ยวข้อง</div>
              <div className="text-3xl font-black text-slate-800">
                {Object.values(stats.byGrade).reduce((a, b) => (a as number) + (b as number), 0)}
              </div>
              <div className="text-xs text-slate-500 mt-1">คน/ครั้ง</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-slate-800 mb-3 border-b-2 border-slate-800 pb-1">
                สถิติแยกตามประเภทเหตุการณ์
              </h4>
              <table className="w-full text-sm border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-200 p-2 text-left">ประเภท</th>
                    <th className="border border-slate-200 p-2 text-center w-24">จำนวน (ครั้ง)</th>
                  </tr>
                </thead>
                <tbody>
                  {(Object.entries(stats.byType) as [string, number][]).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                    <tr key={type}>
                      <td className="border border-slate-200 p-2">{TYPE_LABELS[type] || type}</td>
                      <td className="border border-slate-200 p-2 text-center font-bold text-rose-600">{count}</td>
                    </tr>
                  ))}
                  {Object.keys(stats.byType).length === 0 && (
                    <tr>
                      <td colSpan={2} className="border border-slate-200 p-4 text-center text-slate-500">ไม่มีข้อมูลเหตุการณ์</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-3 border-b-2 border-slate-800 pb-1">
                สถิติแยกตามระดับความรุนแรง
              </h4>
              <table className="w-full text-sm border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-200 p-2 text-left">ระดับความรุนแรง</th>
                    <th className="border border-slate-200 p-2 text-center w-24">จำนวน (ครั้ง)</th>
                  </tr>
                </thead>
                <tbody>
                  {(Object.entries(stats.bySeverity) as [string, number][]).sort((a, b) => b[1] - a[1]).map(([severity, count]) => (
                    <tr key={severity}>
                      <td className="border border-slate-200 p-2">{SEVERITY_LABELS[severity] || severity}</td>
                      <td className="border border-slate-200 p-2 text-center font-bold text-rose-600">{count}</td>
                    </tr>
                  ))}
                  {Object.keys(stats.bySeverity).length === 0 && (
                    <tr>
                      <td colSpan={2} className="border border-slate-200 p-4 text-center text-slate-500">ไม่มีข้อมูล</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-3 border-b-2 border-slate-800 pb-1">
              สถิติการเกี่ยวข้องแยกตามระดับชั้น
            </h4>
            <div className="grid grid-cols-4 gap-4">
              {(Object.entries(stats.byGrade) as [string, number][]).sort((a, b) => b[1] - a[1]).map(([grade, count]) => (
                <div key={grade} className="border border-slate-200 rounded p-3 flex justify-between items-center bg-white shadow-sm">
                  <span className="font-medium text-slate-700">{grade}</span>
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{count}</span>
                </div>
              ))}
            </div>
            {Object.keys(stats.byGrade).length === 0 && (
              <div className="border border-slate-200 p-4 text-center text-slate-500 bg-slate-50">ไม่มีข้อมูล</div>
            )}
          </div>
        </div>

        <div className="mt-8 page-break-inside-avoid">
            <h4 className="font-bold text-slate-800 mb-4 border-b-2 border-slate-800 pb-1">
              สรุปเหตุการณ์รุนแรง/สำคัญ (ถ้ามี)
            </h4>
            <div className="space-y-4">
              {filteredIncidents
                .filter((inc) => inc.severity === 'high' || inc.severity === 'critical')
                .slice(0, 10)
                .map((inc) => (
                  <div key={inc.id} className="border border-rose-200 rounded p-4 bg-rose-50/30 text-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-rose-800">
                        {TYPE_LABELS[inc.type] || inc.type} 
                        <span className="text-slate-500 font-normal ml-2">({inc.date})</span>
                      </div>
                      <span className="px-2 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200">
                        {SEVERITY_LABELS[inc.severity || 'none'] || inc.severity}
                      </span>
                    </div>
                    <p className="text-slate-700 mb-2">{inc.description}</p>
                    <div className="text-xs text-slate-500">
                      <strong>นักเรียนที่เกี่ยวข้อง:</strong> {inc.studentNames.join(', ')}
                    </div>
                  </div>
              ))}
              {filteredIncidents.filter((inc) => inc.severity === 'high' || inc.severity === 'critical').length === 0 && (
                <div className="text-center p-4 text-emerald-600 font-medium bg-emerald-50 rounded-lg border border-emerald-200">
                  ไม่มีบันทึกเหตุการณ์ระดับรุนแรงในภาคเรียนนี้
                </div>
              )}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-16 page-break-inside-avoid">
          <PrintSignatureBox
            role="ผู้รายงาน (หัวหน้าฝ่ายปกครอง)"
            label="(ลงชื่อ) ....................................................... "
          />
          <PrintSignatureBox
            role="ผู้อำนวยการโรงเรียน"
            label="(ลงชื่อ) ....................................................... "
          />
        </div>
      </PrintPageContainer>
    </PDFPrintHelper>
  );
};
