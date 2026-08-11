const fs = require('fs');

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  const uiCode = `
          </div>
          
          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-emerald-500" />
                ครูผู้ร่วมสอน (Co-teachers)
              </span>
              <span className="text-[10px] text-slate-500 font-normal">เลือกได้มากกว่า 1 ท่าน (ไม่บังคับ)</span>
            </label>
            <div 
              className="w-full p-3 min-h-[44px] text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white cursor-pointer flex flex-wrap gap-2 items-center"
              onClick={() => setShowCoTeacherDropdown(!showCoTeacherDropdown)}
            >
              {coTeachers.length === 0 ? (
                <span className="text-slate-400">คลิกเพื่อเลือกครูผู้ร่วมสอน...</span>
              ) : (
                coTeachers.map(id => {
                  const t = teachers.find(t => t.id === id);
                  return (
                    <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-medium border border-emerald-100">
                      {t ? (t.thaiName || t.displayName) : id}
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setCoTeachers(prev => prev.filter(tid => tid !== id));
                        }}
                        className="hover:text-emerald-900 focus:outline-none"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })
              )}
            </div>
            
            {showCoTeacherDropdown && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2 flex flex-col gap-1">
                {teachers.filter(t => t.id !== teacherId && ['teacher', 'academic', 'deputy', 'admin'].includes(t.role || '')).length === 0 ? (
                  <p className="text-[10px] text-center text-slate-500 p-2">ไม่มีครูท่านอื่นในระบบ</p>
                ) : (
                  teachers
                    .filter(t => t.id !== teacherId && ['teacher', 'academic', 'deputy', 'admin'].includes(t.role || ''))
                    .map(t => {
                      const isSelected = coTeachers.includes(t.id);
                      return (
                        <label key={t.id} className={\`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-colors \${isSelected ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}\`}>
                          <input 
                            type="checkbox" 
                            className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 transition-all cursor-pointer"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCoTeachers(prev => [...prev, t.id]);
                              } else {
                                setCoTeachers(prev => prev.filter(id => id !== t.id));
                              }
                            }}
                          />
                          <span className="text-xs truncate">{t.thaiName || t.displayName}</span>
                        </label>
                      );
                    })
                )}
              </div>
            )}
          </div>
`;

  code = code.replace(/<\/div>\s*<div className="bg-slate-50 border border-slate-200/, uiCode + '\n          <div className="bg-slate-50 border border-slate-200');
  
  if (!code.includes('User,') && !code.includes('import { User } from "lucide-react"')) {
    code = code.replace(/import {/, 'import { User,');
  }

  fs.writeFileSync(file, code, 'utf8');
}

processFile('src/components/LessonPlanForm.tsx');
processFile('src/components/PBLLessonPlanForm.tsx');
