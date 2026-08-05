const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

// For the IndicatorSelector, let's remove the null return when curriculums is empty and show a message instead.
const selectorEmptyTarget = `  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
  
  if (!curriculums || curriculums.length === 0) return null;

  const toggleIndicator`;

const selectorEmptyReplacement = `  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');

  const toggleIndicator`;

code = code.replace(selectorEmptyTarget, selectorEmptyReplacement);

const renderSelectorEmptyTarget = `      {isOpen && (
        <div className="p-3 max-h-64 overflow-y-auto custom-scrollbar flex flex-col bg-white">`;

const renderSelectorEmptyReplacement = `      {isOpen && (
        <div className="p-3 max-h-64 overflow-y-auto custom-scrollbar flex flex-col bg-white">
          {(!curriculums || curriculums.length === 0) ? (
            <div className="text-center py-4 text-slate-500 text-xs">
              ไม่พบข้อมูลตัวชี้วัด กรุณาเพิ่มหลักสูตรในโมดูลวิชาการ
            </div>
          ) : (
            <>
`;

code = code.replace(renderSelectorEmptyTarget, renderSelectorEmptyReplacement);

// Close the fragment inside the selector
const closeSelectorEmptyTarget = `              })}
            </div>
          ))}
          </div>
        </div>
      )}
    </div>`;

const closeSelectorEmptyReplacement = `              })}
            </div>
          ))}
          </div>
          </>
          )}
        </div>
      )}
    </div>`;
code = code.replace(closeSelectorEmptyTarget, closeSelectorEmptyReplacement);

// For the Remaining Indicators Table
const tableConditionTarget = `{curriculums.length > 0 && totalRemaining > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col gap-3 mb-4 shadow-sm">`;

const tableConditionReplacement = `<div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 mb-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">สรุปตัวชี้วัดคงเหลือที่ต้องจัดทำแผน</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {curriculums.length === 0 
                        ? 'ไม่พบข้อมูลหลักสูตรสำหรับวิชาและระดับชั้นนี้ (กรุณาเพิ่มในโมดูลวิชาการ)' 
                        : totalRemaining === 0 
                          ? 'คุณได้นำตัวชี้วัดทั้งหมดไปใช้ในแผนการสอนครบถ้วนแล้ว เยี่ยมมาก!'
                          : \`คุณมีตัวชี้วัดที่ยังไม่ได้ระบุในแผนการสอนใดเลย จำนวน \${totalRemaining} ตัวชี้วัด\`}
                    </p>
                  </div>
                </div>
                {curriculums.length > 0 && (
                  <select 
                    value={tableGradeFilter}
                    onChange={(e) => setTableGradeFilter(e.target.value)}
                    className="text-xs p-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[120px]"
                  >
                    <option value="all">ทุกระดับชั้น</option>
                    {curriculums.map(c => (
                      <option key={c.gradeLevel} value={c.gradeLevel}>{c.gradeLevel}</option>
                    ))}
                  </select>
                )}
              </div>
              
              {curriculums.length > 0 && totalRemaining > 0 && (
                <div className="mt-2 bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto custom-scrollbar max-h-60">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 w-24">รหัสตัวชี้วัด</th>
                          <th className="px-3 py-2 min-w-[250px]">คำอธิบาย</th>
                          <th className="px-3 py-2 w-28 text-center">ประเภท</th>
                          <th className="px-3 py-2 w-32">มาตรฐาน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {curriculums
                          .filter(c => tableGradeFilter === 'all' || c.gradeLevel === tableGradeFilter)
                          .map(curr => 
                          curr.standards.map((std: any) => 
                            std.indicators.map((ind: any) => {
                              if (usedIndicators.has(ind.code)) return null;
                              return (
                                <tr key={ind.id || ind.code} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-3 py-2 font-bold text-slate-700">{ind.code}</td>
                                  <td className="px-3 py-2 text-slate-600 whitespace-normal min-w-[250px]">{ind.description}</td>
                                  <td className="px-3 py-2 text-center">
                                    <span className={\`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold \${ind.type === 'core' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}\`}>
                                      {ind.type === 'core' ? 'ระหว่างทาง' : 'ปลายทาง'}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-slate-500 font-medium truncate max-w-[150px]" title={std.title}>{std.title}</td>
                                </tr>
                              );
                            })
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
`;

// Remove the old table code
const oldTableEndTarget = `                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}`;

code = code.replace(tableConditionTarget, tableConditionReplacement);

const cleanupRegex = /<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">[\s\S]*?<\/table>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?}\)/;
// Actually, let me just replace the exact block manually using string replace.
// Wait, I messed up the replacement logic for the table by only replacing the opening tags. Let me rewrite the script to do a clean replace.
