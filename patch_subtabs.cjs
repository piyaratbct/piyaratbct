const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

const newTabs = `              <div className="flex overflow-x-auto border-b border-slate-200 mb-6">
                <button
                  onClick={() => setGradesSubTab('attendance')}
                  className={\`px-4 py-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap \${gradesSubTab === 'attendance' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
                >
                  เวลาเรียน (ปพ.5)
                </button>
                <button
                  onClick={() => setGradesSubTab('part1')}
                  className={\`px-4 py-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap \${gradesSubTab === 'part1' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
                >`;

code = code.replace(/<div className="flex overflow-x-auto border-b border-slate-200 mb-6">\s*<button\s*onClick={\(\) => setGradesSubTab\('part1'\)}\s*className={[^>]+}\s*>\s*ส่วนที่ 1: เก็บระหว่างเรียน\s*<\/button>/g, newTabs + '\n                >\n                  ส่วนที่ 1: เก็บระหว่างเรียน\n                </button>');

fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf-8');
console.log("Patched subtabs");
