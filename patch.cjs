const fs = require('fs');
let code = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

const target = `                    const tScheds = allSchedules.filter(s => s.teacherId === t.id);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-slate-800">{t.displayName || t.thaiName}</td>
                        <td className="py-3 px-4 text-center text-sm font-bold text-indigo-600">{tScheds.length} คาบ</td>
                      </tr>
                    )`;

const replacement = `                    const tScheds = allSchedules.filter(s => s.teacherId === t.id);
                    const subjectGroups = tScheds.reduce((acc, curr) => {
                      const subjectName = curr.subject === 'อื่นๆ' ? (curr.customSubject || 'อื่นๆ') : curr.subject;
                      if (!acc[subjectName]) acc[subjectName] = new Set<string>();
                      acc[subjectName].add(curr.gradeLevel);
                      return acc;
                    }, {} as Record<string, Set<string>>);
                    const sortedSubjects = Object.keys(subjectGroups).sort();
                    
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-slate-800 align-top whitespace-nowrap">{t.displayName || t.thaiName}</td>
                        <td className="py-3 px-4 text-sm text-slate-600 align-top">
                          {sortedSubjects.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1">
                              {sortedSubjects.map(sub => (
                                <li key={sub}>
                                  <span className="font-semibold text-slate-700">{sub}</span> 
                                  <span className="text-xs text-slate-500 ml-1">({Array.from(subjectGroups[sub]).sort().join(', ')})</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-slate-400 italic">ไม่มีข้อมูล</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-sm font-bold text-indigo-600 align-top">{tScheds.length} คาบ</td>
                      </tr>
                    )`;

if (code.includes(target)) {
  fs.writeFileSync('src/components/ScheduleManager.tsx', code.replace(target, replacement));
  console.log("Patched successfully");
} else {
  console.log("Target not found");
}
