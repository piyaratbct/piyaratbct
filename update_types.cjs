const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const unitInterface = `
export interface SubjectUnit {
  id: string;
  name: string;
  hours: number;
  score: number;
  indicators: string[]; // List of Indicator codes e.g., "ค 1.1 ป.1/1"
}
`;

if (!code.includes('export interface SubjectUnit')) {
  code = code + unitInterface;
}

const target = `export interface CurriculumSubject {
  subjectCode?: string;
  id: string;
  subjectName: string;
  gradeLevel: string;
  standards: CurriculumStandard[];
  createdAt: string;
  updatedAt: string;
}`;

const replacement = `export interface CurriculumSubject {
  subjectCode?: string;
  id: string;
  subjectName: string;
  gradeLevel: string;
  standards: CurriculumStandard[];
  units?: SubjectUnit[]; // Added for Unified Curriculum Architecture
  createdAt: string;
  updatedAt: string;
}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/types.ts', code);
  console.log("Patched types.ts");
} else {
  console.log("Could not find CurriculumSubject in types.ts");
}
