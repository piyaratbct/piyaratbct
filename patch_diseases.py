import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target1 = """            const specialCareData = [
              { name: 'แพ้อาหาร', value: allAllergicFoodStudents.length, fill: '#f97316' },
              { name: 'โรคประจำตัว', value: allCongenitalDiseaseStudents.length, fill: '#a855f7' },
              { name: 'แพ้ยา', value: allergicMedStudents.length, fill: '#e11d48' },
              { name: 'อื่นๆ', value: otherMedicalStudents.length, fill: '#d97706' },
            ].filter(item => item.value > 0);"""

replacement1 = """            const specialCareData = [
              { name: 'แพ้อาหาร', value: allAllergicFoodStudents.length, fill: '#f97316' },
              { name: 'โรคประจำตัว', value: allCongenitalDiseaseStudents.length, fill: '#a855f7' },
              { name: 'แพ้ยา', value: allergicMedStudents.length, fill: '#e11d48' },
              { name: 'อื่นๆ', value: otherMedicalStudents.length, fill: '#d97706' },
            ].filter(item => item.value > 0);

            const diseaseCount: Record<string, number> = {};
            allCongenitalDiseaseStudents.forEach(s => {
              if (s.congenitalDisease) {
                const diseases = s.congenitalDisease.split(',').map(d => d.trim()).filter(Boolean);
                diseases.forEach(d => {
                  diseaseCount[d] = (diseaseCount[d] || 0) + 1;
                });
              }
            });

            const diseaseColors = ['#8b5cf6', '#d946ef', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'];
            const diseaseData = Object.entries(diseaseCount)
              .map(([name, value], index) => ({
                name,
                value,
                fill: diseaseColors[index % diseaseColors.length]
              }))
              .sort((a, b) => b.value - a.value);"""

content = content.replace(target1, replacement1)

target2 = """                  {/* Chart Section */}
                  <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                    <h4 className="font-bold text-slate-700 mb-4 text-center">สถิติข้อมูลสุขภาพ</h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={specialCareData}
                          margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                          <YAxis 
                            tickFormatter={(val) => `${((val / (students.length || 1)) * 100).toFixed(0)}%`} 
                            tick={{ fontSize: 12, fill: '#64748b' }} 
                            axisLine={false} 
                            tickLine={false} 
                            domain={[0, 'dataMax']}
                          />
                          <RechartsTooltip 
                            formatter={(value) => [`${value} คน (${((Number(value) / (students.length || 1)) * 100).toFixed(1)}%)`, 'จำนวน']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: '#f1f5f9' }}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
                            {specialCareData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>"""

replacement2 = """                  {/* Chart Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                      <h4 className="font-bold text-slate-700 mb-4 text-center">สถิติข้อมูลสุขภาพ</h4>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={specialCareData}
                            margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                            <YAxis 
                              tickFormatter={(val) => `${((val / (students.length || 1)) * 100).toFixed(0)}%`} 
                              tick={{ fontSize: 12, fill: '#64748b' }} 
                              axisLine={false} 
                              tickLine={false} 
                              domain={[0, 'dataMax']}
                            />
                            <RechartsTooltip 
                              formatter={(value) => [`${value} คน (${((Number(value) / (students.length || 1)) * 100).toFixed(1)}%)`, 'จำนวน']}
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              cursor={{ fill: '#f1f5f9' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
                              {specialCareData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                      <h4 className="font-bold text-slate-700 mb-4 text-center">จำแนกตามโรคประจำตัว</h4>
                      <div className="h-64 w-full">
                        {diseaseData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={diseaseData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                              >
                                {diseaseData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                              <RechartsTooltip 
                                formatter={(value) => [`${value} คน`, 'จำนวน']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              />
                              <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-slate-400">
                            ไม่มีข้อมูลโรคประจำตัว
                          </div>
                        )}
                      </div>
                    </div>
                  </div>"""

content = content.replace(target2, replacement2)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
