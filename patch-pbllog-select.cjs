const fs = require('fs');

let content = fs.readFileSync('src/components/PBLLessonLogForm.tsx', 'utf8');

const targetStr = `<select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {availableSubjects.map((s, idx) => {`;

const newTargetStr = `<select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="" disabled>เลือกวิชาหลัก...</option>
              {availableSubjects.map((s, idx) => {`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newTargetStr);
  fs.writeFileSync('src/components/PBLLessonLogForm.tsx', content);
  console.log("Patched PBLLessonLogForm.tsx select");
} else {
  console.log("Could not find target string in PBLLessonLogForm.tsx");
}
