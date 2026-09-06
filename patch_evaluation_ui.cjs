const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf-8');

const filterBlock = `
          <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl">
            {isHistorical && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/80 text-white text-xs font-bold rounded-lg border border-rose-400">
                <AlertCircle className="h-4 w-4" />
                <span>โหมดดูข้อมูลย้อนหลัง {isReadOnly ? '(อ่านอย่างเดียว)' : '(สิทธิ์ Admin)'}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>ปีการศึกษา:</span>
              <select 
                className="bg-white/20 border border-white/30 text-white rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-white/50 [&>option]:text-slate-800"
                value={viewYear}
                onChange={e => setViewYear(e.target.value)}
              >
                {[2564, 2565, 2566, 2567, 2568, 2569, 2570].map(y => (
                  <option key={y} value={y.toString()}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>ภาคเรียนที่:</span>
              <select 
                className="bg-white/20 border border-white/30 text-white rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-white/50 [&>option]:text-slate-800"
                value={viewSemester}
                onChange={e => setViewSemester(e.target.value)}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">ฤดูร้อน</option>
              </select>
            </div>
          </div>
`;

code = code.replace(/<div className="flex items-center gap-5 relative z-10">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/, `<div className="flex items-center gap-5 relative z-10">$1</div>\n          </div>\n          ${filterBlock}\n        </div>`);

fs.writeFileSync('src/components/EvaluationModule.tsx', code, 'utf-8');
console.log('Patched UI with filter');
