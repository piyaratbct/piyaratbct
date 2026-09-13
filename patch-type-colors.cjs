const fs = require('fs');
let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

const targetStr = `                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full \${
                          c.subjectType === 'activity' ? 'bg-purple-100 text-purple-700' :
                          c.academicCategory === 'additional' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }\`}>
                          {c.subjectType === 'activity' ? 'กิจกรรม' : 
                           c.academicCategory === 'additional' ? 'เพิ่มเติม' : 'พื้นฐาน'}
                        </span>`;

const newTargetStr = `                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full \${
                          c.subjectType === 'activity' ? 'bg-purple-100 text-purple-700' :
                          c.academicCategory === 'additional' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }\`}>
                          {c.subjectType === 'activity' ? 'กิจกรรม' : 
                           (!c.subjectType || c.subjectType === 'academic') && c.academicCategory === 'additional' ? 'วิชาเพิ่มเติม' : 'วิชาพื้นฐาน'}
                        </span>`;

content = content.replace(targetStr, newTargetStr);
fs.writeFileSync('src/components/CurriculumManager.tsx', content);
console.log("Patched curriculum tags text");
