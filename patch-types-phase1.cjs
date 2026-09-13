const fs = require('fs');

let content = fs.readFileSync('src/types.ts', 'utf8');

// Update CurriculumSubject
content = content.replace(
  /totalHours\?: number;/,
  `totalHours?: number;\n  requiredHoursPerTerm?: number; // จำนวนชั่วโมงเรียนที่ต้องได้ต่อเทอม`
);

// Update SchoolHoliday
content = content.replace(
  /export interface SchoolHoliday \{\n  id: string;\n  date: string;\n  description: string;\n\}/,
  `export interface SchoolHoliday {
  id: string;
  date: string;
  description: string;
  type?: 'holiday' | 'activity_no_class' | 'activity_integrated';
  integratedSubjects?: string[];
}`
);

fs.writeFileSync('src/types.ts', content);
console.log("Patched types.ts");
