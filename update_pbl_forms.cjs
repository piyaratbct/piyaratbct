const fs = require('fs');

function processPlan(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Remove `subject` and `customSubject` state
  code = code.replace(/  const \[subject, setSubject\] = useState<string>\(.*?\);\n/, '');
  code = code.replace(/  const \[customSubject, setCustomSubject\] = useState\(.*?\);\n/, '');

  // Remove `isIntegrated` state
  code = code.replace(/  const \[isIntegrated, setIsIntegrated\] = useState\(.*?\);\n/, '');

  // Update initial settings
  code = code.replace(/      setIsIntegrated\(initialPlan\.isIntegrated \|\| false\);\n/, '');

  // Update reset
  code = code.replace(/    setIsIntegrated\(false\);\n/, '');
  
  // Update the payload
  code = code.replace(/      subject: subject === "อื่นๆ" || subject === "อื่น ๆ" \? customSubject || subject : subject,\n/, '      subject: "บูรณาการ (PBL)",\n');
  code = code.replace(/      customSubject: undefined, \/\/ Handled implicitly via subject string\n/, '');
  code = code.replace(/      isIntegrated,\n/, '      isIntegrated: true,\n');

  // Remove single subject UI
  code = code.replace(/            <div>\n\s*<label className="block text-xs font-semibold text-slate-700 mb-1">\n\s*วิชา \(Subject\)\n\s*<\/label>\n\s*<input\n\s*type="text"\n\s*list="plan-subject-list"\n\s*value=\{subject\}\n\s*onChange=\{\(e\) => setSubject\(e\.target\.value\)\}\n\s*placeholder="เลือกหรือพิมพ์รายวิชา..."\n\s*className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"\n\s*\/>\n\s*<datalist id="plan-subject-list">\n\s*\{SUBJECTS\.map\(\(subj\) => \(\n\s*<option key=\{subj\} value=\{subj\} \/>\n\s*\)\)\}\n\s*<\/datalist>\n\s*<\/div>\n/, '');

  // Remove `isIntegrated` conditional UI but keep the dropdown
  // Find the exact block.
  // <div className={`col-span-1 ${isIntegrated ? 'md:col-span-full' : 'sm:col-span-2'} bg-indigo-50/50 p-4 rounded-xl border border-indigo-100`}>
  // ...
  // </div>
  // Wait, let's just do a string replace on the specific parts.
  
  code = code.replace(/<div className=\{`col-span-1 \$\{isIntegrated \? 'md:col-span-full' : 'sm:col-span-2'\} bg-indigo-50\/50 p-4 rounded-xl border border-indigo-100`\}>/, '<div className="col-span-1 md:col-span-full bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">');
  
  code = code.replace(/<label className="flex items-center gap-2 cursor-pointer mb-3">\n\s*<input type="checkbox" checked=\{isIntegrated\} onChange=\{\(e\) => setIsIntegrated\(e\.target\.checked\)\} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-indigo-300" \/>\n\s*<span className="text-sm font-bold text-indigo-900">จัดการเรียนรู้แบบบูรณาการ \(Integrated Learning\)<\/span>\n\s*<\/label>\n\s*\{isIntegrated && \(\n\s*<div>/, '<div>\n                <span className="block text-sm font-bold text-indigo-900 mb-2">จัดการเรียนรู้แบบบูรณาการ (Integrated Learning)</span>');
  
  // Fix the closing tags. The easiest is to remove `)}` that matched the `{isIntegrated && (`
  // By looking around `<!-- END isIntegrated -->` or just manually replacing it. Let's find the end of that block.
  // Actually, I can just replace `)}` if it is exactly at the end of that div block.
  // It's safer to use regex to find the end of the `<div>` inside `isIntegrated && ( <div> ... </div> )}`
  // Let's replace `{isIntegrated && (` with nothing, and find the corresponding closing.
  
  fs.writeFileSync(file, code, 'utf8');
}

processPlan('src/components/PBLLessonPlanForm.tsx');

