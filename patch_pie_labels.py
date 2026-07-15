import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# Fix BMI PieChart
target_bmi = """                            <PieChart>
                              <Pie
                                data={bmiData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => percent < 0.1 ? '' : `${name} ${(percent * 100).toFixed(0)}%`}
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
                            </PieChart>"""

replacement_bmi = """                            <PieChart>
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
                            </PieChart>"""

content = content.replace(target_bmi, replacement_bmi)

# Fix Disease PieChart
target_disease = """                            <PieChart>
                              <Pie
                                data={diseaseData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => percent < 0.1 ? '' : `${name} ${(percent * 100).toFixed(0)}%`}
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
                            </PieChart>"""

replacement_disease = """                            <PieChart>
                              <Pie
                                data={diseaseData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ percent }) => percent < 0.1 ? '' : `${(percent * 100).toFixed(0)}%`}
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
                              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>"""

content = content.replace(target_disease, replacement_disease)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
