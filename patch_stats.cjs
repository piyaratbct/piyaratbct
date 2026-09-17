const fs = require('fs');
let code = fs.readFileSync('src/components/LessonAdmitModule.tsx', 'utf8');

// 1. Add the useMemo blocks for the 3 new stats arrays.
const useMemoInsertionPoint = `  const currentStudentSchoolStats = React.useMemo(() => {`;

const newStatsCode = `
  const surveySourceStats = React.useMemo(() => {
    const stats = {};
    applicants.forEach(app => {
      if (app.surveySource && Array.isArray(app.surveySource)) {
        app.surveySource.forEach(source => {
          // If source is 'อื่นๆ' and there's surveySourceOther, maybe use that or just group as 'อื่นๆ'
          // To keep it simple, group as 'อื่นๆ' or whatever the string is.
          const key = source === 'อื่นๆ' ? (app.surveySourceOther ? \`อื่นๆ (\${app.surveySourceOther})\` : 'อื่นๆ') : source;
          stats[key] = (stats[key] || 0) + 1;
        });
      }
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [applicants]);

  const surveyReasonsStats = React.useMemo(() => {
    const stats = {};
    applicants.forEach(app => {
      if (app.surveyReasons && Array.isArray(app.surveyReasons)) {
        app.surveyReasons.forEach(reason => {
          stats[reason] = (stats[reason] || 0) + 1;
        });
      }
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [applicants]);

  const surveyExpectationsStats = React.useMemo(() => {
    const stats = {};
    applicants.forEach(app => {
      if (app.surveyExpectations && Array.isArray(app.surveyExpectations)) {
        app.surveyExpectations.forEach(exp => {
          stats[exp] = (stats[exp] || 0) + 1;
        });
      }
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [applicants]);

`;

code = code.replace(useMemoInsertionPoint, newStatsCode + useMemoInsertionPoint);

// 2. Add the UI for these 3 stats. We will add them below the current stats.
// Let's find the end of the `gradeStats` and `schoolStats` grid.
// The current grid is:
// <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// ... gradeStats ...
// ... schoolStats ...
// </div>
//
// So we can replace the end of the grid and append another row of charts or just add to the same grid by changing the classes.
// The grid is currently grid-cols-1 lg:grid-cols-2. If we add 3 more, we can just let them wrap in the same grid.

const uiInsertionPoint = `            </div>
          </div>
        )}
      </div>

      {/* Tabs */}`;

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

code = code.replace(
  `            </div>
          </div>
        )}
      </div>

      {/* Tabs */}`,
  newChartsUi + `            </div>
          </div>
        )}
      </div>

      {/* Tabs */}`
);

fs.writeFileSync('src/components/LessonAdmitModule.tsx', code);
console.log('Patched LessonAdmitModule.tsx successfully');
