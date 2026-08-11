const fs = require('fs');

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Remove collaborators states
  code = code.replace(/const \[collaborators, setCollaborators\] = useState<string\[\]>\(initialPlan\?\.collaborators \|\| \[\]\);\n\s*const \[collaboratorInput, setCollaboratorInput\] = useState\(""\);\n/, '');
  
  // Remove collaborators from payload
  code = code.replace(/coTeachers,\n\s*collaborators,\n/, 'coTeachers,\n');
  
  // Remove collaborators UI (it starts from `<div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 mb-4 shadow-sm">` and goes up to the next target block which starts with the same `<div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 mb-4 shadow-sm">` but has the Target icon.
  // Actually, I can use a script to find and replace.
  
  const startStr = `<div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 mb-4 shadow-sm">
            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-blue-500" />
                รายชื่ออีเมลผู้ร่วมแก้ไข (Collaborators)`;
                
  let startIdx = code.indexOf(startStr);
  if (startIdx !== -1) {
    let nextDivIdx = code.indexOf('<div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 mb-4 shadow-sm">', startIdx + 100);
    if (nextDivIdx !== -1) {
      code = code.slice(0, startIdx) + code.slice(nextDivIdx);
    }
  }

  fs.writeFileSync(file, code, 'utf8');
}

processFile('src/components/LessonPlanForm.tsx');
processFile('src/components/PBLLessonPlanForm.tsx');
