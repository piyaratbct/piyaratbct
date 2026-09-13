const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

const currTarget = `export interface CurriculumSubject {
  subjectCode?: string;
  id: string;
  subjectName: string;
  gradeLevel: string;
  subjectType?: 'academic' | 'activity';`;

const newCurrTarget = `export interface CurriculumSubject {
  subjectCode?: string;
  id: string;
  subjectName: string;
  gradeLevel: string; // Keep for backward compatibility, represents primary grade
  gradeLevels?: string[]; // Array of grades for multi-grade subjects
  subjectType?: 'academic' | 'activity';`;

content = content.replace(currTarget, newCurrTarget);
fs.writeFileSync('src/types.ts', content);
console.log("Patched types.ts for gradeLevels");
