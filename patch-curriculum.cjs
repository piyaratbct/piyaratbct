const fs = require('fs');
let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

const inputStr = `              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อรายวิชา (พร้อมรหัส)</label>
                <input 
                  type="text" 
                  value={editingSubject.subjectName || ''} 
                  onChange={e => setEditingSubject({...editingSubject, subjectName: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="เช่น ท11101 ภาษาไทย"
                />
              </div>`;

const newInputStr = `              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ประเภทวิชา</label>
                <select 
                  value={editingSubject.subjectType || 'academic'} 
                  onChange={e => setEditingSubject({...editingSubject, subjectType: e.target.value as 'academic' | 'activity'})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="academic">วิชาการ (ตัดเกรด 0-4)</option>
                  <option value="activity">กิจกรรมพัฒนาผู้เรียน (ผ่าน / ไม่ผ่าน)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อรายวิชา (พร้อมรหัส)</label>
                <input 
                  type="text" 
                  value={editingSubject.subjectName || ''} 
                  onChange={e => setEditingSubject({...editingSubject, subjectName: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="เช่น ท11101 ภาษาไทย หรือ กิจกรรมลูกเสือ"
                />
              </div>`;

content = content.replace(inputStr, newInputStr);
fs.writeFileSync('src/components/CurriculumManager.tsx', content);
console.log("Patched CurriculumManager form");
