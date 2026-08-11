const fs = require('fs');

function restoreFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  const regex = /<label className="block text-xs font-semibold text-slate-700 mb-1">\s*ภาคเรียน \(Semester\)\s*<\/label>\s*<input type="text" required value=\{date\} onChange=\{\(e\) => setDate\(e\.target\.value\)\} className="[^"]+" title="คาบที่ \(ระบุเป็นครั้ง\)" placeholder="เช่น ครั้งที่ 1, คาบที่ 1-2" \/>/g;

  const replacement = '<label className="block text-xs font-semibold text-slate-700 mb-1">ภาคเรียน (Semester)</label><select required value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">{SEMESTERS.map(s => (<option key={s} value={s}>{s}</option>))}</select></div><div><label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">คาบที่ (ระบุเป็นครั้ง)</label><input type="text" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" title="คาบที่ (ระบุเป็นครั้ง)" placeholder="เช่น ครั้งที่ 1, คาบที่ 1-2" />';
            
  content = content.replace(regex, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
}

['src/components/LessonPlanForm.tsx', 'src/components/LessonLogForm.tsx', 'src/components/PBLLessonPlanForm.tsx', 'src/components/PBLLessonLogForm.tsx'].forEach(restoreFile);
