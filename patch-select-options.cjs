const fs = require('fs');
let content = fs.readFileSync('src/components/LessonLogForm.tsx', 'utf8');

if (!content.includes('<option value="" disabled>เลือกรายวิชา...</option>')) {
  content = content.replace(
    '<select\n                value={subject}\n                onChange={(e) => setSubject(e.target.value as SubjectType)}',
    '<select\n                value={subject}\n                onChange={(e) => setSubject(e.target.value as SubjectType)}\n              >\n                <option value="" disabled>เลือกรายวิชา...</option>'
  );
  // Might be already there or slightly different
}
fs.writeFileSync('src/components/LessonLogForm.tsx', content);

let content2 = fs.readFileSync('src/components/PBLLessonLogForm.tsx', 'utf8');
if (!content2.includes('<option value="" disabled>เลือกวิชาหลัก...</option>')) {
  content2 = content2.replace(
    '<select\n                value={subject}\n                onChange={(e) => setSubject(e.target.value)}',
    '<select\n                value={subject}\n                onChange={(e) => setSubject(e.target.value)}\n              >\n                <option value="" disabled>เลือกวิชาหลัก...</option>'
  );
}
fs.writeFileSync('src/components/PBLLessonLogForm.tsx', content2);
