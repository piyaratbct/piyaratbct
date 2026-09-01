const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /\{\s*selectedGrades\.some\(g => g\.includes\('ประถม'\)\) && \(\s*\{\/\* คุณลักษณะอันพึงประสงค์ 8 ประการ \*\/\}\s*<div/g,
    "{selectedGrades.some(g => g.includes('ประถม')) && (\n<div"
  );
  fs.writeFileSync(file, code);
  console.log("Fixed " + file);
}

fixFile('src/components/LessonPlanForm.tsx');
fixFile('src/components/PBLLessonPlanForm.tsx');
