const fs = require('fs');

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  if (!code.includes('const [collaborators, setCollaborators]')) {
    // Add collaborators state
    code = code.replace(/const \[coTeachers, setCoTeachers\] = useState<string\[\]>\(initialPlan\?\.coTeachers \|\| \[\]\);/, 
    `const [coTeachers, setCoTeachers] = useState<string[]>(initialPlan?.coTeachers || []);
  const [collaborators, setCollaborators] = useState<string[]>(initialPlan?.collaborators || []);
  const [collaboratorInput, setCollaboratorInput] = useState("");`);
  
    // Add to payload
    code = code.replace(/coTeachers,\n\s*status:/, 'coTeachers,\n      collaborators,\n      status:');

    // Add UI right after coTeachers UI block
    const collabUI = `
          </div>
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 mb-4 shadow-sm">
            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-blue-500" />
                รายชื่ออีเมลผู้ร่วมแก้ไข (Collaborators)
              </span>
              <span className="text-[10px] text-slate-500 font-normal">เพิ่มอีเมลของครูท่านอื่นที่ต้องการให้ร่วมอ่าน/แก้ไข</span>
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={collaboratorInput}
                  onChange={(e) => setCollaboratorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const email = collaboratorInput.trim();
                      if (email && /[^@]+@[^@]+\\.[^@]+/.test(email) && !collaborators.includes(email)) {
                        setCollaborators(prev => [...prev, email]);
                        setCollaboratorInput("");
                      }
                    }
                  }}
                  placeholder="พิมพ์อีเมลแล้วกด Enter..."
                  className="flex-1 p-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const email = collaboratorInput.trim();
                    if (email && /[^@]+@[^@]+\\.[^@]+/.test(email) && !collaborators.includes(email)) {
                      setCollaborators(prev => [...prev, email]);
                      setCollaboratorInput("");
                    }
                  }}
                  className="px-4 py-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 font-medium text-xs transition-colors whitespace-nowrap"
                >
                  เพิ่ม
                </button>
              </div>
              
              {collaborators.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {collaborators.map(email => (
                    <span key={email} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-700 shadow-sm">
                      {email}
                      <button
                        type="button"
                        onClick={() => setCollaborators(prev => prev.filter(e => e !== email))}
                        className="text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
`;
    
    // Find where to insert it (after the showCoTeacherDropdown block)
    // We can replace the end of the coTeachers block.
    // In LessonPlanForm, it ends with:
    //               </div>
    //             )}
    //           </div>
    //           <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 mb-4 shadow-sm">
    //           <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 pb-3">
    
    // So let's insert it right before the `<div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 mb-4 shadow-sm">` that contains `Target` icon.

    code = code.replace(/<\/div>\s*\)\}\s*<\/div>\s*<div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 mb-4 shadow-sm">\s*<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 pb-3">\s*<div className="flex items-start gap-3">\s*<Target/,
      `</div>\n            )}\n          </div>\n${collabUI}\n          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 mb-4 shadow-sm">\n            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 pb-3">\n              <div className="flex items-start gap-3">\n                <Target`);
      
    fs.writeFileSync(file, code, 'utf8');
  }
}

processFile('src/components/LessonPlanForm.tsx');
processFile('src/components/PBLLessonPlanForm.tsx');
