const fs = require('fs');

let content = fs.readFileSync('src/components/UnifiedCurriculumManager.tsx', 'utf8');

const targetStr = `              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อรายวิชา (พร้อมรหัส)</label>
                <input 
                  type="text" 
                  value={editingSubject.subjectName || ''}
                  onChange={e => setEditingSubject({...editingSubject, subjectName: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="เช่น คณิตศาสตร์พื้นฐาน (ค11101)"
                  list="subject-options"
                />
                <datalist id="subject-options">
                  {SUBJECTS.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>`;

const newFields = `              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อรายวิชา (พร้อมรหัส)</label>
                <input 
                  type="text" 
                  value={editingSubject.subjectName || ''}
                  onChange={e => setEditingSubject({...editingSubject, subjectName: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="เช่น คณิตศาสตร์พื้นฐาน (ค11101)"
                  list="subject-options"
                />
                <datalist id="subject-options">
                  {SUBJECTS.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">โครงสร้างเวลาเรียน (ชั่วโมง / เทอม)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={editingSubject.requiredHoursPerTerm || ''}
                    onChange={e => setEditingSubject({...editingSubject, requiredHoursPerTerm: e.target.value ? Number(e.target.value) : undefined})}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm pr-10"
                    placeholder="เช่น 100"
                    min="1"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium pointer-events-none">ชม.</div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">ตัวเลขนี้จะถูกนำไปใช้คำนวณระยะเวลาเรียนที่แท้จริงหักลบกับวันหยุดในตารางสอน</p>
              </div>`;

content = content.replace(targetStr, newFields);
fs.writeFileSync('src/components/UnifiedCurriculumManager.tsx', content);
console.log("Patched UnifiedCurriculumManager.tsx");
