const fs = require('fs');
let code = fs.readFileSync('src/components/AttendanceSummary.tsx', 'utf8');

const target = `                    <div className="flex items-center gap-1.5 text-rose-500">
                      <XCircle className="h-3.5 w-3.5" /> ขาด: {stats.absent}
                    </div>
                  </div>
                </div>
              );`;
const replacement = `                    <div className="flex items-center gap-1.5 text-rose-500">
                      <XCircle className="h-3.5 w-3.5" /> ขาด: {stats.absent}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      onClick={() => setEditingSession(session)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="แก้ไข"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="ลบ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );`;
code = code.replace(target, replacement);
fs.writeFileSync('src/components/AttendanceSummary.tsx', code, 'utf8');
