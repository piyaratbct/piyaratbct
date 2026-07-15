import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """                          let ageYears = 7;
                          let ageMonths = 0;
                          if (student.dob) {
                            const birthDate = new Date(student.dob);
                            const now = new Date();
                            
                            let years = now.getFullYear() - birthDate.getFullYear();
                            let months = now.getMonth() - birthDate.getMonth();
                            
                            if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
                              years--;
                              months += (months < 0 ? 12 : 11);
                            }
                            
                            ageYears = years;
                            ageMonths = months;
                          }
                          const baseNormal = 14 + (ageYears - 6) * 0.3;
                          const baseOverweight = 18 + (ageYears - 6) * 0.5;
                          const baseObese1 = 20 + (ageYears - 6) * 0.6;
                          const baseObese2 = 22 + (ageYears - 6) * 0.7;

                          displayMonths.forEach(m => {
                            const assessmentForMonth = allAssessments.find(a => a.studentId === student.id && a.month === m);
                            const weight = assessmentForMonth?.weight !== undefined ? assessmentForMonth.weight : (m === fallbackMonth ? student.weight : undefined);
                            const height = assessmentForMonth?.height !== undefined ? assessmentForMonth.height : (m === fallbackMonth ? student.height : undefined);
                            
                            if (weight && height) {
                              const h = height / 100;
                              const bmi = weight / (h * h);
                              
                              let label = '';
                              let color = '';
                              if (bmi < baseNormal) { label = 'ผอม'; color = 'text-blue-600'; }
                              else if (bmi < baseOverweight) { label = 'สมส่วน'; color = 'text-green-600'; }
                              else if (bmi < baseObese1) { label = 'ท้วม'; color = 'text-yellow-600'; }
                              else if (bmi < baseObese2) { label = 'เริ่มอ้วน'; color = 'text-orange-600'; }
                              else { label = 'อ้วน'; color = 'text-red-600'; }
                              
                              studentDataMap[m] = { weight, height, bmi, bmiLabel: label, bmiColor: color };
                            }
                          });"""

replacement = """                          let currentAgeYears = 7;
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
content = content.replace(target, replacement)

target2 = """                              <td className="px-4 py-2 text-center text-sm font-medium text-slate-600 border-r border-slate-200">
                                {student.dob ? `${ageYears} ปี ${ageMonths} ด.` : '-'}
                              </td>"""

replacement2 = """                              <td className="px-4 py-2 text-center text-sm font-medium text-slate-600 border-r border-slate-200">
                                {student.dob ? `${currentAgeYears} ปี ${currentAgeMonths} ด.` : '-'}
                              </td>"""

content = content.replace(target2, replacement2)

target3 = """                                      <td className="px-2 py-2 text-center border-r border-slate-200 bg-slate-50/30">
                                        <div className={`text-sm font-bold ${d.bmiColor}`}>{d.bmi?.toFixed(1)}</div>
                                        <div className={`text-[10px] ${d.bmiColor} opacity-80`}>{d.bmiLabel}</div>
                                      </td>"""

replacement3 = """                                      <td className="px-2 py-2 text-center border-r border-slate-200 bg-slate-50/30">
                                        <div className={`text-sm font-bold ${d.bmiColor}`}>{d.bmi?.toFixed(1)}</div>
                                        {student.dob ? (
                                           <div className={`text-[10px] ${d.bmiColor} opacity-80`}>{d.bmiLabel}</div>
                                        ) : (
                                           <div className="text-[10px] text-red-500 font-bold" title="ไม่สามารถแปลผล BMI ได้เนื่องจากไม่มีข้อมูลวันเกิด โปรดอัปเดตประวัตินักเรียน">⚠️ ขาดวันเกิด</div>
                                        )}
                                      </td>"""

content = content.replace(target3, replacement3)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
