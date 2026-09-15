const fs = require('fs');

const files = ['src/components/CurriculumManager.tsx', 'src/components/UnifiedCurriculumManager.tsx'];

for (const file of files) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Fix 1: Read from totalHours first, fallback to requiredHoursPerTerm
    code = code.replace(
      /value=\{editingSubject\.requiredHoursPerTerm \|\| ''\}/g,
      "value={editingSubject.totalHours || editingSubject.requiredHoursPerTerm || ''}"
    );
    
    // Fix 2: Save to totalHours instead of requiredHoursPerTerm
    code = code.replace(
      /onChange=\{e => setEditingSubject\(\{\.\.\.editingSubject, requiredHoursPerTerm: e\.target\.value \? Number\(e\.target\.value\) : undefined\}\)\}/g,
      "onChange={e => setEditingSubject({...editingSubject, totalHours: e.target.value ? Number(e.target.value) : undefined})}"
    );
    
    // Fix 3: UI Alert check
    code = code.replace(
      /\{\(\!\(c\.totalHours \|\| c\.requiredHoursPerTerm\)\) && \(/g,
      "{(!(c.totalHours || c.requiredHoursPerTerm)) && ("
    );
    
    fs.writeFileSync(file, code);
  }
}
