const fs = require('fs');

let content = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

if (!content.includes('BASE_GRADE_LEVELS')) {
  content = content.replace(
    /GRADE_LEVELS, SUBJECTS, PERIODS/,
    "GRADE_LEVELS, SUBJECTS, PERIODS, BASE_GRADE_LEVELS"
  );
}

const oldSummary = `<div className="overflow-x-auto">
               <table className="min-w-full bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="py-3 px-4 text-left font-bold">ชื่อ-นามสกุลครูผู้สอน</th>
                      <th className="py-3 px-4 text-left font-bold">การตรวจสอบชั่วโมงเรียนตามหลักสูตร</th>
                      <th className="py-3 px-4 text-center font-bold">คาบสอน/สัปดาห์</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teachers.map(t => {
                      const tScheds = allSchedules.filter(s => s.teacherId === t.id);
                      if (tScheds.length === 0) return null;

                      // Group by grade and subject
                      const classGroups: Record<string, { subject: string, periods: number, days: number[] }> = {};
                      
                      tScheds.forEach(curr => {
                        const subjectName = curr.subject === 'อื่นๆ' ? (curr.customSubject || 'อื่นๆ') : curr.subject;
                        const key = \`\${curr.gradeLevel}_\${subjectName}\`;
                        if (!classGroups[key]) {
                           classGroups[key] = { subject: subjectName, periods: 0, days: [] };
                        }
                        classGroups[key].periods += 1;
                        classGroups[key].days.push(curr.dayOfWeek);
                      });
                      
                      return (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium text-slate-800 align-top whitespace-nowrap">{t.displayName || t.thaiName}</td>
                          <td className="py-3 px-4 text-sm text-slate-600 align-top">
                              <div className="space-y-3">
                                {Object.keys(classGroups).sort().map(key => {
                                  const [grade, ...subArr] = key.split('_');
                                  const sub = subArr.join('_');
                                  const gData = classGroups[key];
                                  
                                  // Calculate actual hours
                                  let actualHours = 0;
                                  if (teachingDaysCount) {
                                     gData.days.forEach(d => {
                                        actualHours += teachingDaysCount[d] || 0;
                                     });
                                  }

                                  // Find required hours from curriculum
                                  const curriculumMatch = curriculums.find(c => c.subjectName === sub && c.gradeLevel === grade);
                                  const requiredHours = curriculumMatch?.requiredHoursPerTerm || 0;
                                  
                                  let statusColor = "bg-slate-100 text-slate-600";
                                  let statusText = "ไม่ได้กำหนดเวลาในหลักสูตร";
                                  
                                  if (requiredHours > 0 && teachingDaysCount) {
                                     if (actualHours === requiredHours) {
                                        statusColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
                                        statusText = "ครบถ้วน (พอดี)";
                                     } else if (actualHours > requiredHours) {
                                        statusColor = "bg-amber-100 text-amber-700 border-amber-200";
                                        statusText = \`เกินมา \${actualHours - requiredHours} ชม.\`;
                                     } else {
                                        statusColor = "bg-rose-100 text-rose-700 border-rose-200";
                                        statusText = \`ขาด \${requiredHours - actualHours} ชม.\`;
                                     }
                                  }

                                  return (
                                    <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded border border-slate-100 bg-white shadow-sm gap-2">
                                      <div className="font-semibold text-slate-700 text-xs">
                                        <span className="text-indigo-600 mr-1">{grade}</span> {sub}
                                      </div>
                                      
                                      <div className="flex items-center gap-3 text-xs">
                                        <div className="flex items-center gap-1">
                                           <span className="text-slate-500">จัดได้:</span>
                                           <span className="font-bold">{teachingDaysCount ? actualHours : '-'}</span>
                                           <span className="text-slate-400">/</span>
                                           <span className="font-bold">{requiredHours || '?'}</span>
                                           <span className="text-slate-500">ชม.</span>
                                        </div>
                                        <div className={\`px-2 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap \${statusColor}\`}>
                                           {statusText}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                          </td>
                          <td className="py-3 px-4 text-center text-sm font-bold text-indigo-600 align-top">{tScheds.length} คาบ</td>
                        </tr>
                      )
                    })}
                  </tbody>
               </table>
            </div>`;

