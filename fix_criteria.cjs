const fs = require('fs');
['src/components/LessonLogForm.tsx', 'src/components/PBLLessonLogForm.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /\{ id: 'th4', label: 'นำผลการประเมินไปใช้ในการซ่อมเสริมและพัฒนาผู้เรียนได้อย่างเป็นรูปธรรม \(ม\.3\.5\)' \},/g,
    `{ id: 'th4', label: 'นำผลการประเมินไปใช้ในการซ่อมเสริมและพัฒนาผู้เรียนได้อย่างเป็นรูปธรรม (ม.3.5)' },\n    { id: 'th5', label: 'มีการจัดบรรยากาศที่ส่งเสริมการเรียนรู้ และดูแลช่วยเหลือนักเรียนอย่างทั่วถึง (ม.3.2/3.3)' },`
  );
  content = content.replace(
    /teacher: \{ th1: 5, th2: 5, th3: 5, th4: 5 \}/g,
    `teacher: { th1: 5, th2: 5, th3: 5, th4: 5, th5: 5 }`
  );
  fs.writeFileSync(file, content, 'utf8');
});

let printContent = fs.readFileSync('src/components/PrintTemplate.tsx', 'utf8');
printContent = printContent.replace(
  /<div className="flex justify-between text-\[8px\] text-slate-600"><span>4\. ซ่อมเสริม\/พัฒนาผู้เรียนฯ<\/span><span className="font-bold">\{record\.evaluations\.teacher\.th4 \|\| record\.evaluations\.teacher\.t4 \|\| 0\}\/5<\/span><\/div>/g,
  `<div className="flex justify-between text-[8px] text-slate-600"><span>4. ซ่อมเสริม/พัฒนาผู้เรียนฯ</span><span className="font-bold">{record.evaluations.teacher.th4 || record.evaluations.teacher.t4 || 0}/5</span></div>\n                      <div className="flex justify-between text-[8px] text-slate-600"><span>5. จัดบรรยากาศส่งเสริมเรียนรู้ฯ</span><span className="font-bold">{record.evaluations.teacher.th5 || record.evaluations.teacher.t5 || 0}/5</span></div>`
);
fs.writeFileSync('src/components/PrintTemplate.tsx', printContent, 'utf8');
