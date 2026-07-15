import re
with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# I want to find where `let currentAgeYears = 7;` starts (which is at line 1290)
# and where `studentDataMap[m] = ...` ends (which is line 1344).
# And replace that entire block with the recovered code!

start_idx = content.find("                                    let currentAgeYears = 7;")
end_str = "studentDataMap[m] = { weight, height, bmi, bmiLabel: label, bmiColor: color };\n                            }\n                          });"
end_idx = content.find(end_str, start_idx) + len(end_str)

recovered_code = """                                      let ageYears = 7;
                                      if (student.dob) {
                                        const birthDate = new Date(student.dob);
                                        const now = new Date();
                                        ageYears = now.getFullYear() - birthDate.getFullYear();
                                      }
                                      
                                      const baseNormal = 14 + (ageYears - 6) * 0.3;
                                      const baseOverweight = 18 + (ageYears - 6) * 0.5;
                                      const baseObese1 = 20 + (ageYears - 6) * 0.6;
                                      const baseObese2 = 22 + (ageYears - 6) * 0.7;

                                      let label = '';
                                      let color = '';
                                      if (bmi < baseNormal) { label = 'ผอม'; color = 'text-blue-600'; }
                                      else if (bmi >= baseObese1) { label = 'เริ่มอ้วน/อ้วน'; color = 'text-red-600'; }

                                      if (label) {
                                        return (
                                          <div>
                                            <div className="font-bold">{weight} กก. / {height} ซม.</div>
                                            <div className={`font-bold ${color}`}>{label} (BMI {bmi.toFixed(1)})</div>
                                          </div>
                                        );
                                      }
                                    }
                                    return <span className="text-slate-400">-</span>;
                                  })()}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                  <div className="flex flex-col gap-1">
                                    {student.congenitalDisease && <div className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full inline-block w-max font-medium text-xs border border-rose-100">โรค: {student.congenitalDisease}</div>}
                                    {student.allergicFood && <div className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full inline-block w-max font-medium text-xs border border-orange-100">แพ้อาหาร: {student.allergicFood}</div>}
                                    {student.allergicMedicine && <div className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full inline-block w-max font-medium text-xs border border-purple-100">แพ้ยา: {student.allergicMedicine}</div>}
                                    {!student.congenitalDisease && !student.allergicFood && !student.allergicMedicine && (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {allSpecialCareStudents.length === 0 && (
                              <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                  ไม่มีข้อมูลนักเรียนที่ต้องดูแลสุขภาพเป็นพิเศษ
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "health-report" && (() => {
            const allAssessments = Object.values(assessments);
            const availableMonthsSet = new Set<string>();
            allAssessments.forEach(a => availableMonthsSet.add(a.month));
            const availableMonths = Array.from(availableMonthsSet).sort().reverse();
            
            const currentChartMonth = selectedMonth || availableMonths[0];
            const fallbackMonth = currentChartMonth; // fallback to master record
            
            const bmiDataCount = {
              underweight: 0,
              normal: 0,
              overweight: 0,
              obese1: 0,
              obese2: 0,
              unknown: 0,
            };
            const bmiByGrade: Record<string, { grade: string, underweight: number, normal: number, overweight: number, obese1: number, obese2: number, unknown: number, total: number }> = {};
            
            if (currentChartMonth) {
              students.forEach(s => {
                const grade = s.gradeLevel || 'ไม่ระบุ';
                if (!bmiByGrade[grade]) {
                  bmiByGrade[grade] = { grade, underweight: 0, normal: 0, overweight: 0, obese1: 0, obese2: 0, unknown: 0, total: 0 };
                }
                
                const assessmentForMonth = allAssessments.find(a => a.studentId === s.id && a.month === currentChartMonth);
                const weight = assessmentForMonth?.weight !== undefined ? assessmentForMonth.weight : (currentChartMonth === fallbackMonth ? s.weight : undefined);
                const height = assessmentForMonth?.height !== undefined ? assessmentForMonth.height : (currentChartMonth === fallbackMonth ? s.height : undefined);
                
                if (weight && height) {
                  bmiByGrade[grade].total++;
                  const heightM = height / 100;
                  const bmi = weight / (heightM * heightM);
                  
                  if (!s.dob) {
                    bmiByGrade[grade].unknown++;
                  } else {
                    const birthDate = new Date(s.dob);
                    const targetDate = currentChartMonth ? new Date(`${currentChartMonth}-01`) : new Date();
                    let years = targetDate.getFullYear() - birthDate.getFullYear();
                    if (targetDate.getMonth() < birthDate.getMonth()) {
                      years--;
                    }
                    const ageYears = years;
                    
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
                }
              });
              
              displayedStudents.forEach(s => {
                const assessmentForMonth = allAssessments.find(a => a.studentId === s.id && a.month === currentChartMonth);
                const weight = assessmentForMonth?.weight !== undefined ? assessmentForMonth.weight : (currentChartMonth === fallbackMonth ? s.weight : undefined);
                const height = assessmentForMonth?.height !== undefined ? assessmentForMonth.height : (currentChartMonth === fallbackMonth ? s.height : undefined);
                
                if (weight && height) {
                  const heightM = height / 100;
                  const bmi = weight / (heightM * heightM);
                  
                  if (!s.dob) {
                    bmiDataCount.unknown++;
                  } else {
                    const birthDate = new Date(s.dob);
                    const targetDate = currentChartMonth ? new Date(`${currentChartMonth}-01`) : new Date();
                    let years = targetDate.getFullYear() - birthDate.getFullYear();
                    if (targetDate.getMonth() < birthDate.getMonth()) {
                      years--;
                    }
                    const ageYears = years;
                    
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
                }
              });
            }
            
            const bmiData = [
              { name: 'ผอม/น้ำหนักน้อย', value: bmiDataCount.underweight, fill: '#3b82f6' },
              { name: 'สมส่วน', value: bmiDataCount.normal, fill: '#22c55e' },
              { name: 'ท้วม', value: bmiDataCount.overweight, fill: '#eab308' },
              { name: 'เริ่มอ้วน', value: bmiDataCount.obese1, fill: '#f97316' },
              { name: 'อ้วน', value: bmiDataCount.obese2, fill: '#ef4444' },
              { name: 'ขาดวันเกิด (คำนวณไม่ได้)', value: bmiDataCount.unknown, fill: '#94a3b8' },
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
              });

            return (
              <div className="p-6 relative animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      รายงานสรุปพัฒนาการทางร่างกาย (BMI)
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      เปรียบเทียบข้อมูล BMI ของนักเรียน
                    </p>
                  </div>
                  {currentChartMonth && (
                    <div className="bg-pink-50 text-pink-700 px-4 py-2 rounded-lg font-bold text-sm">
                      ข้อมูลประจำเดือน {currentChartMonth}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                    <h4 className="font-bold text-slate-700 mb-4 text-center">สัดส่วนนักเรียนแยกตามเกณฑ์ (ห้องนี้)</h4>
                    <div className="h-64 w-full">
                      {bmiData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={bmiData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                    <h4 className="font-bold text-slate-700 mb-4 text-center">สัดส่วนนักเรียนแยกตามเกณฑ์ (รายชั้นปี)</h4>
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
                              tick={{ fontSize: 11, fill: '#64748b' }} 
                              axisLine={false} 
                              tickLine={false} 
                              allowDecimals={false}
                            />
                            <RechartsTooltip 
                              formatter={(value, name) => [`${value} คน`, name === 'underweight' ? 'ผอม' : name === 'normal' ? 'สมส่วน' : name === 'overweight' ? 'ท้วม' : name === 'obese1' ? 'เริ่มอ้วน' : name === 'obese2' ? 'อ้วน' : 'ขาดวันเกิด']}
                              labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }}
                              payload={[
                                { value: 'ผอม', type: 'circle', color: '#3b82f6' },
                                { value: 'สมส่วน', type: 'circle', color: '#22c55e' },
                                { value: 'ท้วม', type: 'circle', color: '#eab308' },
                                { value: 'เริ่มอ้วน', type: 'circle', color: '#f97316' },
                                { value: 'อ้วน', type: 'circle', color: '#ef4444' },
                                { value: 'ขาดวันเกิด', type: 'circle', color: '#94a3b8' }
                              ]}
                            />
                            <Bar dataKey="underweight" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="normal" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="overweight" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="obese1" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="obese2" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="unknown" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">
                          ไม่มีข้อมูลระดับชั้น
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <tr>
                          <th className="px-4 py-3 text-center w-16 whitespace-nowrap border-r border-slate-200">เลขที่</th>
                          <th className="px-4 py-3 whitespace-nowrap border-r border-slate-200">ชื่อ-สกุล</th>
                          <th className="px-4 py-3 text-center w-24 whitespace-nowrap border-r border-slate-200">อายุ (ปี/เดือน)</th>
                          {availableMonths.length === 0 ? (
                            <th className="px-4 py-3 text-center whitespace-nowrap">ไม่มีข้อมูลการประเมิน</th>
                          ) : (
                            availableMonths.slice(0, 4).map(m => (
                              <th key={m} className="px-2 py-3 text-center whitespace-nowrap border-r border-slate-200 text-xs">
                                <div className="font-bold text-pink-600">{m}</div>
                                <div className="text-[10px] text-slate-400 font-normal mt-0.5">BMI / ผลประเมิน</div>
                              </th>
                            ))
                          )}
                          {availableMonths.length > 1 && (
                            <th className="px-4 py-3 text-center w-20 whitespace-nowrap">แนวโน้ม</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {displayedStudents.map((student) => {
                          const displayMonths = availableMonths.slice(0, 4);
                          const studentDataMap: Record<string, { weight: number, height: number, bmi: number, bmiLabel: string, bmiColor: string }> = {};
                          
                          let currentAgeYears = 7;
                          let currentAgeMonths = 0;
                          const hasDob = !!student.dob;
                          if (hasDob) {
                            const birthDate = new Date(student.dob!);
                            const now = new Date();
                            
                            let years = now.getFullYear() - birthDate.getFullYear();
                            let months = now.getMonth() - birthDate.getMonth();
                            
                            if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
                              years--;
                              months += (months < 0 ? 12 : 11);
                            }
                            
                            currentAgeYears = years;
                            currentAgeMonths = months;
                          }

                          displayMonths.forEach(m => {
                            const assessmentForMonth = allAssessments.find(a => a.studentId === student.id && a.month === m);
                            const weight = assessmentForMonth?.weight !== undefined ? assessmentForMonth.weight : (m === fallbackMonth ? student.weight : undefined);
                            const height = assessmentForMonth?.height !== undefined ? assessmentForMonth.height : (m === fallbackMonth ? student.height : undefined);
                            
                            if (weight && height) {
                              const h = height / 100;
                              const bmi = weight / (h * h);
                              
                              let label = '';
                              let color = '';
                              
                              if (!hasDob) {
                                label = 'ไม่มีวันเกิด';
                                color = 'text-slate-400';
                              } else {
                                const birthDate = new Date(student.dob!);
                                const targetDate = new Date(`${m}-01`);
                                let years = targetDate.getFullYear() - birthDate.getFullYear();
                                if (targetDate.getMonth() < birthDate.getMonth()) {
                                  years--;
                                }
                                const ageAtMonth = years;
                                
                                const baseNormal = 14 + (ageAtMonth - 6) * 0.3;
                                const baseOverweight = 18 + (ageAtMonth - 6) * 0.5;
                                const baseObese1 = 20 + (ageAtMonth - 6) * 0.6;
                                const baseObese2 = 22 + (ageAtMonth - 6) * 0.7;

                                if (bmi < baseNormal) { label = 'ผอม'; color = 'text-blue-600'; }
                                else if (bmi < baseOverweight) { label = 'สมส่วน'; color = 'text-green-600'; }
                                else if (bmi < baseObese1) { label = 'ท้วม'; color = 'text-yellow-600'; }
                                else if (bmi < baseObese2) { label = 'เริ่มอ้วน'; color = 'text-orange-600'; }
                                else { label = 'อ้วน'; color = 'text-red-600'; }
                              }
                              
                              studentDataMap[m] = { weight, height, bmi, bmiLabel: label, bmiColor: color };
                            }
                          });"""

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + recovered_code + content[end_idx:]
    print("RECOVERED")
else:
    print("NOT FOUND", start_idx, end_idx)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
