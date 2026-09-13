const fs = require('fs');

let content = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

const oldLogic = `                // Group by actual grade room and subject
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
                );`;

const newLogic = `                // Group by SUBJECT first, then ROOM
                const subjectGroups: Record<string, Record<string, { periods: number, days: number[], teachers: Set<string> }>> = {};
                
                gradeSchedules.forEach(curr => {
                  const subjectName = curr.subject === 'อื่นๆ' ? (curr.customSubject || 'อื่นๆ') : curr.subject;
                  const room = curr.gradeLevel;
                  
                  if (!subjectGroups[subjectName]) {
                     subjectGroups[subjectName] = {};
                  }
                  if (!subjectGroups[subjectName][room]) {
                     subjectGroups[subjectName][room] = { periods: 0, days: [], teachers: new Set() };
                  }
                  subjectGroups[subjectName][room].periods += 1;
                  subjectGroups[subjectName][room].days.push(curr.dayOfWeek);
                  
                  const teacher = teachers.find(t => t.id === curr.teacherId);
                  if (teacher) {
                    subjectGroups[subjectName][room].teachers.add(teacher.displayName || teacher.thaiName || '');
                  }
                });

                return (
                  <div key={baseGrade} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-4 flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-indigo-600" />
                      <h3 className="font-black text-indigo-900 text-lg">{baseGrade}</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                          <tr>
                            <th className="py-3 px-6 font-bold w-1/4">รายวิชา</th>
                            <th className="py-3 px-6 font-bold w-1/6">เป้าหมาย (ชม./เทอม)</th>
                            <th className="py-3 px-6 font-bold">ข้อมูลการจัดตารางสอนรายห้อง</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {Object.keys(subjectGroups).sort().map(sub => {
                            // Find required hours from curriculum
                            let curriculumMatch = curriculums.find(c => c.subjectName === sub && c.gradeLevel === baseGrade);
                            const requiredHours = curriculumMatch?.requiredHoursPerTerm || 0;
                            
                            const rooms = subjectGroups[sub];
                            
                            return (
                              <tr key={sub} className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-6 font-bold text-slate-800 align-top">{sub}</td>
                                <td className="py-4 px-6 text-slate-600 align-top">
                                  {requiredHours > 0 ? <><span className="font-bold text-indigo-700 text-base">{requiredHours}</span> ชม.</> : '-'}
                                </td>
                                <td className="py-3 px-6">
                                  <div className="space-y-2">
                                    {Object.keys(rooms).sort().map(roomName => {
                                      const rData = rooms[roomName];
                                      let actualHours = 0;
                                      if (teachingDaysCount) {
                                         rData.days.forEach(d => {
                                            actualHours += teachingDaysCount[d] || 0;
                                         });
                                      }
                                      
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
                                        <div key={roomName} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-white shadow-sm gap-2">
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                            <span className="font-bold text-slate-700 w-24">{roomName}</span>
                                            <span className="text-slate-500 text-xs flex items-center gap-1.5">
                                              <User className="h-3 w-3" />
                                              ครู{Array.from(rData.teachers).join(', ')}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-4">
                                            <span className="text-xs text-slate-500 whitespace-nowrap">
                                              จัดได้: <span className="font-bold text-slate-700">{teachingDaysCount ? actualHours : '-'} ชม.</span> 
                                              <span className="ml-1 opacity-70">({rData.periods} คาบ)</span>
                                            </span>
                                            <div className={\`inline-block px-2 py-0.5 rounded-md border text-[10px] font-bold whitespace-nowrap w-24 text-center \${statusColor}\`}>
                                               {statusText}
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );`;

if (content.includes('const classGroups: Record<string, { subject: string, periods: number, days: number[], teachers: Set<string> }> = {};')) {
    content = content.replace(oldLogic, newLogic);
    fs.writeFileSync('src/components/ScheduleManager.tsx', content);
    console.log("Replaced with Subject-centric pivot");
} else {
    console.log("Could not find old logic");
}
