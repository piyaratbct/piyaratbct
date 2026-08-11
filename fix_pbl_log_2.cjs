const fs = require('fs');
let code = fs.readFileSync('src/components/PBLLessonLogForm.tsx', 'utf8');

// Fix grid container
code = code.replace(/<div className=\{`grid grid-cols-1 \$\{isIntegrated \? 'md:grid-cols-2' : 'md:grid-cols-3'\} gap-4`\}>/, '<div className="grid grid-cols-1 md:grid-cols-2 gap-4">');

// Remove the `{!isIntegrated && (` block entirely
code = code.replace(/          \{!isIntegrated && \(\n            <div>\n              <label className="block text-xs font-semibold text-slate-700 mb-1">\n                กลุ่มสาระ \/ วิชาที่สอน\n              <\/label>\n              <input\n                type="text"\n                list="subject-list"\n                value=\{subject\}\n                onChange=\{\(e\) => setSubject\(e\.target\.value as SubjectType\)\}\n                placeholder="เลือกหรือพิมพ์รายวิชา..."\n                className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"\n              \/>\n              <datalist id="subject-list">\n                \{SUBJECTS\.filter\(s => s !== 'อื่นๆ'\)\.map\(\(sub\) => \(\n                  <option key=\{sub\} value=\{sub\}>\{sub\}<\/option>\n                \)\)\}\n              <\/datalist>\n            <\/div>\n          \)\}\n/g, '');

// See if there's any stray `)}` after the integrated selector
// Well, `)}` for `isIntegrated` was probably not there because I might have replaced it incorrectly?
// Wait, my previous script did this:
// `code = code.replace(/\{isIntegrated && \(\n\s*<div>/, '<div>\n              <span className="block text-sm font-bold text-slate-900 mb-2">จัดการเรียนรู้แบบบูรณาการ (Integrated Learning)</span>');`
// And I left a comment saying I would use sed to remove `)}` but I didn't actually write the code to remove it! So it's still there!
// Let's find the closing `)}` of the `isIntegrated && (` block.
code = code.replace(/                            <\/label>\n                          \)\n                        \}\)\}\n                      <\/div>\n                    \)\}\n                  <\/div>\n                <\/div>\n              <\/div>\n            \)\}/, '                            </label>\n                          )\n                        })}\n                      </div>\n                    )}\n                  </div>\n                </div>\n              </div>');

fs.writeFileSync('src/components/PBLLessonLogForm.tsx', code, 'utf8');
