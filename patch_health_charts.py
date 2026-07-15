import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target1 = """            const bmiDataCount = {
              underweight: 0,
              normal: 0,
              overweight: 0,
              obese1: 0,
              obese2: 0,
            };

            if (currentChartMonth) {
              displayedStudents.forEach(s => {
                const assessmentForMonth = allAssessments.find(a => a.studentId === s.id && a.month === currentChartMonth);
                const weight = assessmentForMonth?.weight;
                const height = assessmentForMonth?.height;
                
                if (weight && height) {
                  const heightM = height / 100;
                  const bmi = weight / (heightM * heightM);
                  
                  let ageYears = 7;
                  if (s.dob) {
                    const birthDate = new Date(s.dob);
                    const now = new Date();
                    let years = now.getFullYear() - birthDate.getFullYear();
                    let months = now.getMonth() - birthDate.getMonth();
                    if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
                      years--;
                    }
                    ageYears = years;
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
            }"""

replacement1 = """            const bmiDataCount = {
              underweight: 0,
              normal: 0,
              overweight: 0,
              obese1: 0,
              obese2: 0,
            };
            
            const bmiByGrade: Record<string, { grade: string, underweight: number, normal: number, overweight: number, obese1: number, obese2: number, total: number }> = {};

            if (currentChartMonth) {
              // Calculate for the currently displayed students (for pie chart)
              displayedStudents.forEach(s => {
                const assessmentForMonth = allAssessments.find(a => a.studentId === s.id && a.month === currentChartMonth);
                const weight = assessmentForMonth?.weight;
                const height = assessmentForMonth?.height;
                
                if (weight && height) {
                  const heightM = height / 100;
                  const bmi = weight / (heightM * heightM);
                  
                  let ageYears = 7;
                  if (s.dob) {
                    const birthDate = new Date(s.dob);
                    const now = new Date();
                    let years = now.getFullYear() - birthDate.getFullYear();
                    let months = now.getMonth() - birthDate.getMonth();
                    if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
                      years--;
                    }
                    ageYears = years;
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
              
              // Calculate for ALL students grouped by grade level (for bar chart)
              students.forEach(s => {
                const grade = s.gradeLevel || 'ไม่ระบุ';
                if (!bmiByGrade[grade]) {
                  bmiByGrade[grade] = { grade, underweight: 0, normal: 0, overweight: 0, obese1: 0, obese2: 0, total: 0 };
                }
                
                const assessmentForMonth = allAssessments.find(a => a.studentId === s.id && a.month === currentChartMonth);
                const weight = assessmentForMonth?.weight;
                const height = assessmentForMonth?.height;
                
                if (weight && height) {
                  bmiByGrade[grade].total++;
                  const heightM = height / 100;
                  const bmi = weight / (heightM * heightM);
                  
                  let ageYears = 7;
                  if (s.dob) {
                    const birthDate = new Date(s.dob);
                    const now = new Date();
                    let years = now.getFullYear() - birthDate.getFullYear();
                    let months = now.getMonth() - birthDate.getMonth();
                    if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
                      years--;
                    }
                    ageYears = years;
                  }
                  
                  const baseNormal = 14 + (ageYears - 6) * 0.3;
                  const baseOverweight = 18 + (ageYears - 6) * 0.5;
                  const baseObese1 = 20 + (ageYears - 6) * 0.6;
                  const baseObese2 = 22 + (ageYears - 6) * 0.7;

                  if (bmi < baseNormal) bmiByGrade[grade].underweight++;
                  else if (bmi < baseOverweight) bmiByGrade[grade].normal++;
                  else if (bmi < baseObese1) bmiByGrade[grade].overweight++;
                  else if (bmi < baseObese2) bmiByGrade[grade].obese1++;
                  else bmiByGrade[grade].obese2++;
                }
              });
            }"""

content = content.replace(target1, replacement1)

target2 = """            const bmiData = [
              { name: 'ผอม/น้ำหนักน้อย', value: bmiDataCount.underweight, fill: '#3b82f6' },
              { name: 'สมส่วน', value: bmiDataCount.normal, fill: '#22c55e' },
              { name: 'ท้วม', value: bmiDataCount.overweight, fill: '#eab308' },
              { name: 'เริ่มอ้วน', value: bmiDataCount.obese1, fill: '#f97316' },
              { name: 'อ้วน', value: bmiDataCount.obese2, fill: '#ef4444' },
            ].filter(item => item.value > 0);"""

