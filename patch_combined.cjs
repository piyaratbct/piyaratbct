const fs = require('fs');
const target = fs.readFileSync('target_combine.txt', 'utf8');

const replacement = `          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 mb-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-800">การจัดการตัวชี้วัด (Indicators)</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {curriculums.length === 0 
                      ? 'ไม่พบข้อมูลหลักสูตรสำหรับวิชาและชั้นเรียนที่เลือก'
                      : totalRemaining === 0 
                        ? 'คุณได้นำตัวชี้วัดทั้งหมดไปใช้ในแผนการสอนครบถ้วนแล้ว เยี่ยมมาก!'
                        : \`คุณมีตัวชี้วัดที่ยังไม่ได้ระบุในแผนการสอนใดเลย จำนวน \${totalRemaining} ตัวชี้วัด\`}
                  </p>
                </div>
              </div>
              {curriculums.length > 0 && (
                <div className="flex flex-col gap-1 items-end">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">กรองระดับชั้น</label>
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
                </div>
              )}
            </div>

            {curriculums.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-800">ไม่สามารถเลือกตัวชี้วัดได้</p>
                  <p className="text-[10px] text-amber-700 mt-0.5">
                    กรุณาไปที่ <strong>โมดูลวิชาการ &gt; จัดการหลักสูตร</strong> เพื่อเพิ่มข้อมูลหลักสูตรและตัวชี้วัดให้ครบถ้วนก่อน
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="max-h-80 overflow-y-auto custom-scrollbar p-3 space-y-4">
                  {curriculums
                    .filter(c => tableGradeFilter === 'all' || c.gradeLevel === tableGradeFilter)
                    .map((curr, cIdx) => (
                    <div key={cIdx}>
                      <div className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-2 py-1 rounded mb-2 border border-indigo-100 inline-block">
                        {curr.gradeLevel}
                      </div>
                      {curr.standards.map((std: any, sIdx: number) => {
                        if (!std.indicators || std.indicators.length === 0) return null;
                        
                        return (
                          <div key={sIdx} className="mb-3 ml-2">
                            <div className="font-bold text-slate-700 text-[11px] mb-2 bg-slate-100 px-2 py-1.5 rounded border border-slate-200">
                              {std.title}
                            </div>
                            <div className="space-y-1.5 pl-2">
                              {std.indicators.map((ind: any, iIdx: number) => {
                                const used = usedIndicators.has(ind.code);
                                
                                // Check if selected in current form textareas
                                const isSelectedCore = coreIndicators.split('\\n').some(l => l.trim().startsWith(ind.code));
                                const isSelectedTarget = targetIndicators.split('\\n').some(l => l.trim().startsWith(ind.code));
                                const selected = isSelectedCore || isSelectedTarget;
                                
                                const toggleCombinedIndicator = () => {
                                  const itemStr = \`\${ind.code} \${ind.description}\`;
                                  if (ind.type === 'core') {
                                    let currentLines = coreIndicators.split('\\n').map(l => l.trim()).filter(Boolean);
                                    const existingIndex = currentLines.findIndex(l => l.startsWith(ind.code));
                                    if (existingIndex >= 0) currentLines.splice(existingIndex, 1);
                                    else currentLines.push(itemStr);
                                    setCoreIndicators(currentLines.join('\\n'));
                                  } else {
                                    let currentLines = targetIndicators.split('\\n').map(l => l.trim()).filter(Boolean);
                                    const existingIndex = currentLines.findIndex(l => l.startsWith(ind.code));
                                    if (existingIndex >= 0) currentLines.splice(existingIndex, 1);
                                    else currentLines.push(itemStr);
                                    setTargetIndicators(currentLines.join('\\n'));
                                  }
                                };
                                
                                return (
                                  <label 
                                    key={iIdx} 
                                    className={\`flex items-start gap-2 p-2.5 rounded-lg border sm:cursor-pointer transition-colors \${selected ? 'bg-indigo-50 border-indigo-300 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}\`}
                                  >
                                    <div className="mt-0.5">
                                      <input 
                                        type="checkbox"
                                        checked={selected}
                                        onChange={toggleCombinedIndicator}
                                        className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 h-4 w-4 transition-all"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-800">
                                        <span>{ind.code}</span>
                                        <span className={\`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold \${ind.type === 'core' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}\`}>
                                          {ind.type === 'core' ? 'ต้นทาง' : 'ปลายทาง'}
                                        </span>
                                        {used ? (
                                          <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200" title="ถูกใช้งานแล้วในแผนการสอนอื่น">
                                            <Check className="h-3 w-3" /> ถูกใช้แล้ว
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-100" title="ยังไม่เคยถูกนำไปใช้ในแผนการสอนใดเลย">
                                            <AlertCircle className="h-3 w-3" /> คงเหลือ
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                                        {ind.description}
                                      </div>
                                    </div>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-emerald-600" />
              ตัวชี้วัดต้องรู้ (ต้นทาง) ที่เลือกไว้
            </label>
            <p className="text-[10px] text-slate-400 mb-2">
              (สามารถแก้ไขข้อความด้านล่างเพิ่มเติมได้ หากจำเป็น)
            </p>
            <textarea
              value={coreIndicators}
              onChange={(e) => setCoreIndicators(e.target.value)}
              rows={2}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
              placeholder="คลิกเลือกจากรายการด้านบน หรือพิมพ์เพิ่ม..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-amber-500" />
              ตัวชี้วัดควรรู้ (ปลายทาง) ที่เลือกไว้
            </label>
            <p className="text-[10px] text-slate-400 mb-2">
              (สามารถแก้ไขข้อความด้านล่างเพิ่มเติมได้ หากจำเป็น)
            </p>
            <textarea
              value={targetIndicators}
              onChange={(e) => setTargetIndicators(e.target.value)}
              rows={2}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
              placeholder="คลิกเลือกจากรายการด้านบน หรือพิมพ์เพิ่ม..."
            />
          </div>`;

let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');
code = code.replace(target, replacement);
fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
