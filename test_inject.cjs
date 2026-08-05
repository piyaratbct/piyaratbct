const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

const coreTarget = `            <textarea
              value={coreIndicators}
              onChange={(e) => setCoreIndicators(e.target.value)}
              rows={2}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
              placeholder="ค 1.1 ป.1/1 บอกจำนวนของสิ่งต่าง ๆ..."
            />
          </div>`;

const coreReplacement = `            <textarea
              value={coreIndicators}
              onChange={(e) => setCoreIndicators(e.target.value)}
              rows={2}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
              placeholder="ค 1.1 ป.1/1 บอกจำนวนของสิ่งต่าง ๆ..."
            />
            {curriculums.length > 0 && (
              <IndicatorSelector 
                curriculums={curriculums} 
                usedIndicators={usedIndicators} 
                selectedText={coreIndicators} 
                onSelectChange={setCoreIndicators} 
                type="core" 
              />
            )}
          </div>`;
code = code.replace(coreTarget, coreReplacement);

const targetTarget = `            <textarea
              value={targetIndicators}
              onChange={(e) => setTargetIndicators(e.target.value)}
              rows={2}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
              placeholder="ค 1.1 ป.1/2 เปรียบเทียบจำนวนนับ..."
            />
          </div>`;

const targetReplacement = `            <textarea
              value={targetIndicators}
              onChange={(e) => setTargetIndicators(e.target.value)}
              rows={2}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
              placeholder="ค 1.1 ป.1/2 เปรียบเทียบจำนวนนับ..."
            />
            {curriculums.length > 0 && (
              <IndicatorSelector 
                curriculums={curriculums} 
                usedIndicators={usedIndicators} 
                selectedText={targetIndicators} 
                onSelectChange={setTargetIndicators} 
                type="terminal" 
              />
            )}
          </div>`;
code = code.replace(targetTarget, targetReplacement);

fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
