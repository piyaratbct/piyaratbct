const fs = require('fs');
let code = fs.readFileSync('src/components/AttendanceTracking.tsx', 'utf-8');

// Fix handleSave button
code = code.replace(
  "onClick={handleSave}\n              disabled={isSaving || isLoading}",
  "onClick={handleSave}\n              disabled={isSaving || isLoading || isDateDisabled}"
);

// Add disabled styles to student buttons
code = code.replace(
  /: 'bg-slate-100 text-slate-500 hover:bg-slate-200'\n                      }\`}/g,
  ": 'bg-slate-100 text-slate-500 hover:bg-slate-200'\n                      } disabled:opacity-50 disabled:cursor-not-allowed`}"
);

fs.writeFileSync('src/components/AttendanceTracking.tsx', code, 'utf-8');
console.log("Patched AttendanceTracking4");
