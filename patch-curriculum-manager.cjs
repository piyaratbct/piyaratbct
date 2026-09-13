const fs = require('fs');
let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

const propsInterfaceRegex = /interface CurriculumManagerProps \{([\s\S]*?)\}/;
content = content.replace(propsInterfaceRegex, `import { Student } from '../types';\ninterface CurriculumManagerProps {\n  currentUserRole?: string;\n  students?: Student[];\n  systemSemester?: string;\n  systemAcademicYear?: string;\n}`);

const fcRegex = /export const CurriculumManager: React\.FC<CurriculumManagerProps> = \(\{ currentUserRole = 'teacher' \}\) => \{/;
content = content.replace(fcRegex, `export const CurriculumManager: React.FC<CurriculumManagerProps> = ({ currentUserRole = 'teacher', students = [], systemSemester = '', systemAcademicYear = '' }) => {`);

const childManagerRegex = /<SubjectChildManager parentSubject=\{selectedCurriculum\} onUpdate=\{fetchCurriculums\} canEdit=\{canEdit\} \/>/;
content = content.replace(childManagerRegex, `<SubjectChildManager parentSubject={selectedCurriculum} onUpdate={fetchCurriculums} canEdit={canEdit} students={students} systemSemester={systemSemester} systemAcademicYear={systemAcademicYear} />`);

fs.writeFileSync('src/components/CurriculumManager.tsx', content);
console.log("Patched CurriculumManager");
