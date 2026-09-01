const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

const newSection = `
          {/* คุณลักษณะอันพึงประสงค์ 8 ประการ */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
            <button 
              type="button" 
              onClick={() => setExpandedDesirable(!expandedDesirable)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <label className="text-xs font-bold text-amber-900 cursor-pointer">คุณลักษณะอันพึงประสงค์ 8 ประการ (Desirable Characteristics)</label>
              </div>
              {expandedDesirable ? <ChevronUp className="h-4 w-4 text-amber-600" /> : <ChevronDown className="h-4 w-4 text-amber-600" />}
            </button>
            
            {expandedDesirable && (
              <div className="mt-4 space-y-4">
                <p className="text-[10px] text-amber-700">เลือกตัวชี้วัดคุณลักษณะอันพึงประสงค์ที่ต้องการประเมินในแผนการสอนนี้ (ข้อมูลจะถูกนำไปตั้งเป็นหัวข้อประเมินอัตโนมัติในบันทึกหลังสอน)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DESIRABLE_CHARACTERISTICS.map(char => (
                    <div key={char.id} className="bg-white p-3 rounded-xl border border-amber-100">
                      <div className="font-bold text-[11px] text-amber-900 mb-2">{char.id}. {char.name}</div>
                      <div className="space-y-2">
                        {char.indicators.map(ind => (
                          <label key={ind.id} className="flex items-start gap-2 cursor-pointer group">
                            <div className="mt-0.5">
                              <input 
                                type="checkbox"
                                className="rounded border-amber-300 text-amber-500 focus:ring-amber-500"
                                checked={desirableCharacteristics.includes(ind.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setDesirableCharacteristics(prev => [...prev, ind.id]);
                                  } else {
                                    setDesirableCharacteristics(prev => prev.filter(id => id !== ind.id));
                                  }
                                }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-600 group-hover:text-amber-800 leading-tight">
                              {ind.id} {ind.text}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
`;

code = code.replace(
  "            />\n          </div>\n          {isKindergarten ? (",
  "            />\n          </div>\n" + newSection + "\n          {isKindergarten ? ("
);

fs.writeFileSync('src/components/LessonPlanForm.tsx', code);
