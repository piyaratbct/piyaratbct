const fs = require('fs');
let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

// 1. Sidebar subject edit/delete
const search1 = `{selectedCurriculumId === c.id && (
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1 bg-indigo-50 pl-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingSubject(c); setShowSubjectForm(true); }}
                          className="p-1 text-indigo-400 hover:text-indigo-600 rounded"
                        ><Edit className="h-3.5 w-3.5" /></button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteSubject(c.id); }}
                          className="p-1 text-rose-400 hover:text-rose-600 rounded"
                        ><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    )}`;

const repl1 = `{canEdit && selectedCurriculumId === c.id && (
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1 bg-indigo-50 pl-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingSubject(c); setShowSubjectForm(true); }}
                          className="p-1 text-indigo-400 hover:text-indigo-600 rounded"
                        ><Edit className="h-3.5 w-3.5" /></button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteSubject(c.id); }}
                          className="p-1 text-rose-400 hover:text-rose-600 rounded"
                        ><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    )}`;

// 2. Detail header buttons
const search2 = `<div className="flex items-center gap-2 flex-shrink-0">
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
                    <Trash2 className="h-4 w-4" /> ลบรายวิชา
                  </button>
                  <button 
                    onClick={() => clearIndicators(selectedCurriculum.id)}
                    className="px-3 py-2 bg-white border border-amber-200 text-amber-600 rounded-lg text-sm font-bold hover:bg-amber-50 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> ล้างตัวชี้วัดทั้งหมด
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
                </div>`;

const repl2 = `{canEdit && (
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
                    <Trash2 className="h-4 w-4" /> ลบรายวิชา
                  </button>
                  <button 
                    onClick={() => clearIndicators(selectedCurriculum.id)}
                    className="px-3 py-2 bg-white border border-amber-200 text-amber-600 rounded-lg text-sm font-bold hover:bg-amber-50 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> ล้างตัวชี้วัดทั้งหมด
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
                )}`;

// 3. Standard level buttons
const search3 = `<div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setTargetStandardId(standard.id);
                              setEditingIndicator({ code: '', description: '', type: 'core' });
                              setShowIndicatorForm(true);
                            }}
                            className="text-xs font-bold text-indigo-600 bg-white border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" /> เพิ่มตัวชี้วัด
                          </button>
                          <div className="h-4 w-px bg-slate-300 mx-1"></div>
                          <button onClick={() => { setEditingStandard({ id: standard.id, title: standard.title }); setShowStandardForm(true); }} className="text-slate-400 hover:text-indigo-600"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => deleteStandard(standard.id)} className="text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                        </div>`;

const repl3 = `{canEdit && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setTargetStandardId(standard.id);
                              setEditingIndicator({ code: '', description: '', type: 'core' });
                              setShowIndicatorForm(true);
                            }}
                            className="text-xs font-bold text-indigo-600 bg-white border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" /> เพิ่มตัวชี้วัด
                          </button>
                          <div className="h-4 w-px bg-slate-300 mx-1"></div>
                          <button onClick={() => { setEditingStandard({ id: standard.id, title: standard.title }); setShowStandardForm(true); }} className="text-slate-400 hover:text-indigo-600"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => deleteStandard(standard.id)} className="text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                        </div>
                        )}`;

// 4. Indicator level buttons
const search4 = `<div className="flex gap-2 text-slate-400">
                                <button onClick={() => { setTargetStandardId(standard.id); setEditingIndicator(ind); setShowIndicatorForm(true); }} className="hover:text-indigo-600"><Edit className="h-4 w-4" /></button>
                                <button onClick={() => deleteIndicator(standard.id, ind.id)} className="hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                              </div>`;

const repl4 = `{canEdit && (
                              <div className="flex gap-2 text-slate-400">
                                <button onClick={() => { setTargetStandardId(standard.id); setEditingIndicator(ind); setShowIndicatorForm(true); }} className="hover:text-indigo-600"><Edit className="h-4 w-4" /></button>
                                <button onClick={() => deleteIndicator(standard.id, ind.id)} className="hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                              </div>
                              )}`;

if(content.includes(search1)) { content = content.replace(search1, repl1); console.log('1 replaced'); } else { console.log('1 missing'); }
if(content.includes(search2)) { content = content.replace(search2, repl2); console.log('2 replaced'); } else { console.log('2 missing'); }
if(content.includes(search3)) { content = content.replace(search3, repl3); console.log('3 replaced'); } else { console.log('3 missing'); }
if(content.includes(search4)) { content = content.replace(search4, repl4); console.log('4 replaced'); } else { console.log('4 missing'); }

fs.writeFileSync('src/components/CurriculumManager.tsx', content);
