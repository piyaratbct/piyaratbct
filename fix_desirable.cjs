const fs = require('fs');

function applyPatch(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Extract the target section to replace
  const regex = /\{\/\* คุณลักษณะอันพึงประสงค์ 8 ประการ \*\/\}[\s\S]*?<\/div>\s*\{isKindergarten/g;
  
  const newSection = `
          {selectedGrades.some(g => g.includes('ประถม')) && (
            {/* คุณลักษณะอันพึงประสงค์ 8 ประการ */}
            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 mb-4">
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
                  <p className="text-xs text-amber-700">เลือกตัวชี้วัดคุณลักษณะอันพึงประสงค์ที่ต้องการประเมินในแผนการสอนนี้ (ข้อมูลจะถูกนำไปตั้งเป็นหัวข้อประเมินอัตโนมัติในบันทึกหลังสอน)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DESIRABLE_CHARACTERISTICS.map(char => (
                      <div key={char.id} className="bg-white p-3 rounded-xl border border-amber-100">
                        <div className="font-bold text-xs text-amber-900 mb-2">{char.id}. {char.name}</div>
                        <div className="space-y-1">
                          {char.indicators.map(ind => (
                            <label key={ind.id} className="flex items-start gap-2 cursor-pointer group py-0.5">
                              <input 
                                type="checkbox"
                                className="mt-[3px] rounded border-amber-300 text-amber-500 focus:ring-amber-500 shrink-0"
                                checked={desirableCharacteristics.includes(ind.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setDesirableCharacteristics(prev => [...prev, ind.id]);
                                  } else {
                                    setDesirableCharacteristics(prev => prev.filter(id => id !== ind.id));
                                  }
                                }}
                              />
                              <span className="text-[11px] text-slate-600 group-hover:text-amber-800 leading-snug">
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
          )}

          {isKindergarten`;

  if (code.match(regex)) {
    code = code.replace(regex, newSection);
    fs.writeFileSync(file, code);
    console.log("Patched " + file);
  } else {
    console.log("Could not find target in " + file);
  }
}

applyPatch('src/components/LessonPlanForm.tsx');
applyPatch('src/components/PBLLessonPlanForm.tsx');
