const fs = require('fs');
let code = fs.readFileSync('src/components/AttendanceTracking.tsx', 'utf-8');

code = code.replace(
  /onClick=\{\(\) => handleStatusChange\(student\.id, 'present'\)\}/g,
  "onClick={() => handleStatusChange(student.id, 'present')} disabled={isDateDisabled}"
);
code = code.replace(
  /onClick=\{\(\) => handleStatusChange\(student\.id, 'leave'\)\}/g,
  "onClick={() => handleStatusChange(student.id, 'leave')} disabled={isDateDisabled}"
);
code = code.replace(
  /onClick=\{\(\) => handleStatusChange\(student\.id, 'sick'\)\}/g,
  "onClick={() => handleStatusChange(student.id, 'sick')} disabled={isDateDisabled}"
);
code = code.replace(
  /onClick=\{\(\) => handleStatusChange\(student\.id, 'late'\)\}/g,
  "onClick={() => handleStatusChange(student.id, 'late')} disabled={isDateDisabled}"
);
code = code.replace(
  /onClick=\{\(\) => handleStatusChange\(student\.id, 'absent'\)\}/g,
  "onClick={() => handleStatusChange(student.id, 'absent')} disabled={isDateDisabled}"
);

fs.writeFileSync('src/components/AttendanceTracking.tsx', code, 'utf-8');
console.log("Patched buttons in AttendanceTracking");