const newSummary = `<div className="space-y-8">
              {BASE_GRADE_LEVELS.map(baseGrade => {
                // Find all schedules that belong to this base grade (e.g. "ประถมศึกษาปีที่ 1" matches "ประถมศึกษาปีที่ 1/1", etc.)
                const gradeSchedules = allSchedules.filter(s => s.gradeLevel && s.gradeLevel.startsWith(baseGrade));
                if (gradeSchedules.length === 0) return null;

                // Group by actual grade room and subject
                const classGroups: Record<string, { subject: string, periods: number, days: number[], teachers: Set<string> }> = {};
                
                gradeSchedules.forEach(curr => {
                  const subjectName = curr.subject === 'อื่นๆ' ? (curr.customSubject || 'อื่นๆ') : curr.subject;
                  const key = \`\${curr.gradeLevel}_\${subjectName}\`;
                  if (!classGroups[key]) {
                     classGroups[key] = { subject: subjectName, periods: 0, days: [], teachers: new Set() };
                  }
                  classGroups[key].periods += 1;
                  classGroups[key].days.push(curr.dayOfWeek);
                  
                  const teacher = teachers.find(t => t.id === curr.teacherId);
                  if (teacher) {
                    classGroups[key].teachers.add(teacher.displayName || teacher.thaiName || '');
                  }
                });

                return (
                  <div key={baseGrade} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-4">
                      <h3 className="font-black text-indigo-900 text-lg">{baseGrade}</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                          <tr>
                            <th className="py-3 px-6 font-bold w-48">ห้องเรียน</th>
                            <th className="py-3 px-6 font-bold">รายวิชา</th>
                            <th className="py-3 px-6 font-bold w-48">ครูผู้สอน</th>
                            <th className="py-3 px-6 font-bold w-48">เวลาเรียนที่จัดได้</th>
                            <th className="py-3 px-6 font-bold w-48">เป้าหมายตามหลักสูตร</th>
                            <th className="py-3 px-6 font-bold w-40">สถานะ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {Object.keys(classGroups).sort().map(key => {
                            const [gradeRoom, ...subArr] = key.split('_');
                            const sub = subArr.join('_');
                            const gData = classGroups[key];
                            
                            // Calculate actual hours
                            let actualHours = 0;
                            if (teachingDaysCount) {
                               gData.days.forEach(d => {
                                  actualHours += teachingDaysCount[d] || 0;
                               });
                            }

                            // Find required hours from curriculum (try exact match first, then base grade match)
                            let curriculumMatch = curriculums.find(c => c.subjectName === sub && c.gradeLevel === gradeRoom);
                            if (!curriculumMatch) {
                               curriculumMatch = curriculums.find(c => c.subjectName === sub && c.gradeLevel === baseGrade);
                            }
                            
                            const requiredHours = curriculumMatch?.requiredHoursPerTerm || 0;
                            
                            let statusColor = "bg-slate-100 text-slate-600";
                            let statusText = "ไม่ได้กำหนดเวลา";
                            
                            if (requiredHours > 0 && teachingDaysCount) {
                               if (actualHours === requiredHours) {
                                  statusColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
                                  statusText = "ครบถ้วน";
                               } else if (actualHours > requiredHours) {
                                  statusColor = "bg-amber-100 text-amber-700 border-amber-200";
                                  statusText = \`เกินมา \${actualHours - requiredHours} ชม.\`;
                               } else {
                                  statusColor = "bg-rose-100 text-rose-700 border-rose-200";
                                  statusText = \`ขาด \${requiredHours - actualHours} ชม.\`;
                               }
                            }

                            return (
                              <tr key={key} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-6 font-semibold text-slate-800">{gradeRoom}</td>
                                <td className="py-3 px-6 text-slate-700">{sub}</td>
                                <td className="py-3 px-6 text-slate-600">{Array.from(gData.teachers).join(', ')}</td>
                                <td className="py-3 px-6">
                                  <span className="font-bold text-indigo-600">{teachingDaysCount ? actualHours : '-'}</span> ชม. 
                                  <span className="text-xs text-slate-400 ml-1">({gData.periods} คาบ/สัปดาห์)</span>
                                </td>
                                <td className="py-3 px-6 text-slate-600">
                                  {requiredHours > 0 ? <><span className="font-bold text-slate-700">{requiredHours}</span> ชม.</> : '-'}
                                </td>
                                <td className="py-3 px-6">
                                  <div className={\`inline-block px-2.5 py-1 rounded-full border text-xs font-bold whitespace-nowrap \${statusColor}\`}>
                                     {statusText}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>`;

content = content.replace(oldSummary, newSummary);
fs.writeFileSync('src/components/ScheduleManager.tsx', content);
console.log("Replaced summary with grade-centric view");
