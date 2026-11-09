import React, { useState, useMemo } from 'react';
import { 
  X, 
  UserMinus, 
  Download, 
  Search, 
  School, 
  Users, 
  User, 
  UserCheck, 
  ShieldAlert, 
  ArrowUpRight, 
  Filter, 
  Building2, 
  Phone, 
  FileSpreadsheet,
  Eye,
  Info
} from 'lucide-react';
import { Student } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ResignedStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onViewStudent360?: (student: Student) => void;
}

export function ResignedStudentsModal({ 
  isOpen, 
  onClose, 
  students,
  onViewStudent360 
}: ResignedStudentsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'roster'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');

  // Filter only resigned/inactive students (status === 'inactive')
  const inactiveStudents = useMemo(() => {
    return students.filter(s => s.status === 'inactive');
  }, [students]);

  // Statistics calculation by grade
  const stats = useMemo(() => {
    const summary = inactiveStudents.reduce((acc, student) => {
      const rawGrade = student.gradeLevel || 'ไม่ระบุชั้น';
      const grade = rawGrade.replace(/\s*\(ป\..*\)/g, '').trim();

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
  }, [inactiveStudents]);

  const sortGrades = (a: string, b: string) => {
    const isKinderA = a.startsWith('อนุบาล');
    const isKinderB = b.startsWith('อนุบาล');
    if (isKinderA && !isKinderB) return -1;
    if (!isKinderA && isKinderB) return 1;
    return a.localeCompare(b, 'th-TH', { numeric: true });
  };

  const shortenGrade = (grade: string) => {
    return grade
      .replace('อนุบาล ', 'อ.')
      .replace('อนุบาล', 'อ.')
      .replace('ประถมศึกษาปีที่ ', 'ป.')
      .replace('ประถมศึกษาปีที่', 'ป.');
  };

  const chartData = useMemo(() => {
    return Object.keys(stats).sort(sortGrades).map(grade => ({
      name: shortenGrade(grade),
      ชาย: stats[grade].male,
      หญิง: stats[grade].female,
      รวม: stats[grade].total
    }));
  }, [stats]);

  const totalMale = inactiveStudents.filter(s => s.gender === 'male').length;
  const totalFemale = inactiveStudents.filter(s => s.gender === 'female').length;
  const withDestinationCount = inactiveStudents.filter(s => !!s.destinationSchool?.trim()).length;

  // Destination schools frequency
  const destinationSchoolsList = useMemo(() => {
    const map = new Map<string, number>();
    inactiveStudents.forEach(s => {
      const dest = (s.destinationSchool || '').trim();
      if (dest) {
        map.set(dest, (map.get(dest) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([school, count]) => ({ school, count }))
      .sort((a, b) => b.count - a.count);
  }, [inactiveStudents]);

  // Unique grades for filter dropdown
  const gradeOptions = useMemo(() => {
    const set = new Set<string>();
    inactiveStudents.forEach(s => {
      if (s.gradeLevel) set.add(s.gradeLevel.replace(/\s*\(ป\..*\)/g, '').trim());
    });
    return Array.from(set).sort(sortGrades);
  }, [inactiveStudents]);

  // Filtered roster list
  const filteredRoster = useMemo(() => {
    return inactiveStudents.filter(s => {
      const cleanGrade = (s.gradeLevel || '').replace(/\s*\(ป\..*\)/g, '').trim();
      if (selectedGradeFilter !== 'all' && cleanGrade !== selectedGradeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
        const nickname = (s.nickname || '').toLowerCase();
        const studentId = (s.studentId || '').toLowerCase();
        const dest = (s.destinationSchool || '').toLowerCase();
        const parent = (s.parentName || s.fatherName || s.motherName || '').toLowerCase();
        return fullName.includes(q) || nickname.includes(q) || studentId.includes(q) || dest.includes(q) || parent.includes(q);
      }
      return true;
    });
  }, [inactiveStudents, selectedGradeFilter, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    if (inactiveStudents.length === 0) {
      alert('ไม่มีข้อมูลนักเรียนย้าย/ลาออกสำหรับส่งออก');
      return;
    }

    const headers = [
      'ลำดับ',
      'รหัสนักเรียน',
      'เลขที่',
      'คำนำหน้า/เพศ',
      'ชื่อ',
      'นามสกุล',
      'ชื่อเล่น',
      'ระดับชั้นเดิม',
      'สถานะ',
      'สถานศึกษาที่ศึกษาต่อ/ย้ายไป',
      'ชื่อผู้ปกครอง',
      'เบอร์โทรศัพท์ผู้ปกครอง',
      'หมายเหตุเพิ่มเติม'
    ];

    const escape = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = inactiveStudents.map((s, index) => [
      index + 1,
      escape(s.studentId),
      escape(s.number || '-'),
      escape(s.gender === 'male' ? 'ชาย' : 'หญิง'),
      escape(s.firstName),
      escape(s.lastName),
      escape(s.nickname || ''),
      escape(s.gradeLevel || ''),
      escape('ย้าย/ออก'),
      escape(s.destinationSchool || 'ยังไม่ระบุ'),
      escape(s.parentName || s.fatherName || s.motherName || ''),
      escape(s.parentPhone || s.fatherPhone || s.motherPhone || ''),
      escape(s.additionalNotes || '')
    ].join(','));

    const csvContent = [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `รายงานสถิตินักเรียนย้าย_ลาออก_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 p-5 sm:p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md shadow-inner">
              <UserMinus className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-xl tracking-tight">
                  สรุปสถิตินักเรียนที่ย้าย / ลาออก
                </h3>
                <span className="bg-rose-900/60 text-rose-100 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-400/40 uppercase tracking-wider">
                  Admin Only
                </span>
              </div>
              <p className="text-rose-100/90 text-xs mt-0.5 font-medium">
                รายงานสถิติ บัญชีรายชื่อ และสถานศึกษาปลายทางของนักเรียนที่จำหน่ายออกจากระบบ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action & Tab Bar */}
        <div className="bg-white border-b border-slate-100 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ภาพรวมสถิติและกราฟ
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'roster'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>บัญชีรายชื่อนักเรียน</span>
              <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {inactiveStudents.length}
              </span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={inactiveStudents.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="ดาวน์โหลดไฟล์ CSV สำหรับเปิดใน Excel หรือ Google Sheets"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>ส่งออก Excel / CSV</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar bg-slate-50/70 flex-1 space-y-6">

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-rose-100 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <UserMinus className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-500">ย้าย/ลาออกทั้งหมด</p>
                <p className="text-xl sm:text-2xl font-black text-rose-600 leading-tight">
                  {inactiveStudents.length} <span className="text-xs font-bold text-slate-400">คน</span>
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-xs border border-sky-100 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-500">นักเรียนชาย</p>
                <p className="text-xl sm:text-2xl font-black text-sky-700 leading-tight">
                  {totalMale} <span className="text-xs font-bold text-slate-400">คน</span>
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-xs border border-pink-100 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-500">นักเรียนหญิง</p>
                <p className="text-xl sm:text-2xl font-black text-pink-700 leading-tight">
                  {totalFemale} <span className="text-xs font-bold text-slate-400">คน</span>
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-xs border border-amber-100 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <School className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-500">ระบุที่เรียนต่อ</p>
                <p className="text-xl sm:text-2xl font-black text-amber-700 leading-tight">
                  {withDestinationCount} <span className="text-xs font-bold text-slate-400">คน</span>
                </p>
              </div>
            </div>
          </div>

          {inactiveStudents.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <div className="h-16 w-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-8 w-8" />
              </div>
              <h4 className="font-bold text-slate-700 text-base">ไม่พบข้อมูลนักเรียนที่มีสถานะย้ายหรือลาออกในระบบ</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                เมื่อมีการเปลี่ยนสถานะนักเรียนเป็น "ย้าย/ออก" ในระบบจัดการชั้นเรียน ข้อมูลสถิติและรายชื่อจะปรากฏในหน้านี้ทันที
              </p>
            </div>
          ) : activeTab === 'overview' ? (
            <div className="space-y-6">
              
              {/* Chart Section */}
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      แผนภูมิแสดงจำนวนนักเรียนย้าย/ลาออก จำแนกตามระดับชั้น
                    </h4>
                    <p className="text-xs text-slate-500">เปรียบเทียบสัดส่วนระหว่างนักเรียนชายและนักเรียนหญิง</p>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                      <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: '#fff1f2' }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #fed7aa', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.08)' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }} />
                      <Bar dataKey="ชาย" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="หญิง" fill="#fb7185" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Grid: Grade Breakdown Table & Destination Schools */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Table Breakdown */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800">ตารางจำแนกตามระดับชั้น</h4>
                    <span className="text-xs font-semibold text-slate-500">
                      ทั้งหมด {Object.keys(stats).length} ระดับชั้น
                    </span>
                  </div>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <th className="py-2.5 px-4">ระดับชั้น</th>
                        <th className="py-2.5 px-3 text-center text-sky-600">ชาย</th>
                        <th className="py-2.5 px-3 text-center text-pink-600">หญิง</th>
                        <th className="py-2.5 px-4 text-center">รวม (คน)</th>
                        <th className="py-2.5 px-4 text-right">สัดส่วน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Object.keys(stats).sort(sortGrades).map(grade => {
                        const count = stats[grade].total;
                        const pct = inactiveStudents.length > 0 
                          ? ((count / inactiveStudents.length) * 100).toFixed(1)
                          : '0';
                        return (
                          <tr key={grade} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-4 font-bold text-slate-700">{grade}</td>
                            <td className="py-2.5 px-3 text-center text-sky-700 font-semibold">{stats[grade].male}</td>
                            <td className="py-2.5 px-3 text-center text-pink-700 font-semibold">{stats[grade].female}</td>
                            <td className="py-2.5 px-4 text-center font-black text-rose-600">{count}</td>
                            <td className="py-2.5 px-4 text-right font-medium text-slate-500">{pct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Top Destination Schools Card */}
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                    <Building2 className="h-4 w-4 text-amber-600" />
                    <h4 className="text-sm font-bold text-slate-800">สถานศึกษาปลายทาง</h4>
                  </div>

                  {destinationSchoolsList.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                      <School className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-xs font-semibold">ยังไม่มีการบันทึกสถานศึกษาปลายทาง</p>
                      <p className="text-[10px] mt-1 text-slate-400">สามารถระบุได้ในเมนูแก้ไขข้อมูลนักเรียน</p>
                    </div>
                  ) : (
                    <div className="space-y-2 flex-1 overflow-y-auto max-h-56 pr-1 custom-scrollbar">
                      {destinationSchoolsList.map(({ school, count }, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-amber-50/50 transition-colors text-xs border border-slate-100">
                          <span className="font-bold text-slate-700 truncate pr-2" title={school}>
                            {i + 1}. {school}
                          </span>
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-black text-[11px] shrink-0">
                            {count} คน
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>ระบุที่เรียนแล้ว</span>
                    <span className="font-bold text-slate-600">{withDestinationCount} / {inactiveStudents.length} คน</span>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* Tab: Roster List */
            <div className="space-y-4">
              
              {/* Filter & Search Bar */}
              <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาชื่อ, รหัส, โรงเรียนปลายทาง..."
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-600 whitespace-nowrap">ระดับชั้น:</span>
                  <select
                    value={selectedGradeFilter}
                    onChange={e => setSelectedGradeFilter(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none bg-white font-medium"
                  >
                    <option value="all">ทุกระดับชั้น ({inactiveStudents.length})</option>
                    {gradeOptions.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Roster Table */}
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <th className="py-3 px-3 text-center w-12">เลขที่</th>
                        <th className="py-3 px-3">รหัสนักเรียน</th>
                        <th className="py-3 px-4">ชื่อ - สกุล</th>
                        <th className="py-3 px-3">ระดับชั้นเดิม</th>
                        <th className="py-3 px-4">สถานศึกษาที่ศึกษาต่อ / ย้ายไป</th>
                        <th className="py-3 px-3">ผู้ปกครอง / เบอร์ติดต่อ</th>
                        <th className="py-3 px-3 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRoster.length > 0 ? (
                        filteredRoster.map(student => (
                          <tr key={student.id} className="hover:bg-rose-50/30 transition-colors">
                            <td className="py-3 px-3 text-center font-bold text-slate-500">
                              {student.number || '-'}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-700">
                              {student.studentId}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  student.gender === 'male' ? 'bg-sky-50 text-sky-600' : 'bg-pink-50 text-pink-600'
                                }`}>
                                  {student.gender === 'male' ? 'ช' : 'ญ'}
                                </span>
                                <span className="font-bold text-slate-800">
                                  {student.firstName} {student.lastName}
                                </span>
                                {student.nickname && (
                                  <span className="text-slate-400 font-normal">({student.nickname})</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 font-medium text-slate-600 whitespace-nowrap">
                              {student.gradeLevel || '-'}
                            </td>
                            <td className="py-3 px-4">
                              {student.destinationSchool ? (
                                <span className="font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 inline-flex items-center gap-1.5">
                                  <School className="h-3 w-3 text-amber-600 shrink-0" />
                                  <span className="truncate max-w-[200px]">{student.destinationSchool}</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">- ยังไม่ระบุ -</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              <div className="leading-tight">
                                <span className="font-medium">{student.parentName || student.fatherName || student.motherName || '-'}</span>
                                {(student.parentPhone || student.fatherPhone || student.motherPhone) && (
                                  <span className="block text-[11px] text-slate-400 mt-0.5">
                                    {student.parentPhone || student.fatherPhone || student.motherPhone}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {onViewStudent360 && (
                                <button
                                  onClick={() => onViewStudent360(student)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                                  title="ดูข้อมูล 360 องศาของนักเรียน"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>360°</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                            ไม่พบรายชื่อนักเรียนที่ตรงกับเงื่อนไขการค้นหา
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-100 p-4 px-6 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-slate-400" />
            <span>
              ข้อมูลจะถูกกรองออกจากยอดนักเรียนปกติในห้องเรียน และแยกเก็บเป็นประวัติการจำหน่ายนักเรียน
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
