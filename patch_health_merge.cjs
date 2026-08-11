const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

const m1 = '{activeTab === "special-care" && (() => {';
const m2 = '        {/* Assessment Modal/Form Overlay */}';

const i1 = content.indexOf(m1);
const i2 = content.indexOf(m2);

if (i1 === -1 || i2 === -1) {
    console.log("Could not find markers.");
    process.exit(1);
}

const replacement = `{activeTab === "health" && (() => {
            const allAssessments = Object.values(assessments);
            const availableMonthsSet = new Set();
            allAssessments.forEach(a => { if (a.month) availableMonthsSet.add(a.month); });
            const availableMonths = Array.from(availableMonthsSet).sort().reverse();
            
            const displayMonths = showHistoryCompare ? availableMonths.slice(0, 4).reverse() : currentChartMonth ? [currentChartMonth] : [];

            // 1. Health data (allergies & diseases)
            const allergicMedStudents = studentsInGrade.filter((s) => s.allergicMedicine && s.allergicMedicine !== 'ไม่มี' && s.allergicMedicine !== '-');
            const otherMedicalStudents = studentsInGrade.filter((s) => s.medicalInfo && s.medicalInfo !== 'ไม่มี' && s.medicalInfo !== '-');
            const allAllergicFoodStudents = studentsInGrade.filter((s) => s.allergicFood && s.allergicFood !== 'ไม่มี' && s.allergicFood !== '-');
            const allCongenitalDiseaseStudents = studentsInGrade.filter((s) => s.congenitalDisease && s.congenitalDisease !== 'ไม่มี' && s.congenitalDisease !== '-');
            
            const diseaseData = [
              { name: 'แพ้ยา', value: allergicMedStudents.length, fill: '#8b5cf6' },
              { name: 'แพ้อาหาร', value: allAllergicFoodStudents.length, fill: '#f97316' },
              { name: 'โรคประจำตัว', value: allCongenitalDiseaseStudents.length, fill: '#e11d48' },
              { name: 'อื่นๆ', value: otherMedicalStudents.length, fill: '#64748b' }
            ].filter(d => d.value > 0);

            const hasAnySpecialCare = diseaseData.length > 0;

            // 2. BMI Data
            let bmiData = [];
            let bmiByGradeData = [];
            
            if (currentChartMonth) {
              const currentAssessments = allAssessments.filter(a => a.month === currentChartMonth);
              let underweight = 0;
              let normal = 0;
              let overweight = 0;
              let obese1 = 0;
              let obese2 = 0;
              let unknown = 0;
              
              const studentsToCalculate = showHistoryCompare ? students : studentsInGrade;
              
              const currentGradeBmiStats = { underweight: 0, normal: 0, overweight: 0, obese1: 0, obese2: 0, unknown: 0 };
              
              const gradeStats = {};
              
              studentsToCalculate.forEach(s => {
                const assessment = currentAssessments.find(a => a.studentId === s.id);
                const grade = s.gradeLevel || 'ไม่ระบุ';
                if (!gradeStats[grade]) {
                  gradeStats[grade] = { grade, underweight: 0, normal: 0, overweight: 0, obese1: 0, obese2: 0, unknown: 0 };
                }
                
                if (assessment && assessment.weight && assessment.height) {
                  const w = assessment.weight;
                  const h = assessment.height / 100;
                  const bmi = w / (h * h);
                  
                  if (!s.dob) {
                     unknown++;
                     gradeStats[grade].unknown++;
                     if(s.gradeLevel === selectedGrade) currentGradeBmiStats.unknown++;
                  } else {
                    const birthDate = new Date(s.dob);
                    const targetDate = new Date(\`\${currentChartMonth}-01\`);
                    let years = targetDate.getFullYear() - birthDate.getFullYear();
                    if (targetDate.getMonth() < birthDate.getMonth()) {
                      years--;
                    }
                    
                    const baseNormal = 14 + (years - 6) * 0.3;
                    const baseOverweight = 18 + (years - 6) * 0.5;
                    const baseObese1 = 20 + (years - 6) * 0.6;
                    const baseObese2 = 22 + (years - 6) * 0.7;
                    
                    let cat = '';
                    if (bmi < baseNormal) cat = 'underweight';
                    else if (bmi < baseOverweight) cat = 'normal';
                    else if (bmi < baseObese1) cat = 'overweight';
                    else if (bmi < baseObese2) cat = 'obese1';
                    else cat = 'obese2';
                    
                    if (cat === 'underweight') { underweight++; gradeStats[grade].underweight++; if(s.gradeLevel === selectedGrade) currentGradeBmiStats.underweight++; }
                    else if (cat === 'normal') { normal++; gradeStats[grade].normal++; if(s.gradeLevel === selectedGrade) currentGradeBmiStats.normal++; }
                    else if (cat === 'overweight') { overweight++; gradeStats[grade].overweight++; if(s.gradeLevel === selectedGrade) currentGradeBmiStats.overweight++; }
                    else if (cat === 'obese1') { obese1++; gradeStats[grade].obese1++; if(s.gradeLevel === selectedGrade) currentGradeBmiStats.obese1++; }
                    else if (cat === 'obese2') { obese2++; gradeStats[grade].obese2++; if(s.gradeLevel === selectedGrade) currentGradeBmiStats.obese2++; }
                  }
                }
              });
              
              if (currentGradeBmiStats.underweight > 0) bmiData.push({ name: 'ผอม', value: currentGradeBmiStats.underweight, fill: '#3b82f6' });
              if (currentGradeBmiStats.normal > 0) bmiData.push({ name: 'สมส่วน', value: currentGradeBmiStats.normal, fill: '#22c55e' });
              if (currentGradeBmiStats.overweight > 0) bmiData.push({ name: 'ท้วม', value: currentGradeBmiStats.overweight, fill: '#eab308' });
              if (currentGradeBmiStats.obese1 > 0) bmiData.push({ name: 'เริ่มอ้วน', value: currentGradeBmiStats.obese1, fill: '#f97316' });
              if (currentGradeBmiStats.obese2 > 0) bmiData.push({ name: 'อ้วน', value: currentGradeBmiStats.obese2, fill: '#ef4444' });
              if (currentGradeBmiStats.unknown > 0) bmiData.push({ name: 'ขาดวันเกิด', value: currentGradeBmiStats.unknown, fill: '#94a3b8' });
              
              bmiByGradeData = Object.values(gradeStats).sort((a, b) => a.grade.localeCompare(b.grade));
            }

            return (
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <HeartPulse className="h-5 w-5 text-rose-500" />
                      สรุปข้อมูลสุขภาพและพัฒนาการร่างกาย
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      ข้อมูลโรคประจำตัว การแพ้ และดัชนีมวลกาย (BMI) ของนักเรียน
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={printBatchHealthReport}
                      className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <Printer className="h-4 w-4" /> พิมพ์รายงาน
                    </button>
                    <button
                      onClick={() => setShowHistoryCompare(!showHistoryCompare)}
                      className={\`px-4 py-2 rounded-xl text-sm font-bold border transition-colors \${showHistoryCompare ? 'bg-pink-50 text-pink-600 border-pink-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}\`}
                    >
                      {showHistoryCompare ? 'ซ่อนเปรียบเทียบย้อนหลัง' : 'เปรียบเทียบย้อนหลัง 4 เดือน'}
                    </button>
                    {currentChartMonth && (
                      <div className="bg-pink-50 text-pink-700 px-4 py-2 rounded-lg font-bold text-sm">
                        ประจำเดือน {formatThaiMonthYear(currentChartMonth).replace('256', '6')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Special Care Chart */}
                  <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col">
                    <h4 className="font-bold text-slate-700 mb-4 text-center">สถิติข้อมูลสุขภาพ (ห้อง {selectedGrade})</h4>
                    <div className="flex-1 min-h-[250px] w-full">
                      {hasAnySpecialCare ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={diseaseData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ percent }) => percent < 0.1 ? '' : \`\${(percent * 100).toFixed(0)}%\`}
                              labelLine={false}
                            >
                              {diseaseData.map((entry, index) => (
                                <Cell key={\`cell-\${index}\`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              formatter={(value) => [\`\${value} คน\`, 'จำนวน']}
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                          ไม่มีข้อมูลสุขภาพที่ต้องดูแลเป็นพิเศษ
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BMI Chart */}
                  <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col">
                    <h4 className="font-bold text-slate-700 mb-4 text-center">สัดส่วนนักเรียนแยกตามเกณฑ์ BMI (ห้อง {selectedGrade})</h4>
                    <div className="flex-1 min-h-[250px] w-full">
                      {currentChartMonth && bmiData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={bmiData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={90}
                              dataKey="value"
                              label={({ name, percent }) => \`\${name} \${(percent * 100).toFixed(0)}%\`}
                            >
                              {bmiData.map((entry, index) => (
                                <Cell key={\`cell-\${index}\`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              formatter={(value) => [\`\${value} คน\`, 'จำนวน']}
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 font-medium gap-2">
                          <Activity className="h-8 w-8 opacity-20" />
                          <span>{currentChartMonth ? 'ไม่มีข้อมูลน้ำหนัก/ส่วนสูงในเดือนนี้' : 'กรุณาเลือกประจำเดือนเพื่อดูสรุปข้อมูล'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Unified Data Table */}
                <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <tr>
                          <th className="px-4 py-3 text-center w-16 whitespace-nowrap">เลขที่</th>
                          <th className="px-4 py-3 whitespace-nowrap">ชื่อ-สกุล</th>
                          <th className="px-4 py-3 whitespace-nowrap border-r border-slate-200 w-48">ข้อมูลสุขภาพ</th>
                          
                          {displayMonths.length === 0 ? (
                            <th className="px-4 py-3 text-center whitespace-nowrap">BMI (รอเลือกเดือน)</th>
                          ) : (
                            displayMonths.map(m => (
                              <th key={m} className="px-2 py-3 text-center whitespace-nowrap border-r border-slate-200 min-w-[80px]">
                                <div className="text-[10px] text-slate-400 font-medium leading-tight">ประจำเดือน</div>
                                <div>{formatThaiMonthYear(m).replace('256', '6')}</div>
                              </th>
                            ))
                          )}
                          {displayMonths.length > 1 && (
                            <th className="px-4 py-3 text-center whitespace-nowrap w-20 bg-slate-50">แนวโน้ม</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {displayedStudents.map((student) => {
                          const hasDisease = student.congenitalDisease && student.congenitalDisease !== 'ไม่มี' && student.congenitalDisease !== '-';
                          const hasFoodAlg = student.allergicFood && student.allergicFood !== 'ไม่มี' && student.allergicFood !== '-';
                          const hasMedAlg = student.allergicMedicine && student.allergicMedicine !== 'ไม่มี' && student.allergicMedicine !== '-';
                          const hasHealthCare = hasDisease || hasFoodAlg || hasMedAlg;
                          
                          const studentDataMap = {};
                          let currentAgeYears = 7;
                          let currentAgeMonths = 0;
                          const hasDob = !!student.dob;

                          if (hasDob) {
                            const birthDate = new Date(student.dob);
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
                            const weight = assessmentForMonth?.weight;
                            const height = assessmentForMonth?.height;
                            
                            if (weight && height) {
                              const h = height / 100;
                              const bmi = weight / (h * h);
                              
                              let label = '';
                              let color = '';
                              
                              if (!hasDob) {
                                label = 'ไม่มีวันเกิด';
                                color = 'text-slate-400';
                              } else {
                                const birthDate = new Date(student.dob);
                                const targetDate = new Date(\`\${m}-01\`);
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
                          });

                          let trendIcon = <Minus className="h-4 w-4 text-slate-300 mx-auto" />;
                          if (displayMonths.length > 1) {
                            const firstM = displayMonths[displayMonths.length - 1]; // oldest in display
                            const lastM = displayMonths[0]; // newest in display
                            const firstBmi = studentDataMap[firstM]?.bmi;
                            const lastBmi = studentDataMap[lastM]?.bmi;
                            if (firstBmi && lastBmi) {
                              const diff = lastBmi - firstBmi;
                              if (diff > 0.5) trendIcon = <TrendingUp className="h-4 w-4 text-red-500 mx-auto" title={\`เพิ่มขึ้น \${diff.toFixed(1)}\`} />;
                              else if (diff < -0.5) trendIcon = <TrendingDown className="h-4 w-4 text-green-500 mx-auto" title={\`ลดลง \${Math.abs(diff).toFixed(1)}\`} />;
                            }
                          }

                          return (
                            <tr key={student.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                              <td className="px-4 py-3 text-center font-mono text-slate-500 whitespace-nowrap">{student.number}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="font-bold text-slate-800">{student.firstName} {student.lastName}</div>
                                <div className="text-[10px] text-slate-500 font-mono">รหัส: {student.studentId} • {hasDob ? \`\${currentAgeYears} ปี \${currentAgeMonths} ด.\` : 'ไม่มีวันเกิด'}</div>
                              </td>
                              <td className="px-4 py-3 text-sm border-r border-slate-200">
                                <div className="flex flex-wrap gap-1">
                                  {hasDisease && <div className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-rose-100 whitespace-nowrap">โรค: {student.congenitalDisease}</div>}
                                  {hasFoodAlg && <div className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-orange-100 whitespace-nowrap">แพ้อาหาร: {student.allergicFood}</div>}
                                  {hasMedAlg && <div className="text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-purple-100 whitespace-nowrap">แพ้ยา: {student.allergicMedicine}</div>}
                                  {!hasHealthCare && (
                                    <span className="text-slate-400 text-xs">-</span>
                                  )}
                                </div>
                              </td>
                              
                              {displayMonths.length === 0 ? (
                                <td className="px-4 py-3 text-center text-slate-400 text-sm">-</td>
                              ) : (
                                displayMonths.map(m => {
                                  const d = studentDataMap[m];
                                  if (!d) {
                                    return (
                                      <td key={\`\${student.id}-\${m}\`} className="px-2 py-2 text-center text-slate-300 border-r border-slate-200 bg-slate-50/30">-</td>
                                    );
                                  }
                                  return (
                                      <td key={\`\${student.id}-\${m}\`} className="px-2 py-2 text-center border-r border-slate-200 bg-slate-50/30">
                                        <div className={\`text-sm font-bold \${d.bmiColor}\`}>{d.bmi?.toFixed(1)}</div>
                                        {d.bmiLabel === 'ไม่มีวันเกิด' ? (
                                          <div className="text-[10px] text-red-500 font-bold flex items-center justify-center gap-0.5" title="ไม่มีวันเกิด">
                                            <AlertCircle className="h-3 w-3" /> ขาดข้อมูล
                                          </div>
                                        ) : (
                                          <div className={\`text-[10px] \${d.bmiColor} opacity-80 leading-none\`}>{d.bmiLabel}</div>
                                        )}
                                      </td>
                                  );
                                })
                              )}
                              {displayMonths.length > 1 && (
                                <td className="px-4 py-2 text-center bg-slate-50">
                                  {trendIcon}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                        {displayedStudents.length === 0 && (
                          <tr>
                            <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                              ไม่มีข้อมูลนักเรียน
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

        {/* Assessment Modal/Form Overlay */}`;

const newContent = content.substring(0, i1) + replacement + content.substring(i2 + m2.length);

fs.writeFileSync('src/components/ClassroomModule.tsx', newContent, 'utf8');
console.log('Merged health and physical development into a single tab.');
