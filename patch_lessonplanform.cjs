const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

// Add states
code = code.replace(
  'const [title, setTitle] = useState("");',
  'const [title, setTitle] = useState("");\n  const [coreIndicators, setCoreIndicators] = useState("");\n  const [targetIndicators, setTargetIndicators] = useState("");'
);

// Add to resetForm
code = code.replace(
  'setTitle("");',
  'setTitle("");\n    setCoreIndicators("");\n    setTargetIndicators("");'
);

// Read from initialPlan
code = code.replace(
  'setTitle(initialPlan.title);',
  'setTitle(initialPlan.title);\n      setCoreIndicators(initialPlan.coreIndicators || "");\n      setTargetIndicators(initialPlan.targetIndicators || "");'
);

// Add to new plan object
code = code.replace(
  'title,',
  'title,\n      coreIndicators,\n      targetIndicators,'
);

// UI update: add fields before Objectives
const newFields = `
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-rose-500" />
              ตัวชี้วัดต้องรู้ (ต้นทาง)
            </label>
            <p className="text-[10px] text-slate-400 mb-2">
              ตัวชี้วัดหลักที่ต้องนำมาใช้ประเมินผลการเรียน
            </p>
            <textarea
              value={coreIndicators}
              onChange={(e) => setCoreIndicators(e.target.value)}
              rows={2}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
              placeholder="ค 1.1 ป.1/1 บอกจำนวนของสิ่งต่าง ๆ..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-amber-500" />
              ตัวชี้วัดควรรู้ (ปลายทาง)
            </label>
            <p className="text-[10px] text-slate-400 mb-2">
              ตัวชี้วัดที่สามารถใช้ประเมินผลร่วม หรือบูรณาการได้
            </p>
            <textarea
              value={targetIndicators}
              onChange={(e) => setTargetIndicators(e.target.value)}
              rows={2}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 leading-relaxed placeholder:text-slate-400 whitespace-pre-line resize-none"
              placeholder="ค 1.1 ป.1/2 เปรียบเทียบจำนวนนับ..."
            />
          </div>
`;

code = code.replace(
  '<div>\n            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">\n              <Target className="h-4 w-4 text-amber-500" />\n              2. จุดประสงค์การเรียนรู้ (Objectives){" "}',
  newFields + '\n          <div>\n            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">\n              <Target className="h-4 w-4 text-amber-500" />\n              2. จุดประสงค์การเรียนรู้ (Objectives){" "}'
);

fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
