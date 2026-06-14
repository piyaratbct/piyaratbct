import { LessonRecord, SUBJECTS } from '../types';
import { BookOpen, GraduationCap, Calendar, Clock, BarChart3, Presentation } from 'lucide-react';

interface DashboardStatsProps {
  records: LessonRecord[];
}

export function DashboardStats({ records }: DashboardStatsProps) {
  const totalLogs = records.length;

  // Calculate unique grade levels
  const uniqueGrades = new Set(records.map(r => r.gradeLevel)).size;

  // Find most frequent subject
  const subjectCounts: Record<string, number> = {};
  records.forEach(r => {
    const subj = r.subject === 'อื่นๆ' && r.customSubject ? r.customSubject : r.subject;
    subjectCounts[subj] = (subjectCounts[subj] || 0) + 1;
  });

  let topSubject = 'ยังไม่มีข้อมูล';
  let topCount = 0;
  Object.entries(subjectCounts).forEach(([subj, count]) => {
    if (count > topCount) {
      topSubject = subj;
      topCount = count;
    }
  });

  // Last log date
  const lastLogDate = records.length > 0
    ? [...records].sort((a,b) => b.date.localeCompare(a.date))[0].date
    : null;

  // Format date helper th
  const formatThaiDate = (dateString: string | null) => {
    if (!dateString) return 'ไม่มีข้อมูล';
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0]) + 543; // Buddhist Era
      const month = months[parseInt(parts[1]) - 1];
      const day = parseInt(parts[2]);
      return `${day} ${month} ${year}`;
    }
    return dateString;
  };

  // Prepare subject distribution stats
  const subjectDistribution = SUBJECTS.map(subj => {
    const logs = records.filter(p => p.subject === subj);
    return {
      name: subj,
      count: logs.length,
      percentage: totalLogs > 0 ? (logs.length / totalLogs) * 100 : 0
    };
  }).filter(item => item.count > 0 || item.name === 'ภาษาไทย' || item.name === 'คณิตศาสตร์' || item.name === 'วิทยาศาสตร์และเทคโนโลยี');

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition duration-200">
          <div className="p-3 bg-blue-55 rounded-xl bg-blue-50 text-blue-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-600">บันทึกทั้งหมด</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalLogs} <span className="text-xs font-bold text-slate-500">รายการ</span></p>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition duration-200">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-600">ห้องเรียนที่สอน</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{uniqueGrades} <span className="text-xs font-bold text-slate-500">ชั้นเรียน</span></p>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition duration-200">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Presentation className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-600">วิชาที่สอนบ่อยที่สุด</p>
            <p className="text-base font-black text-slate-900 mt-1 truncate max-w-[130px] sm:max-w-none">{topSubject}</p>
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition duration-200">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-600">บันทึกล่าสุดเมื่อ</p>
            <p className="text-sm font-black text-slate-900 mt-1.5">{formatThaiDate(lastLogDate)}</p>
          </div>
        </div>
      </div>

      {/* Visual Chart Bento Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-slate-500" />
          สรุปภาพรวมแยกตามวิชา
        </h3>
        
        {totalLogs === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            เขียนบันทึกวิชาแรกของคุณเพื่อดูสถิติได้ที่นี่
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3.5">
              {subjectDistribution.map((item, index) => {
                const colors = [
                  'bg-blue-500', 
                  'bg-indigo-500', 
                  'bg-emerald-500', 
                  'bg-amber-500', 
                  'bg-rose-500',
                  'bg-sky-500'
                ];
                const barColor = colors[index % colors.length];

                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-600">{item.name}</span>
                      <span className="text-slate-900 font-bold">{item.count} ครั้ง ({Math.round(item.percentage)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${item.percentage || 1}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center border border-slate-100">
              <h4 className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-500" /> 
                บันทึกการสอนดียังไง?
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                การบันทึกหลังสอนเป็นประจำช่วยให้เห็นพัฒนาการของเด็กๆ และจดจำปัญหาเพื่อนำมาปรับปรุงคาบเรียนถัดไปได้อย่างรวดเร็ว
              </p>
              <div className="mt-4 flex gap-4 text-center">
                <div className="flex-1 bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-xl font-bold text-blue-600">{totalLogs}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">บันทึกแล้ว</span>
                </div>
                <div className="flex-1 bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-xl font-bold text-emerald-600">100%</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">ข้อมูลปลอดภัย</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
