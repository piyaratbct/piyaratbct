const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

const oldNameCol = `<td className="px-4 py-3 border-r border-slate-200 font-medium">
                              <div className="flex items-center gap-2">
                                <span>{student.firstName} {student.lastName}</span>
                                {isAtRisk && <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold" title="เวลาเรียนไม่ถึง 80% (ไม่มีสิทธิ์สอบ)">มส.</span>}
                              </div>
                            </td>`;

const newNameCol = `<td className="px-4 py-3 border-r border-slate-200 font-medium whitespace-nowrap">
                              <span>{student.firstName} {student.lastName}</span>
                            </td>`;

code = code.replace(oldNameCol, newNameCol);

const oldPercentageCol = `<td className={\`px-4 py-3 text-center font-bold \${isAtRisk ? 'text-rose-600' : 'text-emerald-600'}\`}>
                              {percentage.toFixed(1)}%
                            </td>`;

const newPercentageCol = `<td className={\`px-4 py-3 text-center font-bold \${isAtRisk ? 'text-rose-600' : 'text-emerald-600'}\`}>
                              <div className="flex items-center justify-center gap-2">
                                <span>{percentage.toFixed(1)}%</span>
                                {isAtRisk && <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold" title="เวลาเรียนไม่ถึง 80% (ไม่มีสิทธิ์สอบ)">มส.</span>}
                              </div>
                            </td>`;

code = code.replace(oldPercentageCol, newPercentageCol);

fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf-8');
console.log("Moved badge");
