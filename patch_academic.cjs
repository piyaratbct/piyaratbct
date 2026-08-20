const fs = require('fs');
let content = fs.readFileSync('src/components/AcademicModule.tsx', 'utf8');

const searchStr = `<CurriculumManager />`;
const replacementStr = `<CurriculumManager currentUserRole={currentTeacher.role} />`;

if (content.includes(searchStr)) {
    content = content.replace(searchStr, replacementStr);
    console.log("AcademicModule patched.");
    fs.writeFileSync('src/components/AcademicModule.tsx', content);
} else {
    console.log("Could not find search string in AcademicModule.");
}
