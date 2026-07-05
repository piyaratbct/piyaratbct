import React from 'react';
import { Trophy, TrendingUp, Users, Target, Activity, Award, AlertCircle, CheckCircle2, BarChart2, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

export function LessonAchieve() {
  const gradeData = [
    { name: 'เกรด 4', students: 45 },
    { name: 'เกรด 3.5', students: 30 },
    { name: 'เกรด 3', students: 35 },
    { name: 'เกรด 2.5', students: 20 },
    { name: 'เกรด 2', students: 15 },
    { name: 'เกรด 1.5', students: 10 },
    { name: 'เกรด 1', students: 5 },
  ];

  const behaviorData = [
    { name: 'ดีเยี่ยม', value: 65, color: '#10b981' },
    { name: 'ดี', value: 25, color: '#3b82f6' },
    { name: 'ปานกลาง', value: 8, color: '#f59e0b' },
    { name: 'ต้องปรับปรุง', value: 2, color: '#ef4444' },
  ];

  const subjectScoresData = [
    { subject: 'คณิตศาสตร์', 'ป.4': 75, 'ป.5': 78, 'ป.6': 72 },
    { subject: 'วิทยาศาสตร์', 'ป.4': 80, 'ป.5': 82, 'ป.6': 79 },
    { subject: 'ภาษาไทย', 'ป.4': 85, 'ป.5': 84, 'ป.6': 86 },
    { subject: 'อังกฤษ', 'ป.4': 70, 'ป.5': 68, 'ป.6': 74 },
    { subject: 'สังคมศึกษา', 'ป.4': 82, 'ป.5': 85, 'ป.6': 83 },
  ];

  const individualStudentData = [
    { subject: 'คณิตศาสตร์', score: 85, avg: 72 },
    { subject: 'วิทยาศาสตร์', score: 90, avg: 79 },
    { subject: 'ภาษาไทย', score: 78, avg: 86 },
    { subject: 'อังกฤษ', score: 88, avg: 74 },
    { subject: 'สังคมศึกษา', score: 82, avg: 83 },
  ];

  const atRiskStudents = [
    { id: 1, name: 'ด.ช. สมพล รักเรียน', class: 'ป.4/1', issue: 'ขาดเรียนบ่อย (3 ครั้งในเดือนนี้)', severity: 'high' },
    { id: 2, name: 'ด.ญ. มาลี สุขใจ', class: 'ป.5/2', issue: 'คะแนนสอบกลางภาคต่ำกว่าเกณฑ์', severity: 'medium' },
    { id: 3, name: 'ด.ช. ชัยชาญ มุ่งมั่น', class: 'ป.6/1', issue: 'ไม่ส่งงานวิชาคณิตศาสตร์ 4 ชิ้น', severity: 'medium' },
  ];

  return (
    <div className="space-y-6 print:space-y-4 print:p-4">
      {/* Action Header */}
      <div className="flex justify-between items-center print:hidden mb-4">
        <h2 className="text-xl font-black text-slate-800">สรุปผลสัมฤทธิ์</h2>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold text-sm shadow-sm"
        >
          <Printer className="h-4 w-4" />
          พิมพ์รายงาน (PDF)
        </button>
      </div>

      {/* Header Alert */}
      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-3 print:hidden">
        <Activity className="h-5 w-5 text-indigo-500 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-indigo-900">ตัวอย่าง (Mockup) การแสดงผลข้อมูลผลสัมฤทธิ์</h4>
          <p className="text-xs text-indigo-700 mt-1">
            ส่วนนี้เป็นการจำลอง Dashboard สำหรับการวัดและประเมินผลผู้เรียน เพื่อให้เห็นภาพรวมของข้อมูลที่ควรนำมาแสดง
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">อัตราการเข้าเรียนเฉลี่ย</p>
            <p className="text-xl font-black text-slate-800">94.5%</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">คะแนนเฉลี่ยรวม</p>
            <p className="text-xl font-black text-slate-800">76.8 / 100</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">บรรลุตัวชี้วัด</p>
            <p className="text-xl font-black text-slate-800">82%</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">กลุ่มเสี่ยงที่ต้องดูแล</p>
            <p className="text-xl font-black text-rose-600">3 <span className="text-xs font-medium text-slate-500">คน</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Scores Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-6">
            <BarChart2 className="h-4 w-4 text-slate-400" />
            เปรียบเทียบคะแนนเฉลี่ยรายวิชา จำแนกตามระดับชั้น
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectScoresData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                <Bar dataKey="ป.4" name="ชั้นประถมศึกษาปีที่ 4" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="ป.5" name="ชั้นประถมศึกษาปีที่ 5" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="ป.6" name="ชั้นประถมศึกษาปีที่ 6" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-6">
            <TrendingUp className="h-4 w-4 text-slate-400" />
            การกระจายตัวของระดับผลการเรียน (เกรด)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="students" name="จำนวนนักเรียน" radius={[4, 4, 0, 0]}>
                  {gradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index < 3 ? '#3b82f6' : index < 5 ? '#8b5cf6' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Behavior Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-slate-400" />
            การประเมินคุณลักษณะอันพึงประสงค์
          </h3>
          <div className="flex-1 flex items-center justify-center relative">
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={behaviorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {behaviorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center mt-2">
                  <span className="block text-2xl font-black text-slate-700">160</span>
                  <span className="block text-xs text-slate-400">คนทั้งหมด</span>
                </div>
             </div>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {behaviorData.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-[10px] text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Individual Student Radar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-6">
            <Award className="h-4 w-4 text-slate-400" />
            เปรียบเทียบคะแนนรายบุคคล (ด.ช. สมพล รักเรียน)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={individualStudentData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Radar name="คะแนนนักเรียน" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Radar name="ค่าเฉลี่ยห้อง" dataKey="avg" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* At-risk Students List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
          <AlertCircle className="h-4 w-4 text-rose-500" />
          รายชื่อนักเรียนที่ต้องติดตาม (Early Warning System)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 rounded-tl-xl font-bold">ชื่อ - สกุล</th>
                <th className="px-4 py-3 font-bold">ชั้นเรียน</th>
                <th className="px-4 py-3 font-bold">ประเด็นที่พบ</th>
                <th className="px-4 py-3 rounded-tr-xl font-bold text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {atRiskStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                  <td className="px-4 py-3 text-slate-600">{student.class}</td>
                  <td className="px-4 py-3 text-slate-600">{student.issue}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      student.severity === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {student.severity === 'high' ? 'วิกฤต' : 'เฝ้าระวัง'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
