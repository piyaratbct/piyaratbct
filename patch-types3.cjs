const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

const interfaceStr = `export interface CurriculumSubject {
  subjectCode?: string;
  id: string;
  subjectName: string;
  gradeLevel: string; // Keep for backward compatibility, represents primary grade
  gradeLevels?: string[]; // Array of grades for multi-grade subjects
  subjectType?: 'academic' | 'activity';`;

const newInterfaceStr = `export interface CurriculumSubject {
  subjectCode?: string;
  id: string;
  subjectName: string;
  gradeLevel: string; // Keep for backward compatibility, represents primary grade
  gradeLevels?: string[]; // Array of grades for multi-grade subjects
  subjectType?: 'academic' | 'activity';
  academicCategory?: 'basic' | 'additional'; // วิชาพื้นฐาน หรือ วิชาเพิ่มเติม`;

content = content.replace(interfaceStr, newInterfaceStr);
fs.writeFileSync('src/types.ts', content);
console.log("Patched types.ts with academicCategory");
