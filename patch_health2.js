import fs from 'fs';

const file = 'src/components/ClassroomModule.tsx';
let content = fs.readFileSync(file, 'utf8');

const startIndex = content.indexOf('<table className="w-full text-left text-sm">');
const endIndexStr = '</table>';
const endIndex = content.indexOf(endIndexStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const replacementContent = `<div className="flex flex-col border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
              {displayedStudents.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-500">
                  ไม่มีข้อมูลนักเรียน
                </div>
              ) : (
                displayedStudents.map((student) => {
                  const studentDataMap: Record<string, any> = {};
                  
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
                    const weight = assessmentForMonth?.weight;
                    const height = assessmentForMonth?.height;
                    let bmi = null;
                    let label = '-';
                    let color = 'text-slate-500';

                    if (weight && height) {
                      const h = height / 100;
                      bmi = weight / (h * h);
                      
                      if (!hasDob) {
                        label = 'ไม่มีวันเกิด';
                        color = 'text-red-500';
                      } else {
                        const baseNormal = 14 + (currentAgeYears - 6) * 0.3;
                        const baseOverweight = 17 + (currentAgeYears - 6) * 0.4;
                        const baseObese1 = 20 + (currentAgeYears - 6) * 0.6;
                        const baseObese2 = 22 + (currentAgeYears - 6) * 0.7;

                        if (bmi < baseNormal) { label = 'ผอม'; color = 'text-blue-600'; }
                        else if (bmi < baseOverweight) { label = 'สมส่วน'; color = 'text-green-600'; }
                        else if (bmi < baseObese1) { label = 'ท้วม'; color = 'text-yellow-600'; }
                        else if (bmi < baseObese2) { label = 'เริ่มอ้วน'; color = 'text-orange-600'; }
                        else { label = 'อ้วน'; color = 'text-red-600'; }
                      }
                      
                      studentDataMap[m] = { weight, height, bmi, bmiLabel: label, bmiColor: color };
                    }
                  });

                  let trendIcon = <Minus className="h-4 w-4 text-slate-300" />;
                  if (displayMonths.length > 1) {
                    const firstM = displayMonths[displayMonths.length - 1];
                    const lastM = displayMonths[0];
                    const firstBmi = studentDataMap[firstM]?.bmi;
                    const lastBmi = studentDataMap[lastM]?.bmi;
                    if (firstBmi && lastBmi) {
                      const diff = lastBmi - firstBmi;
                      if (diff > 0.5) trendIcon = <TrendingUp className="h-4 w-4 text-red-500" title={\`เพิ่มขึ้น \${diff.toFixed(1)}\`} />;
                      else if (diff < -0.5) trendIcon = <TrendingDown className="h-4 w-4 text-green-500" title={\`ลดลง \${Math.abs(diff).toFixed(1)}\`} />;
                    }
                  }

                  return (
                    <div key={student.id} className="p-3 sm:px-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 even:bg-slate-50/30">
                      <div className="flex items-start gap-2.5 min-w-[200px]">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm shrink-0 mt-0.5">
                          {student.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-700 text-sm truncate whitespace-normal leading-tight">
                            {student.firstName} {student.lastName}
                            {student.nickname && <span className="block sm:inline sm:ml-1 text-slate-500 font-normal">({student.nickname})</span>}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex flex-wrap gap-x-1.5 items-center">
                            <span>รหัส: {student.studentId}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                            <span>อายุ: {student.dob ? \`\${currentAgeYears} ปี \${currentAgeMonths} ด.\` : '-'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col gap-1 w-full md:w-auto mt-2 md:mt-0 pl-10 md:pl-0">
                        {displayMonths.length === 0 ? (
                          <div className="text-sm text-slate-400">-</div>
                        ) : (
                          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
                            {displayMonths.map(m => {
                              const d = studentDataMap[m];
                              return (
                                <div key={\`\${student.id}-\${m}\`} className="flex flex-col bg-slate-50 border border-slate-100 rounded-md p-1.5 min-w-[70px] sm:min-w-[90px]">
                                  <div className="text-[9px] text-slate-400 mb-0.5 truncate">{formatThaiMonthYear(m).replace('256', '6')}</div>
                                  {!d ? (
                                    <div className="text-xs text-slate-300 font-medium">-</div>
                                  ) : (
                                    <>
                                      <div className={\`text-xs font-bold \${d.bmiColor}\`}>{d.bmi?.toFixed(1)}</div>
                                      {d.bmiLabel === 'ไม่มีวันเกิด' ? (
                                        <div className="text-[9px] text-red-500 font-bold opacity-100 flex items-center gap-0.5" title="ไม่สามารถแปลผล BMI ได้เนื่องจากไม่มีข้อมูลวันเกิด">
                                          <AlertCircle className="h-2.5 w-2.5" /> <span className="truncate">ขาดวันเกิด</span>
                                        </div>
                                      ) : (
                                        <div className={\`text-[9px] \${d.bmiColor} opacity-80\`}>{d.bmiLabel}</div>
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      
                      {displayMonths.length > 1 && (
                        <div className="flex items-center gap-1.5 pl-10 md:pl-0 mt-1 md:mt-0">
                          <span className="text-[10px] text-slate-400 md:hidden">แนวโน้ม:</span>
                          <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                            {trendIcon}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>`;

  const newContent = content.substring(0, startIndex) + replacementContent + content.substring(endIndex + endIndexStr.length);
  fs.writeFileSync(file, newContent);
  console.log("Successfully replaced table 2!");
} else {
  console.error("Target block not found. startIndex:", startIndex, "endIndex:", endIndex);
}
