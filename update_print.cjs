const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanPrintTemplate.tsx', 'utf8');

const target = `          <div>
            <h3
              className={\`font-bold text-slate-800 border-b border-slate-200 \${isCompact ? "text-base pb-1 mb-2" : "text-lg pb-2 mb-3"}\`}
            >
              2. จุดประสงค์การเรียนรู้ (Objectives)
            </h3>
            <div
              className={\`pl-4 whitespace-pre-wrap text-slate-700 leading-relaxed bg-white \${isCompact ? "text-sm" : "text-base"}\`}
            >
              {plan.objectives}
            </div>
          </div>

          <div>
            <h3
              className={\`font-bold text-slate-800 border-b border-slate-200 \${isCompact ? "text-base pb-1 mb-2" : "text-lg pb-2 mb-3"}\`}
            >
              3. กิจกรรมการเรียนรู้ (Learning Activities)
            </h3>
            <div
              className={\`pl-4 whitespace-pre-wrap text-slate-700 leading-relaxed bg-white \${isCompact ? "text-sm min-h-[80px]" : "text-base min-h-[120px]"}\`}
            >
              {plan.activities}
            </div>
          </div>

          <div>
            <h3
              className={\`font-bold text-slate-800 border-b border-slate-200 \${isCompact ? "text-base pb-1 mb-2" : "text-lg pb-2 mb-3"}\`}
            >
              4. สื่อการเรียนรู้ / แหล่งเรียนรู้ (Materials)
            </h3>
            <div
              className={\`pl-4 whitespace-pre-wrap text-slate-700 leading-relaxed bg-white \${isCompact ? "text-sm" : "text-base"}\`}
            >
              {plan.materials || "-"}
            </div>
          </div>

          <div>
            <h3
              className={\`font-bold text-slate-800 border-b border-slate-200 \${isCompact ? "text-base pb-1 mb-2" : "text-lg pb-2 mb-3"}\`}
            >
              5. การวัดและประเมินผล (Evaluation)
            </h3>
            <div
              className={\`pl-4 whitespace-pre-wrap text-slate-700 leading-relaxed bg-white \${isCompact ? "text-sm" : "text-base"}\`}
            >
              {plan.evaluation || "-"}
            </div>
          </div>`;

const replacement = `          {(plan.coreIndicators || plan.targetIndicators) && (
            <div>
              <h3
                className={\`font-bold text-slate-800 border-b border-slate-200 \${isCompact ? "text-base pb-1 mb-2" : "text-lg pb-2 mb-3"}\`}
              >
                2. มาตรฐานการเรียนรู้และตัวชี้วัด (Indicators)
              </h3>
              <div className={\`pl-4 space-y-3 bg-white \${isCompact ? "text-sm" : "text-base"}\`}>
                {plan.coreIndicators && (
                  <div>
                    <span className="font-bold text-emerald-700 block mb-1">ตัวชี้วัดต้องรู้ (ต้นทาง):</span>
                    <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">{plan.coreIndicators}</div>
                  </div>
                )}
                {plan.targetIndicators && (
                  <div>
                    <span className="font-bold text-amber-700 block mb-1">ตัวชี้วัดควรรู้ (ปลายทาง):</span>
                    <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">{plan.targetIndicators}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {plan.competencies && (
            <div>
              <h3
                className={\`font-bold text-slate-800 border-b border-slate-200 \${isCompact ? "text-base pb-1 mb-2" : "text-lg pb-2 mb-3"}\`}
              >
                {(plan.coreIndicators || plan.targetIndicators) ? '3.' : '2.'} สมรรถนะสำคัญของผู้เรียน (Competencies)
              </h3>
              <div
                className={\`pl-4 whitespace-pre-wrap text-slate-700 leading-relaxed bg-white \${isCompact ? "text-sm" : "text-base"}\`}
              >
                {plan.competencies}
              </div>
            </div>
          )}

          <div>
            <h3
              className={\`font-bold text-slate-800 border-b border-slate-200 \${isCompact ? "text-base pb-1 mb-2" : "text-lg pb-2 mb-3"}\`}
            >
              {((plan.coreIndicators || plan.targetIndicators) && plan.competencies) ? '4.' : ((plan.coreIndicators || plan.targetIndicators) || plan.competencies) ? '3.' : '2.'} จุดประสงค์การเรียนรู้ (Objectives)
            </h3>
            <div
              className={\`pl-4 whitespace-pre-wrap text-slate-700 leading-relaxed bg-white \${isCompact ? "text-sm" : "text-base"}\`}
            >
              {plan.objectives}
            </div>
          </div>

          <div>
            <h3
              className={\`font-bold text-slate-800 border-b border-slate-200 \${isCompact ? "text-base pb-1 mb-2" : "text-lg pb-2 mb-3"}\`}
            >
              {((plan.coreIndicators || plan.targetIndicators) && plan.competencies) ? '5.' : ((plan.coreIndicators || plan.targetIndicators) || plan.competencies) ? '4.' : '3.'} กิจกรรมการเรียนรู้ (Learning Activities)
            </h3>
            <div
              className={\`pl-4 whitespace-pre-wrap text-slate-700 leading-relaxed bg-white \${isCompact ? "text-sm min-h-[80px]" : "text-base min-h-[120px]"}\`}
            >
              {plan.activities}
            </div>
          </div>

          <div>
            <h3
              className={\`font-bold text-slate-800 border-b border-slate-200 \${isCompact ? "text-base pb-1 mb-2" : "text-lg pb-2 mb-3"}\`}
            >
              {((plan.coreIndicators || plan.targetIndicators) && plan.competencies) ? '6.' : ((plan.coreIndicators || plan.targetIndicators) || plan.competencies) ? '5.' : '4.'} สื่อการเรียนรู้ / แหล่งเรียนรู้ (Materials)
            </h3>
            <div
              className={\`pl-4 whitespace-pre-wrap text-slate-700 leading-relaxed bg-white \${isCompact ? "text-sm" : "text-base"}\`}
            >
              {plan.materials || "-"}
            </div>
          </div>

          <div>
            <h3
              className={\`font-bold text-slate-800 border-b border-slate-200 \${isCompact ? "text-base pb-1 mb-2" : "text-lg pb-2 mb-3"}\`}
            >
              {((plan.coreIndicators || plan.targetIndicators) && plan.competencies) ? '7.' : ((plan.coreIndicators || plan.targetIndicators) || plan.competencies) ? '6.' : '5.'} การวัดและประเมินผล (Evaluation)
            </h3>
            <div
              className={\`pl-4 whitespace-pre-wrap text-slate-700 leading-relaxed bg-white \${isCompact ? "text-sm" : "text-base"}\`}
            >
              {plan.evaluation || "-"}
            </div>
          </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/LessonPlanPrintTemplate.tsx', code, 'utf8');
