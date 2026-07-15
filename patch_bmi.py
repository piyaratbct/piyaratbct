import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target1 = """            const diseaseData = Object.entries(diseaseCount)
              .map(([name, value], index) => ({
                name,
                value,
                fill: diseaseColors[index % diseaseColors.length]
              }))
              .sort((a, b) => b.value - a.value);"""

replacement1 = """            const diseaseData = Object.entries(diseaseCount)
              .map(([name, value], index) => ({
                name,
                value,
                fill: diseaseColors[index % diseaseColors.length]
              }))
              .sort((a, b) => b.value - a.value);

            const bmiDataCount = {
              underweight: 0,
              normal: 0,
              overweight: 0,
              obese1: 0,
              obese2: 0,
            };

            students.forEach(s => {
              if (s.weight && s.height) {
                const heightM = s.height / 100;
                const bmi = s.weight / (heightM * heightM);
                if (bmi < 18.5) bmiDataCount.underweight++;
                else if (bmi < 23) bmiDataCount.normal++;
                else if (bmi < 25) bmiDataCount.overweight++;
                else if (bmi < 30) bmiDataCount.obese1++;
                else bmiDataCount.obese2++;
              }
            });

            const bmiData = [
              { name: 'น้ำหนักน้อย', value: bmiDataCount.underweight, fill: '#3b82f6' },
              { name: 'สมส่วน', value: bmiDataCount.normal, fill: '#22c55e' },
              { name: 'น้ำหนักเกิน', value: bmiDataCount.overweight, fill: '#eab308' },
              { name: 'อ้วนระดับ 1', value: bmiDataCount.obese1, fill: '#f97316' },
              { name: 'อ้วนระดับ 2', value: bmiDataCount.obese2, fill: '#ef4444' },
            ].filter(item => item.value > 0);"""

content = content.replace(target1, replacement1)

target2 = """                  {/* Chart Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                      <h4 className="font-bold text-slate-700 mb-4 text-center">สถิติข้อมูลสุขภาพ</h4>"""

replacement2 = """                  {/* Chart Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-slate-400">
                            ไม่มีข้อมูลน้ำหนัก/ส่วนสูง
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                      <h4 className="font-bold text-slate-700 mb-4 text-center">สถิติข้อมูลสุขภาพ</h4>"""

content = content.replace(target2, replacement2)

target3 = """นักเรียนที่มีข้อมูลสุขภาพ แพ้อาหาร แพ้ยา หรือโรคประจำตัว"""
replacement3 = """นักเรียนที่มีข้อมูลสุขภาพ แพ้อาหาร แพ้ยา โรคประจำตัว รวมถึงการประเมินน้ำหนักและส่วนสูง"""
content = content.replace(target3, replacement3)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
