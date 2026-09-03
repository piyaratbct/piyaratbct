const fs = require('fs');
let code = fs.readFileSync('src/components/AttendanceTracking.tsx', 'utf-8');

code = code.replace(
  "onClick={handleMarkAllPresent}\\n              disabled={isSaving || isLoading}",
  "onClick={handleMarkAllPresent}\\n              disabled={isSaving || isLoading || isDateDisabled}"
);
// replace multiple occurrences if they exist
code = code.split('onClick={handleMarkAllPresent}\n              disabled={isSaving || isLoading}').join('onClick={handleMarkAllPresent}\n              disabled={isSaving || isLoading || isDateDisabled}');

fs.writeFileSync('src/components/AttendanceTracking.tsx', code, 'utf-8');
console.log("Patched AttendanceTracking2");
