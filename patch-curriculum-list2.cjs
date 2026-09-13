const fs = require('fs');

let content = fs.readFileSync('src/components/UnifiedCurriculumManager.tsx', 'utf8');

const targetStr = `{(!c.totalHours || c.totalHours === 0) && !c.isParent && (
                             <AlertCircle className="h-3.5 w-3.5 text-orange-500 shrink-0" title="ยังไม่ได้ระบุชั่วโมงเรียน" />
                          )}`;

const newTargetStr = `{(!c.totalHours || c.totalHours === 0) && (
                             <AlertCircle className="h-3.5 w-3.5 text-orange-500 shrink-0" title="ยังไม่ได้ระบุชั่วโมงเรียน" />
                          )}`;

content = content.replace(targetStr, newTargetStr);
fs.writeFileSync('src/components/UnifiedCurriculumManager.tsx', content);

let content2 = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');
content2 = content2.replace(targetStr, newTargetStr);
fs.writeFileSync('src/components/CurriculumManager.tsx', content2);
console.log("Patched to show on all subjects");
