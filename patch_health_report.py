import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """          })()}
        </div>"""

replacement = """          })()}

          {activeTab === "health-report" && (() => {
            const monthsWithData = Array.from(new Set(
              allAssessments
                .filter(a => a.weight !== undefined && a.height !== undefined)
                .map(a => a.month)
                .filter(Boolean) as string[]
            )).sort((a, b) => a.localeCompare(b));

            const displayMonths = monthsWithData.slice(-4);

            return (
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      รายงานสรุปพัฒนาการทางร่างกาย (น้ำหนัก/ส่วนสูง)
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      เปรียบเทียบข้อมูลน้ำหนัก ส่วนสูง และ BMI ย้อนหลังของนักเรียนแต่ละคน
                    </p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap"
                  >
                    <Printer className="h-4 w-4" /> พิมพ์รายงาน
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th rowSpan={2} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center border-r border-slate-200">เลขที่</th>
                          <th rowSpan={2} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase border-r border-slate-200">ชื่อ-สกุล</th>
                          {displayMonths.length === 0 ? (
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center">ไม่มีข้อมูลพัฒนาการ</th>
                          ) : (
                            displayMonths.map(m => (
                              <th key={m} colSpan={3} className="px-4 py-3 text-xs font-black text-slate-700 text-center border-r border-slate-200 bg-slate-100/50">
                                {formatThaiMonthYear(m + '-01')}
                              </th>
                            ))
                          )}
                          {displayMonths.length > 1 && (
                            <th rowSpan={2} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center bg-slate-50">แนวโน้ม BMI</th>
                          )}
                        </tr>
                        {displayMonths.length > 0 && (
                          <tr className="bg-slate-50 border-b border-slate-200">
                            {displayMonths.map(m => (
                              <React.Fragment key={`${m}-sub`}>
                                <th className="px-2 py-2 text-xs font-semibold text-slate-500 text-center border-r border-slate-100">น้ำหนัก</th>
                                <th className="px-2 py-2 text-xs font-semibold text-slate-500 text-center border-r border-slate-100">ส่วนสูง</th>
                                <th className="px-2 py-2 text-xs font-semibold text-slate-500 text-center border-r border-slate-200 bg-slate-100/30">BMI</th>
                              </React.Fragment>
                            ))}
                          </tr>
                        )}
                      </thead>
                      <tbody>
                        {displayedStudents.map((student, idx) => {
                          const studentDataMap: Record<string, { weight?: number, height?: number, bmi?: number, bmiLabel?: string, bmiColor?: string }> = {};
                          
                          let ageYears = 7;
                          if (student.dob) {
                            const birthDate = new Date(student.dob);
                            const ageDifMs = Date.now() - birthDate.getTime();
                            const ageDate = new Date(ageDifMs);
                            ageYears = Math.abs(ageDate.getUTCFullYear() - 1970);
                          }
                          const baseNormal = 14 + (ageYears - 6) * 0.3;
                          const baseOverweight = 18 + (ageYears - 6) * 0.5;
                          const baseObese1 = 20 + (ageYears - 6) * 0.6;
                          const baseObese2 = 22 + (ageYears - 6) * 0.7;

                          displayMonths.forEach(m => {
                            const assessmentForMonth = allAssessments.find(a => a.studentId === student.id && a.month === m);
                            if (assessmentForMonth && assessmentForMonth.weight && assessmentForMonth.height) {
                              const h = assessmentForMonth.height / 100;
                              const bmi = assessmentForMonth.weight / (h * h);
                              
                              let label = '';
                              let color = '';
                              if (bmi < baseNormal) { label = 'ผอม'; color = 'text-blue-600'; }
                              else if (bmi < baseOverweight) { label = 'สมส่วน'; color = 'text-green-600'; }
                              else if (bmi < baseObese1) { label = 'ท้วม'; color = 'text-yellow-600'; }
                              else if (bmi < baseObese2) { label = 'เริ่มอ้วน'; color = 'text-orange-600'; }
                              else { label = 'อ้วน'; color = 'text-red-600'; }

                              studentDataMap[m] = { weight: assessmentForMonth.weight, height: assessmentForMonth.height, bmi, bmiLabel: label, bmiColor: color };
                            }
                          });

                          let trendIcon = <Minus className="h-4 w-4 text-slate-300 mx-auto" />;
                          if (displayMonths.length > 1) {
                            const firstM = displayMonths[0];
                            const lastM = displayMonths[displayMonths.length - 1];
                            const firstBmi = studentDataMap[firstM]?.bmi;
                            const lastBmi = studentDataMap[lastM]?.bmi;
                            if (firstBmi && lastBmi) {
                              const diff = lastBmi - firstBmi;
                              if (diff > 0.5) trendIcon = <TrendingUp className="h-4 w-4 text-red-500 mx-auto" title={`เพิ่มขึ้น ${diff.toFixed(1)}`} />;
                              else if (diff < -0.5) trendIcon = <TrendingDown className="h-4 w-4 text-green-500 mx-auto" title={`ลดลง ${Math.abs(diff).toFixed(1)}`} />;
                            }
                          }

                          return (
                            <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-2 text-sm text-center font-mono text-slate-500 border-r border-slate-200">
                                {student.number}
                              </td>
                              <td className="px-4 py-2 border-r border-slate-200">
                                <div className="font-bold text-slate-800">{student.firstName} {student.lastName}</div>
                                <div className="text-xs text-slate-500 font-mono">{student.studentId}</div>
                              </td>
                              {displayMonths.length === 0 ? (
                                <td className="px-4 py-3 text-center text-slate-400 text-sm">-</td>
                              ) : (
                                displayMonths.map(m => {
                                  const d = studentDataMap[m];
                                  if (!d) {
                                    return (
                                      <React.Fragment key={`${student.id}-${m}`}>
                                        <td className="px-2 py-2 text-center text-slate-300 border-r border-slate-100">-</td>
                                        <td className="px-2 py-2 text-center text-slate-300 border-r border-slate-100">-</td>
                                        <td className="px-2 py-2 text-center text-slate-300 border-r border-slate-200 bg-slate-50/30">-</td>
                                      </React.Fragment>
                                    );
                                  }
                                  return (
                                    <React.Fragment key={`${student.id}-${m}`}>
                                      <td className="px-2 py-2 text-center text-sm font-medium text-slate-700 border-r border-slate-100">{d.weight}</td>
                                      <td className="px-2 py-2 text-center text-sm font-medium text-slate-700 border-r border-slate-100">{d.height}</td>
                                      <td className="px-2 py-2 text-center border-r border-slate-200 bg-slate-50/30">
                                        <div className={`text-sm font-bold ${d.bmiColor}`}>{d.bmi?.toFixed(1)}</div>
                                        <div className={`text-[10px] ${d.bmiColor} opacity-80`}>{d.bmiLabel}</div>
                                      </td>
                                    </React.Fragment>
                                  );
                                })
                              )}
                              {displayMonths.length > 1 && (
                                <td className="px-4 py-2 text-center bg-slate-50/50">
                                  {trendIcon}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                        {displayedStudents.length === 0 && (
                          <tr>
                            <td colSpan={displayMonths.length * 3 + 3} className="px-4 py-8 text-center text-slate-500">
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
        </div>"""

content = content.replace(target, replacement)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
