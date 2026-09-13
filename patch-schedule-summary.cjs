const fs = require('fs');

let content = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

// Update header
content = content.replace(
  '<th className="py-3 px-6 font-bold w-1/6">เป้าหมาย (ชม./เทอม)</th>',
  '<th className="py-3 px-6 font-bold w-1/5">เป้าหมายตามหลักสูตร</th>'
);

// Update required hours logic
content = content.replace(
  'const requiredHours = curriculumMatch?.requiredHoursPerTerm || 0;',
  `const requiredHoursYear = curriculumMatch?.requiredHoursPerTerm || 0;
                            const requiredHours = Math.round(requiredHoursYear / 2);`
);

// Update rendering of required hours
content = content.replace(
  `{requiredHours > 0 ? <><span className="font-bold text-indigo-700 text-base">{requiredHours}</span> ชม.</> : '-'}`,
  `{requiredHoursYear > 0 ? (
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-slate-700 font-bold"><span className="text-indigo-700 text-base">{requiredHours}</span> ชม./เทอม</span>
                                      <span className="text-xs text-slate-500">(เต็มปี {requiredHoursYear} ชม.)</span>
                                    </div>
                                  ) : '-'}`
);

fs.writeFileSync('src/components/ScheduleManager.tsx', content);
console.log("Patched schedule manager summary.");
