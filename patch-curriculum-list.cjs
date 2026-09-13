const fs = require('fs');

let content = fs.readFileSync('src/components/UnifiedCurriculumManager.tsx', 'utf8');

const targetStr = `                    <button 
                      onClick={() => setSelectedCurriculumId(c.id)}
                      className={\`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors \${
                        selectedCurriculumId === c.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                      }\`}
                    >
                      <div className="line-clamp-1">{c.subjectName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{c.gradeLevel}</div>
                    </button>`;

const newTargetStr = `                    <button 
                      onClick={() => setSelectedCurriculumId(c.id)}
                      className={\`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-start justify-between \${
                        selectedCurriculumId === c.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                      }\`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="line-clamp-1 flex items-center gap-1.5">
                          {c.subjectName}
                          {(!c.totalHours || c.totalHours === 0) && !c.isParent && (
                             <AlertCircle className="h-3.5 w-3.5 text-orange-500 shrink-0" title="ยังไม่ได้ระบุชั่วโมงเรียน" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{c.gradeLevel}</div>
                      </div>
                    </button>`;

content = content.replace(targetStr, newTargetStr);
fs.writeFileSync('src/components/UnifiedCurriculumManager.tsx', content);
console.log("Patched UnifiedCurriculumManager.tsx");

// Let's do the same for CurriculumManager.tsx just in case
let content2 = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');
content2 = content2.replace(targetStr, newTargetStr);
fs.writeFileSync('src/components/CurriculumManager.tsx', content2);
console.log("Patched CurriculumManager.tsx");

