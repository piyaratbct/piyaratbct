const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

const uiCode = `                {gradesSubTab === 'attendance' ? (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-center w-16 border-r border-slate-200">เลขที่</th>
                        <th className="px-4 py-3 w-60 border-r border-slate-200">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-3 text-center border-r border-slate-200 text-emerald-600">มาเรียน</th>
                        <th className="px-4 py-3 text-center border-r border-slate-200 text-amber-500">สาย</th>
                        <th className="px-4 py-3 text-center border-r border-slate-200 text-sky-500">ลากิจ</th>
                        <th className="px-4 py-3 text-center border-r border-slate-200 text-purple-500">ลาป่วย</th>
                        <th className="px-4 py-3 text-center border-r border-slate-200 text-rose-500">ขาดเรียน</th>
                        <th className="px-4 py-3 text-center border-r border-slate-200">รวม (ครั้ง)</th>
                        <th className="px-4 py-3 text-center border-r border-slate-200">เวลาเรียนเต็ม (คาบ)</th>
                        <th className="px-4 py-3 text-center">ร้อยละ (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((student) => {
                        const stats = attendanceStats.studentStats[student.id];
                        const totalAttended = stats.present + stats.late;
                        const totalRecords = stats.present + stats.late + stats.leave + stats.sick + stats.absent;
                        
                        // Percentage can be calculated from target periods or total records if target periods is 0
                        const baseTotal = attendanceStats.totalTargetPeriods > 0 ? attendanceStats.totalTargetPeriods : totalRecords;
                        const percentage = baseTotal > 0 ? (totalAttended / baseTotal) * 100 : 0;
                        const isAtRisk = baseTotal > 0 && percentage < 80;

                        return (
                          <tr key={student.id} className={\`hover:bg-slate-50 transition-colors \${isAtRisk ? 'bg-rose-50/30' : ''}\`}>
                            <td className="px-4 py-3 text-center border-r border-slate-200 text-slate-500">{student.number}</td>
                            <td className="px-4 py-3 border-r border-slate-200 font-medium">
                              <div className="flex items-center gap-2">
                                <span>{student.firstName} {student.lastName}</span>
                                {isAtRisk && <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold" title="เวลาเรียนไม่ถึง 80% (ไม่มีสิทธิ์สอบ)">มส.</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center border-r border-slate-200 text-emerald-600 font-medium">{stats.present}</td>
                            <td className="px-4 py-3 text-center border-r border-slate-200 text-amber-500 font-medium">{stats.late}</td>
                            <td className="px-4 py-3 text-center border-r border-slate-200 text-sky-500 font-medium">{stats.leave}</td>
                            <td className="px-4 py-3 text-center border-r border-slate-200 text-purple-500 font-medium">{stats.sick}</td>
                            <td className="px-4 py-3 text-center border-r border-slate-200 text-rose-500 font-medium">{stats.absent}</td>
                            <td className="px-4 py-3 text-center border-r border-slate-200 font-bold text-slate-700">{totalAttended}</td>
                            <td className="px-4 py-3 text-center border-r border-slate-200 text-slate-500">{baseTotal}</td>
                            <td className={\`px-4 py-3 text-center font-bold \${isAtRisk ? 'text-rose-600' : 'text-emerald-600'}\`}>
                              {percentage.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : gradesSubTab === 'part1' && subjectSettings ? (`;

code = code.replace(
  "{gradesSubTab === 'part1' && subjectSettings ? (", 
  uiCode
);

fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf-8');
console.log("Patched attendance UI");
