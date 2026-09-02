const fs = require('fs');
let code = fs.readFileSync('src/components/Student360.tsx', 'utf-8');

// We will insert a table after the first div with grid-cols-2 sm:grid-cols-3
// which ends around line 698.
// Or we can insert it just before the closing </div> of the health tab (before behavior tab).

const tableBlock = `
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 mt-6">
                      <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" /> 
                        ประวัติการเจริญเติบโต (BMI ย้อนหลัง)
                      </h4>
                      {sortedAssessments.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                              <tr>
                                <th className="px-4 py-3 whitespace-nowrap">เดือนที่ประเมิน</th>
                                <th className="px-4 py-3 text-right">น้ำหนัก (กก.)</th>
                                <th className="px-4 py-3 text-right">ส่วนสูง (ซม.)</th>
                                <th className="px-4 py-3 text-center">BMI</th>
                                <th className="px-4 py-3">ผลการประเมิน</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {sortedAssessments.map((a, idx) => {
                                const w = a.weight || 0;
                                const h = (a.height || 100) / 100;
                                const bmi = w / (h * h);
                                
                                let label = '';
                                let color = '';
                                if (bmi < 18.5) { label = 'ผอม'; color = 'text-blue-600 bg-blue-50'; }
                                else if (bmi < 23) { label = 'สมส่วน'; color = 'text-green-600 bg-green-50'; }
                                else if (bmi < 25) { label = 'ท้วม'; color = 'text-yellow-600 bg-yellow-50'; }
                                else if (bmi < 30) { label = 'เริ่มอ้วน'; color = 'text-orange-600 bg-orange-50'; }
                                else { label = 'อ้วน'; color = 'text-red-600 bg-red-50'; }

                                // Format month
                                const parts = (a.month || '').split('-');
                                const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
                                const formattedMonth = parts.length === 2 
                                  ? \`\${monthNames[parseInt(parts[1])-1]} \${parseInt(parts[0]) + 543}\`
                                  : (a.month || \`เทอม \${a.semester}/\${a.academicYear}\`);

                                return (
                                  <tr key={'health_'+idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-700">{formattedMonth}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">{w}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">{a.height}</td>
                                    <td className="px-4 py-3 text-center font-bold text-slate-700">{bmi.toFixed(1)}</td>
                                    <td className="px-4 py-3">
                                      <span className={\`inline-flex px-2 py-1 rounded-md text-[10px] font-bold \${color}\`}>
                                        {label}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-400 text-sm italic bg-slate-50 rounded-xl">
                          ยังไม่มีประวัติการวัดน้ำหนัก-ส่วนสูง
                        </div>
                      )}
                    </div>`;

// Insert after the medical info div
const searchStr = \`                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{student.dental || student.health.dental}</p>
                      </div>
                    </div>\`;

const replaceStr = \`                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{student.dental || student.health.dental}</p>
                      </div>
                    </div>
\` + tableBlock;

code = code.replace(searchStr, replaceStr);

// Also we need to make sure we combine assessments properly.
// The previous logic was: const sortedAssessments = [...kAssessments].filter(a => a.weight && a.height).sort((a, b) => b.month.localeCompare(a.month));
const searchStr2 = \`const sortedAssessments = [...kAssessments].filter(a => a.weight && a.height).sort((a, b) => b.month.localeCompare(a.month));\`;
const replaceStr2 = \`const sortedAssessments = [...kAssessments, ...assessments].filter(a => a.weight && a.height).sort((a, b) => (b.month || '').localeCompare(a.month || ''));\`;
code = code.replace(searchStr2, replaceStr2);

const searchStr3 = \`if (kAssessments.length > 0) {\`;
const replaceStr3 = \`if (kAssessments.length > 0 || assessments.length > 0) {\`;
code = code.replace(searchStr3, replaceStr3);

fs.writeFileSync('src/components/Student360.tsx', code, 'utf-8');
console.log("Health trend table patch applied.");
