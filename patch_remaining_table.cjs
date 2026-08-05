const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

const bannerTarget = `{curriculums.length > 0 && totalRemaining > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-rose-700">มีตัวชี้วัดที่ยังไม่ได้ถูกใช้งาน (คงเหลือ)</p>
                <p className="text-[10px] text-rose-600 mt-0.5">คุณมีตัวชี้วัดที่ยังไม่ได้ระบุในแผนการสอนใดเลย จำนวน {totalRemaining} ตัวชี้วัด กรุณาตรวจสอบและเลือกใช้ให้ครบถ้วนในภาคเรียนนี้</p>
              </div>
            </div>
          )}`;

const bannerReplacement = `{curriculums.length > 0 && totalRemaining > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col gap-3 mb-4 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-rose-800">มีตัวชี้วัดที่ยังไม่ได้ถูกใช้งาน (คงเหลือ)</p>
                  <p className="text-[11px] text-rose-600 mt-1">คุณมีตัวชี้วัดที่ยังไม่ได้ระบุในแผนการสอนใดเลย จำนวน {totalRemaining} ตัวชี้วัด กรุณาตรวจสอบและเลือกใช้ให้ครบถ้วนในภาคเรียนนี้</p>
                </div>
              </div>
              <div className="mt-2 bg-white rounded-lg border border-rose-100 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar max-h-60">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-rose-50/50 text-rose-700 font-bold border-b border-rose-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 w-24">รหัสตัวชี้วัด</th>
                        <th className="px-3 py-2 min-w-[250px]">คำอธิบาย</th>
                        <th className="px-3 py-2 w-28 text-center">ประเภท</th>
                        <th className="px-3 py-2 w-32">มาตรฐาน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50">
                      {curriculums.map(curr => 
                        curr.standards.map((std: any) => 
                          std.indicators.map((ind: any) => {
                            if (usedIndicators.has(ind.code)) return null;
                            return (
                              <tr key={ind.id || ind.code} className="hover:bg-rose-50/30 transition-colors">
                                <td className="px-3 py-2 font-bold text-rose-700">{ind.code}</td>
                                <td className="px-3 py-2 text-slate-700 whitespace-normal min-w-[250px]">{ind.description}</td>
                                <td className="px-3 py-2 text-center">
                                  <span className={\`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold \${ind.type === 'core' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}\`}>
                                    {ind.type === 'core' ? 'ระหว่างทาง' : 'ปลายทาง'}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-slate-500 font-medium truncate max-w-[150px]" title={std.title}>{std.title}</td>
                              </tr>
                            );
                          })
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}`;

code = code.replace(bannerTarget, bannerReplacement);
fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
