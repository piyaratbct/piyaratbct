const fs = require('fs');
let content = fs.readFileSync('src/components/PBLLessonPlanForm.tsx', 'utf8');

content = content.replace(
  '<select\n              value={subject}\n              onChange={(e) => setSubject(e.target.value)}\n              className="w-full p-3 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"\n            >\n              {availableSubjects.map((s, idx) => {',
  '<select\n              value={subject}\n              onChange={(e) => setSubject(e.target.value)}\n              className="w-full p-3 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"\n            >\n              <option value="" disabled>เลือกวิชาหลัก...</option>\n              {availableSubjects.map((s, idx) => {'
);

fs.writeFileSync('src/components/PBLLessonPlanForm.tsx', content);

let content2 = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');
content2 = content2.replace(
  'const [subject, setSubject] = useState<string>(initialPlan?.subject || "");',
  'const [subject, setSubject] = useState<string>(initialPlan?.subject || "");'
);
