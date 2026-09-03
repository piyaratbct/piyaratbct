const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

const oldTabs = `<button
                  onClick={() => setGradesSubTab('part2')}
                  className={\`px-4 py-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap \${gradesSubTab === 'part2' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
                >
                  ส่วนที่ 2: สอบ (กลางภาค/ปลายภาค)
                </button>`;

const newTabs = `<button
                  onClick={() => setGradesSubTab('part2')}
                  className={\`px-4 py-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap \${gradesSubTab === 'part2' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
                >
                  ส่วนที่ 2: ผลการเรียน
                </button>
                <button
                  onClick={() => setGradesSubTab('part3')}
                  className={\`px-4 py-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap \${gradesSubTab === 'part3' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
                >
                  ส่วนที่ 3: คุณลักษณะฯ
                </button>
                <button
                  onClick={() => setGradesSubTab('part4')}
                  className={\`px-4 py-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap \${gradesSubTab === 'part4' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
                >
                  ส่วนที่ 4: อ่าน คิดวิเคราะห์ฯ
                </button>
                <button
                  onClick={() => setGradesSubTab('part5')}
                  className={\`px-4 py-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap \${gradesSubTab === 'part5' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
                >
                  ส่วนที่ 5: สมรรถนะสำคัญ
                </button>`;

code = code.replace(oldTabs, newTabs);
fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf-8');
console.log("Patched Evaluation Tabs");