replacement2 = """            const bmiData = [
              { name: 'ผอม/น้ำหนักน้อย', value: bmiDataCount.underweight, fill: '#3b82f6' },
              { name: 'สมส่วน', value: bmiDataCount.normal, fill: '#22c55e' },
              { name: 'ท้วม', value: bmiDataCount.overweight, fill: '#eab308' },
              { name: 'เริ่มอ้วน', value: bmiDataCount.obese1, fill: '#f97316' },
              { name: 'อ้วน', value: bmiDataCount.obese2, fill: '#ef4444' },
            ].filter(item => item.value > 0);
            
            const gradeOrder = ['อนุบาล 1', 'อนุบาล 2', 'อนุบาล 3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6', 'ม.1', 'ม.2', 'ม.3'];
            const bmiByGradeData = Object.values(bmiByGrade)
              .filter(d => d.total > 0)
              .sort((a, b) => {
                const idxA = gradeOrder.indexOf(a.grade);
                const idxB = gradeOrder.indexOf(b.grade);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                return a.grade.localeCompare(b.grade);
              });"""

content = content.replace(target2, replacement2)

target3 = """                <div className="mb-8 bg-white border border-slate-100 rounded-xl p-5 shadow-sm max-w-lg mx-auto">
                  <h4 className="font-bold text-slate-700 mb-4 text-center">
                    ประเมินน้ำหนัก/ส่วนสูง (BMI) {currentChartMonth && `ประจำเดือน ${formatThaiMonthYear(currentChartMonth + '-01')}`}
                  </h4>
                  <div className="h-64 w-full">
                    {bmiData.length > 0 ? ("""

replacement3 = """                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                    <h4 className="font-bold text-slate-700 mb-4 text-center">
                      ประเมิน (BMI) เฉพาะ {selectedGrade || 'นักเรียนทั้งหมด'} {currentChartMonth && `ประจำเดือน ${formatThaiMonthYear(currentChartMonth + '-01')}`}
                    </h4>
                    <div className="h-64 w-full">
                      {bmiData.length > 0 ? ("""

content = content.replace(target3, replacement3)

target4 = """                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400">
                        ไม่มีข้อมูลน้ำหนัก/ส่วนสูง สำหรับเดือนนี้
                      </div>
                    )}
                  </div>
                </div>"""

replacement4 = """                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400">
                        ไม่มีข้อมูลน้ำหนัก/ส่วนสูง สำหรับเดือนนี้
                      </div>
                    )}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                    <h4 className="font-bold text-slate-700 mb-4 text-center">
                      ประเมิน (BMI) แบ่งตามระดับชั้น {currentChartMonth && `ประจำเดือน ${formatThaiMonthYear(currentChartMonth + '-01')}`}
                    </h4>
                    <div className="h-64 w-full">
                      {bmiByGradeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={bmiByGradeData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="grade" 
                              tick={{ fontSize: 11, fill: '#64748b' }} 
                              axisLine={false} 
                              tickLine={false} 
                              angle={-45} 
                              textAnchor="end" 
                            />
                            <YAxis 
                              tick={{ fontSize: 12, fill: '#64748b' }} 
                              axisLine={false} 
                              tickLine={false} 
                              allowDecimals={false}
                            />
                            <RechartsTooltip 
                              formatter={(value, name) => [`${value} คน`, name === 'underweight' ? 'ผอม' : name === 'normal' ? 'สมส่วน' : name === 'overweight' ? 'ท้วม' : name === 'obese1' ? 'เริ่มอ้วน' : 'อ้วน']}
                              labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }}
                              payload={[
                                { value: 'ผอม', type: 'circle', color: '#3b82f6' },
                                { value: 'สมส่วน', type: 'circle', color: '#22c55e' },
                                { value: 'ท้วม', type: 'circle', color: '#eab308' },
                                { value: 'เริ่มอ้วน', type: 'circle', color: '#f97316' },
                                { value: 'อ้วน', type: 'circle', color: '#ef4444' }
                              ]}
                            />
                            <Bar dataKey="underweight" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="normal" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="overweight" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="obese1" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="obese2" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">
                          ไม่มีข้อมูลระดับชั้น
                        </div>
                      )}
                    </div>
                  </div>
                </div>"""

content = content.replace(target4, replacement4)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
