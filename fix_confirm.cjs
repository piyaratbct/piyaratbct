const fs = require('fs');
let code = fs.readFileSync('src/components/AttendanceTracking.tsx', 'utf8');

code = code.replace(
  "    if (applyToAllPeriods && !window.confirm('คุณต้องการบันทึกข้อมูลการเข้าเรียนนี้ให้เหมือนกันใน \"ทุกคาบ\" ของวันนี้ใช่หรือไม่? (การดำเนินการนี้จะเขียนทับข้อมูลของคาบอื่นในวันนี้)')) {\n      return;\n    }",
  "    // Removed window.confirm due to iframe restrictions. Checkbox acts as explicit intent."
);

fs.writeFileSync('src/components/AttendanceTracking.tsx', code);
console.log('Removed window.confirm');
