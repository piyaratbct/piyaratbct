const fs = require('fs');
let code = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

const targetStr = `
                <button 
                  onClick={() => {
                    setEditingStandard({ title: '' });
                    setShowStandardForm(true);
                  }}
                  className="flex-shrink-0 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors"
                >
                  + เพิ่มมาตรฐานการเรียนรู้
                </button>
              </div>`;

const replaceStr = `
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button 
                    onClick={() => {
                      setEditingSubject(selectedCurriculum);
                      setShowSubjectForm(true);
                    }}
                    className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" /> แก้ไขรายวิชา
                  </button>
                  <button 
                    onClick={() => deleteSubject(selectedCurriculum.id)}
                    className="px-3 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg text-sm font-bold hover:bg-rose-50 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> ลบ
                  </button>
                  <div className="w-px h-8 bg-slate-200 mx-1"></div>
                  <button 
                    onClick={() => {
                      setEditingStandard({ title: '' });
                      setShowStandardForm(true);
                    }}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> เพิ่มมาตรฐาน
                  </button>
                </div>
              </div>`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/CurriculumManager.tsx', code, 'utf8');
