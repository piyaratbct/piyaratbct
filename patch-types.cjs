const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

const interfaceStr = `export interface CurriculumSubject {
  subjectCode?: string;
  id: string;
  subjectName: string;
  gradeLevel: string;`;

const newInterfaceStr = `export interface CurriculumSubject {
  subjectCode?: string;
  id: string;
  subjectName: string;
  gradeLevel: string;
  subjectType?: 'academic' | 'activity';`;

content = content.replace(interfaceStr, newInterfaceStr);

const subjectScoreStr = `export interface SubjectScore {
  id: string;
  studentId: string;
  gradeLevel: string;`;

const newSubjectScoreStr = `export interface SubjectScore {
  id: string;
  studentId: string;
  gradeLevel: string;
  subjectType?: 'academic' | 'activity';
  activityResult?: 'ผ่าน' | 'ไม่ผ่าน';`;
  
content = content.replace(subjectScoreStr, newSubjectScoreStr);

fs.writeFileSync('src/types.ts', content);
console.log("Patched types.ts");
