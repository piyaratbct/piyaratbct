const fs = require('fs');

let content = fs.readFileSync('src/components/StudentReportPrintTemplate.tsx', 'utf8');

// Update mappings
content = content.replace(
  /return \{\s*subject: subjectDef\.subjectCode \? `\$\{subjectDef\.subjectCode\} \$\{subjectDef\.subjectName\}` : subjectDef\.subjectName,\s*totalScore: hasAnyScore \? totalScore : "-",\s*grade: hasAnyScore \? grade : "-",\s*isScout: subjectDef\.subjectName\.includes\("ลูกเสือ"\)\s*\};/g,
  `return {
                   subjectCode: subjectDef.subjectCode || "-",
                   subjectName: subjectDef.subjectName,
                   subject: subjectDef.subjectName,
                   totalScore: hasAnyScore ? totalScore : "-",
                   grade: hasAnyScore ? grade : "-",
                   isScout: subjectDef.subjectName.includes("ลูกเสือ")
                };`
);

content = content.replace(
  /return \{\s*subject: subjectDef\.subjectCode \? `\$\{subjectDef\.subjectCode\} \$\{subjectDef\.subjectName\}` : subjectDef\.subjectName,\s*totalScore: score\?\.totalScore \?\? "-",\s*grade: score\?\.grade \|\| "-",\s*isScout: subjectDef\.subjectName\.includes\("ลูกเสือ"\)\s*\};/g,
  `return {
                  subjectCode: subjectDef.subjectCode || "-",
                  subjectName: subjectDef.subjectName,
                  subject: subjectDef.subjectName,
                  totalScore: score?.totalScore ?? "-",
                  grade: score?.grade || "-",
                  isScout: subjectDef.subjectName.includes("ลูกเสือ")
                };`
);

content = content.replace(
  /return \{\s*subject,\s*totalScore: score\?\.totalScore \|\| "-",\s*grade: score\?\.grade \|\| "-",\s*isScout: subject\.includes\('ลูกเสือ'\)\s*\};/g,
  `return {
              subjectCode: "-",
              subjectName: subject,
              subject,
              totalScore: score?.totalScore || "-",
              grade: score?.grade || "-",
              isScout: subject.includes('ลูกเสือ')
            };`
);

// Update table headers and rows
content = content.replace(
  /<th className="border border-slate-900 px-4 py-3 text-center w-16">ลำดับ<\/th>/,
  `<th className="border border-slate-900 px-4 py-3 text-center w-24">รหัสวิชา</th>`
);

content = content.replace(
  /<td className="border border-slate-900 px-4 py-1\.5 text-center">\{index \+ 1\}<\/td>\s*<td className="border border-slate-900 px-4 py-1\.5 text-left">\{score\.subject\}<\/td>/g,
  `<td className="border border-slate-900 px-4 py-1.5 text-center">{score.subjectCode}</td>
                      <td className="border border-slate-900 px-4 py-1.5 text-left">{score.subjectName}</td>`
);

fs.writeFileSync('src/components/StudentReportPrintTemplate.tsx', content);
console.log("Patched StudentReportPrintTemplate.tsx table");
