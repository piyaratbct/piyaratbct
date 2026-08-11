const fs = require('fs');

function replaceSelectWithInput(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(/สัปดาห์ที่สอน/g, 'คาบที่ (ระบุเป็นครั้ง)');
  
  const selectRegex = /<select[\s\S]*?value=\{date\}[\s\S]*?onChange=\{\(e\) => setDate\(e\.target\.value\)\}[\s\S]*?title="คาบที่ \(ระบุเป็นครั้ง\)"[\s\S]*?<\/select>/;
  
  const replacement = '<input type="text" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" title="คาบที่ (ระบุเป็นครั้ง)" placeholder="เช่น ครั้งที่ 1, คาบที่ 1-2" />';
            
  content = content.replace(selectRegex, replacement);
  content = content.replace(/teachingWeeks\[0\]/g, '""');

  fs.writeFileSync(filePath, content, 'utf8');
}

['src/components/LessonPlanForm.tsx', 'src/components/LessonLogForm.tsx', 'src/components/PBLLessonPlanForm.tsx', 'src/components/PBLLessonLogForm.tsx'].forEach(replaceSelectWithInput);
