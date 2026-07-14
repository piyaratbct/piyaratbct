import re

with open('src/components/DisciplineModule.tsx', 'r') as f:
    content = f.read()

target_stats = """  const accidentStats = incidents.filter(i => i.type === 'accident').reduce((acc, curr) => {
    const detail = curr.accidentDetail || 'ไม่ระบุ';
    acc[detail] = (acc[detail] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const accidentChartData = Object.keys(accidentStats).map((detail, index) => {
    const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#2563eb', '#1d4ed8'];
    return {
      name: detail,
      value: accidentStats[detail],
      fill: colors[index % colors.length]
    };
  }).sort((a, b) => b.value - a.value);"""

replacement_stats = """  const accidentStats = incidents.filter(i => i.type === 'accident').reduce((acc, curr) => {
    const detail = curr.accidentDetail || 'ไม่ระบุ';
    acc[detail] = (acc[detail] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const accidentChartData = Object.keys(accidentStats).map((detail, index) => {
    const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#2563eb', '#1d4ed8'];
    return {
      name: detail,
      value: accidentStats[detail],
      fill: colors[index % colors.length]
    };
  }).sort((a, b) => b.value - a.value);

  const accidentGradeLevelStats = incidents.filter(i => i.type === 'accident').reduce((acc, curr) => {
    curr.studentIds?.forEach(studentId => {
      const student = students.find(s => s.id === studentId);
      if (student && student.gradeLevel) {
        acc[student.gradeLevel] = (acc[student.gradeLevel] || 0) + 1;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  const accidentGradeLevelChartData = Object.keys(accidentGradeLevelStats).map((gradeLevel, index) => {
    const colors = ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#d97706', '#b45309'];
    return {
      name: gradeLevel,
      value: accidentGradeLevelStats[gradeLevel],
      fill: colors[index % colors.length]
    };
  }).sort((a, b) => b.value - a.value);"""

content = content.replace(target_stats, replacement_stats)

target_grid = """        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">"""
replacement_grid = """        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">"""
content = content.replace(target_grid, replacement_grid)

target_chart = """                  </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>"""
replacement_chart = """                  </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-6">สถิติอุบัติเหตุแยกตามระดับชั้น</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accidentGradeLevelChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {accidentGradeLevelChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>"""
content = content.replace(target_chart, replacement_chart)

with open('src/components/DisciplineModule.tsx', 'w') as f:
    f.write(content)
