const fs = require('fs');
let code = fs.readFileSync('src/components/LessonAdmitModule.tsx', 'utf8');

// The replacement failed because the string didn't match perfectly.
// Let's use a simpler marker to find where to insert.
// We know we are inside `showStats && (` block, which ends with:
//               </div>
//             </div>
//           </div>
//         )}
// Let's find `schoolStats` rendering.

const schoolStatsEndMarker = /<\/PieChart>\s*<\/ResponsiveContainer>\s*<\/div>\s*<\/div>/;

const match = schoolStatsEndMarker.exec(code);
if (match) {
  const insertIndex = match.index + match[0].length;
  
  const newChartsUi = `

              {/* Survey Source */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h5 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm">
                  <PieChartIcon className="h-4 w-4 text-emerald-500" /> แหล่งที่ทราบข่าวการรับสมัคร
                </h5>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={surveySourceStats} layout="vertical" margin={{ top: 5, right: 10, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name="จำนวน (คน)">
                        {surveySourceStats.map((entry, index) => (
                          <Cell key={\`cell-\${index}\`} fill={COLORS[(index + 1) % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Survey Reasons */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h5 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-amber-500" /> เหตุผลที่สนใจเข้าเรียน
                </h5>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={surveyReasonsStats} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} name="จำนวน (คน)">
                        {surveyReasonsStats.map((entry, index) => (
                          <Cell key={\`cell-\${index}\`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Survey Expectations */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                <h5 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-purple-500" /> ความคาดหวังเมื่อจบการศึกษา
                </h5>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={surveyExpectationsStats} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="จำนวน (คน)">
                        {surveyExpectationsStats.map((entry, index) => (
                          <Cell key={\`cell-\${index}\`} fill={COLORS[(index + 3) % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
`;

  code = code.slice(0, insertIndex) + newChartsUi + code.slice(insertIndex);
  fs.writeFileSync('src/components/LessonAdmitModule.tsx', code);
  console.log('Successfully injected UI manually!');
} else {
  console.log('Could not find injection point!');
}

