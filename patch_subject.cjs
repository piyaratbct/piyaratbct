const fs = require('fs');
let code = fs.readFileSync('src/components/SubjectScorePrintTemplate.tsx', 'utf-8');

code = code.replace(/<td className="border border-slate-900 px-4 py-1 text-left whitespace-nowrap">\s*\{st\.firstName\} \{st\.lastName\}\s*<\/td>/g, 
  '<td className="border border-slate-900 px-4 py-1 text-left break-words leading-tight max-w-[200px]">\n                        {st.firstName} {st.lastName}\n                      </td>');

fs.writeFileSync('src/components/SubjectScorePrintTemplate.tsx', code, 'utf-8');
console.log("Patched SubjectScorePrintTemplate");
