import React, { useMemo } from 'react';
import { Users, X, User, UserCheck } from 'lucide-react';
import { Student } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StudentStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
}

export function StudentStatsModal({ isOpen, onClose, students }: StudentStatsModalProps) {
  const stats = useMemo(() => {
    const summary = students.reduce((acc, student) => {
      // Clean up legacy grade level format that might have "(ป.x/x)"
      const rawGrade = student.gradeLevel || 'ไม่ระบุชั้น';
      const grade = rawGrade.replace(/\s*\(ป\..*\)/g, '');
      
      if (!acc[grade]) {
        acc[grade] = { male: 0, female: 0, total: 0 };
      }
      
      if (student.gender === 'male') {
        acc[grade].male += 1;
      } else if (student.gender === 'female') {
        acc[grade].female += 1;
      }
      
      acc[grade].total += 1;
      return acc;
    }, {} as Record<string, { male: number; female: number; total: number }>);
    
    return summary;
  }, [students]);

  const chartData = useMemo(() => {
    return Object.keys(stats).sort().map(grade => ({
      name: grade,
      ชาย: stats[grade].male,
      หญิง: stats[grade].female,
      รวม: stats[grade].total
    }));
  }, [stats]);

  const totalMale = students.filter(s => s.gender === 'male').length;
  const totalFemale = students.filter(s => s.gender === 'female').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">สถิตินักเรียนในระบบ</h3>
              <p className="text-pink-100 text-xs mt-0.5">
                จำแนกตามระดับชั้นและเพศ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">นักเรียนทั้งหมด</p>
                <p className="text-2xl font-black text-slate-800">{students.length}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-sky-100 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
                <User className="h-6 w-6 text-sky-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-sky-600">นักเรียนชาย</p>
                <p className="text-2xl font-black text-sky-700">{totalMale}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-pink-100 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
                <UserCheck className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-pink-600">นักเรียนหญิง</p>
                <p className="text-2xl font-black text-pink-700">{totalFemale}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 w-full overflow-x-auto">
            <h4 className="text-sm font-bold text-slate-700 mb-4 px-2">แผนภูมิแสดงจำนวนนักเรียนจำแนกตามระดับชั้น</h4>
            <div className="h-64 min-w-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={{stroke: '#cbd5e1'}} />
                  <YAxis tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend wrapperStyle={{paddingTop: '10px'}} />
                  <Bar dataKey="ชาย" stackId="a" fill="#0ea5e9" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="หญิง" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-sm">
                  <th className="py-3 px-4 font-bold border-b border-slate-200">ระดับชั้น</th>
                  <th className="py-3 px-4 font-bold border-b border-slate-200 text-center text-sky-600">ชาย</th>
                  <th className="py-3 px-4 font-bold border-b border-slate-200 text-center text-pink-600">หญิง</th>
                  <th className="py-3 px-4 font-bold border-b border-slate-200 text-center">รวมทั้งหมด</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(stats).length > 0 ? (
                  Object.keys(stats).sort().map((grade) => (
                    <tr key={grade} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm">
                      <td className="py-3 px-4 font-bold text-slate-700">{grade}</td>
                      <td className="py-3 px-4 text-center font-medium text-slate-600 bg-sky-50/30">{stats[grade].male}</td>
                      <td className="py-3 px-4 text-center font-medium text-slate-600 bg-pink-50/30">{stats[grade].female}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">{stats[grade].total}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      ไม่พบข้อมูลนักเรียน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
