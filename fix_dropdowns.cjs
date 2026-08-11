const fs = require('fs');

const PERIOD_OPTIONS_CODE = `export const PERIOD_OPTIONS = Array.from({length: 60}, (_, i) => \`ครั้งที่ \${i + 1}\`);`;

const typesContent = fs.readFileSync('src/types.ts', 'utf8');
if (!typesContent.includes('PERIOD_OPTIONS')) {
  fs.writeFileSync('src/types.ts', typesContent + '\n' + PERIOD_OPTIONS_CODE + '\n', 'utf8');
}

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Make sure PERIOD_OPTIONS is imported if not already
  if (!content.includes('PERIOD_OPTIONS')) {
    content = content.replace(/import \{([^}]+)\} from "\.\.\/types";/, 'import { $1, PERIOD_OPTIONS } from "../types";');
  }

  const replacement = `
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ภาคเรียนพร้อมปีการศึกษา
            </label>
            <select
              required
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="" disabled>เลือกภาคเรียน</option>
              {SEMESTERS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              คาบที่ (ระบุเป็นครั้ง)
            </label>
            <select
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              title="คาบที่ (ระบุเป็นครั้ง)"
            >
              <option value="" disabled>เลือกคาบที่</option>
              {PERIOD_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>`;

  // For LessonLogForm.tsx
  if (filePath.includes('LessonLogForm.tsx') || filePath.includes('PBLLessonLogForm.tsx')) {
    // Current match in LessonLogForm.tsx is:
    /*
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ภาคเรียนพร้อมปีการศึกษา
            </label>
            <input type="text" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" title="คาบที่ (ระบุเป็นครั้ง)" placeholder="เช่น ครั้งที่ 1, คาบที่ 1-2" />
          </div>
    */
    const regex = /<div>\s*<label className="block text-xs font-semibold text-slate-700 mb-1">\s*ภาคเรียนพร้อมปีการศึกษา\s*<\/label>\s*<input type="text" required value=\{date\}.*? \/>\s*<\/div>/g;
    content = content.replace(regex, replacement.trim());
  }
  
  // For LessonPlanForm.tsx
  if (filePath.includes('LessonPlanForm.tsx') || filePath.includes('PBLLessonPlanForm.tsx')) {
    // Current match in LessonPlanForm.tsx is:
    /*
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ภาคเรียน (Semester)</label><select required value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">{SEMESTERS.map(s => (<option key={s} value={s}>{s}</option>))}</select></div><div><label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">คาบที่ (ระบุเป็นครั้ง)</label><input type="text" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" title="คาบที่ (ระบุเป็นครั้ง)" placeholder="เช่น ครั้งที่ 1, คาบที่ 1-2" />
          </div>
    */
    const regex2 = /<div>\s*<label className="block text-xs font-semibold text-slate-700 mb-1">ภาคเรียน \(Semester\)<\/label>.*?<\/select><\/div><div><label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">คาบที่ \(ระบุเป็นครั้ง\)<\/label><input type="text" required value=\{date\}.*? \/>\s*<\/div>/g;
    content = content.replace(regex2, replacement.trim());
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

['src/components/LessonLogForm.tsx', 'src/components/LessonPlanForm.tsx', 'src/components/PBLLessonLogForm.tsx', 'src/components/PBLLessonPlanForm.tsx'].forEach(replaceInFile);

