const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

// Calculate total remaining
const calcTarget = "const [isLoadingIndicators, setIsLoadingIndicators] = useState(false);";
const calcReplacement = `const [isLoadingIndicators, setIsLoadingIndicators] = useState(false);

  // Calculate remaining indicators
  let totalRemaining = 0;
  curriculums.forEach(curr => {
    curr.standards.forEach((std: any) => {
      std.indicators.forEach((ind: any) => {
        if (!usedIndicators.has(ind.code)) {
          totalRemaining++;
        }
      });
    });
  });
`;

code = code.replace(calcTarget, calcReplacement);

// Render the banner
const bannerTarget = `          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-rose-500" />
              ตัวชี้วัดต้องรู้ (ต้นทาง)
            </label>`;

const bannerReplacement = `          {curriculums.length > 0 && totalRemaining > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-rose-700">มีตัวชี้วัดที่ยังไม่ได้ถูกใช้งาน (คงเหลือ)</p>
                <p className="text-[10px] text-rose-600 mt-0.5">คุณมีตัวชี้วัดที่ยังไม่ได้ระบุในแผนการสอนใดเลย จำนวน {totalRemaining} ตัวชี้วัด กรุณาตรวจสอบและเลือกใช้ให้ครบถ้วนในภาคเรียนนี้</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-rose-500" />
              ตัวชี้วัดต้องรู้ (ต้นทาง)
            </label>`;

code = code.replace(bannerTarget, bannerReplacement);
fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
