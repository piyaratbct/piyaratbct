const fs = require('fs');

let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

const targetStr = `                    <button 
                      onClick={() => setSelectedCurriculumId(c.id)}
                      className={\`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors \${
                        selectedCurriculumId === c.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                      }\`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        {c.subjectCode && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 flex-shrink-0">
                            {c.subjectCode}
                          </span>
                        )}
                        <span className="line-clamp-1 flex-1 font-bold">{c.subjectName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {c.gradeLevels && c.gradeLevels.length > 1 
                          ? \`\${c.gradeLevels[0]} - \${c.gradeLevels[c.gradeLevels.length - 1]}\`
                          : c.gradeLevel}
                      </div>
                    </button>`;

const newTargetStr = `                    <button 
                      onClick={() => setSelectedCurriculumId(c.id)}
                      className={\`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-start justify-between \${
                        selectedCurriculumId === c.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                      }\`}
                    >
                      <div className="min-w-0 pr-2 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          {c.subjectCode && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 flex-shrink-0">
                              {c.subjectCode}
                            </span>
                          )}
                          <span className="line-clamp-1 flex-1 font-bold flex items-center gap-1.5">
                            {c.subjectName}
                            {(!c.totalHours || c.totalHours === 0) && (
                               <AlertCircle className="h-3.5 w-3.5 text-orange-500 shrink-0" title="ยังไม่ได้ระบุชั่วโมงเรียน" />
                            )}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {c.gradeLevels && c.gradeLevels.length > 1 
                            ? \`\${c.gradeLevels[0]} - \${c.gradeLevels[c.gradeLevels.length - 1]}\`
                            : c.gradeLevel}
                        </div>
                      </div>
                    </button>`;

content = content.replace(targetStr, newTargetStr);
fs.writeFileSync('src/components/CurriculumManager.tsx', content);

console.log("Patched CurriculumManager with AlertCircle");
