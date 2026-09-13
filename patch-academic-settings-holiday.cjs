const fs = require('fs');

let content = fs.readFileSync('src/components/AcademicSettings.tsx', 'utf8');

// Add useAvailableSubjects if not present
if (!content.includes('useAvailableSubjects')) {
  content = content.replace(
    /import \{ Teacher, SchoolHoliday \} from "\.\.\/types";/,
    `import { Teacher, SchoolHoliday } from "../types";\nimport { useAvailableSubjects } from "../hooks/useAvailableSubjects";`
  );
}

// Add the hook inside the component
if (!content.includes('const availableSubjects = useAvailableSubjects()')) {
  content = content.replace(
    /const \[isProcessing, setIsProcessing\] = useState\(false\);/,
    `const [isProcessing, setIsProcessing] = useState(false);\n  const availableSubjects = useAvailableSubjects();`
  );
}

// Ensure the new SchoolHoliday has type default to 'holiday'
content = content.replace(
  /onClick=\{\(\) => setHolidays\(\[\.\.\.holidays, \{ id: Date\.now\(\)\.toString\(\), date: '', description: '' \}\]\)\}/,
  `onClick={() => setHolidays([...holidays, { id: Date.now().toString(), date: '', description: '', type: 'holiday', integratedSubjects: [] }])}`
);

// Replace the holiday mapping structure
const oldHolidayRender = `<div className="space-y-3">
                {holidays.map((holiday, index) => (
                  <div key={holiday.id} className="flex items-start sm:items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
                    <input
                      type="date"
                      value={holiday.date}
                      onChange={(e) => {
                        const newHolidays = [...holidays];
                        newHolidays[index].date = e.target.value;
                        setHolidays(newHolidays);
                      }}
                      disabled={!canEdit}
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-slate-100"
                    />
                    <input
                      type="text"
                      value={holiday.description}
                      onChange={(e) => {
                        const newHolidays = [...holidays];
                        newHolidays[index].description = e.target.value;
                        setHolidays(newHolidays);
                      }}
                      disabled={!canEdit}
                      placeholder="รายละเอียด (เช่น วันวิสาขบูชา, วันหยุดชดเชย)"
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-slate-100"
                    />
                    {canEdit && (
                      <button
                        onClick={() => {
                          const newHolidays = holidays.filter(h => h.id !== holiday.id);
                          setHolidays(newHolidays);
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>`;

const newHolidayRender = `<div className="space-y-3">
                {holidays.map((holiday, index) => (
                  <div key={holiday.id} className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex flex-wrap items-start sm:items-center gap-3">
                      <input
                        type="date"
                        value={holiday.date}
                        onChange={(e) => {
                          const newHolidays = [...holidays];
                          newHolidays[index].date = e.target.value;
                          setHolidays(newHolidays);
                        }}
                        disabled={!canEdit}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-slate-100"
                      />
                      
                      <select
                        value={holiday.type || 'holiday'}
                        onChange={(e) => {
                          const newHolidays = [...holidays];
                          newHolidays[index].type = e.target.value as any;
                          if (e.target.value !== 'activity_integrated') {
                            newHolidays[index].integratedSubjects = [];
                          }
                          setHolidays(newHolidays);
                        }}
                        disabled={!canEdit}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 min-w-[180px]"
                      >
                        <option value="holiday">วันหยุดราชการ / หยุดพิเศษ</option>
                        <option value="activity_no_class">กิจกรรมโรงเรียน (งดเรียน)</option>
                        <option value="activity_integrated">กิจกรรมบูรณาการ (นับชั่วโมง)</option>
                      </select>

                      <input
                        type="text"
                        value={holiday.description}
                        onChange={(e) => {
                          const newHolidays = [...holidays];
                          newHolidays[index].description = e.target.value;
                          setHolidays(newHolidays);
                        }}
                        disabled={!canEdit}
                        placeholder="รายละเอียด (เช่น วันวิสาขบูชา, วันกีฬาสี)"
                        className="flex-1 min-w-[200px] border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-slate-100"
                      />
                      
                      {canEdit && (
                        <button
                          onClick={() => {
                            const newHolidays = holidays.filter(h => h.id !== holiday.id);
                            setHolidays(newHolidays);
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto sm:ml-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    {holiday.type === 'activity_integrated' && (
                      <div className="pl-0 sm:pl-[380px]">
                        <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                          <label className="block text-xs font-bold text-indigo-800 mb-2">
                            บูรณาการเพื่อคิดชั่วโมงให้วิชาต่อไปนี้ (เลือกได้มากกว่า 1 วิชา)
                          </label>
                          <div className="w-full text-xs p-2 border border-slate-200 rounded-lg max-h-32 overflow-y-auto bg-white flex flex-col gap-1.5">
                            {availableSubjects.flatMap((s: any) => typeof s === 'string' ? [s] : s.type === 'single' ? [s.name] : s.subjects).filter((s: string) => s !== 'อื่นๆ' && s !== 'อื่น ๆ').map((subj: string) => {
                                const isChecked = (holiday.integratedSubjects || []).includes(subj);
                                return (
                                  <label key={subj} className="flex items-start gap-1.5 cursor-pointer hover:bg-slate-50 p-1 rounded">
                                    <input 
                                      type="checkbox" 
                                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (!canEdit) return;
                                        const newHolidays = [...holidays];
                                        const currSubs = newHolidays[index].integratedSubjects || [];
                                        if (e.target.checked) {
                                          newHolidays[index].integratedSubjects = [...currSubs, subj];
                                        } else {
                                          newHolidays[index].integratedSubjects = currSubs.filter((s: string) => s !== subj);
                                        }
                                        setHolidays(newHolidays);
                                      }}
                                      disabled={!canEdit}
                                    />
                                    <span className={isChecked ? 'text-indigo-700 font-medium' : 'text-slate-600'}>{subj}</span>
                                  </label>
                                );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>`;

content = content.replace(oldHolidayRender, newHolidayRender);

fs.writeFileSync('src/components/AcademicSettings.tsx', content);
console.log("Patched AcademicSettings.tsx");
