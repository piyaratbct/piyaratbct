const fs = require('fs');
let code = fs.readFileSync('src/components/AttendancePrintTemplate.tsx', 'utf-8');

// 1. Update header
const oldHeader = `<th className="border border-slate-900 px-2 py-2 text-center w-16" rowSpan={2}>รวมมาเรียน<br/><span className="text-[10px] font-normal">(คาบ)</span></th>
                  <th className="border border-slate-900 px-2 py-2 text-center w-16" rowSpan={2}>เวลาเรียนเต็ม<br/><span className="text-[10px] font-normal">(คาบ)</span></th>
                  <th className="border border-slate-900 px-2 py-2 text-center w-16" rowSpan={2}>ร้อยละ<br/><span className="text-[10px] font-normal">(%)</span></th>
                  <th className="border border-slate-900 px-2 py-2 text-center w-16" rowSpan={2}>สิทธิ์สอบ<br/><span className="text-[10px] font-normal">(ผ/มส)</span></th>`;

const newHeader = `<th className="border border-slate-900 px-2 py-2 text-center w-16 whitespace-nowrap" rowSpan={2}>รวมมาเรียน<br/><span className="text-[10px] font-normal">(คาบ)</span></th>
                  <th className="border border-slate-900 px-2 py-2 text-center w-16 whitespace-nowrap" rowSpan={2}>เวลาเรียนเต็ม<br/><span className="text-[10px] font-normal">(คาบ)</span></th>
                  <th className="border border-slate-900 px-2 py-2 text-center w-20 whitespace-nowrap" rowSpan={2}>ร้อยละ<br/><span className="text-[10px] font-normal">(%)</span></th>`;

code = code.replace(oldHeader, newHeader);

// 2. Update tbody row (remove the last column and append " (มส.)" if at risk)
const oldTbody = `<td className={\`border border-slate-900 px-2 py-1 text-center font-bold \${isAtRisk ? 'text-rose-600' : ''}\`}>
                        {baseTotal > 0 ? percentage.toFixed(1) : "-"}
                      </td>
                      <td className={\`border border-slate-900 px-2 py-1 text-center font-bold \${isAtRisk ? 'text-rose-600' : ''}\`}>
                        {baseTotal > 0 ? (isAtRisk ? "มส." : "ผ") : "-"}
                      </td>`;

const newTbody = `<td className={\`border border-slate-900 px-2 py-1 text-center font-bold \${isAtRisk ? 'text-rose-600' : ''}\`}>
                        {baseTotal > 0 ? percentage.toFixed(1) + (isAtRisk ? " (มส.)" : "") : "-"}
                      </td>`;

code = code.replace(oldTbody, newTbody);

fs.writeFileSync('src/components/AttendancePrintTemplate.tsx', code, 'utf-8');
console.log("Patched AttendancePrintTemplate");
