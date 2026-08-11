const fs = require('fs');
let code = fs.readFileSync('src/components/PBLLessonLogForm.tsx', 'utf8');

// Remove states
code = code.replace(/  const \[subject, setSubject\] = useState<SubjectType>\('ภาษาไทย'\);\n/, '  const subject = "บูรณาการ (PBL)";\n');
code = code.replace(/  const \[isIntegrated, setIsIntegrated\] = useState\(initialRecord\?\.isIntegrated \|\| false\);\n/, '');

// Remove setSubject calls
code = code.replace(/    setSubject\(plan\.subject as SubjectType\);\n/, '');
code = code.replace(/      setSubject\(initialRecord\.subject === 'อื่นๆ' && initialRecord\.customSubject \? initialRecord\.customSubject : \(initialRecord\.subject as string\)\);\n/, '');

// Remove setIsIntegrated calls
code = code.replace(/    setIsIntegrated\(plan\.isIntegrated \|\| false\);\n/, '');

// Update payload
code = code.replace(/      subject: isIntegrated \? 'บูรณาการ' : subject,\n/, '      subject: "บูรณาการ (PBL)",\n');
code = code.replace(/      isIntegrated,\n/, '      isIntegrated: true,\n');

// Validation
code = code.replace(/    if \(!subject\.trim\(\)\) \{\n\s*setErrorMsg\('กรุณากรอก กลุ่มสาระ \/ วิชาที่สอน'\);\n\s*return;\n\s*\}\n/, '');

// Remove single subject UI
code = code.replace(/            <div>\n\s*<label className="block text-xs font-semibold text-slate-700 mb-1">\n\s*กลุ่มสาระ \/ วิชาที่สอน\n\s*<\/label>\n\s*<input\n\s*type="text"\n\s*list="subject-list"\n\s*value=\{subject\}\n\s*onChange=\{\(e\) => setSubject\(e\.target\.value as SubjectType\)\}\n\s*placeholder="เลือกหรือพิมพ์รายวิชา..."\n\s*className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"\n\s*\/>\n\s*<datalist id="subject-list">\n\s*\{SUBJECTS\.map\(\(subj\) => \(\n\s*<option key=\{subj\} value=\{subj\} \/>\n\s*\)\)\}\n\s*<\/datalist>\n\s*<\/div>\n/, '');

// Fix integrated learning wrapper
code = code.replace(/<div className=\{`col-span-1 \$\{isIntegrated \? 'md:col-span-full' : 'sm:col-span-2'\} p-4 rounded-xl border border-slate-200`\}>/, '<div className="col-span-1 md:col-span-full p-4 rounded-xl border border-slate-200">');
code = code.replace(/<label className="flex items-center gap-2 cursor-pointer mb-3">\n\s*<input type="checkbox" checked=\{isIntegrated\} onChange=\{\(e\) => setIsIntegrated\(e\.target\.checked\)\} className="w-4 h-4 rounded text-slate-800 focus:ring-blue-500 border-slate-300" \/>\n\s*<span className="text-sm font-bold text-slate-800">จัดการเรียนรู้แบบบูรณาการ \(Integrated Learning\)<\/span>\n\s*<\/label>\n\s*\{isIntegrated && \(\n\s*<div>/, '<div>\n              <span className="block text-sm font-bold text-slate-900 mb-2">จัดการเรียนรู้แบบบูรณาการ (Integrated Learning)</span>');

// `isIntegrated && ( <div> ... </div> )}`
// I will just use sed or string replace for `)}` at the end of the integrated learning block.

fs.writeFileSync('src/components/PBLLessonLogForm.tsx', code, 'utf8');
