const fs = require('fs');
let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

const targetStr = `              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ประเภทวิชา</label>
                <select 
                  value={editingSubject.subjectType || 'academic'} 
                  onChange={e => setEditingSubject({...editingSubject, subjectType: e.target.value as 'academic' | 'activity'})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm mb-4"
                >
                  <option value="academic">วิชาการ (ตัดเกรด 0-4)</option>
                  <option value="activity">กิจกรรมพัฒนาผู้เรียน (ผ่าน / ไม่ผ่าน)</option>
                </select>
              </div>`;

const newTargetStr = `              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ประเภทวิชา</label>
                  <select 
                    value={editingSubject.subjectType || 'academic'} 
                    onChange={e => {
                      const newType = e.target.value as 'academic' | 'activity';
                      setEditingSubject({
                        ...editingSubject, 
                        subjectType: newType,
                        // Reset academicCategory if switched to activity
                        academicCategory: newType === 'activity' ? undefined : (editingSubject.academicCategory || 'basic')
                      });
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm mb-4"
                  >
                    <option value="academic">วิชาการ (ตัดเกรด 0-4)</option>
                    <option value="activity">กิจกรรมพัฒนาผู้เรียน (ผ่าน / ไม่ผ่าน)</option>
                  </select>
                </div>
                
                {(!editingSubject.subjectType || editingSubject.subjectType === 'academic') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">หมวดหมู่วิชาการ</label>
                    <select 
                      value={editingSubject.academicCategory || 'basic'} 
                      onChange={e => setEditingSubject({...editingSubject, academicCategory: e.target.value as 'basic' | 'additional'})}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm mb-4"
                    >
                      <option value="basic">วิชาพื้นฐาน</option>
                      <option value="additional">วิชาเพิ่มเติม</option>
                    </select>
                  </div>
                )}
              </div>`;

content = content.replace(targetStr, newTargetStr);

// Also patch the save logic to include academicCategory
const saveTargetStr = `        gradeLevels: editingSubject.gradeLevels || [editingSubject.gradeLevel],
        subjectType: editingSubject.subjectType || 'academic',
        standards: editingSubject.standards || [],`;
        
const newSaveTargetStr = `        gradeLevels: editingSubject.gradeLevels || [editingSubject.gradeLevel],
        subjectType: editingSubject.subjectType || 'academic',
        academicCategory: editingSubject.subjectType === 'activity' ? undefined : (editingSubject.academicCategory || 'basic'),
        standards: editingSubject.standards || [],`;

content = content.replace(saveTargetStr, newSaveTargetStr);

// Also patch the list display to show tags for basic/additional/activity
const listTargetStr = `                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={\`text-xs font-bold px-2 py-0.5 rounded-full \${
                          c.isParent ? 'bg-indigo-100 text-indigo-700' : 
                          c.parentId ? 'bg-emerald-100 text-emerald-700' : 
                          'bg-slate-100 text-slate-600'
                        }\`}>
                          {c.isParent ? 'วิชาหลัก' : c.parentId ? 'วิชาย่อย' : 'รายวิชา'}
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm truncate">{c.subjectName}</h4>
                      </div>
                      <div className="text-[10px] text-slate-400">`;

const newListTargetStr = `                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full \${
                          c.isParent ? 'bg-indigo-100 text-indigo-700' : 
                          c.parentId ? 'bg-emerald-100 text-emerald-700' : 
                          'bg-slate-100 text-slate-600'
                        }\`}>
                          {c.isParent ? 'วิชาหลัก' : c.parentId ? 'วิชาย่อย' : 'รายวิชา'}
                        </span>
                        
                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full \${
                          c.subjectType === 'activity' ? 'bg-purple-100 text-purple-700' :
                          c.academicCategory === 'additional' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }\`}>
                          {c.subjectType === 'activity' ? 'กิจกรรม' : 
                           c.academicCategory === 'additional' ? 'เพิ่มเติม' : 'พื้นฐาน'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm truncate mb-0.5">{c.subjectName}</h4>
                      <div className="text-[10px] text-slate-400">`;
                      
content = content.replace(listTargetStr, newListTargetStr);

fs.writeFileSync('src/components/CurriculumManager.tsx', content);
console.log("Patched CurriculumManager with academicCategory");
