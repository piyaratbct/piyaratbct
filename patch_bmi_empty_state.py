import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """                {bmiData.length > 0 && (
                  <div className="mb-8 bg-white border border-slate-100 rounded-xl p-5 shadow-sm max-w-lg mx-auto">
                    <h4 className="font-bold text-slate-700 mb-4 text-center">
                      ประเมินน้ำหนัก/ส่วนสูง (BMI) {currentChartMonth && `ประจำเดือน ${formatThaiMonthYear(currentChartMonth + '-01')}`}
                    </h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={bmiData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ percent }) => percent < 0.1 ? '' : `${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {bmiData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value) => [`${value} คน`, 'จำนวน']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}"""

replacement = """                <div className="mb-8 bg-white border border-slate-100 rounded-xl p-5 shadow-sm max-w-lg mx-auto">
                  <h4 className="font-bold text-slate-700 mb-4 text-center">
                    ประเมินน้ำหนัก/ส่วนสูง (BMI) {currentChartMonth && `ประจำเดือน ${formatThaiMonthYear(currentChartMonth + '-01')}`}
                  </h4>
                  <div className="h-64 w-full">
                    {bmiData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={bmiData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ percent }) => percent < 0.1 ? '' : `${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {bmiData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value) => [`${value} คน`, 'จำนวน']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400">
                        ไม่มีข้อมูลน้ำหนัก/ส่วนสูง สำหรับเดือนนี้
                      </div>
                    )}
                  </div>
                </div>"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
