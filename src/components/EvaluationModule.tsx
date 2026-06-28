import React, { useState } from 'react';
import { BarChart3, TrendingUp, Award, BookOpen, ChevronDown, CheckCircle, Search, FileText, Wrench, CalendarDays } from 'lucide-react';
import { Student, GRADE_LEVELS, SUBJECTS } from '../types';
import { AttendanceSummary } from './AttendanceSummary';

interface EvaluationModuleProps {
  systemAcademicYear?: string;
  systemSemester?: string;
}

export const EvaluationModule: React.FC<EvaluationModuleProps> = ({ systemAcademicYear, systemSemester }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'attendance'>('overview');
  const [selectedGrade, setSelectedGrade] = useState<string>(GRADE_LEVELS[0]);
  const [selectedSubject, setSelectedSubject] = useState<string>(SUBJECTS[0]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="print:hidden space-y-6">
        {/* Module Header with attractive display */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-300 opacity-20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="h-16 w-16 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center shadow-inner border border-white/30">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">3. การวัดและประเมินผลผู้เรียน (LessonAchieve)</h2>
              <p className="text-emerald-100 font-medium mt-1">รายงานผลสัมฤทธิ์ทางการเรียนและวิเคราะห์สถิติภาพรวม</p>
            </div>
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex flex-wrap bg-white rounded-xl p-1 shadow-sm border border-slate-100 max-w-2xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'overview' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="h-4 w-4" /> ภาพรวมผลสัมฤทธิ์
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'grades' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Award className="h-4 w-4" /> บันทึกคะแนน
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'attendance' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <CalendarDays className="h-4 w-4" /> สรุปการเช็คชื่อ
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800">ภาพรวมผลสัมฤทธิ์ (จำลอง)</h3>
                  <p className="text-sm text-slate-500">รายงานสถิติผลการเรียนของนักเรียนระดับชั้นประถมศึกษา</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-4">
                  <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-500">เกรดเฉลี่ยรวม</div>
                    <div className="text-2xl font-black text-slate-800">3.45</div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-4">
                  <div className="h-12 w-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center shrink-0">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-500">นักเรียนผลการเรียนดีเยี่ยม</div>
                    <div className="text-2xl font-black text-slate-800">45%</div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-4">
                  <div className="h-12 w-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center shrink-0">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-500">วิชาที่ทำคะแนนเฉลี่ยสูงสุด</div>
                    <div className="text-2xl font-black text-slate-800">ภาษาไทย</div>
                  </div>
                </div>
              </div>
              
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h4 className="font-bold text-slate-600 mb-2">พื้นที่สำหรับแสดงกราฟสรุปสถิติ</h4>
                <p className="text-sm text-slate-400">แผนภูมิเปรียบเทียบผลการเรียนจะแสดงที่นี่ในอนาคต</p>
              </div>
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800">บันทึกคะแนน</h3>
                  <p className="text-sm text-slate-500">จัดการข้อมูลคะแนนเก็บ คะแนนสอบย่อย กลางภาค และปลายภาค</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <select 
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {SUBJECTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <select 
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {GRADE_LEVELS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-center w-16">เลขที่</th>
                      <th className="px-4 py-3 w-48">ชื่อ-นามสกุล</th>
                      <th className="px-4 py-3 text-center border-l border-slate-200">เก็บระหว่างเรียน<br/><span className="text-xs font-normal text-slate-400">(60)</span></th>
                      <th className="px-4 py-3 text-center">กลางภาค<br/><span className="text-xs font-normal text-slate-400">(20)</span></th>
                      <th className="px-4 py-3 text-center">ปลายภาค<br/><span className="text-xs font-normal text-slate-400">(20)</span></th>
                      <th className="px-4 py-3 text-center border-l border-slate-200">รวม<br/><span className="text-xs font-normal text-slate-400">(100)</span></th>
                      <th className="px-4 py-3 text-center">เกรด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Mock Table Rows */}
                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-center font-medium">1</td>
                      <td className="px-4 py-3 font-medium text-slate-800">สมชาย รักดี</td>
                      <td className="px-4 py-3 text-center border-l border-slate-100">
                        <input type="number" className="w-16 text-center border border-slate-200 rounded p-1" defaultValue={52} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input type="number" className="w-16 text-center border border-slate-200 rounded p-1" defaultValue={15} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input type="number" className="w-16 text-center border border-slate-200 rounded p-1" defaultValue={18} />
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-800 border-l border-slate-100">85</td>
                      <td className="px-4 py-3 text-center font-black text-emerald-600">4</td>
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-center font-medium">2</td>
                      <td className="px-4 py-3 font-medium text-slate-800">สมหญิง ใจเย็น</td>
                      <td className="px-4 py-3 text-center border-l border-slate-100">
                        <input type="number" className="w-16 text-center border border-slate-200 rounded p-1" defaultValue={48} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input type="number" className="w-16 text-center border border-slate-200 rounded p-1" defaultValue={12} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input type="number" className="w-16 text-center border border-slate-200 rounded p-1" defaultValue={16} />
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-800 border-l border-slate-100">76</td>
                      <td className="px-4 py-3 text-center font-black text-emerald-600">3.5</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
                  <CheckCircle className="h-4 w-4" /> บันทึกข้อมูล
                </button>
              </div>

            </div>
          )}

          {activeTab === 'attendance' && (
            <AttendanceSummary 
              systemAcademicYear={systemAcademicYear}
              systemSemester={systemSemester}
            />
          )}

          </div>
        </div>
      </div>
    </div>
  );
};
