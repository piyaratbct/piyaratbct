const fs = require('fs');

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  if (!code.includes('allTeachers?: Teacher[];')) {
    code = code.replace(/currentUser\?: Teacher \| null;/, 'currentUser?: Teacher | null;\n  allTeachers?: Teacher[];');
    
    code = code.replace(/onUpdatePlan,\n  onClose,/, 'onUpdatePlan,\n  onClose,\n  allTeachers = [],');
    
    // Replace where teacher name is printed
    const oldTeacherRender = `{teacher?.thaiName || teacher?.displayName || "-"}`;
    const newTeacherRender = `{teacher?.thaiName || teacher?.displayName || "-"}{plan.coTeachers && plan.coTeachers.length > 0 && (
                            <span className="text-slate-600 font-normal">
                              {" "} (ร่วมกับ {plan.coTeachers.map(id => {
                                const ct = allTeachers.find(t => t.id === id);
                                return ct ? (ct.thaiName || ct.displayName) : id;
                              }).join(', ')})
                            </span>
                          )}`;
                          
    code = code.replace(oldTeacherRender, newTeacherRender);
    fs.writeFileSync(file, code, 'utf8');
  }
}

processFile('src/components/LessonPlanPrintTemplate.tsx');
