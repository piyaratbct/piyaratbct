import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# 1. Remove the BMI data calculation from special-care
bmi_data_calc_target = """            const bmiDataCount = {
              underweight: 0,
              normal: 0,
              overweight: 0,
              obese1: 0,
              obese2: 0,
            };

            const getStudentHealthData = (s: Student) => {
              let weight = s.weight;
              let height = s.height;
              
              if (selectedMonth) {
                const assessmentForMonth = assessments[s.id];
                if (assessmentForMonth && assessmentForMonth.weight !== undefined && assessmentForMonth.height !== undefined) {
                  weight = assessmentForMonth.weight;
                  height = assessmentForMonth.height;
                } else {
                  weight = undefined;
                  height = undefined;
                }
              }
              
              return { weight, height };
            };

            students.forEach(s => {
              const { weight, height } = getStudentHealthData(s);
              if (weight && height) {
                const heightM = height / 100;
                const bmi = weight / (heightM * heightM);
                
                let ageYears = 7;
                if (s.dob) {
                  const birthDate = new Date(s.dob);
                  const ageDifMs = Date.now() - birthDate.getTime();
                  ageYears = Math.abs(new Date(ageDifMs).getUTCFullYear() - 1970);
                }
                
                const baseNormal = 14 + (ageYears - 6) * 0.3;
                const baseOverweight = 18 + (ageYears - 6) * 0.5;
                const baseObese1 = 20 + (ageYears - 6) * 0.6;
                const baseObese2 = 22 + (ageYears - 6) * 0.7;

                if (bmi < baseNormal) bmiDataCount.underweight++;
                else if (bmi < baseOverweight) bmiDataCount.normal++;
                else if (bmi < baseObese1) bmiDataCount.overweight++;
                else if (bmi < baseObese2) bmiDataCount.obese1++;
                else bmiDataCount.obese2++;
              }
            });

            const bmiData = [
              { name: 'ผอม/น้ำหนักน้อย', value: bmiDataCount.underweight, fill: '#3b82f6' },
              { name: 'สมส่วน', value: bmiDataCount.normal, fill: '#22c55e' },
              { name: 'ท้วม', value: bmiDataCount.overweight, fill: '#eab308' },
              { name: 'เริ่มอ้วน', value: bmiDataCount.obese1, fill: '#f97316' },
              { name: 'อ้วน', value: bmiDataCount.obese2, fill: '#ef4444' },
            ].filter(item => item.value > 0);"""

content = content.replace(bmi_data_calc_target, "")

# Remove the BMI chart element from special-care
bmi_chart_target = """                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                      <h4 className="font-bold text-slate-700 mb-4 text-center">ประเมินน้ำหนัก/ส่วนสูง (BMI)</h4>
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
                            ไม่มีข้อมูลน้ำหนัก/ส่วนสูง
                          </div>
                        )}
                      </div>
                    </div>"""

bmi_chart_replacement = """                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">"""

content = content.replace(bmi_chart_target, bmi_chart_replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
